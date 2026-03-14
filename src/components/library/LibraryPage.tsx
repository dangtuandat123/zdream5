import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { Link } from "react-router-dom"
import {
    SearchIcon,
    SparklesIcon,
    UploadIcon,
    ImageIcon,
    WandIcon,
    LayoutGridIcon,
    CalendarIcon,
    DownloadIcon,
    Trash2Icon,
    MoreHorizontalIcon,
    PaletteIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XIcon,
    ZoomInIcon,
    ZoomOutIcon,
    MaximizeIcon,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useToast } from "@/hooks/use-toast"
import { imageApi, type GeneratedImageData } from "@/lib/api"

// === Kiểu dữ liệu ===
type MediaType = "ai" | "template" | "upload"

interface MediaItem {
    id: string
    type: MediaType
    thumbnail: string
    createdAt: string
    prompt?: string
    templateName?: string
    numericId?: number // for API delete
}

// === Cấu hình tabs — flat, mỗi tab = 1 loại, không sub-filter ===
const TABS = [
    { value: "all", label: "Tất cả", icon: LayoutGridIcon },
    { value: "ai", label: "AI", icon: SparklesIcon },
    { value: "template", label: "Mẫu", icon: PaletteIcon },
    { value: "upload", label: "Tải lên", icon: UploadIcon },
] as const

// === Badge config theo loại ===
const TYPE_CONFIG: Record<MediaType, { label: string; className: string }> = {
    ai: { label: "AI", className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
    template: { label: "Mẫu", className: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
    upload: { label: "Upload", className: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" },
}

// === Map API data → MediaItem ===
function apiToMediaItem(img: GeneratedImageData): MediaItem {
    return {
        id: String(img.id),
        numericId: img.id,
        type: (img.type as any) || "ai",
        thumbnail: img.file_url,
        createdAt: img.created_at.split('T')[0],
        prompt: img.prompt,
    }
}

// === Empty state config ===
const EMPTY_STATES: Record<string, { icon: typeof ImageIcon; title: string; desc: string; cta?: { label: string; to: string } }> = {
    all: { icon: ImageIcon, title: "Thư viện trống", desc: "Bắt đầu tạo ảnh AI hoặc tải ảnh lên để xây dựng bộ sưu tập của bạn.", cta: { label: "Tạo ảnh đầu tiên", to: "/app/generate" } },
    ai: { icon: SparklesIcon, title: "Chưa có ảnh AI nào", desc: "Hãy tạo ảnh bằng cách nhập prompt sáng tạo của bạn.", cta: { label: "Tạo ảnh ngay", to: "/app/generate" } },
    template: { icon: PaletteIcon, title: "Chưa có ảnh từ mẫu", desc: "Khám phá các mẫu thiết kế để tạo ảnh nhanh chóng.", cta: { label: "Xem mẫu", to: "/app/templates" } },
    upload: { icon: UploadIcon, title: "Chưa có ảnh tải lên", desc: "Tải ảnh lên để sử dụng làm tài liệu tham khảo." },
}

export function LibraryPage() {
    const { toast } = useToast()
    const [items, setItems] = useState<MediaItem[]>([])
    const [search, setSearch] = useState("")
    const [tab, setTab] = useState<string>("all")
    const [sort, setSort] = useState("newest")
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const loadingMore = useRef(false)

    // Fetch images from API
    const fetchImages = useCallback(async (pageNum: number, append = false) => {
        try {
            if (pageNum === 1) setIsLoading(true)
            loadingMore.current = true
            const res = await imageApi.list(pageNum, 30)
            const mapped = res.data.map(apiToMediaItem)
            setItems(prev => append ? [...prev, ...mapped] : mapped)
            setHasMore(res.current_page < res.last_page)
            setPage(res.current_page)
        } catch {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải ảnh từ thư viện." })
        } finally {
            setIsLoading(false)
            loadingMore.current = false
        }
    }, [toast])

    useEffect(() => { fetchImages(1) }, [fetchImages])

    // Infinite scroll - load more
    const loadMore = useCallback(() => {
        if (!hasMore || loadingMore.current) return
        fetchImages(page + 1, true)
    }, [hasMore, page, fetchImages])
    
    // Lightbox / Image Viewer Navigation State
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    
    // Pan & Zoom State
    const [zoom, setZoom] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const dragStart = useRef({ x: 0, y: 0 })
    const lastTouchDistance = useRef<number | null>(null)
    const lastTouchCenter = useRef<{ x: number; y: number } | null>(null)
    const isTouchPanning = useRef(false)
    const imageContainerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const lastTapTime = useRef(0)
    const touchStartPos = useRef<{ x: number; y: number } | null>(null)
    
    // Delete image via API
    const handleDeleteImage = useCallback(async (item: MediaItem, e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (!item.numericId) {
            setItems(prev => prev.filter(i => i.id !== item.id))
            return
        }
        try {
            await imageApi.delete(item.numericId)
            setItems(prev => prev.filter(i => i.id !== item.id))
            if (selectedIndex !== null) setSelectedIndex(null)
            toast({ title: "Đã xóa", description: "Ảnh đã được xóa khỏi thư viện." })
        } catch {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể xóa ảnh." })
        }
    }, [selectedIndex, toast])

    // Upload refs & state
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const dragCounter = useRef(0)

    // Window drag handlers
    useEffect(() => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            dragCounter.current++
            if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
                setIsDragging(true)
            }
        }

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            dragCounter.current--
            if (dragCounter.current === 0) {
                setIsDragging(false)
            }
        }

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
        }

        const handleDrop = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
            dragCounter.current = 0

            const files = e.dataTransfer?.files
            if (files && files.length > 0) {
                processFiles(Array.from(files))
            }
        }

        window.addEventListener("dragenter", handleDragEnter)
        window.addEventListener("dragleave", handleDragLeave)
        window.addEventListener("dragover", handleDragOver)
        window.addEventListener("drop", handleDrop)

        return () => {
            window.removeEventListener("dragenter", handleDragEnter)
            window.removeEventListener("dragleave", handleDragLeave)
            window.removeEventListener("dragover", handleDragOver)
            window.removeEventListener("drop", handleDrop)
        }
    }, [])

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        processFiles(Array.from(files))
    }

    const processFiles = async (files: File[]) => {
        // Lọc chỉ lấy file ảnh
        const imageFiles = files.filter(file => file.type.startsWith("image/"))
        if (imageFiles.length === 0) {
            toast({
                variant: "destructive",
                title: "Lỗi định dạng",
                description: "Vui lòng chỉ tải lên các tệp hình ảnh.",
            })
            return
        }

        setIsUploading(true)

        try {
            // Upload song song tất cả các tệp
            const uploadPromises = imageFiles.map(file => imageApi.upload(file))
            const results = await Promise.all(uploadPromises)
            
            // Map kết quả từ API sang MediaItem format
            const uploadedItems: MediaItem[] = results.map(res => apiToMediaItem(res.image as any))

            setItems(prev => [...uploadedItems, ...prev])
            setTab("upload")

            toast({
                title: "Tải lên thành công",
                description: `Đã lưu ${imageFiles.length} tệp vào Thư viện của bạn.`,
            })

            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = ""
        } catch (error: any) {
            console.error("Upload error detail:", error)
            toast({
                variant: "destructive",
                title: "Tải lên thất bại",
                description: error.message || "Có lỗi xảy ra khi gửi tệp lên máy chủ.",
            })
        } finally {
            setIsUploading(false)
        }
    }

    // Lọc và sắp xếp
    const filteredItems = useMemo(() => {
        let currentItems = [...items]

        // Lọc theo tab — flat, mỗi tab = 1 loại
        if (tab !== "all") {
            currentItems = currentItems.filter((item) => item.type === tab)
        }

        // Lọc theo search
        if (search.trim()) {
            const q = search.toLowerCase()
            currentItems = currentItems.filter(
                (item) =>
                    item.prompt?.toLowerCase().includes(q) ||
                    item.templateName?.toLowerCase().includes(q) ||
                    (item.type === "upload" && "tải lên".includes(q))
            )
        }

        // Sắp xếp
        currentItems.sort((a, b) => {
            const dateDiff = sort === "newest" 
                ? b.createdAt.localeCompare(a.createdAt) 
                : a.createdAt.localeCompare(b.createdAt)
            
            if (dateDiff === 0) {
                return b.id.localeCompare(a.id)
            }
            return dateDiff
        })

        return currentItems
    }, [items, tab, search, sort])

    const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null

    // ── Perf-critical: all gesture math uses mutable refs, DOM writes bypass React ──
    const transformRef = useRef({ x: 0, y: 0, zoom: 1 })
    const gestureActive = useRef(false)
    const mouseDragStart = useRef({ x: 0, y: 0 })
    const isMouseDragging = useRef(false)

    const clampPos = (x: number, y: number, z: number) => {
        const container = imageContainerRef.current
        const img = imgRef.current
        if (!container || !img) return { x, y }
        const cw = container.clientWidth, ch = container.clientHeight
        const nw = img.naturalWidth || cw, nh = img.naturalHeight || ch
        const r = nw / nh, cr = cw / ch
        const dw = r > cr ? cw : ch * r
        const dh = r > cr ? cw / r : ch
        const mx = Math.max(0, (dw * z - cw) / 2)
        const my = Math.max(0, (dh * z - ch) / 2)
        return { x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) }
    }

    const applyTransformDOM = () => {
        const img = imgRef.current
        if (!img) return
        const { x, y, zoom: z } = transformRef.current
        img.style.transitionDuration = '0ms'
        img.style.transform = `translate(${x}px, ${y}px) scale(${z})`
    }

    // Sync ref → React state (for UI like zoom % display)
    const syncToState = useCallback(() => {
        const { x, y, zoom: z } = transformRef.current
        setZoom(z)
        setPosition({ x, y })
        if (imgRef.current) imgRef.current.style.transitionDuration = '200ms'
    }, [])

    const resetZoom = useCallback(() => {
        transformRef.current = { x: 0, y: 0, zoom: 1 }
        applyTransformDOM()
        syncToState()
    }, [syncToState])

    const applyZoom = useCallback((newZ: number) => {
        const z = Math.min(Math.max(newZ, 1), 5)
        const pos = z === 1 ? { x: 0, y: 0 } : clampPos(transformRef.current.x, transformRef.current.y, z)
        transformRef.current = { ...pos, zoom: z }
        applyTransformDOM()
        syncToState()
    }, [syncToState])

    const handleZoomIn = useCallback(() => applyZoom(transformRef.current.zoom + 0.5), [applyZoom])
    const handleZoomOut = useCallback(() => applyZoom(transformRef.current.zoom - 0.5), [applyZoom])

    useEffect(() => {
        transformRef.current = { x: 0, y: 0, zoom: 1 }
        applyTransformDOM()
        syncToState()
    }, [selectedIndex, syncToState])

    // Mouse drag pan (desktop) — also uses direct DOM
    const handleMouseDownPan = (e: React.MouseEvent) => {
        if (transformRef.current.zoom <= 1) return
        e.preventDefault()
        isMouseDragging.current = true
        mouseDragStart.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y }
    }
    const handleMouseMovePan = (e: React.MouseEvent) => {
        if (!isMouseDragging.current) return
        e.preventDefault()
        const z = transformRef.current.zoom
        const p = clampPos(e.clientX - mouseDragStart.current.x, e.clientY - mouseDragStart.current.y, z)
        transformRef.current = { ...p, zoom: z }
        applyTransformDOM()
    }
    const handleMouseUpPan = () => {
        if (!isMouseDragging.current) return
        isMouseDragging.current = false
        syncToState()
    }

    const handleWheelZoom = (e: React.WheelEvent) => {
        if (e.deltaY < 0) {
            handleZoomIn()
        } else {
            handleZoomOut()
        }
    }

    // Native touch listeners — zero React re-renders during gesture
    useEffect(() => {
        const el = imageContainerRef.current
        if (!el || selectedIndex === null) return

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault()
                gestureActive.current = true
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                lastTouchDistance.current = Math.hypot(dx, dy)
                lastTouchCenter.current = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                }
                isTouchPanning.current = false
                touchStartPos.current = null
            } else if (e.touches.length === 1) {
                const t = e.touches[0]
                touchStartPos.current = { x: t.clientX, y: t.clientY }

                if (transformRef.current.zoom > 1) {
                    gestureActive.current = true
                    isTouchPanning.current = true
                    dragStart.current = {
                        x: t.clientX - transformRef.current.x,
                        y: t.clientY - transformRef.current.y
                    }
                }

                // Double-tap
                const now = Date.now()
                if (now - lastTapTime.current < 300) {
                    e.preventDefault()
                    if (transformRef.current.zoom > 1) resetZoom()
                    else applyZoom(2.5)
                    lastTapTime.current = 0
                    touchStartPos.current = null
                } else {
                    lastTapTime.current = now
                }
            }
        }

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && lastTouchDistance.current !== null) {
                e.preventDefault()
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                const distance = Math.hypot(dx, dy)
                const scale = distance / lastTouchDistance.current

                const newZ = Math.min(Math.max(transformRef.current.zoom * scale, 1), 5)

                if (newZ === 1) {
                    transformRef.current = { x: 0, y: 0, zoom: 1 }
                } else if (lastTouchCenter.current) {
                    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
                    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
                    const np = clampPos(
                        transformRef.current.x + (cx - lastTouchCenter.current.x),
                        transformRef.current.y + (cy - lastTouchCenter.current.y),
                        newZ
                    )
                    transformRef.current = { ...np, zoom: newZ }
                    lastTouchCenter.current = { x: cx, y: cy }
                } else {
                    transformRef.current.zoom = newZ
                }

                applyTransformDOM()
                lastTouchDistance.current = distance
            } else if (e.touches.length === 1 && isTouchPanning.current && transformRef.current.zoom > 1) {
                e.preventDefault()
                const t = e.touches[0]
                const np = clampPos(
                    t.clientX - dragStart.current.x,
                    t.clientY - dragStart.current.y,
                    transformRef.current.zoom
                )
                transformRef.current = { ...np, zoom: transformRef.current.zoom }
                applyTransformDOM()
            }
        }

        const onTouchEnd = (e: TouchEvent) => {
            // Swipe navigation (not zoomed)
            if (touchStartPos.current && transformRef.current.zoom <= 1 && e.changedTouches.length === 1) {
                const dx = e.changedTouches[0].clientX - touchStartPos.current.x
                const dy = e.changedTouches[0].clientY - touchStartPos.current.y
                if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                    if (dx > 0) {
                        handlePrevRef.current()
                    } else {
                        handleNextRef.current()
                    }
                }
            }
            lastTouchDistance.current = null
            lastTouchCenter.current = null
            isTouchPanning.current = false
            touchStartPos.current = null
            if (gestureActive.current) {
                gestureActive.current = false
                syncToState()
            }
        }

        el.addEventListener('touchstart', onTouchStart, { passive: false })
        el.addEventListener('touchmove', onTouchMove, { passive: false })
        el.addEventListener('touchend', onTouchEnd)
        return () => {
            el.removeEventListener('touchstart', onTouchStart)
            el.removeEventListener('touchmove', onTouchMove)
            el.removeEventListener('touchend', onTouchEnd)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIndex, syncToState, resetZoom, applyZoom])

    // Handlers for Navigation
    const handleNext = useCallback(() => {
        if (selectedIndex !== null && selectedIndex < filteredItems.length - 1) {
            setSelectedIndex(selectedIndex + 1)
        }
    }, [selectedIndex, filteredItems.length])

    const handlePrev = useCallback(() => {
        if (selectedIndex !== null && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1)
        }
    }, [selectedIndex])

    // Refs for touch swipe navigation (avoids stale closure in native listener)
    const handleNextRef = useRef(handleNext)
    const handlePrevRef = useRef(handlePrev)
    useEffect(() => { handleNextRef.current = handleNext }, [handleNext])
    useEffect(() => { handlePrevRef.current = handlePrev }, [handlePrev])

    // Lắng nghe phím mũi tên và ESC khi xem ảnh
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return
            if (e.key === "Escape") setSelectedIndex(null)
            if (e.key === "ArrowRight") handleNext()
            if (e.key === "ArrowLeft") handlePrev()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [selectedIndex, handleNext, handlePrev])

    const emptyState = EMPTY_STATES[tab] || EMPTY_STATES.all

    return (
        <div className="relative flex flex-1 flex-col gap-5 p-4 lg:p-6 min-h-full">
            {/* Overlay Drag & Drop */}
            {isDragging && (
                <div className="fixed top-0 bottom-0 right-0 left-0 md:left-[72px] z-[100] flex items-center justify-center p-4 lg:p-6 bg-background/80 backdrop-blur-sm pointer-events-none transition-all duration-200">
                    <div className="flex flex-col items-center justify-center w-full h-full rounded-2xl border-2 border-dashed border-primary bg-background/50">
                        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse mb-4">
                            <UploadIcon className="size-10" />
                        </div>
                        <div className="space-y-1 text-center">
                            <h3 className="text-xl font-semibold">Thả tệp vào đây</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                Hỗ trợ JPG, PNG, WEBP. Bạn có thể thả nhiều tệp cùng lúc.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Thư viện</h1>
                    <p className="text-sm text-muted-foreground">
                        Tất cả kết quả hình ảnh và tài nguyên của bạn.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
                    <div className="relative w-full sm:w-[240px]">
                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo prompt, mẫu..."
                            className="pl-9 h-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={handleUploadClick}
                        className="h-9 whitespace-nowrap px-4 w-full sm:w-auto"
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <div className="size-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <UploadIcon className="size-4 mr-2" />
                        )}
                        Tải ảnh lên
                    </Button>
                    {/* Hidden file input (hỗ trợ multiple) */}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {/* Tabs filter + Sort — một hàng duy nhất, gọn gàng */}
            <div className="flex items-center justify-between gap-3 border-b pb-3">
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList>
                        {TABS.map((t) => (
                            <TabsTrigger key={t.value} value={t.value} className="gap-1.5 text-xs">
                                <t.icon className="size-3.5" />
                                {t.label}
                                {/* Hiển thị số lượng cho từng tab */}
                                {tab === t.value && (
                                    <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px] font-medium">
                                        {filteredItems.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                        <CalendarIcon className="size-3 mr-1.5 text-muted-foreground" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Mới nhất</SelectItem>
                        <SelectItem value="oldest">Cũ nhất</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                    <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Đang tải thư viện...</p>
                </div>
            ) : filteredItems.length > 0 ? (
                <><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pt-1">
                    {filteredItems.map((item, index) => (
                        <Card
                            key={item.id}
                            className="group cursor-pointer overflow-hidden transition-all hover:shadow-md hover:border-primary/30"
                            onClick={() => setSelectedIndex(index)}
                        >
                            <CardContent className="p-0">
                                {/* Thumbnail */}
                                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                                    <img
                                        src={item.thumbnail}
                                        alt={`Item ${item.id}`}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 flex items-end justify-between p-2 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100">
                                        <div className="flex gap-1">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="size-7 rounded-lg bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <DownloadIcon className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="size-7 rounded-lg bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border-0"
                                                onClick={(e) => handleDeleteImage(item, e)}
                                            >
                                                <Trash2Icon className="size-3.5" />
                                            </Button>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="size-7 rounded-lg bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontalIcon className="size-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem>
                                                    <WandIcon className="size-3.5 mr-2" />
                                                    Tạo tương tự
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <LayoutGridIcon className="size-3.5 mr-2" />
                                                    Dùng làm mẫu
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Type badge — góc trên trái */}
                                    <Badge
                                        className={`absolute top-2 left-2 text-[10px] sm:text-[9px] font-semibold px-2 sm:px-1.5 py-0.5 sm:py-0 border-none rounded-md shadow-sm ${TYPE_CONFIG[item.type].className}`}
                                    >
                                        {TYPE_CONFIG[item.type].label}
                                    </Badge>
                                </div>

                                {/* Footer info (simplified without artificial title) */}
                                <div className="p-2 sm:p-2.5 flex items-center justify-between text-[10px] text-muted-foreground bg-muted/30">
                                    <span className="flex items-center gap-1.5 truncate pr-2 max-w-[75%]">
                                        {item.type === "ai" && <SparklesIcon className="size-3 text-blue-500/70" />}
                                        {item.type === "template" && <PaletteIcon className="size-3 text-purple-500/70" />}
                                        {item.type === "upload" && <UploadIcon className="size-3 text-emerald-500/70" />}
                                        <span className="truncate">
                                            {item.prompt || item.templateName || "Tài nguyên gốc"}
                                        </span>
                                    </span>
                                    <span className="shrink-0">{item.createdAt}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {hasMore && (
                    <div className="flex justify-center pt-6 pb-2">
                        <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore.current}>
                            Tải thêm ảnh
                        </Button>
                    </div>
                )}
                </>
            ) : (
                // Empty state
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                        <emptyState.icon className="size-7 text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-base font-medium">{emptyState.title}</p>
                        <p className="text-sm text-muted-foreground max-w-xs">{emptyState.desc}</p>
                    </div>
                    {emptyState.cta && (
                        <Button asChild size="sm">
                            <Link to={emptyState.cta.to}>{emptyState.cta.label}</Link>
                        </Button>
                    )}
                    {search && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSearch(""); setTab("all") }}
                        >
                            Xoá bộ lọc
                        </Button>
                    )}
                </div>
            )}

            {/* Fullscreen Image Lightbox — dùng portal thuần, không dùng Radix Dialog để tránh xung đột touch events */}
            {selectedIndex !== null && selectedItem && createPortal(
                <div
                    className="fixed inset-0 z-50 bg-black/95 text-slate-200"
                    style={{ touchAction: 'none' }}
                >
                    <div className="relative w-full h-[100dvh] flex items-center justify-center">
                        {/* Nút đóng */}
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="absolute top-4 right-4 z-50 rounded-full bg-white text-black hover:bg-neutral-200 hover:text-black border-none shadow-lg pointer-events-auto"
                            onClick={() => setSelectedIndex(null)}
                        >
                            <XIcon className="size-6" />
                        </Button>

                        {/* Thông tin Ảnh (Góc trên trái) */}
                        <div className="absolute top-4 left-4 z-50 max-w-[60vw] space-y-2 pointer-events-none">
                            <div className="flex items-center gap-3">
                                <Badge
                                    className={`px-2.5 py-0.5 text-xs font-semibold shadow-sm border-none ${TYPE_CONFIG[selectedItem.type].className}`}
                                >
                                    {TYPE_CONFIG[selectedItem.type].label}
                                </Badge>
                                <span className="text-xs text-white/60 drop-shadow-md">
                                    {selectedItem.createdAt}
                                </span>
                            </div>
                            <h3 className="text-sm md:text-base font-medium text-white/90 drop-shadow-lg line-clamp-2">
                                {selectedItem.prompt || selectedItem.templateName || "Tài nguyên tải lên"}
                            </h3>
                        </div>

                        {/* Action Bar (Góc dưới) */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto">
                            {/* Group: Zoom Controls */}
                            <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    title="Thu nhỏ"
                                    className="text-white hover:bg-white/20 h-9 w-9 py-0 rounded-xl"
                                    onClick={handleZoomOut}
                                    disabled={zoom <= 1}
                                >
                                    <ZoomOutIcon className="size-4" />
                                </Button>
                                <span className="text-xs font-medium w-10 text-center text-white/80 select-none">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    title="Phóng to"
                                    className="text-white hover:bg-white/20 h-9 w-9 py-0 rounded-xl"
                                    onClick={handleZoomIn}
                                    disabled={zoom >= 5}
                                >
                                    <ZoomInIcon className="size-4" />
                                </Button>
                                {zoom > 1 && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        title="Đặt lại"
                                        className="text-white hover:bg-white/20 h-9 w-9 py-0 rounded-xl"
                                        onClick={resetZoom}
                                    >
                                        <MaximizeIcon className="size-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Group: Actions */}
                            {(selectedItem.type === "ai" || selectedItem.type === "template") && (
                                <Button variant="ghost" className="text-white hover:bg-white/20 gap-2 h-9 rounded-xl px-3">
                                    <WandIcon className="size-4" />
                                    <span className="hidden sm:inline text-xs font-medium">Tạo tương tự</span>
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-9 w-9 py-0 rounded-xl">
                                <DownloadIcon className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/20 hover:text-red-400 h-9 w-9 py-0 rounded-xl mr-0.5"
                                onClick={(e) => selectedItem && handleDeleteImage(selectedItem, e)}>
                                <Trash2Icon className="size-4" />
                            </Button>
                        </div>

                        {/* Nút Previous */}
                        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
                            <Button
                                variant="outline"
                                size="icon"
                                className={`size-9 sm:size-12 rounded-full bg-white/80 sm:bg-white text-black hover:bg-neutral-200 hover:text-black border-none shadow-lg transition-opacity pointer-events-auto ${selectedIndex === 0 ? "opacity-0 !pointer-events-none" : "opacity-100"}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handlePrev()
                                }}
                            >
                                <ChevronLeftIcon className="size-5 sm:size-8" />
                            </Button>
                        </div>

                        {/* Nút Next */}
                        <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
                            <Button
                                variant="outline"
                                size="icon"
                                className={`size-9 sm:size-12 rounded-full bg-white/80 sm:bg-white text-black hover:bg-neutral-200 hover:text-black border-none shadow-lg transition-opacity pointer-events-auto ${selectedIndex === filteredItems.length - 1 ? "opacity-0 !pointer-events-none" : "opacity-100"}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleNext()
                                }}
                            >
                                <ChevronRightIcon className="size-5 sm:size-8" />
                            </Button>
                        </div>

                        {/* Container Hình Ảnh (Pan & Zoom Wrapper) */}
                        <div
                            ref={imageContainerRef}
                            className={`w-full h-full p-0 flex items-center justify-center relative overflow-hidden select-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                            style={{ touchAction: 'none' }}
                            onWheel={handleWheelZoom}
                            onMouseDown={handleMouseDownPan}
                            onMouseMove={handleMouseMovePan}
                            onMouseUp={handleMouseUpPan}
                            onMouseLeave={handleMouseUpPan}
                            onDoubleClick={zoom > 1 ? resetZoom : handleZoomIn}
                        >
                            <img
                                ref={imgRef}
                                src={selectedItem.thumbnail}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] will-change-transform"
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                    transitionProperty: 'transform',
                                    transitionTimingFunction: 'ease-out',
                                    transitionDuration: '0ms',
                                }}
                                draggable={false}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
