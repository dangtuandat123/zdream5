import { useState, useMemo, useRef, useEffect, useCallback } from "react"
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
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"

import { useToast } from "@/hooks/use-toast"

// === Kiểu dữ liệu ===
type MediaType = "ai" | "template" | "upload"

interface MediaItem {
    id: string
    type: MediaType
    thumbnail: string
    createdAt: string
    prompt?: string
    templateName?: string
}

// === Cấu hình tabs ===
const TABS = [
    { value: "all", label: "Tất cả", icon: null },
    { value: "generated", label: "Kết quả AI", icon: SparklesIcon }, // Gộp AI + Template
    { value: "upload", label: "Tài nguyên gốc", icon: UploadIcon },
] as const

type GeneratedFilter = "all" | "ai" | "template"

// === Badge config theo loại ===
const TYPE_CONFIG: Record<MediaType, { label: string; className: string }> = {
    ai: { label: "AI", className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
    template: { label: "Mẫu", className: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
    upload: { label: "Upload", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
}

// === Mock data ===
const INITIAL_MOCK_ITEMS: MediaItem[] = [
    { id: "1", type: "ai", thumbnail: "https://images.unsplash.com/photo-1542442828-287217bfb21f?w=400&auto=format&fit=crop", createdAt: "2025-03-09", prompt: "A cyberpunk city at night with neon lights" },
    { id: "2", type: "template", thumbnail: "https://images.unsplash.com/photo-1498453488252-0974dcabe0cb?w=400&auto=format&fit=crop", createdAt: "2025-03-08", templateName: "Phong cảnh Ghibli" },
    { id: "3", type: "upload", thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop", createdAt: "2025-03-08" },
    { id: "4", type: "ai", thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop", createdAt: "2025-03-07", prompt: "A majestic dragon in a fantasy realm" },
    { id: "5", type: "template", thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop", createdAt: "2025-03-07", templateName: "Anime Waifu" },
    { id: "6", type: "upload", thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&auto=format&fit=crop", createdAt: "2025-03-06" },
    { id: "7", type: "ai", thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&auto=format&fit=crop", createdAt: "2025-03-06", prompt: "Oil painting of a mountain landscape, baroque style" },
    { id: "8", type: "template", thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop", createdAt: "2025-03-05", templateName: "Ảnh thời trang" },
    { id: "9", type: "upload", thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop", createdAt: "2025-03-05" },
    { id: "10", type: "ai", thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&auto=format&fit=crop", createdAt: "2025-03-04", prompt: "Abstract galaxy nebula, vibrant colors" },
    { id: "11", type: "template", thumbnail: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop", createdAt: "2025-03-04", templateName: "Watercolor Portrait" },
    { id: "12", type: "upload", thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&auto=format&fit=crop", createdAt: "2025-03-03" },
    { id: "13", type: "ai", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop", createdAt: "2025-03-03", prompt: "A samurai in neon armor, rain, dramatic lighting" },
    { id: "14", type: "template", thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop", createdAt: "2025-03-02", templateName: "Render sản phẩm 3D" },
    { id: "15", type: "upload", thumbnail: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&auto=format&fit=crop", createdAt: "2025-03-01" },
]

// === Empty state config ===
const EMPTY_STATES: Record<string, { icon: typeof ImageIcon; title: string; desc: string; cta?: { label: string; to: string } }> = {
    all: { icon: ImageIcon, title: "Thư viện trống", desc: "Bắt đầu tạo ảnh AI hoặc tải ảnh lên để xây dựng bộ sưu tập của bạn.", cta: { label: "Tạo ảnh đầu tiên", to: "/app/generate" } },
    generated: { icon: SparklesIcon, title: "Chưa có kết quả AI nào", desc: "Hãy tạo ảnh bằng cách nhập prompt hoặc sử dụng mẫu thiết kế.", cta: { label: "Tạo ảnh ngay", to: "/app/generate" } },
    upload: { icon: UploadIcon, title: "Chưa có tài nguyên gốc", desc: "Tải ảnh lên để sử dụng với các mẫu thiết kế hoặc làm tài liệu tham khảo." },
}

export function LibraryPage() {
    const { toast } = useToast()
    const [items, setItems] = useState<MediaItem[]>(INITIAL_MOCK_ITEMS)
    const [search, setSearch] = useState("")
    const [tab, setTab] = useState<string>("all")
    const [generatedSubFilter, setGeneratedSubFilter] = useState<GeneratedFilter>("all")
    const [sort, setSort] = useState("newest")
    
    // Lightbox / Image Viewer Navigation State
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    
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

    const processFiles = (files: File[]) => {
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

        // TODO: Fake upload delay. Thay bằng logic up từng file lên server
        setTimeout(() => {
            const newUploads: MediaItem[] = imageFiles.map((file, index) => ({
                id: `upload-${Date.now()}-${index}`,
                type: "upload",
                thumbnail: URL.createObjectURL(file), // Preview ngay lập tức
                createdAt: new Date().toISOString().split('T')[0],
                prompt: file.name // Dùng tên file làm tooltip/label hiển thị tạm
            }))

            setIsUploading(false)
            setItems(prev => [...newUploads, ...prev])
            setTab("upload")

            toast({
                title: "Tải lên thành công",
                description: `Đã lưu ${imageFiles.length} tệp vào Thư viện của bạn.`,
            })

            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = ""
        }, 1500) // Giả lập tổng thời gian upload
    }

    // Lọc và sắp xếp
    const filteredItems = useMemo(() => {
        let currentItems = [...items]

        // Lọc theo tab lớn
        if (tab === "generated") {
            currentItems = currentItems.filter((item) => item.type === "ai" || item.type === "template")
            // Lọc phụ bên trong tab generated
            if (generatedSubFilter !== "all") {
                currentItems = currentItems.filter((item) => item.type === generatedSubFilter)
            }
        } else if (tab === "upload") {
            currentItems = currentItems.filter((item) => item.type === "upload")
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
            if (sort === "newest") return b.createdAt.localeCompare(a.createdAt)
            return a.createdAt.localeCompare(b.createdAt)
        })

        return currentItems
    }, [items, tab, generatedSubFilter, search, sort])

    const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null

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

    // Lắng nghe phím mũi tên khi xem ảnh
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return
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
                <div className="fixed top-0 bottom-0 right-0 left-0 md:left-[72px] z-50 flex items-center justify-center p-4 lg:p-6 bg-background/80 backdrop-blur-sm pointer-events-none transition-all duration-200">
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
                <div className="flex w-full sm:w-auto items-center gap-3">
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
                        className="h-9 whitespace-nowrap px-4"
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

            {/* Tab filter chính */}
            <ToggleGroup
                type="single"
                value={tab}
                onValueChange={(v) => {
                    if (v) {
                        setTab(v)
                        setGeneratedSubFilter("all") // Reset sub-filter khi đổi tab
                    }
                }}
                className="flex flex-wrap justify-start gap-1"
            >
                {TABS.map((t) => (
                    <ToggleGroupItem
                        key={t.value}
                        value={t.value}
                        className="rounded-full px-4 text-xs h-8 gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                        {t.icon && <t.icon className="size-3.5" />}
                        {t.label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>

            {/* Toolbar: Counter + Sub-filter + Sort */}
            <div className="flex flex-wrap items-center justify-between gap-3 -mt-1 border-b pb-3">
                <div className="flex items-center gap-4">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {filteredItems.length} mục
                    </p>
                    
                    {/* Filter phụ chỉ hiện khi ở tab Kết quả AI */}
                    {tab === "generated" && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full border border-border/50">
                            <span className="text-[10px] text-muted-foreground mr-1">Lọc:</span>
                            <button 
                                onClick={() => setGeneratedSubFilter("all")}
                                className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${generatedSubFilter === "all" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Tất cả
                            </button>
                            <button 
                                onClick={() => setGeneratedSubFilter("ai")}
                                className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${generatedSubFilter === "ai" ? "bg-blue-500/15 text-blue-400 font-medium" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Chỉ Prompt
                            </button>
                            <button 
                                onClick={() => setGeneratedSubFilter("template")}
                                className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${generatedSubFilter === "template" ? "bg-purple-500/15 text-purple-400 font-medium" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Chỉ Mẫu
                            </button>
                        </div>
                    )}
                </div>

                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-[120px] h-7 text-xs bg-background">
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
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pt-1">
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
                                    <div className="absolute inset-0 flex items-end justify-between p-2 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                                                onClick={(e) => e.stopPropagation()}
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
                                        variant="outline"
                                        className={`absolute top-2 left-2 text-[9px] font-semibold border px-1.5 py-0 rounded-md backdrop-blur-md ${TYPE_CONFIG[item.type].className}`}
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

            {/* Fullscreen Image Lightbox */}
            <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
                <DialogContent 
                    className="max-w-none w-screen h-screen p-0 m-0 border-none bg-black/95 rounded-none flex items-center justify-center overflow-hidden [&>button]:hidden text-slate-200"
                    aria-describedby="Image viewer"
                >
                    <DialogTitle className="sr-only">Trình xem ảnh toàn màn hình</DialogTitle>
                    
                    {selectedItem && (
                        <>
                            {/* Nút đóng */}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-4 right-4 z-50 rounded-full bg-black/20 text-white hover:bg-black/50 hover:text-white"
                                onClick={() => setSelectedIndex(null)}
                            >
                                <XIcon className="size-6" />
                            </Button>

                            {/* Thông tin Ảnh (Góc trên trái) */}
                            <div className="absolute top-4 left-4 z-50 max-w-[60vw] space-y-2 pointer-events-none">
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant="outline"
                                        className={`px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md shadow-sm border ${TYPE_CONFIG[selectedItem.type].className}`}
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
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto">
                                {(selectedItem.type === "ai" || selectedItem.type === "template") && (
                                    <Button variant="ghost" className="text-white hover:bg-white/20 gap-2 h-10 rounded-xl">
                                        <WandIcon className="size-4" />
                                        <span className="hidden sm:inline">Tạo tương tự</span>
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-10 w-10 py-0 rounded-xl">
                                    <DownloadIcon className="size-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/20 hover:text-red-400 h-10 w-10 py-0 rounded-xl">
                                    <Trash2Icon className="size-4" />
                                </Button>
                            </div>

                            {/* Nút Previous */}
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-40">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`size-12 rounded-full bg-black/20 text-white hover:bg-black/50 hover:text-white backdrop-blur-sm transition-opacity ${selectedIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handlePrev()
                                    }}
                                >
                                    <ChevronLeftIcon className="size-8" />
                                </Button>
                            </div>

                            {/* Nút Next */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`size-12 rounded-full bg-black/20 text-white hover:bg-black/50 hover:text-white backdrop-blur-sm transition-opacity ${selectedIndex === filteredItems.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleNext()
                                    }}
                                >
                                    <ChevronRightIcon className="size-8" />
                                </Button>
                            </div>

                            {/* Container Hình Ảnh */}
                            <div className="w-full h-full p-4 md:p-12 flex items-center justify-center pointer-events-none relative select-none">
                                <img 
                                    src={selectedItem.thumbnail} 
                                    alt="Preview" 
                                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform select-none"
                                />
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
