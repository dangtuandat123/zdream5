import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { ImageViewer, type ImageViewerItem } from "@/components/ui/image-viewer"
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
} from "lucide-react"

import { Input } from "@/components/ui/input"
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
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { imageApi, type GeneratedImageData } from "@/lib/api"

// === Kiểu dữ liệu ===
type MediaType = "ai" | "upload"

interface MediaItem {
    id: string
    type: MediaType
    thumbnail: string
    createdAt: string
    createdAtFull: string // dd/MM/yyyy HH:mm
    prompt?: string
    designedPrompt?: string
    negativePrompt?: string
    templateName?: string
    model?: string
    style?: string
    aspectRatio?: string
    gemsCost?: number
    seed?: number
    numericId?: number // for API delete
    referenceImages?: string[]
}

// === Cấu hình tabs — flat, mỗi tab = 1 loại, không sub-filter ===
const TABS = [
    { value: "all", label: "Tất cả", icon: LayoutGridIcon },
    { value: "ai", label: "AI", icon: SparklesIcon },
    { value: "upload", label: "Tải lên", icon: UploadIcon },
] as const

// === Map API data → MediaItem ===
/** Format ISO date → "dd/MM/yyyy HH:mm" */
function formatDate(iso: string): string {
    try {
        const d = new Date(iso)
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    } catch {
        return iso.split('T')[0]
    }
}

function apiToMediaItem(img: GeneratedImageData): MediaItem {
    return {
        id: String(img.id),
        numericId: img.id,
        type: (img.type as any) || "ai",
        thumbnail: img.file_url,
        createdAt: img.created_at.split('T')[0],
        createdAtFull: formatDate(img.created_at),
        prompt: img.prompt,
        designedPrompt: img.designed_prompt || undefined,
        negativePrompt: img.negative_prompt || undefined,
        model: img.model,
        style: img.style,
        aspectRatio: img.aspect_ratio,
        gemsCost: img.gems_cost,
        seed: img.seed,
        referenceImages: img.reference_images && img.reference_images.length > 0 ? img.reference_images : undefined,
    }
}

// === Empty state config ===
const EMPTY_STATES: Record<string, { icon: typeof ImageIcon; title: string; desc: string; cta?: { label: string; to: string } }> = {
    all: { icon: ImageIcon, title: "Thư viện trống", desc: "Bắt đầu tạo ảnh AI hoặc tải ảnh lên để xây dựng bộ sưu tập của bạn.", cta: { label: "Tạo ảnh đầu tiên", to: "/app/generate" } },
    ai: { icon: SparklesIcon, title: "Chưa có ảnh AI nào", desc: "Hãy tạo ảnh bằng cách nhập prompt sáng tạo của bạn.", cta: { label: "Tạo ảnh ngay", to: "/app/generate" } },
    upload: { icon: UploadIcon, title: "Chưa có ảnh tải lên", desc: "Tải ảnh lên để sử dụng làm tài liệu tham khảo." },
}

export function LibraryPage() {
    const { toast } = useToast()
    const isMobile = useIsMobile()
    const [items, setItems] = useState<MediaItem[]>([])
    const [search, setSearch] = useState("")
    // Action menu state — mobile dùng Drawer, desktop dùng DropdownMenu
    const [actionItem, setActionItem] = useState<MediaItem | null>(null)
    // Delete confirmation dialog
    const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
    const [tab, setTab] = useState<string>("all")
    const [sort, setSort] = useState("newest")
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const PER_PAGE = 30

    // Fetch images from API — phân trang + filter server-side
    const fetchImages = useCallback(async (pageNum: number, filterType?: string) => {
        try {
            setIsLoading(true)
            // "all" → không filter, các tab khác ("ai", "upload", "template") → truyền thẳng
            const apiType = filterType === "all" || !filterType ? null : filterType
            const res = await imageApi.list(pageNum, PER_PAGE, null, apiType)
            const mapped = res.data.map(apiToMediaItem)
            setItems(mapped)
            setTotalPages(res.last_page)
            setPage(res.current_page)
        } catch {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải ảnh từ thư viện." })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => { fetchImages(1, tab) }, [fetchImages, tab])

    // Chuyển trang
    const goToPage = useCallback((p: number) => {
        if (p < 1 || p > totalPages || p === page) return
        fetchImages(p, tab)
        // Scroll lên đầu danh sách khi chuyển trang
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [page, totalPages, tab, fetchImages])

    // Lightbox / Image Viewer Navigation State
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    // Mở dialog xác nhận xoá — không xoá trực tiếp
    const confirmDelete = useCallback((item: MediaItem, e?: React.MouseEvent) => {
        e?.stopPropagation()
        setDeleteTarget(item)
    }, [])

    // Thực thi xoá sau khi user xác nhận
    const handleDeleteImage = useCallback(async (item: MediaItem) => {
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

    // Download ảnh
    const handleDownload = useCallback(async (item: MediaItem) => {
        try {
            const response = await fetch(item.thumbnail)
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `zdream-${item.id}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch {
            // Fallback: mở ảnh trong tab mới
            window.open(item.thumbnail, "_blank")
        }
    }, [])

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

        // Tab filter đã xử lý server-side, chỉ cần filter search client-side
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
    }, [items, search, sort])

    const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null

    // Map sang ImageViewerItem cho shared ImageViewer component
    const viewerItems = useMemo<ImageViewerItem[]>(() => filteredItems.map(item => ({
        id: item.id,
        url: item.thumbnail,
        type: item.type,
        prompt: item.prompt,
        designedPrompt: item.designedPrompt,
        negativePrompt: item.negativePrompt,
        referenceImages: item.referenceImages,
        model: item.model,
        style: item.style,
        aspectRatio: item.aspectRatio,
        seed: item.seed,
        gemsCost: item.gemsCost,
        createdAt: item.createdAtFull,
    })), [filteredItems])

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
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative flex-1 sm:w-[260px]">
                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            placeholder="Tìm theo prompt, mẫu..."
                            className="pl-9 h-9 rounded-lg border-white/[0.08] bg-white/[0.06] placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:bg-white/[0.08] transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleUploadClick}
                        className="h-9 px-3 sm:px-4 shrink-0 transition-all active:scale-95"
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <div className="size-4 mr-1.5 sm:mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <UploadIcon className="size-4 mr-1.5 sm:mr-2" />
                        )}
                        <span className="text-xs sm:text-sm font-medium">Tải lên</span>
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

            {/* Tabs filter + Sort */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 w-full">
                <Tabs value={tab} onValueChange={setTab} className="flex-1">
                    <TabsList className="w-auto inline-flex bg-white/[0.04] border border-white/[0.06] p-1 rounded-lg gap-0.5">
                        {TABS.map((t) => (
                            <TabsTrigger key={t.value} value={t.value} className="gap-1.5 text-xs px-3.5 py-1.5 rounded-md text-white/50 data-[state=active]:bg-white/[0.1] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                                <t.icon className="size-3.5" />
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-10 h-10 sm:w-[130px] sm:h-9 shrink-0 flex items-center justify-center sm:justify-start px-0 sm:px-3 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 transition-colors [&>svg:last-child]:hidden sm:[&>svg:last-child]:block [&>span]:hidden sm:[&>span]:block">
                        <CalendarIcon className="size-4 sm:size-3 sm:mr-1.5 text-muted-foreground" />
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
                    {filteredItems.map((item, index) => {
                        return (
                            <Card
                                key={item.id}
                                className="group cursor-pointer overflow-hidden border-white/[0.06] bg-white/[0.02] transition-all duration-200 hover:shadow-lg hover:border-white/[0.15] hover:ring-1 hover:ring-white/[0.06]"
                                onClick={() => setSelectedIndex(index)}
                            >
                                <CardContent className="p-0">
                                    {/* Thumbnail — square cho gallery đều đặn */}
                                    <div className="relative aspect-square bg-muted overflow-hidden">
                                        <img
                                            src={item.thumbnail}
                                            alt={item.prompt || `Item ${item.id}`}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />

                                        {/* Nút ⋯ .— luôn hiện trên mobile, hover hiện trên desktop */}
                                        {isMobile ? (
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="absolute top-1.5 right-1.5 size-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-0"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setActionItem(item)
                                                }}
                                            >
                                                <MoreHorizontalIcon className="size-4" />
                                            </Button>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        className="absolute top-1.5 right-1.5 size-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontalIcon className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-[#2a2d31]/95 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl ring-1 ring-black/5 text-white p-1.5">
                                                    <DropdownMenuItem
                                                        onClick={(e) => { e.stopPropagation(); handleDownload(item) }}
                                                        className="rounded-xl px-3 py-2.5 text-white/90 focus:bg-white/10 focus:text-white cursor-pointer gap-3"
                                                    >
                                                        <DownloadIcon className="size-4 text-white/60" />
                                                        Tải xuống
                                                    </DropdownMenuItem>
                                                    {item.type === "ai" && item.prompt && (
                                                        <DropdownMenuItem
                                                            onClick={(e) => { e.stopPropagation(); window.location.href = `/app/generate?prompt=${encodeURIComponent(item.prompt || "")}` }}
                                                            className="rounded-xl px-3 py-2.5 text-white/90 focus:bg-white/10 focus:text-white cursor-pointer gap-3"
                                                        >
                                                            <WandIcon className="size-4 text-white/60" />
                                                            Tạo tương tự
                                                        </DropdownMenuItem>
                                                    )}
                                                    <div className="border-t border-white/[0.08] my-1.5 mx-2" />
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-3 py-2.5 text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer gap-3"
                                                        onClick={(e) => confirmDelete(item, e)}
                                                    >
                                                        <Trash2Icon className="size-4" />
                                                        Xóa ảnh
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}

                                        {/* Hover gradient nhẹ cho desktop — tạo chiều sâu */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                    </div>

                                    {/* Footer — prompt + date */}
                                    <div className="px-3 py-2.5 space-y-1">
                                        <p className="text-[13px] font-medium truncate leading-snug">
                                            {item.prompt || item.templateName || "Tài nguyên tải lên"}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground/70">{item.createdAt}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="flex justify-center pt-6 pb-2">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => goToPage(page - 1)}
                                            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>

                                    {/* Trang đầu */}
                                    {page > 2 && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(1)}>1</PaginationLink>
                                        </PaginationItem>
                                    )}
                                    {page > 3 && (
                                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                                    )}

                                    {/* Trang trước */}
                                    {page > 1 && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(page - 1)}>{page - 1}</PaginationLink>
                                        </PaginationItem>
                                    )}

                                    {/* Trang hiện tại */}
                                    <PaginationItem>
                                        <PaginationLink isActive>{page}</PaginationLink>
                                    </PaginationItem>

                                    {/* Trang sau */}
                                    {page < totalPages && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(page + 1)}>{page + 1}</PaginationLink>
                                        </PaginationItem>
                                    )}

                                    {page < totalPages - 2 && (
                                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                                    )}
                                    {/* Trang cuối */}
                                    {page < totalPages - 1 && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(totalPages)}>{totalPages}</PaginationLink>
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => goToPage(page + 1)}
                                            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
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

            {/* === IMAGE VIEWER — shared ImageViewer component === */}
            <ImageViewer
                open={selectedIndex !== null && !!selectedItem}
                onClose={() => setSelectedIndex(null)}
                items={viewerItems}
                currentIndex={selectedIndex ?? 0}
                onIndexChange={setSelectedIndex}
                onDownload={(item) => {
                    const original = filteredItems.find(i => i.id === item.id)
                    if (original) handleDownload(original)
                }}
                onCreateSimilar={(item) => {
                    window.location.href = `/app/generate?prompt=${encodeURIComponent(item.prompt || "")}`
                }}
                onDelete={(item) => {
                    const original = filteredItems.find(i => i.id === item.id)
                    if (original) confirmDelete(original)
                }}
            />

            {/* Mobile Action Drawer — bottom sheet dễ bấm trên điện thoại */}
            <Drawer open={!!actionItem} onOpenChange={(open) => !open && setActionItem(null)}>
                <DrawerContent className="bg-[#2a2d31]/95 backdrop-blur-xl border-t border-white/10 text-white rounded-t-[28px]">
                    <DrawerHeader className="pb-3 border-b border-white/5 mb-3">
                        <DrawerTitle className="text-sm font-medium truncate text-white/90">
                            {actionItem?.prompt || actionItem?.templateName || "Tài nguyên tải lên"}
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 pb-6 space-y-1">
                        {/* Thumbnail preview nhỏ */}
                        {actionItem && (
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                <img
                                    src={actionItem.thumbnail}
                                    alt=""
                                    className="size-14 rounded-xl object-cover shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium truncate text-white">{actionItem.prompt || actionItem.templateName || "Tài nguyên tải lên"}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-white/50 uppercase tracking-wider">{actionItem.type === "ai" ? "AI" : "Tải lên"}</span>
                                        <span className="text-[11px] text-white/50">{actionItem.createdAt}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions — vùng bấm lớn, icon rõ ràng */}
                        <button
                            className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium hover:bg-white/10 active:bg-white/15 transition-colors"
                            onClick={() => { if (actionItem) handleDownload(actionItem); setActionItem(null) }}
                        >
                            <DownloadIcon className="size-5 text-white/70" />
                            Tải xuống
                        </button>
                        {actionItem?.type === "ai" && actionItem?.prompt && (
                            <button
                                className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium hover:bg-white/10 active:bg-white/15 transition-colors"
                                onClick={() => { setActionItem(null); window.location.href = `/app/generate?prompt=${encodeURIComponent(actionItem?.prompt || "")}` }}
                            >
                                <WandIcon className="size-5 text-white/70" />
                                Tạo tương tự
                            </button>
                        )}

                        {/* Separator + Delete */}
                        <div className="border-t border-white/10 my-2" />
                        <button
                            className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-colors"
                            onClick={() => {
                                if (actionItem) confirmDelete(actionItem)
                                setActionItem(null)
                            }}
                        >
                            <Trash2Icon className="size-5" />
                            Xóa ảnh
                        </button>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Dialog xác nhận xoá ảnh */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa ảnh này?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Ảnh sẽ bị xóa vĩnh viễn khỏi thư viện.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteTarget) handleDeleteImage(deleteTarget)
                                setDeleteTarget(null)
                            }}
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
