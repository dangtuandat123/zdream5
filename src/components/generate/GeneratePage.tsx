import React, { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { imageApi, projectApi, modelApi, type GeneratedImageData, type ProjectData, type AiModelData } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
    Wand2,
    Download,
    Settings2,
    ArrowUp,
    Trash2,
    RotateCcw,
    RectangleHorizontal,
    RectangleVertical,
    Square,

    ImageIcon,
    X,
    Link,
    Upload,
    Check,
    Plus,
    Copy,
    ChevronDown,
    ChevronUp,
    History,
    CheckSquare,
    Dices,
    Loader2,
    FolderOpen,
    LayoutGrid,
    ChevronsUpDown,
    Box,
    Palette,
    Ruler,
    Hash,
    Clock,
    Sparkles
} from "lucide-react"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ImageLightbox } from "@/components/ui/image-lightbox"


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
// Lightbox zoom/pan constants
const MAX_ZOOM = 3

// === Types ===
interface GeneratedImage {
    id: string
    batchId: string
    url: string
    prompt: string
    designedPrompt?: string
    negativePrompt?: string
    seed: number
    model: string
    style: string
    aspectRatio: number
    aspectLabel: string
    createdAt: Date
    referenceImages?: string[]
    isNew?: boolean
}

// === Prompt History (localStorage) ===
const HISTORY_KEY = 'zdream-prompt-history'
const MAX_HISTORY = 10
function getPromptHistory(): string[] {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function savePromptToHistory(p: string) {
    const h = getPromptHistory().filter(x => x !== p)
    h.unshift(p)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, MAX_HISTORY)))
}

// === Download helper ===
async function downloadImage(url: string, filename: string) {
    try {
        const res = await fetch(url)
        const blob = await res.blob()
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = filename
        a.click()
        URL.revokeObjectURL(a.href)
        // silent
    } catch {
        // silent
    }
}

// === Justified Gallery Component ===
type GalleryItem =
    | { type: 'skeleton'; ratio: number; key: string; variant: 'generate' | 'history' }
    | { type: 'image'; img: GeneratedImage; ratio: number; key: string }

interface JustifiedRow {
    items: GalleryItem[]
    height: number
    isLastRow?: boolean
}

function computeRows(items: GalleryItem[], containerWidth: number, targetHeight: number, gap: number): JustifiedRow[] {
    if (containerWidth <= 0 || items.length === 0) return []

    const rows: JustifiedRow[] = []
    let currentItems: GalleryItem[] = []
    let currentSumRatios = 0

    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const itemWidth = targetHeight * item.ratio
        const currentRowWidth = targetHeight * currentSumRatios + (currentItems.length > 0 ? currentItems.length * gap : 0)
        const widthAfterAdd = currentRowWidth + itemWidth + (currentItems.length > 0 ? gap : 0)

        if (widthAfterAdd <= containerWidth || currentItems.length === 0) {
            // Vẫn vừa hàng hoặc hàng trống → thêm vào
            currentItems.push(item)
            currentSumRatios += item.ratio
        } else {
            // Tràn — quyết định include hay exclude
            const remaining = containerWidth - currentRowWidth
            const nextWidth = itemWidth

            if (remaining > 0.5 * nextWidth) {
                // Khoảng trống > 50% ảnh tiếp → thêm vào, giảm chiều cao
                currentItems.push(item)
                currentSumRatios += item.ratio
                const rowH = (containerWidth - (currentItems.length - 1) * gap) / currentSumRatios
                rows.push({ items: [...currentItems], height: rowH })
                currentItems = []
                currentSumRatios = 0
            } else {
                // Khoảng trống <= 50% → không thêm, tăng chiều cao lấp đầy
                const rowH = (containerWidth - (currentItems.length - 1) * gap) / currentSumRatios
                rows.push({ items: [...currentItems], height: rowH })
                currentItems = [item]
                currentSumRatios = item.ratio
            }
        }
    }

    // Hàng cuối
    if (currentItems.length > 0) {
        const isMobile = containerWidth < 640

        if (isMobile) {
            // Tính rowH lý tưởng sao cho tổng chiều rộng của các ảnh chính xác bằng width container.
            // (w1 + w2 + ... + wn) + (n-1)*gap = containerWidth
            // => rowH * sumRatios + gaps = containerWidth
            // => rowH = (containerWidth - gaps) / sumRatios
            const gapsWidth = (currentItems.length - 1) * gap
            const rowH = (containerWidth - gapsWidth) / currentSumRatios
            
            // Ép buộc dùng rowH này để giữ aspect ratio hoàn hảo
            rows.push({ items: currentItems, height: rowH })
        } else {
            // Trên desktop: Giữ targetHeight cố định
            rows.push({ items: currentItems, height: targetHeight })
        }
    }

    return rows
}

function ImageSkeleton({ variant, progress }: { ratio?: number; variant: 'generate' | 'history'; progress?: number }) {
    return (
        <div
            className="relative w-full h-full rounded-xl overflow-hidden bg-muted/20 border border-border/40 flex flex-col items-center justify-center isolate transition-all duration-500 ease-in-out"
        >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <Skeleton className="absolute inset-0 h-full w-full rounded-none opacity-20" />

            <div className="flex flex-col items-center gap-3 z-10">
                {variant === 'generate' ? (
                    <Wand2 className="size-6 text-muted-foreground/40 animate-pulse" />
                ) : (
                    <div className="size-10 rounded-full bg-muted/20 flex items-center justify-center">
                        <ImageIcon className="size-5 text-muted-foreground/30" />
                    </div>
                )}
                
                {variant === 'generate' && progress !== undefined && (
                    <div className="flex gap-1.5 items-center">
                        <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-[10px] text-muted-foreground/50 ml-1.5 tabular-nums">{Math.round(progress)}%</span>
                    </div>
                )}
            </div>

            {/* Progress bar (Chỉ cho generate) */}
            {variant === 'generate' && progress !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted/30">
                    <div
                        className="h-full bg-primary/60 transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            )}
        </div>
    )
}

const GalleryImage = React.memo(({
    img,
    itemStyle,
    onSelectImage,
    onDeleteImage,
    onDownloadImage,
    onSetReferenceImage,
    onImageDragStart,
    onImageTouchStart,
    selectionMode,
    isSelected,
    onToggleSelection,
}: {
    img: GeneratedImage
    itemStyle: React.CSSProperties
    onSelectImage: (img: GeneratedImage) => void
    onDeleteImage: (id: string) => void
    onDownloadImage: (url: string, id: string) => void
    onSetReferenceImage: (url: string) => void
    onImageDragStart: (e: React.DragEvent, url: string) => void
    onImageTouchStart: (url: string, x: number, y: number) => void
    selectionMode: boolean
    isSelected: boolean
    onToggleSelection: (id: string) => void
}) => {
    const [isImageLoading, setIsImageLoading] = useState(true)

    return (
        <div
            className={`group/img relative cursor-pointer overflow-hidden rounded-xl border border-border/40 select-none transition-all duration-500 ease-in-out ${isSelected ? 'ring-2 ring-primary' : ''} ${img.isNew ? 'animate-in fade-in-0 zoom-in-[0.98] slide-in-from-bottom-4 duration-700 ease-out fill-mode-both' : ''}`}
            style={{ ...itemStyle, WebkitTouchCallout: 'none' }}
            onClick={() => selectionMode ? onToggleSelection(img.id) : onSelectImage(img)}
            draggable
            onDragStart={(e) => onImageDragStart(e, img.url)}
            onTouchStart={(e) => {
                const touch = e.touches[0]
                onImageTouchStart(img.url, touch.clientX, touch.clientY)
            }}
        >
            {/* Skeleton while image stays loading or if url is somehow broken */}
            {isImageLoading && (
                <div className="absolute inset-0 z-10">
                    <ImageSkeleton variant="history" />
                </div>
            )}

            <img
                src={img.url}
                alt={img.prompt}
                className={`h-full w-full object-cover transition-all duration-700 ${isImageLoading ? 'scale-110 blur-xl opacity-0' : 'scale-100 blur-0 opacity-100'}`}
                onLoad={() => setIsImageLoading(false)}
            />

            {/* Dấu tick khi ảnh được chọn trong chế độ multi-select */}
            {selectionMode && (
                <div className={`absolute top-2 left-2 z-20 size-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-white border-white scale-100' : 'border-white/60 bg-black/30 scale-90'}`}>
                    {isSelected && <Check className="size-4 text-black stroke-[3]" />}
                </div>
            )}

            {!selectionMode && (
                <>
                    {/* Hover overlay content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="secondary" className="size-6 rounded-full bg-black/50 hover:bg-black/70 border-0 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onSetReferenceImage(img.url) }}>
                                    <Wand2 className="size-3 text-white" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">Dùng làm tham chiếu</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="secondary" className="size-6 rounded-full bg-black/50 hover:bg-black/70 border-0 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onDownloadImage(img.url, img.id) }}>
                                    <Download className="size-3 text-white" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">Tải xuống</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="secondary" className="size-6 rounded-full bg-black/50 hover:bg-black/70 border-0 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id) }}>
                                    <Trash2 className="size-3 text-white" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">Xoá</TooltipContent>
                        </Tooltip>
                    </div>
                </>
            )}
        </div>
    )
})
GalleryImage.displayName = 'GalleryImage'

function JustifiedGallery({
    items,
    targetHeight,
    gap,
    onSelectImage,
    onDeleteImage,
    onDownloadImage,
    onSetReferenceImage,
    onImageDragStart,
    onImageTouchStart,
    selectionMode,
    selectedIds,
    onToggleSelection,
    progress,
}: {
    items: GalleryItem[]
    targetHeight: number
    gap: number
    onSelectImage: (img: GeneratedImage) => void
    onDeleteImage: (id: string) => void
    onDownloadImage: (url: string, id: string) => void
    onSetReferenceImage: (url: string) => void
    onImageDragStart: (e: React.DragEvent, url: string) => void
    onImageTouchStart: (url: string, x: number, y: number) => void
    selectionMode: boolean
    selectedIds: Set<string>
    onToggleSelection: (id: string) => void
    progress: number
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState(0)

    // Theo dõi container width bằng ResizeObserver
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const ro = new ResizeObserver(([entry]) => {
            setContainerWidth(entry.contentRect.width)
        })
        ro.observe(el)
        // Đọc width ban đầu
        setContainerWidth(el.clientWidth)
        return () => ro.disconnect()
    }, [])

    const rows = useMemo(() => computeRows(items, containerWidth, targetHeight, gap), [items, containerWidth, targetHeight, gap])

    return (
        <div ref={containerRef} className="w-full flex flex-col" style={{ gap: `${gap}px` }}>
            {rows.map((row: JustifiedRow, rowIdx: number) => (
                <div key={rowIdx} className="flex w-full transition-all duration-500 ease-in-out" style={{ gap: `${gap}px`, height: `${row.height}px` }}>
                    {row.items.map((item: GalleryItem) => {
                        const w = row.height * item.ratio

                        const itemStyle: React.CSSProperties = {
                            width: `${w}px`,
                            height: `${row.height}px`,
                            flexShrink: 1,
                            minWidth: 0,
                        }

                        if (item.type === 'skeleton') {
                            return (
                                <div key={item.key} style={itemStyle}>
                                    <ImageSkeleton ratio={item.ratio} variant={item.variant} progress={progress} />
                                </div>
                            )
                        }

                        return (
                            <GalleryImage
                                key={item.key}
                                img={item.img}
                                isSelected={selectedIds.has(item.img.id)}
                                itemStyle={itemStyle}
                                selectionMode={selectionMode}
                                onToggleSelection={onToggleSelection}
                                onSelectImage={onSelectImage}
                                onImageDragStart={onImageDragStart}
                                onImageTouchStart={onImageTouchStart}
                                onSetReferenceImage={onSetReferenceImage}
                                onDownloadImage={onDownloadImage}
                                onDeleteImage={onDeleteImage}
                            />
                        )
                    })}
                </div>
            ))}
        </div>
    )
}


// Aspect ratio configs — đầy đủ 10 tỉ lệ theo OpenRouter API docs cho Gemini
const ASPECT_RATIOS = [
    { value: "1", label: "1:1", ratio: 1, icon: Square },
    { value: "2/3", label: "2:3", ratio: 2 / 3, icon: RectangleVertical },
    { value: "3/2", label: "3:2", ratio: 3 / 2, icon: RectangleHorizontal },
    { value: "3/4", label: "3:4", ratio: 3 / 4, icon: RectangleVertical },
    { value: "4/3", label: "4:3", ratio: 4 / 3, icon: RectangleHorizontal },
    { value: "4/5", label: "4:5", ratio: 4 / 5, icon: RectangleVertical },
    { value: "5/4", label: "5:4", ratio: 5 / 4, icon: RectangleHorizontal },
    { value: "9/16", label: "9:16", ratio: 9 / 16, icon: RectangleVertical },
    { value: "16/9", label: "16:9", ratio: 16 / 9, icon: RectangleHorizontal },
    { value: "21/9", label: "21:9", ratio: 21 / 9, icon: RectangleHorizontal },
]

// Image size configs — theo OpenRouter image_config.image_size
const IMAGE_SIZES = [
    { value: "1K", label: "1K", desc: "Chuẩn" },
    { value: "2K", label: "2K", desc: "Nét hơn" },
    { value: "4K", label: "4K", desc: "Cao nhất" },
]
export function GeneratePage() {
    // === State ===
    const { updateGems, refreshUser } = useAuth()
    
    // Header Scroll State (Headroom)
    const { scrollY } = useScroll()
    const [isHeaderHidden, setIsHeaderHidden] = useState(false)
    const [isScrolledDown, setIsScrolledDown] = useState(false)
    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolledDown(latest > 200)
        const previous = scrollY.getPrevious() ?? 0
        if (latest > previous && latest > 150) {
            setIsHeaderHidden(true)
        } else {
            setIsHeaderHidden(false)
        }
    })
    const isMobile = useIsMobile()
    const [isGenerating, setIsGenerating] = useState(false)
    const [prompt, setPrompt] = useState("")
    const [images, setImages] = useState<GeneratedImage[]>([])
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
    const [referenceImages, setReferenceImages] = useState<string[]>([])
    const MAX_REFERENCE_IMAGES = 6

    // Helper: thêm ảnh tham chiếu có kiểm tra giới hạn tối đa 6 ảnh
    const addReferenceImages = useCallback((urls: string[]) => {
        setReferenceImages(prev => {
            const unique = urls.filter(u => !prev.includes(u))
            if (unique.length === 0) return prev
            const remaining = MAX_REFERENCE_IMAGES - prev.length
            if (remaining <= 0) {
                toast.error(`Tối đa ${MAX_REFERENCE_IMAGES} ảnh tham chiếu.`, { id: 'ref-limit' })
                return prev
            }
            const toAdd = unique.slice(0, remaining)
            if (toAdd.length < unique.length) {
                toast.warning(`Chỉ thêm được ${toAdd.length}/${unique.length} ảnh (đã đạt tối đa ${MAX_REFERENCE_IMAGES}).`, { id: 'ref-limit' })
            }
            return [...prev, ...toAdd]
        })
    }, [])

    const [refImageUrlInput, setRefImageUrlInput] = useState("")
    const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false)
    // New states for 12 upgrades
    const [negativePrompt, setNegativePrompt] = useState("")
    const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 999999999))
    const [generateProgress, setGenerateProgress] = useState(0)
    const [selectionMode, setSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [promptHistory, setPromptHistory] = useState<string[]>(getPromptHistory)
    const [showHistory, setShowHistory] = useState(false)
    const [isHistoryLoading, setIsHistoryLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [totalImages, setTotalImages] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const loadMoreRef = useRef<HTMLDivElement>(null)

    // Projects (Folders) state
    const [projects, setProjects] = useState<ProjectData[]>([])
    const [currentProjectId, setCurrentProjectId] = useState<string>("all")
    const [isCreatingProject, setIsCreatingProject] = useState(false)
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false)
    const [commandValue, setCommandValue] = useState("all")

    useEffect(() => {
        if (isProjectMenuOpen) {
            setCommandValue(currentProjectId === "all" ? "all" : projects.find(p => String(p.id) === currentProjectId)?.name || "all")
        }
    }, [isProjectMenuOpen, currentProjectId, projects])

    const [newProjectName, setNewProjectName] = useState("")
    // @Mention popover state
    const [showMentionPopover, setShowMentionPopover] = useState(false)
    const mentionInsertPosRef = useRef<number>(0)
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const historyRef = useRef<HTMLDivElement>(null)
    // State cho xác nhận xoá: 'single' hoặc 'batch'
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single'; id: string } | { type: 'batch' } | null>(null)

    // — Custom drag avatar state — (reused for both desktop DnD and mobile touch drag)
    const [dragState, setDragState] = useState<{ url: string; x: number; y: number } | null>(null)
    const dragStateRef = useRef<typeof dragState>(null)

    // — Mobile touch drag refs —
    const touchStartRef = useRef<{ url: string; startX: number; startY: number } | null>(null)
    const touchDragActiveRef = useRef(false)
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

    // ── Lightbox helpers (index-based cho ImageLightbox) ──
    const lbCurrentIdx = selectedImage ? images.findIndex(img => img.id === selectedImage.id) : -1
    // Mobile keyboard: dùng interactive-widget=resizes-content trong viewport meta
    // (Lightbox logic đã chuyển sang ImageLightbox shared component)



    // Mobile keyboard: dùng interactive-widget=resizes-content trong viewport meta
    // để browser tự co layout khi bàn phím mở → sticky bottom-0 tự hoạt động đúng

    // Load danh sách projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await projectApi.list()
                if (res.data) setProjects(res.data)
            } catch (err) {
                // silently fail
            }
        }
        fetchProjects()
    }, [])

    // Handler tạo dự án
    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return
        try {
            const res = await projectApi.create({ name: newProjectName })
            setProjects(prev => [res.data, ...prev])
            setCurrentProjectId(String(res.data.id))
            setNewProjectName("")
            setIsCreatingProject(false)
            toast.success("Đã tạo dự án mới", { id: 'create-proj-success' })
        } catch (e: any) {
            toast.error("Không thể tạo dự án", { id: 'create-proj-error' })
        }
    }

    // Handler xóa dự án
    const handleDeleteProject = async (id: number) => {
        try {
            await projectApi.delete(id)
            setProjects(prev => prev.filter(p => p.id !== id))
            if (currentProjectId === String(id)) {
                setCurrentProjectId("all")
            }
            toast.success("Đã xóa dự án", { id: 'delete-proj-success' })
        } catch (e: any) {
            toast.error("Lỗi khi xóa dự án", { id: 'delete-proj-error' })
        }
    }

    // Load lịch sử ảnh khi component mount hoặc chuyển dự án
    // Helper: parse API response thành GeneratedImage[]
    const parseImageData = (data: GeneratedImageData[]): GeneratedImage[] => {
        return data.map((img) => {
            let arNumber = 1
            if (img.aspect_ratio) {
                const parts = img.aspect_ratio.split(':')
                if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
                    arNumber = Number(parts[0]) / Number(parts[1])
                }
            }
            return {
                id: String(img.id),
                batchId: String(img.id),
                url: img.file_url,
                prompt: img.prompt,
                designedPrompt: img.designed_prompt || undefined,
                negativePrompt: img.negative_prompt || undefined,
                seed: img.seed ?? 0,
                model: img.model,
                style: img.style,
                aspectRatio: arNumber,
                aspectLabel: img.aspect_ratio,
                createdAt: new Date(img.created_at),
                referenceImages: img.reference_images && img.reference_images.length > 0 ? img.reference_images : undefined,
                isNew: false,
            }
        })
    }

    // Load trang đầu tiên khi mount hoặc chuyển dự án
    useEffect(() => {
        const fetchHistory = async () => {
            setIsHistoryLoading(true)
            setImages([])
            setCurrentPage(1)
            setLastPage(1)
            setTotalImages(0)
            try {
                const paramProjectId = currentProjectId === "all" ? undefined : currentProjectId
                const res = await imageApi.list(1, 50, paramProjectId, "ai", null, true)
                if (res.data) {
                    setImages(parseImageData(res.data))
                    setCurrentPage(res.current_page)
                    setLastPage(res.last_page)
                    setTotalImages(res.total)
                }
            } catch (err) {
                // silently fail
            } finally {
                setIsHistoryLoading(false)
            }
        }
        fetchHistory()
    }, [currentProjectId])

    // Load thêm ảnh khi cuộn tới cuối (infinite scroll)
    const loadMoreImages = useCallback(async () => {
        if (isLoadingMore || currentPage >= lastPage) return
        setIsLoadingMore(true)
        try {
            const nextPage = currentPage + 1
            const paramProjectId = currentProjectId === "all" ? undefined : currentProjectId
            const res = await imageApi.list(nextPage, 50, paramProjectId, "ai", null, true)
            if (res.data && res.data.length > 0) {
                setImages(prev => [...prev, ...parseImageData(res.data)])
                setCurrentPage(res.current_page)
                setLastPage(res.last_page)
            }
        } catch (err) {
            // silently fail
        } finally {
            setIsLoadingMore(false)
        }
    }, [isLoadingMore, currentPage, lastPage, currentProjectId])

    // IntersectionObserver: tự load trang tiếp khi user cuộn gần cuối
    useEffect(() => {
        const el = loadMoreRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && currentPage < lastPage && !isLoadingMore) {
                    loadMoreImages()
                }
            },
            { rootMargin: '400px' } // Trigger trước 400px để load trước khi user thấy cuối
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [currentPage, lastPage, isLoadingMore, loadMoreImages])

    // Track cursor position for custom drag avatar (desktop DnD)
    // NOTE: mousemove is suppressed during HTML5 drag — must use the `drag` event instead
    useEffect(() => {
        const onDrag = (e: DragEvent) => {
            if (!dragStateRef.current) return
            // `drag` emits clientX=0, clientY=0 on end — ignore those
            if (e.clientX === 0 && e.clientY === 0) return
            setDragState(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
        }
        const onDragEnd = () => {
            dragStateRef.current = null
            setDragState(null)
        }
        window.addEventListener('drag', onDrag)
        window.addEventListener('dragend', onDragEnd)
        return () => {
            window.removeEventListener('drag', onDrag)
            window.removeEventListener('dragend', onDragEnd)
        }
    }, [])

    // Mobile Touch Drag — reuses dragState and dragStateRef for the same floating avatar
    useEffect(() => {
        const DRAG_THRESHOLD = 10 // px cần di chuyển để kích hoạt drag (phân biệt tap vs drag)

        const onTouchMove = (e: TouchEvent) => {
            if (!touchStartRef.current) return
            const touch = e.touches[0]
            const dx = touch.clientX - touchStartRef.current.startX
            const dy = touch.clientY - touchStartRef.current.startY

            if (!touchDragActiveRef.current) {
                // Chưa active drag (chưa đủ 1.5s): kiểm tra nếu bị trượt tay (scroll/pan)
                if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
                    // Trượt tay -> Huỷ chờ long press
                    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)
                    touchStartRef.current = null
                }
                return
            }

            // Đang drag: cập nhật vị trí và highlight drop zone
            e.preventDefault() // Chặn scroll khi đang drag
            setDragState(prev => prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null)

            const rect = promptContainerRef.current?.getBoundingClientRect()
            if (rect) {
                const isOver = (
                    touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom
                )
                setIsDragging(isOver)
            }
        }

        const onTouchEnd = (e: TouchEvent) => {
            if (!touchStartRef.current) return
            const touch = e.changedTouches[0]

            if (touchDragActiveRef.current) {
                // Kiểm tra nếu thả vào drop zone
                const rect = promptContainerRef.current?.getBoundingClientRect()
                if (rect) {
                    const isOver = (
                        touch.clientX >= rect.left && touch.clientX <= rect.right &&
                        touch.clientY >= rect.top && touch.clientY <= rect.bottom
                    )
                    if (isOver) {
                        const url = touchStartRef.current.url
                        addReferenceImages([url])
                        toast.success('Đã thêm vào ảnh tham chiếu', { id: 'ref-add' })
                    }
                }
            }

            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)

            // Cleanup
            touchStartRef.current = null
            touchDragActiveRef.current = false
            dragStateRef.current = null
            setDragState(null)
            setIsDragging(false)
        }

        const onTouchCancel = () => {
            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)

            touchStartRef.current = null
            touchDragActiveRef.current = false
            dragStateRef.current = null
            setDragState(null)
            setIsDragging(false)
        }

        // passive: false cần thiết để gọi e.preventDefault() trong touchmove
        window.addEventListener('touchmove', onTouchMove, { passive: false })
        window.addEventListener('touchend', onTouchEnd)
        window.addEventListener('touchcancel', onTouchCancel)
        return () => {
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
            window.removeEventListener('touchcancel', onTouchCancel)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Close history dropdown khi click ngoài
    useEffect(() => {
        if (!showHistory) return
        const handler = (e: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
                setShowHistory(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showHistory])

    // Cleanup progress interval on unmount
    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        }
    }, [])

    // --- Prompt Bar refs ---
    const textareaRef = useRef<HTMLDivElement>(null)
    const promptContainerRef = useRef<HTMLDivElement>(null)
    const isComposingRef = useRef(false)
    const forcedCursorRef = useRef<number | null>(null)
    const forcedScrollRef = useRef<number | null>(null)

    // Hàm tiện ích: render prompt thành HTML với mention highlight
    const renderPromptHTML = (text: string): string => {
        if (!text) return ''
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>')
            .replace(/(@(?:Ảnh|anh|ảnh)\s*\d+)/gi, '<span contenteditable="false" data-mention="true" style="color: hsl(var(--primary)); background: hsl(var(--primary) / 0.15); border-radius: 4px; padding: 1px 4px; font-weight: 500; user-select: all; white-space: nowrap;">$1</span>')
    }

    // Hàm tiện ích: đặt cursor vào vị trí offset trong contenteditable
    // Phải duyệt TẤT CẢ nodes (kể cả bên trong contenteditable=false) để khớp với innerText
    const setCursorPosition = (el: HTMLElement, offset: number) => {
        const sel = window.getSelection()
        if (!sel) return

        let currentOffset = 0
        
        // Hàm đệ quy duyệt tất cả nodes
        const walkNodes = (parent: Node): boolean => {
            for (let i = 0; i < parent.childNodes.length; i++) {
                const child = parent.childNodes[i]
                
                if (child.nodeType === Node.TEXT_NODE) {
                    const nodeLen = (child.textContent || '').length
                    if (currentOffset + nodeLen >= offset) {
                        const range = document.createRange()
                        range.setStart(child, offset - currentOffset)
                        range.collapse(true)
                        sel.removeAllRanges()
                        sel.addRange(range)
                        return true
                    }
                    currentOffset += nodeLen
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const childEl = child as HTMLElement
                    // Mention node (contenteditable=false): tính toàn bộ text length, đặt cursor SAU nó
                    if (childEl.getAttribute('contenteditable') === 'false') {
                        const mentionLen = (childEl.textContent || '').length
                        if (currentOffset + mentionLen >= offset) {
                            // Đặt cursor ngay sau mention node
                            const range = document.createRange()
                            range.setStartAfter(child)
                            range.collapse(true)
                            sel.removeAllRanges()
                            sel.addRange(range)
                            return true
                        }
                        currentOffset += mentionLen
                    } else if (childEl.tagName === 'BR') {
                        // <br> tương ứng với 1 ký tự newline
                        if (currentOffset >= offset) {
                            const range = document.createRange()
                            range.setStartBefore(child)
                            range.collapse(true)
                            sel.removeAllRanges()
                            sel.addRange(range)
                            return true
                        }
                        currentOffset += 1
                    } else {
                        if (walkNodes(child)) return true
                    }
                }
            }
            return false
        }

        if (!walkNodes(el)) {
            // Fallback: đặt cursor ở cuối
            const range = document.createRange()
            range.selectNodeContents(el)
            range.collapse(false)
            sel.removeAllRanges()
            sel.addRange(range)
        }
    }

    // Hàm tiện ích: đảm bảo chiều cao contenteditable luôn khớp với nội dung
    const adjustHeight = (el: HTMLDivElement) => {
        const savedScrollTop = el.scrollTop
        // Reset height để đo lại scrollHeight chính xác
        el.style.height = 'auto'
        const newHeight = Math.min(el.scrollHeight, 120)
        el.style.height = newHeight + 'px'
        el.scrollTop = savedScrollTop // Phục hồi scroll position sau khi reset chiều cao

        // Cuộn xuống để cursor luôn nằm trong vùng nhìn thấy
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
            const rect = sel.getRangeAt(0).getBoundingClientRect()
            
            // FIX BUG: Tránh Range lấy toạ độ 0,0 chưa kích hoạt làm giật cuộn lên trên cùng
            if (rect.top === 0 && rect.bottom === 0 && rect.height === 0) return;

            const elRect = el.getBoundingClientRect()
            if (rect.bottom > elRect.bottom) {
                el.scrollTop += rect.bottom - elRect.bottom + 4
            } else if (rect.top > 0 && rect.top < elRect.top) {
                el.scrollTop -= elRect.top - rect.top + 4
            }
        }
    }

    // useEffect: re-render innerHTML với mention highlight khi prompt thay đổi
    useEffect(() => {
        const el = textareaRef.current
        if (!el) return

        // Lưu vị trí cursor hiện tại 
        const sel = window.getSelection()
        let cursorOffset = 0
        if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
            const range = sel.getRangeAt(0)
            const preRange = document.createRange()
            preRange.selectNodeContents(el)
            preRange.setEnd(range.startContainer, range.startOffset)
            cursorOffset = preRange.toString().length
        }

        // Ghi đè nếu có ép buộc từ thao tác chọn ảnh
        let wasForced = false
        if (forcedCursorRef.current !== null) {
            cursorOffset = forcedCursorRef.current
            forcedCursorRef.current = null
            wasForced = true
        }

        // Chỉ update innerHTML nếu text thực sự khác
        const currentText = (el.innerText || '').replace(/\n$/, '')
        if (currentText !== prompt) {
            // Lấy scroll position từ cache (phòng trường hợp trình duyệt reset) hoặc từ el
            const savedScrollTop = forcedScrollRef.current !== null ? forcedScrollRef.current : el.scrollTop
            el.innerHTML = renderPromptHTML(prompt)
            
            // Ép browser khoá chặt scroll bar trong mọi hoàn cảnh
            el.scrollTop = savedScrollTop
            if (forcedScrollRef.current !== null) {
                // Đóng băng scroll trong chuỗi frame liên tiếp để kháng cự native jumping
                for (let i = 0; i <= 5; i++) {
                    setTimeout(() => { if (textareaRef.current) textareaRef.current.scrollTop = savedScrollTop }, i * 15)
                }
                forcedScrollRef.current = null
            }

            // Phục hồi cursor nếu form đang focus HOẶC vừa bấm chèn ảnh
            if (document.activeElement === el || document.activeElement?.tagName === 'BUTTON' || wasForced) {
                if (document.activeElement !== el) el.focus()
                setCursorPosition(el, cursorOffset)
                // Khoá scroll một lần nữa sau khi tạo Range (nguyên nhân gây scroll)
                el.scrollTop = savedScrollTop
            }
        }

        // Luôn recalc chiều cao sau mỗi lần prompt thay đổi
        adjustHeight(el)
    }, [prompt])

    // Danh sách models từ API
    const [availableModels, setAvailableModels] = useState<AiModelData[]>([])
    useEffect(() => {
        modelApi.listActive()
            .then((res) => {
                setAvailableModels(res.data)
                // Đặt model mặc định là model đầu tiên nếu chưa chọn
                if (res.data.length > 0 && !res.data.find((m) => m.model_id === model)) {
                    setModel(res.data[0].model_id)
                }
            })
            .catch(() => { toast.error("Không thể tải danh sách model AI.") })
    }, [])

    // Settings
    const [model, setModel] = useState("")
    const [style, setStyle] = useState("photorealistic")
    const [aspectRatioValue, setAspectRatioValue] = useState("1")
    const [imageSize, setImageSize] = useState("1K")
    const [imageCount, setImageCount] = useState("1")

    // Helper
    const getAspectRatio = (value: string) =>
        ASPECT_RATIOS.find((r) => r.value === value) || ASPECT_RATIOS[0]

    // === Handlers ===
    const handleGenerate = useCallback(async () => {
        if (!prompt.trim() || isGenerating) return

        setIsGenerating(true)
        setGenerateProgress(0)

        // Parse @Ảnh 1, @Ảnh 2... in prompt → [Ảnh tham chiếu X]
        let finalPrompt = prompt.trim()
        const anhRegex = /@(?:Ảnh|anh|ảnh)\s*(\d+)/gi
        finalPrompt = finalPrompt.replace(anhRegex, (_match, p1) => {
            const index = parseInt(p1, 10)
            if (index > 0 && index <= referenceImages.length) {
                return `[Ảnh tham chiếu ${index}]`
            }
            return _match
        })

        // Lưu prompt vào history
        savePromptToHistory(finalPrompt)
        setPromptHistory(getPromptHistory())

        const count = parseInt(imageCount)
        const ar = getAspectRatio(aspectRatioValue)
        const batchId = `batch-${Date.now()}`
        const currentSeed = seed
        const currentNeg = negativePrompt.trim()
        const currentRefs = [...referenceImages]

        // Progress simulation
        const interval = setInterval(() => {
            setGenerateProgress(prev => {
                if (prev >= 95) return 95
                return prev + Math.random() * 5 + 1
            })
        }, 400)
        progressIntervalRef.current = interval

        try {
            // Convert any blob URLs to Base64
            const base64Refs = await Promise.all(
                currentRefs.map(async (url) => {
                    if (url.startsWith('data:')) return url
                    try {
                        const res = await fetch(url)
                        const blob = await res.blob()
                        return new Promise<string>((resolve, reject) => {
                            const reader = new FileReader()
                            reader.onloadend = () => resolve(reader.result as string)
                            reader.onerror = reject
                            reader.readAsDataURL(blob)
                        })
                    } catch (e) {
                        // fallback: dùng URL gốc
                        return url
                    }
                })
            )
            const paramProjectId = currentProjectId === "all" ? undefined : Number(currentProjectId)
            
            const response = await imageApi.generate({
                project_id: paramProjectId,
                prompt: finalPrompt,
                negative_prompt: currentNeg || undefined,
                model,
                style,
                aspect_ratio: ar.label,
                image_size: imageSize,
                seed: currentSeed,
                count,
                reference_images: base64Refs.length > 0 ? base64Refs : undefined,
            })

            clearInterval(interval)
            progressIntervalRef.current = null
            setGenerateProgress(100)

            updateGems(response.gems_remaining)
            refreshUser()
            setTotalImages(prev => prev + count) // Restored line 1974
            toast.success(response.message, { id: 'generate-success' })

            // Đợi thêm 400ms để animation progress bar chạy tới đích (transition 300ms)
            setTimeout(() => {
                const newImages: GeneratedImage[] = response.images.map((img: GeneratedImageData, i: number) => ({
                    id: String(img.id),
                    batchId,
                    url: img.file_url,
                    prompt: img.prompt,
                    designedPrompt: img.designed_prompt || undefined,
                    negativePrompt: img.negative_prompt || undefined,
                    seed: img.seed ?? (currentSeed + i),
                    model: img.model,
                    style: img.style,
                    aspectRatio: ar.ratio,
                    aspectLabel: img.aspect_ratio,
                    createdAt: new Date(img.created_at),
                    referenceImages: img.reference_images && img.reference_images.length > 0 ? img.reference_images : (currentRefs.length > 0 ? currentRefs : undefined),
                    isNew: true,
                }))

                setImages((prev) => [...newImages, ...prev])
                setIsGenerating(false)
                setGenerateProgress(0)
                
                // Clear prompt + ảnh tham chiếu sau khi tạo thành công
                setPrompt("")
                setReferenceImages([])

                // Auto-randomize seed cho lần tạo tiếp theo
                setSeed(Math.floor(Math.random() * 999999999))

                // Tự tắt highlight sau 5 giây
                const newIds = newImages.map((img) => img.id)
                setTimeout(() => {
                    setImages((prev) =>
                        prev.map((img) =>
                            newIds.includes(img.id) ? { ...img, isNew: false } : img
                        )
                    )
                }, 5000)
            }, 400)

        } catch (error: any) {
            clearInterval(interval)
            progressIntervalRef.current = null
            setIsGenerating(false)
            setGenerateProgress(0)

            // Phân loại lỗi để thông báo phù hợp
            const msg = error.message || ''
            if (msg.includes('429') || msg.includes('Too Many')) {
                toast.error('Bạn đang tạo quá nhanh. Vui lòng đợi 1 phút.', { id: 'generate-error' })
            } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('AbortError')) {
                // Mất kết nối — backend có thể vẫn đang chạy
                toast.warning('Mất kết nối. Ảnh có thể vẫn đang tạo — kiểm tra Thư viện sau ít phút.', {
                    id: 'generate-error',
                    duration: 8000,
                })
                // Refresh gems vì có thể đã bị trừ
                refreshUser()
            } else {
                toast.error(msg || 'Lỗi khi tạo ảnh. Vui lòng thử lại.', { id: 'generate-error' })
            }
        }
    }, [prompt, isGenerating, imageCount, model, style, aspectRatioValue, imageSize, negativePrompt, seed, referenceImages, updateGems, refreshUser, currentProjectId, setTotalImages])

    const handleDelete = useCallback((id: string) => {
        setDeleteConfirm({ type: 'single', id })
    }, [])

    // Xác nhận xoá thực sự
    const confirmDelete = useCallback(async () => {
        if (!deleteConfirm) return
        try {
            if (deleteConfirm.type === 'single') {
                await imageApi.delete(Number(deleteConfirm.id))
                setImages(prev => prev.filter(img => img.id !== deleteConfirm.id))
                if (selectedImage?.id === deleteConfirm.id) setSelectedImage(null)
                toast('Đã xoá ảnh', { icon: '🗑️', id: 'delete-single-success' })
            } else {
                for (const id of selectedIds) {
                    await imageApi.delete(Number(id))
                }
                setImages(prev => prev.filter(img => !selectedIds.has(img.id)))
                if (selectedImage && selectedIds.has(selectedImage.id)) setSelectedImage(null)
                toast(`Đã xoá ${selectedIds.size} ảnh`, { icon: '🗑️', id: 'delete-batch-success' })
                setSelectedIds(new Set())
                setSelectionMode(false)
            }
        } catch (e: any) {
            // Đã toast.error bên dưới
            toast.error("Không thể xoá ảnh trên máy chủ", { id: 'delete-api-error' })
        } finally {
            setDeleteConfirm(null)
        }
    }, [deleteConfirm, selectedImage, selectedIds])

    const handleRegenerate = useCallback((img: GeneratedImage) => {
        setPrompt(img.prompt)
        if (img.negativePrompt) setNegativePrompt(img.negativePrompt)
        setModel(img.model)
        setStyle(img.style)
        setSelectedImage(null)
    }, [])

    // Keyboard navigation trong lightbox (← → ESC)
    useEffect(() => {
        if (!selectedImage) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setSelectedImage(null); return }
            const idx = images.findIndex(img => img.id === selectedImage.id)
            if (idx === -1) return
            if (e.key === 'ArrowLeft' && idx > 0) {
                setSelectedImage(images[idx - 1])
            } else if (e.key === 'ArrowRight' && idx < images.length - 1) {
                setSelectedImage(images[idx + 1])
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [selectedImage, images])

    // Batch actions
    const toggleSelection = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            return next
        })
    }, [])
    const handleBatchDelete = useCallback(() => {
        setDeleteConfirm({ type: 'batch' })
    }, [])
    const handleBatchDownload = useCallback(async () => {
        const toDownload = images.filter(img => selectedIds.has(img.id))
        for (const img of toDownload) {
            await downloadImage(img.url, `zdream-${img.id}.jpg`) // silent, không toast từng ảnh
        }
        // silent
        setSelectedIds(new Set())
        setSelectionMode(false)
    }, [images, selectedIds])

    const handleBatchAddReference = useCallback(() => {
        const toAdd = images.filter(img => selectedIds.has(img.id)).map(img => img.url)
        setReferenceImages(prev => {
            const newUrls = toAdd.filter(url => !prev.includes(url))
            if (newUrls.length === 0) {
                toast('Tất cả ảnh này đã có trong tham chiếu rồi', { icon: 'ℹ️', id: 'ref-exists' })
                return prev
            }
            toast.success(`Đã thêm ${newUrls.length} ảnh vào tham chiếu`, { id: 'ref-add' })
            return [...prev, ...newUrls]
        })
        setSelectedIds(new Set())
        setSelectionMode(false)
    }, [images, selectedIds])

    // Drag & drop reference images
    const handleDragOver = (e: React.DragEvent) => {
        // Cần preventDefault để allow drop
        e.preventDefault()
        // Nếu đang kéo một thẻ HTML có chứa text (chính là URL ảnh được gài vào e.dataTransfer.setData('text/plain'))
        // Hoặc đang kéo Files từ máy tính vào
        if (e.dataTransfer.types.includes('Files') || e.dataTransfer.types.includes('text/plain')) {
            setIsDragging(true)
        }
    }
    const handleDragLeave = (e: React.DragEvent) => {
        // Chỉ ẩn khi rời khỏi container thực sự, không phải child elements
        if (e.currentTarget.contains(e.relatedTarget as Node)) return
        setIsDragging(false)
    }
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        
        // 1. Xử lý Drop Image từ thiết bị local (Tệp tin thật)
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
        if (files.length > 0) {
            const urls = files.map(f => URL.createObjectURL(f))
            addReferenceImages(urls)
            return
        }

        // 2. Xử lý Drop Text (Dữ liệu URL kéo từ gallery xuống)
        const textData = e.dataTransfer.getData('text/plain')
        if (textData && (textData.startsWith('http') || textData.startsWith('blob:') || textData.startsWith('data:'))) {
            addReferenceImages([textData])
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            const urls = files.map(file => URL.createObjectURL(file))
            addReferenceImages(urls)
        }
        // Cho phép chọn lại file vừa xoá
        if (e.target) {
            e.target.value = ""
        }
    }

    const handleUrlSubmit = () => {
        if (refImageUrlInput.trim()) {
            addReferenceImages([refImageUrlInput.trim()])
            setRefImageUrlInput("")
        }
    }

    // State cho tab thư viện trong reference image picker
    const [libraryRefImages, setLibraryRefImages] = useState<GeneratedImageData[]>([])
    const [libraryRefLoading, setLibraryRefLoading] = useState(false)
    const [libraryRefPage, setLibraryRefPage] = useState(1)
    const [libraryRefHasMore, setLibraryRefHasMore] = useState(true)
    const [libraryRefType, setLibraryRefType] = useState<string | null>(null)

    // Fetch ảnh thư viện khi mở tab hoặc đổi filter
    const fetchLibraryRefImages = useCallback(async (page = 1, append = false, type: string | null = null) => {
        setLibraryRefLoading(true)
        try {
            const res = await imageApi.list(page, 20, null, type)
            if (append) {
                setLibraryRefImages(prev => [...prev, ...res.data])
            } else {
                setLibraryRefImages(res.data)
            }
            setLibraryRefPage(res.current_page)
            setLibraryRefHasMore(res.current_page < res.last_page)
        } catch {
            // Lỗi fetch thư viện — bỏ qua
        } finally {
            setLibraryRefLoading(false)
        }
    }, [])

    const renderReferenceImageContent = () => (
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-4 overscroll-contain">
            <Tabs defaultValue="upload" className="w-full" onValueChange={(v) => {
                if (v === 'library' && libraryRefImages.length === 0) fetchLibraryRefImages(1, false, libraryRefType)
            }}>
                <div className="px-4 pt-3 pb-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="text-xs"><Upload className="size-3 mr-1.5" /> Tải lên</TabsTrigger>
                        <TabsTrigger value="library" className="text-xs"><LayoutGrid className="size-3 mr-1.5" /> Thư viện</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="upload" className="flex flex-col p-4 pt-0 m-0 min-h-[280px] data-[state=inactive]:hidden">
                    <div className="flex flex-col gap-3 flex-1">
                        {/* Lõi chọn file - Dùng flex-1 để lấp đầy khoảng sống khi chưa có ảnh */}
                        <label
                            htmlFor="ref-image-upload"
                            className="group flex-1 flex flex-col items-center justify-center w-full min-h-[100px] rounded-xl border-2 border-dashed border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 cursor-pointer transition-all"
                        >
                            <div className="p-2.5 rounded-full bg-background border border-border/50 group-hover:scale-110 transition-transform mb-2 shadow-sm">
                                <Upload className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-[11px] text-muted-foreground font-medium">Bấm hoặc kéo thả ảnh vào đây</span>
                            <input
                                id="ref-image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>

                        {/* Phân cách */}
                        <div className="relative flex items-center py-1 shrink-0">
                            <div className="flex-grow border-t border-border/40"></div>
                            <span className="shrink-0 px-2 text-[10px] text-muted-foreground uppercase tracking-wider">Hoặc nhập liên kết</span>
                            <div className="flex-grow border-t border-border/40"></div>
                        </div>

                        {/* Nhập URL */}
                        <div className="flex gap-2 shrink-0">
                            <div className="relative flex-1">
                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="https://"
                                    className="h-9 pl-8 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/30"
                                    value={refImageUrlInput}
                                    onChange={(e) => setRefImageUrlInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                                />
                            </div>
                            <Button size="icon" className="size-9 shrink-0 shadow-sm" onClick={handleUrlSubmit} disabled={!refImageUrlInput.trim()}>
                                <Check className="size-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Hiển thị ảnh tham chiếu đã thêm - Neo đáy */}
                    {referenceImages.length > 0 && (
                        <div className="mt-auto pt-5">
                            <div className="flex items-center justify-between mb-2.5">
                                <span className="text-[10px] uppercase tracking-wider text-foreground font-semibold flex items-center gap-1.5">
                                    <ImageIcon className="size-3 text-primary" />
                                    Ảnh đã chọn
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">
                                    {referenceImages.length} / {MAX_REFERENCE_IMAGES}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {referenceImages.map((src, idx) => (
                                    <div key={idx} className="relative group/thumb aspect-square rounded-lg overflow-hidden border border-border/50 shadow-sm">
                                        <img src={src} alt={`Ref ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setReferenceImages(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute inset-0 bg-black/5 backdrop-blur-[1px] group-hover/thumb:bg-black/40 transition-all flex items-center justify-center"
                                        >
                                            <X className="size-4 text-white opacity-0 group-hover/thumb:opacity-100 group-hover/thumb:scale-110 transition-all drop-shadow-md" />
                                        </button>
                                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                                            {idx + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="library" className="px-4 pt-0 m-0 min-h-[280px]">
                    {/* Bộ lọc loại ảnh */}
                    <div className="flex gap-1.5 mb-3">
                        {([
                            { value: null, label: 'Tất cả' },
                            { value: 'upload', label: 'Upload' },
                            { value: 'ai', label: 'AI' }
                        ] as const).map(({ value, label }) => (
                            <button
                                key={label}
                                type="button"
                                className={cn(
                                    'px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
                                    libraryRefType === value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                )}
                                onClick={() => {
                                    setLibraryRefType(value)
                                    fetchLibraryRefImages(1, false, value)
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {libraryRefLoading && libraryRefImages.length === 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-square rounded-lg" />
                            ))}
                        </div>
                    ) : libraryRefImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <ImageIcon className="size-8 text-muted-foreground/40 mb-2" />
                            <span className="text-xs text-muted-foreground">Thư viện trống</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1 overscroll-contain">
                                {libraryRefImages.map((img) => (
                                    <button
                                        key={img.id}
                                        type="button"
                                        className="group relative aspect-square rounded-lg overflow-hidden border border-border/30 hover:border-primary/60 transition-all hover:ring-2 hover:ring-primary/30 focus-visible:ring-2 focus-visible:ring-primary"
                                        onClick={() => {
                                            setReferenceImages(prev => {
                                                if (prev.includes(img.file_url)) return prev
                                                return [...prev, img.file_url]
                                            })
                                            toast.success('Đã thêm ảnh tham chiếu', { id: 'ref-add' })
                                        }}
                                    >
                                        <img
                                            src={img.file_url}
                                            alt={img.prompt}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <Plus className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                        </div>
                                    </button>
                                ))}
                                {/* Sentinel element — infinite scroll trigger */}
                                {libraryRefHasMore && (
                                    <div
                                        ref={(node) => {
                                            if (!node) return
                                            const observer = new IntersectionObserver(
                                                ([entry]) => {
                                                    if (entry.isIntersecting && !libraryRefLoading && libraryRefHasMore) {
                                                        fetchLibraryRefImages(libraryRefPage + 1, true, libraryRefType)
                                                    }
                                                },
                                                { rootMargin: '100px' }
                                            )
                                            observer.observe(node)
                                            // Cleanup khi unmount
                                            return () => observer.disconnect()
                                        }}
                                        className="col-span-3 flex justify-center py-3"
                                    >
                                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                    )}
                </TabsContent>
            </Tabs>

        </div>
    )

    const renderSettingsContent = () => (
        <div className="space-y-4 px-4 pb-6 pt-4 overflow-y-auto custom-scrollbar max-h-[70vh]">
            {/* Model Select (Mobile Only) */}
            <div className="space-y-2 sm:hidden">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Model</Label>
                <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="h-8">
                        <SelectValue placeholder="Chọn model" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableModels.map((m) => (
                            <SelectItem key={m.model_id} value={m.model_id}>
                                {m.name} <span className="text-muted-foreground">({m.gems_cost} xu)</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Tỷ lệ khung hình</Label>
                <ToggleGroup
                    type="single"
                    value={aspectRatioValue}
                    onValueChange={(v) => v && setAspectRatioValue(v)}
                    className="grid grid-cols-5 gap-1.5"
                >
                    {ASPECT_RATIOS.map((ar) => (
                        <ToggleGroupItem
                            key={ar.value}
                            value={ar.value}
                            className="flex flex-col gap-1 h-auto py-2 rounded-lg text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                            <ar.icon className="size-4" />
                            {ar.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            {/* Số lượng */}
            <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Số lượng ảnh</Label>
                <ToggleGroup
                    type="single"
                    value={imageCount}
                    onValueChange={(v) => v && setImageCount(v)}
                    className="grid grid-cols-4 gap-1.5"
                >
                    {["1", "2", "3", "4"].map((n) => (
                        <ToggleGroupItem
                            key={n}
                            value={n}
                            className="rounded-lg text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                            {n}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            {/* Style */}
            <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Phong cách</Label>
                <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="photorealistic">Chân thực</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                        <SelectItem value="digital-art">Digital Art</SelectItem>
                        <SelectItem value="3d-render">3D Render</SelectItem>
                        <SelectItem value="watercolor">Màu nước</SelectItem>
                        <SelectItem value="oil-painting">Sơn dầu</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Độ phân giải (Image Size) — theo OpenRouter image_config */}
            <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Độ phân giải</Label>
                <ToggleGroup
                    type="single"
                    value={imageSize}
                    onValueChange={(v) => v && setImageSize(v)}
                    className="grid grid-cols-3 gap-1.5"
                >
                    {IMAGE_SIZES.map((s) => (
                        <ToggleGroupItem
                            key={s.value}
                            value={s.value}
                            className="flex flex-col gap-0.5 h-auto py-2 rounded-lg text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                            <span className="font-semibold">{s.label}</span>
                            <span className="text-[9px] opacity-60">{s.desc}</span>
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            <Separator />

            {/* Negative Prompt */}
            <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Negative Prompt</Label>
                <textarea
                    placeholder="mờ, nhòe, chữ, watermark, chất lượng thấp..."
                    className="w-full resize-none border border-border/50 bg-muted/20 rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none placeholder:text-muted-foreground/40 min-h-[60px] max-h-[100px] overflow-y-auto custom-scrollbar"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground/60">Những gì AI nên tránh khi tạo ảnh.</p>
            </div>

            {/* Seed */}
            <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Seed</Label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        className="h-8 text-sm text-foreground flex-1"
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                    />
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs shrink-0"
                        onClick={() => setSeed(Math.floor(Math.random() * 999999999))}
                    >
                        <Dices className="size-3.5 mr-1" /> Random
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/60">Cùng seed sẽ cho kết quả tương tự.</p>
            </div>
        </div>
    )

    const galleryMemo = useMemo(() => {
        if (images.length === 0 && !isGenerating && !isHistoryLoading) return null

        // Xây dựng danh sách item: skeleton trước, ảnh thật sau
        const GAP = 6 // gap giữa ảnh (px)
        const TARGET_H = Math.max(160, Math.min(window.innerWidth * 0.22, 280))

        // Tạo items list: skeleton + ảnh
        const items: GalleryItem[] = []

        if (isGenerating) {
            const count = parseInt(imageCount)
            const ratio = getAspectRatio(aspectRatioValue).ratio
            for (let i = 0; i < count; i++) {
                items.push({ type: 'skeleton', ratio, key: `skeleton-gen-${i}`, variant: 'generate' })
            }
        }

        if (isHistoryLoading && !isGenerating && images.length === 0) {
            // API đang fetch metadata — chỉ hiện spinner nhẹ, KHÔNG dùng skeleton giả tỉ lệ
            return (
                <div className="flex items-center justify-center py-20 w-full">
                    <div className="flex flex-col items-center gap-3">
                        <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <span className="text-xs text-muted-foreground">Đang tải ảnh...</span>
                    </div>
                </div>
            )
        }

        for (const img of images) {
            items.push({ type: 'image', img, ratio: img.aspectRatio, key: img.id })
        }

        return (
            <div className="flex flex-col gap-3">
                <JustifiedGallery
                    items={items}
                    targetHeight={TARGET_H}
                    gap={GAP}
                    onSelectImage={setSelectedImage}
                    onDeleteImage={handleDelete}
                    onDownloadImage={(url, id) => downloadImage(url, `zdream-${id}.jpg`)}
                    onSetReferenceImage={(url) => {
                        addReferenceImages([url])
                    }}
                    onImageDragStart={(e, url) => {
                        e.dataTransfer.setData('text/plain', url)
                        // Ẩn native ghost
                        const emptyCanvas = document.createElement('canvas')
                        emptyCanvas.width = 1; emptyCanvas.height = 1
                        document.body.appendChild(emptyCanvas)
                        e.dataTransfer.setDragImage(emptyCanvas, 0, 0)
                        setTimeout(() => document.body.removeChild(emptyCanvas), 0)
                        // Kích hoạt custom floating overlay
                        const initial = { url, x: e.clientX, y: e.clientY }
                        dragStateRef.current = initial
                        setDragState(initial)
                    }}
                    onImageTouchStart={(url, x, y) => {
                        touchStartRef.current = { url, startX: x, startY: y }
                        touchDragActiveRef.current = false
                        
                        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)
                        longPressTimerRef.current = setTimeout(() => {
                            touchDragActiveRef.current = true
                            const initial = { url, x, y }
                            dragStateRef.current = initial
                            setDragState(initial)
                            // Optional haptic feedback
                            if (navigator.vibrate) navigator.vibrate(50)
                        }, 1500)
                    }}
                    selectionMode={selectionMode}
                    selectedIds={selectedIds}
                    onToggleSelection={toggleSelection}
                    progress={generateProgress}
                />

                {/* Infinite scroll sentinel + Loading more indicator */}
                {currentPage < lastPage && (
                    <div ref={loadMoreRef} className="flex items-center justify-center py-6 w-full">
                        {isLoadingMore && (
                            <div className="flex items-center gap-2">
                                <div className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                <span className="text-xs text-muted-foreground">Đang tải thêm...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Stat bar — Hiện khi đã load xong trang đầu */}
                {images.length > 0 && !isHistoryLoading && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                        Đã hiển thị {images.length}/{totalImages} ảnh
                    </div>
                )}

            </div>
        )
    }, [
        images, isGenerating, isHistoryLoading, imageCount, aspectRatioValue, 
        selectionMode, selectedIds, generateProgress, currentPage, lastPage, 
        isLoadingMore, totalImages,
        setSelectedImage, handleDelete, toggleSelection
    ])

    return (
        <>  
        <TooltipProvider>
            <div className="relative flex flex-1 flex-col min-w-0">
                {/* Nền sạch, không gradient blob */}

                {/* === CANVAS AREA — Gallery full-width, justified layout === */}
                <div className="relative z-10 flex-1 flex flex-col p-3 sm:p-4 lg:p-6 min-w-0">
                    {/* Top Canvas Header: Smart Sticky Header (Headroom pattern) */}
                    <motion.div 
                        variants={{ visible: { y: 0, opacity: 1 }, hidden: { y: "-110%", opacity: 0 } }}
                        animate={isHeaderHidden ? "hidden" : "visible"}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="sticky top-[60px] md:top-0 z-30 py-3 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6 mb-4 sm:mb-6"
                    >
                        {/* Fading Blur Background Layer — Animated for smooth entry/exit */}
                        <motion.div 
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ 
                                opacity: isHeaderHidden ? 0 : 1,
                                backdropFilter: isHeaderHidden ? "blur(0px)" : "blur(5px)"
                            }}
                            transition={{ 
                                duration: 0.3, 
                                ease: "easeOut",
                                delay: isHeaderHidden ? 0 : 0.4 
                            }}
                            className="absolute inset-0 -z-10 bg-background/20 pointer-events-none"
                            style={{ 
                                maskImage: 'linear-gradient(to bottom, black calc(100% - 25px), transparent 100%)', 
                                WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 25px), transparent 100%)' 
                            }}
                        />

                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 sm:px-0">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Popover open={isProjectMenuOpen} onOpenChange={setIsProjectMenuOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isProjectMenuOpen}
                                            className="w-full sm:w-[260px] justify-between font-semibold shadow-sm h-10 border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-transparent"
                                        >
                                            <div className="flex items-center truncate">
                                                <FolderOpen className="mr-2 h-4 w-4 shrink-0 text-primary" />
                                                <span className="truncate">
                                                    {currentProjectId === 'all' 
                                                        ? 'Tất cả ảnh' 
                                                        : projects.find((project) => String(project.id) === currentProjectId)?.name || 'Tất cả ảnh'}
                                                </span>
                                            </div>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent 
                                        className="w-[calc(100vw-2rem)] sm:w-[320px] p-0 shadow-xl rounded-xl border-border/40" 
                                        align="start"
                                        onOpenAutoFocus={(e) => {
                                            if (window.innerWidth < 768) {
                                                e.preventDefault()
                                            }
                                        }}
                                    >
                                        <Command value={commandValue} onValueChange={setCommandValue}>
                                            <CommandInput placeholder="Tìm kiếm thư mục..." />
                                            <CommandList className="custom-scrollbar">
                                                <CommandEmpty>Không tìm thấy thư mục nào.</CommandEmpty>
                                                <CommandGroup heading="Mặc định">
                                                    <CommandItem
                                                        value="all"
                                                        onSelect={() => {
                                                            setCurrentProjectId("all")
                                                            setIsProjectMenuOpen(false)
                                                        }}
                                                    >
                                                        <LayoutGrid />
                                                        <span>Tất cả ảnh</span>
                                                        <Check
                                                            className={cn("ml-auto", currentProjectId === "all" ? "opacity-100" : "opacity-0")}
                                                        />
                                                    </CommandItem>
                                                </CommandGroup>
                                                <CommandSeparator />
                                                <CommandGroup heading="Thư mục của bạn">
                                                    {projects.map((project) => (
                                                        <CommandItem
                                                            key={project.id}
                                                            value={project.name}
                                                            onSelect={() => {
                                                                setCurrentProjectId(String(project.id))
                                                                setIsProjectMenuOpen(false)
                                                            }}
                                                        >
                                                            <FolderOpen />
                                                            <span className="truncate">{project.name}</span>
                                                            <Check
                                                                className={cn("ml-auto", currentProjectId === String(project.id) ? "opacity-100" : "opacity-0")}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                            <CommandSeparator />
                                            <div className="p-1.5 space-y-1">
                                                <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 h-9 px-2 rounded-md">
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Tạo thư mục mới
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="w-[95vw] max-w-md rounded-xl">
                                                        <DialogTitle>Tạo thư mục mới</DialogTitle>
                                                        <div className="flex flex-col gap-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label>Tên thư mục</Label>
                                                                <Input 
                                                                    autoFocus
                                                                    placeholder="Ví dụ: Cảnh quan Cyberpunk..."
                                                                    value={newProjectName}
                                                                    onChange={e => setNewProjectName(e.target.value)}
                                                                    onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-2">
                                                            <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setIsCreatingProject(false)}>Hủy</Button>
                                                            <Button className="w-full sm:w-auto" onClick={handleCreateProject} disabled={!newProjectName.trim()}>Tạo mới</Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                                {/* Nút xóa thư mục - chỉ hiện khi đang chọn 1 thư mục cụ thể */}
                                                {currentProjectId !== 'all' && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-9 px-2 rounded-md">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Xóa thư mục "{projects.find(p => String(p.id) === currentProjectId)?.name}"
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="w-[95vw] max-w-md rounded-xl">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Xóa thư mục làm việc?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Hành động này sẽ xóa vĩnh viễn thư mục <b className="text-foreground">{projects.find(p => String(p.id) === currentProjectId)?.name}</b>.<br/>
                                                                    Các ảnh bên trong sẽ KHÔNG bị xóa mà được chuyển về kho chung "Tất cả ảnh".
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                                                                <AlertDialogCancel className="w-full sm:w-auto mt-0">Hủy</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteProject(Number(currentProjectId))} className="w-full sm:w-auto bg-destructive text-destructive-foreground">Đồng ý xóa</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Stats & Actions (Moved to same row on desktop) */}
                            {images.length > 0 && !isHistoryLoading && (
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end mt-3 sm:mt-0">
                                    <Badge variant="default" className="font-semibold bg-black text-white hover:bg-black pointer-events-none rounded-md px-2.5">
                                        {images.length} ảnh đã tạo
                                    </Badge>
                                    <Button
                                        variant={selectionMode ? "secondary" : "default"}
                                        size="sm"
                                        className="h-7 text-xs rounded-full px-4"
                                        onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()) }}
                                    >
                                        <CheckSquare className="size-3.5 mr-1.5" />
                                        {selectionMode ? "Hủy chọn" : "Chọn"}
                                    </Button>
                                </div>
                            )}
                        </div>
                        
                    </motion.div>

                    {/* Floating Toggle Button (Sticky to stay centered in the exact canvas area) */}
                    <div className="sticky top-[70px] md:top-6 z-40 w-full flex justify-center items-start pointer-events-none h-0">
                        <AnimatePresence>
                            {isHeaderHidden && (
                                <motion.button
                                    initial={{ y: -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    onClick={() => setIsHeaderHidden(false)}
                                    className="pointer-events-auto bg-background/90 backdrop-blur-md border border-border shadow-md rounded-full px-4 py-2 flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-shadow mt-1"
                                >
                                    <ChevronDown className="size-3.5 text-foreground mr-1.5" />
                                    <span className="text-[12px] font-bold text-foreground">Hiện công cụ</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-full flex flex-col flex-1 min-w-0">
                        {/* Empty State — Solid, Neo-brutalism flat design */}
                        {images.length === 0 && !isGenerating && !isHistoryLoading && (
                            <div className="flex-1 flex flex-col items-center justify-center w-full animate-in fade-in duration-700 px-4 -mt-12">

                                {/* Typography */}
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-2 sm:mb-3 text-foreground text-balance">
                                    Đánh thức trí tưởng tượng
                                </h1>
                                <p className="text-muted-foreground text-center text-sm font-medium mb-8 sm:mb-10 max-w-sm leading-relaxed text-balance">
                                    ZDream biến mọi giới hạn của ngôn từ thành những không gian thị giác vô tận.
                                </p>

                                {/* Creative Suggestion Cards — Responsive: 2 on mobile, 4 lg */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-4xl w-full">
                                    {[
                                        { tag: "Nghệ thuật", title: "Sơn dầu trừu tượng", desc: "Sắc màu rực rỡ, nét cọ mạnh mẽ", icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.866 8.21 8.21 0 003 2.48z" },
                                        { tag: "Tương lai", title: "Thành phố Cyberpunk", desc: "Neon, mưa kỹ thuật số, công nghệ cao", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
                                        { tag: "Nhiếp ảnh", title: "Chân dung Cinematic", desc: "Ánh sáng dramatic, bokeh sâu", icon: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z M18.75 10.5h.008v.008h-.008V10.5z" },
                                        { tag: "Kỳ ảo", title: "Thế giới cổ mộc", desc: "Rừng già phát sáng, sinh vật huyền bí", icon: "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" },
                                    ].map((item) => (
                                        <button
                                            key={item.title}
                                            className="group relative flex flex-col text-left p-3 sm:p-4 rounded-xl border-2 border-border bg-card hover:bg-accent transition-colors duration-200 overflow-hidden cursor-pointer w-full"
                                            onClick={() => setPrompt(`${item.title}, ${item.desc}`)}
                                        >
                                            {/* Watermark Icon - Solid color (text-border) */}
                                            <div className="absolute -top-3 -right-2 p-4 text-border group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-16 sm:size-20">
                                                    <path fillRule="evenodd" d={item.icon} clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 z-10">
                                                {item.tag}
                                            </span>
                                            <span className="text-xs sm:text-sm font-bold text-foreground mb-1 z-10 group-hover:text-primary transition-colors">
                                                {item.title}
                                            </span>
                                            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground pr-4 leading-relaxed z-10 hidden lg:block">
                                                {item.desc}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* === Gallery — Justified rows (Google Photos style) === */}
                        {galleryMemo}
                    </div>
                </div>

                {/* === IMAGE VIEWER — Fullscreen Portal Lightbox === */}
                {/* === LIGHTBOX — dùng shared ImageLightbox component === */}
                <ImageLightbox
                    open={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    images={images.map(img => img.url)}
                    currentIndex={lbCurrentIdx >= 0 ? lbCurrentIdx : 0}
                    onIndexChange={(i) => setSelectedImage(images[i])}
                    maxZoom={MAX_ZOOM}
                    badge={
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            <Wand2 className="size-3.5" />
                            AI
                        </div>
                    }
                    actions={selectedImage ? <>
                        <Button variant="ghost" size="icon" title="Tải xuống" className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 py-0 rounded-xl" onClick={() => downloadImage(selectedImage.url, `zdream-${selectedImage.id}.jpg`)}>
                            <Download className="size-4" />
                        </Button>
                        <Button variant="ghost" title="Ảnh tham chiếu" className="text-white hover:bg-white/20 gap-1.5 h-8 sm:h-9 rounded-xl px-2 sm:px-3" onClick={() => {
                            addReferenceImages([selectedImage.url])
                        }}>
                            <ImageIcon className="size-4" />
                            <span className="hidden sm:inline text-xs font-medium">Tham chiếu</span>
                        </Button>
                        <Button
                            variant="ghost"
                            title="Tạo lại"
                            className="text-white hover:bg-white/20 gap-1.5 h-8 sm:h-9 rounded-xl px-2 sm:px-3"
                            disabled={isGenerating}
                            onClick={() => handleRegenerate(selectedImage)}
                        >
                            {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                            <span className="hidden sm:inline text-xs font-medium">{isGenerating ? 'Đang tạo...' : 'Tạo lại'}</span>
                        </Button>
                        <Button variant="ghost" size="icon" title="Xoá ảnh" className="text-red-400 hover:bg-red-500/20 hover:text-red-400 h-8 w-8 sm:h-9 sm:w-9 py-0 rounded-xl mr-0.5" onClick={() => handleDelete(selectedImage.id)}>
                            <Trash2 className="size-4" />
                        </Button>
                    </> : undefined}
                    infoPanel={selectedImage ? <>
                        {/* Prompt */}
                        <div className="px-5 pt-4 pb-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Prompt</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2.5 text-xs text-white/50 hover:text-white hover:bg-white/10 gap-1.5"
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedImage.prompt)
                                        toast.success('Đã sao chép prompt', { id: 'copy-prompt' })
                                    }}
                                >
                                    <Copy className="size-3" />
                                    Sao chép
                                </Button>
                            </div>
                            <p className="text-sm text-white/85 leading-relaxed">
                                {selectedImage.prompt.split(/(\[Ảnh tham chiếu \d+\]|@(?:Ảnh|anh|ảnh)\s*\d+)/gi).map((part, i) =>
                                    /^(\[Ảnh tham chiếu \d+\]|@(?:Ảnh|anh|ảnh)\s*\d+)$/i.test(part)
                                        ? <span key={i} className="text-violet-400 bg-violet-500/15 rounded px-1 py-0.5 text-xs font-semibold">{part}</span>
                                        : <span key={i}>{part}</span>
                                )}
                            </p>
                        </div>

                        {/* AI Designed Prompt */}
                        {selectedImage.designedPrompt && (
                            <div className="px-5 py-3 space-y-2 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-medium text-violet-400/70 uppercase tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="size-3" />
                                        AI Designed Prompt
                                    </p>
                                    <button
                                        className="text-[10px] text-white/40 hover:text-white/70 transition-colors"
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedImage.designedPrompt || '')
                                            toast.success('Đã sao chép AI prompt')
                                        }}
                                    >
                                        Sao chép
                                    </button>
                                </div>
                                <p className="text-sm text-white/75 leading-relaxed">{selectedImage.designedPrompt}</p>
                            </div>
                        )}

                        {/* Negative Prompt */}
                        {selectedImage.negativePrompt && (
                            <div className="px-5 py-3 space-y-2 border-t border-white/5">
                                <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Negative Prompt</p>
                                <p className="text-sm text-white/65 leading-relaxed">{selectedImage.negativePrompt}</p>
                            </div>
                        )}

                        {/* Ảnh tham chiếu */}
                        {selectedImage.referenceImages && selectedImage.referenceImages.length > 0 && (
                            <div className="px-5 py-3 space-y-2 border-t border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Ảnh tham chiếu</p>
                                    <span className="text-[9px] font-bold bg-white/10 text-white/60 px-1.5 py-0.5 rounded">{selectedImage.referenceImages.length}</span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {selectedImage.referenceImages.map((src, i) => (
                                        <div key={i} className="aspect-square relative">
                                            <img src={src} className="absolute inset-0 w-full h-full rounded-lg object-cover border border-white/10" alt="ref" />
                                            <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-white border border-white/20 text-[9px] font-bold h-4 w-4 rounded-full shadow-sm flex items-center justify-center z-10">
                                                {i + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Metadata grid */}
                        <div className="px-5 py-3 border-t border-white/5">
                            <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-3">Thông số</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Box className="size-3" />
                                        <span className="text-[11px]">Model</span>
                                    </div>
                                    <p className="text-xs text-white/80 font-medium truncate" title={selectedImage.model}>
                                        {selectedImage.model.split('/').pop() || selectedImage.model}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Palette className="size-3" />
                                        <span className="text-[11px]">Style</span>
                                    </div>
                                    <p className="text-xs text-white/80 font-medium capitalize">{selectedImage.style}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Ruler className="size-3" />
                                        <span className="text-[11px]">Tỷ lệ</span>
                                    </div>
                                    <p className="text-xs text-white/80 font-medium">{selectedImage.aspectLabel}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Hash className="size-3" />
                                        <span className="text-[11px]">Seed</span>
                                    </div>
                                    <p className="text-xs text-white/80 font-medium tabular-nums">{selectedImage.seed}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Clock className="size-3" />
                                        <span className="text-[11px]">Ngày tạo</span>
                                    </div>
                                    <p className="text-xs text-white/80 font-medium">
                                        {selectedImage.createdAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })} {selectedImage.createdAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </> : undefined}
                />

{/* === XÁC NHẬN XOÁ === */}
                <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                    <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                                <Trash2 />
                            </AlertDialogMedia>
                            <AlertDialogTitle>
                                {deleteConfirm?.type === 'batch' ? `Xoá ${selectedIds.size} ảnh?` : 'Xoá ảnh này?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {deleteConfirm?.type === 'batch'
                                    ? `Bạn có chắc muốn xoá ${selectedIds.size} ảnh đã chọn? Hành động này không thể hoàn tác.`
                                    : 'Hành động này không thể hoàn tác. Ảnh sẽ bị xoá vĩnh viễn.'
                                }
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel variant="outline">Huỷ</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
                                Xoá
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* === PROMPT BAR — sticky dính đáy viewport === */}
                <div ref={promptContainerRef} className="sticky bottom-0 z-50 mx-auto w-full max-w-2xl px-3 sm:px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6 pt-10 sm:pt-6 pointer-events-none bg-gradient-to-b from-transparent to-background to-[40%] sm:bg-none">
                    {/* Floating Indicators Container */}
                    <div className="absolute bottom-[calc(100%-1.5rem)] mb-2 sm:mb-2.5 right-3 sm:right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
                        <AnimatePresence>
                            {/* Scroll to Top Handle (when scrolled down but NOT generating) */}
                            {isScrolledDown && !isGenerating && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                    className="pointer-events-auto"
                                >
                                    <button
                                        className="h-8 md:h-9 px-3.5 md:px-4 rounded-full bg-[#1c1c1e] border border-[#303030] shadow-xl flex items-center justify-center gap-1.5 text-[#a1a1aa] hover:text-white hover:bg-[#2c2c2e] transition-all outline-none group"
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                        aria-label="Lên đầu trang"
                                    >
                                        <span className="text-[12px] md:text-[13px] font-semibold tracking-wide">Lên trên cùng</span>
                                        <ChevronUp className="size-3.5 md:size-4 opacity-70 group-hover:opacity-100" />
                                    </button>
                                </motion.div>
                            )}

                            {/* Generating Indicator (Matches user reference exactly) */}
                            {isGenerating && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.2 }}
                                    className="pointer-events-auto"
                                >
                                    <button
                                        className="h-8 md:h-9 px-3.5 md:px-4 rounded-full bg-[#1c1c1e] border border-[#303030] shadow-xl flex items-center justify-center gap-2 text-[#a1a1aa] hover:text-white hover:bg-[#2c2c2e] transition-all outline-none group"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                    >
                                        <div className="size-3.5 border-[2px] border-[#a1a1aa]/30 border-t-[#a1a1aa] rounded-full animate-spin group-hover:border-t-white" />
                                        <span className="text-[12px] md:text-[13px] font-semibold tracking-wide whitespace-nowrap">0/{imageCount} Đang tạo...</span>
                                        {isScrolledDown && (
                                            <>
                                                <div className="w-px h-3.5 bg-[#303030] mx-0.5" />
                                                <span className="text-[12px] md:text-[13px] font-semibold tracking-wide flex items-center gap-1.5">
                                                    Lên trên cùng <ChevronUp className="size-3.5 md:size-4 opacity-70 group-hover:opacity-100" />
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative w-full pointer-events-auto">

                        {/* Batch Action Bar — bám dính trên prompt bar, giống history dropdown */}
                        {selectionMode && selectedIds.size > 0 && (
                            <div className="absolute bottom-full mb-1 left-0 right-0 z-50 flex justify-center animate-in slide-in-from-bottom-2 fade-in duration-200">
                                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 bg-popover text-popover-foreground border border-border rounded-xl sm:rounded-2xl px-3 py-2 shadow-2xl max-w-[calc(100vw-2rem)]">
                                    <span className="text-sm font-medium whitespace-nowrap pl-1 pr-1.5 flex-[1_0_100%] text-center sm:flex-auto sm:text-left border-b sm:border-b-0 pb-1.5 mb-0.5 sm:pb-0 sm:mb-0 border-border/50">Chọn {selectedIds.size} ảnh</span>
                                    <div className="w-px h-4 bg-border mx-1 hidden sm:block" />
                                    <Button size="sm" variant="ghost" className="h-8 text-[11px] sm:text-xs rounded-lg gap-1.5 px-2.5 sm:px-3 bg-muted/30 sm:bg-transparent" onClick={handleBatchDownload}>
                                        <Download className="size-3.5" /> <span>Tải xuống</span>
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 text-[11px] sm:text-xs rounded-lg gap-1.5 px-2.5 sm:px-3 text-primary hover:text-primary hover:bg-primary/10 bg-primary/5 sm:bg-transparent" onClick={handleBatchAddReference}>
                                        <ImageIcon className="size-3.5" /> <span>Thêm tham chiếu</span>
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 text-[11px] sm:text-xs rounded-lg gap-1.5 px-2.5 sm:px-3 text-destructive hover:text-destructive hover:bg-destructive/10 bg-destructive/5 sm:bg-transparent" onClick={handleBatchDelete}>
                                        <Trash2 className="size-3.5" /> <span>Xoá</span>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Prompt History Dropdown */}
                        {showHistory && promptHistory.length > 0 && (
                            <div ref={historyRef} className="absolute bottom-full mb-1 left-0 right-0 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                                <div className="p-1.5">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2.5 py-1.5">Lịch sử prompt</div>
                                    {promptHistory.map((p, i) => (
                                        <button
                                            key={i}
                                            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors truncate"
                                            onClick={() => { setPrompt(p); setShowHistory(false) }}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pill Container — with Drag & Drop */}
                        <div
                            className={`relative flex flex-col w-full transition-all duration-300 border rounded-[30px] backdrop-blur-xl ${isDragging ? 'border-primary/80 border-2 bg-primary/5 scale-[1.02] shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]' : 'border-border/30 bg-[#37393b]/85 shadow-lg'}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {/* Drag overlay indicator */}
                            {isDragging && (
                                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] rounded-[22px] flex items-center justify-center z-30 pointer-events-none overflow-hidden hover:opacity-100">
                                    {/* Shimmer background inside the dropzone */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                    
                                    <div className="flex flex-col items-center gap-3 text-primary relative z-10 animate-in zoom-in-95 duration-200">
                                        <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center animate-pulse ring-4 ring-primary/20">
                                            <Upload className="size-6 text-primary" />
                                        </div>
                                        <span className="text-sm font-semibold tracking-wide shadow-sm">Thả ảnh tham chiếu vào đây</span>
                                    </div>
                                </div>
                            )}

                            {/* 1. Preview Ảnh Tham Chiếu (Top) — thu nhỏ khi compact */}
                            {referenceImages.length > 0 && (
                                <div className="px-4 pb-1 pt-4 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
                                    {referenceImages.map((src, idx) => (
                                        <div key={idx} className="relative shrink-0 group/ref">
                                            <img
                                                src={src}
                                                alt={`Reference ${idx + 1}`}
                                                className="h-16 w-16 rounded-xl object-cover border border-border/40 bg-muted/30 cursor-pointer hover:ring-2 hover:ring-primary/60 transition-all"
                                                title={`Nhấn để chèn @Ảnh ${idx + 1} vào prompt`}
                                                onClick={() => {
                                                    // KHOÁ TOẠ ĐỘ SCROLL VÀ CURSOR CHO USEEFFECT ĐỂ CHỐNG GIẬT
                                                    if (textareaRef.current) {
                                                        forcedScrollRef.current = textareaRef.current.scrollTop
                                                    }
                                                    
                                                    const mention = `@Ảnh ${idx + 1} `
                                                    const trimmed = prompt.trimEnd()
                                                    const newPrompt = trimmed ? trimmed + ' ' + mention : mention
                                                    
                                                    forcedCursorRef.current = newPrompt.length
                                                    setPrompt(newPrompt)
                                                }}
                                            />
                                            <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-white border border-white/20 text-[9px] font-bold h-4 w-4 rounded-full shadow-sm flex items-center justify-center z-10">
                                                {idx + 1}
                                            </div>
                                            <button
                                                onClick={() => setReferenceImages(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 shadow-sm opacity-100 sm:opacity-0 sm:group-hover/ref:opacity-100 transition-opacity hover:bg-muted"
                                            >
                                                <X className="size-3 text-muted-foreground" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 2. Text Input (Middle) — contenteditable with inline @mention highlighting */}
                            <div className={cn("relative px-4 pb-3", referenceImages.length > 0 ? "pt-2" : "pt-3")}>
                                {/* @Mention popover — hiện khi gõ @ và có ảnh tham chiếu */}
                                {showMentionPopover && (
                                    <div className="absolute bottom-full mb-1 left-0 right-0 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                                        <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                                            <div className="p-1.5">
                                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2.5 py-1.5 select-none flex items-center gap-1.5">
                                                    <ImageIcon className="size-3" />
                                                    Ảnh tham chiếu ({referenceImages.length}/{MAX_REFERENCE_IMAGES})
                                                </div>
                                                {referenceImages.length > 0 ? (
                                                    referenceImages.map((src, idx) => (
                                                        <button
                                                            key={idx}
                                                            className="flex items-center gap-3 w-full px-2.5 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left active:bg-accent/80"
                                                            // Ngăn button cướp focus → bàn phím không bị đóng/mở lại
                                                            onPointerDown={(e) => e.preventDefault()}
                                                            onClick={() => {
                                                                if (textareaRef.current) {
                                                                    forcedScrollRef.current = textareaRef.current.scrollTop
                                                                }

                                                                const mention = `@Ảnh ${idx + 1} `
                                                                const pos = mentionInsertPosRef.current
                                                                
                                                                // KHOÁ OFFSET CURSOR CHO USEEFFECT
                                                                forcedCursorRef.current = pos + mention.length

                                                                const before = prompt.slice(0, pos)
                                                                const after = prompt.slice(pos + 1)
                                                                const newPrompt = before + mention + after
                                                                
                                                                setPrompt(newPrompt)
                                                                setShowMentionPopover(false)
                                                            }}
                                                        >
                                                            <div className="relative shrink-0">
                                                                <img src={src} alt={`Ảnh ${idx + 1}`} className="size-10 rounded-lg object-cover border border-border/40" />
                                                                <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                                                                    {idx + 1}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-sm font-medium truncate">@Ảnh {idx + 1}</span>
                                                                <span className="text-[11px] text-muted-foreground">Chèn tham chiếu vào prompt</span>
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="flex items-center gap-3 px-2.5 py-3">
                                                        <div className="size-10 rounded-lg border-2 border-dashed border-border flex items-center justify-center shrink-0">
                                                            <ImageIcon className="size-4 text-muted-foreground/50" />
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs text-muted-foreground">Chưa có ảnh tham chiếu</span>
                                                            <span className="text-[11px] text-muted-foreground/60">Bấm nút + để thêm ảnh</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ContentEditable Prompt Input — single element, no overlay sync needed */}
                                <div
                                    ref={textareaRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    spellCheck={false}
                                    role="textbox"
                                    aria-multiline="true"
                                    data-placeholder="Mô tả ý tưởng kiến tạo của bạn..."
                                    className="w-full border-0 bg-transparent px-1 text-[15px] focus:ring-0 outline-none leading-[24px] custom-scrollbar py-1.5 overflow-y-auto break-words relative m-0 text-foreground"
                                    style={{
                                        minHeight: '44px',
                                        maxHeight: '120px',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                        caretColor: 'white',
                                        boxSizing: 'border-box',
                                    }}
                                    onMouseDown={(e) => {
                                        const target = e.target as HTMLElement;
                                        const mentionNode = target.closest('[data-mention="true"]');
                                        if (mentionNode) {
                                            // FIX JUMP BUG: Ngăn hành vi native của trình duyệt khi click vào non-editable 
                                            // (Chromium thường giật cuộn lên top khi chọn thẻ contenteditable="false")
                                            e.preventDefault();
                                            
                                            // Đưa con trỏ nháy ra phía sau thẻ mention thay vì chọn nó
                                            const sel = window.getSelection();
                                            if (sel) {
                                                const range = document.createRange();
                                                range.setStartAfter(mentionNode);
                                                range.collapse(true);
                                                sel.removeAllRanges();
                                                sel.addRange(range);
                                            }
                                        }
                                    }}
                                    onInput={(e) => {
                                        const el = e.currentTarget
                                        // Lấy plain text từ contenteditable
                                        const text = el.innerText || ''
                                        // Loại bỏ trailing newline mà contenteditable tự thêm
                                        const cleanText = text.replace(/\n$/, '')
                                        setPrompt(cleanText)

                                        // Phát hiện '@' để trigger mention popover
                                        const sel = window.getSelection()
                                        if (sel && sel.rangeCount > 0) {
                                            const range = sel.getRangeAt(0)
                                            // Lấy text trước cursor
                                            const preRange = document.createRange()
                                            preRange.selectNodeContents(el)
                                            preRange.setEnd(range.startContainer, range.startOffset)
                                            const textBeforeCursor = preRange.toString()
                                            const lastChar = textBeforeCursor[textBeforeCursor.length - 1]
                                            
                                            if (lastChar === '@') {
                                                mentionInsertPosRef.current = textBeforeCursor.length - 1
                                                setShowMentionPopover(true)
                                            } else if (showMentionPopover) {
                                                const textSinceAt = textBeforeCursor.slice(mentionInsertPosRef.current)
                                                if (!textSinceAt.startsWith('@')) {
                                                    setShowMentionPopover(false)
                                                }
                                            }
                                        }

                                        // Cập nhật chiều cao theo nội dung
                                        adjustHeight(el as HTMLDivElement)
                                    }}
                                    onPaste={(e) => {
                                        // Chỉ cho phép paste plain text, loại bỏ mọi HTML/rich formatting
                                        e.preventDefault()
                                        const text = e.clipboardData.getData('text/plain')
                                        document.execCommand('insertText', false, text)
                                    }}
                                    onCompositionStart={() => { isComposingRef.current = true }}
                                    onCompositionEnd={() => { isComposingRef.current = false }}
                                    onKeyDown={(e) => {
                                        // Bỏ qua Enter khi đang compose (IME/predictive text trên mobile)
                                        if (isComposingRef.current) return
                                        if (showMentionPopover && e.key === 'Escape') {
                                            e.preventDefault()
                                            setShowMentionPopover(false)
                                            return
                                        }
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            setShowMentionPopover(false)
                                            handleGenerate()
                                        }
                                    }}
                                    onFocus={() => {
                                        // Trên mobile, scroll prompt bar vào view khi bàn phím mở
                                        if (window.innerWidth < 768) {
                                            setTimeout(() => {
                                                promptContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
                                            }, 300)
                                        }
                                    }}
                                />
                            </div>

                            {/* 3. Tools & Send Button (Bottom) */}
                            <div className="flex items-center justify-between px-2.5 pb-2.5" style={{ touchAction: 'manipulation' }}>
                                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none pr-2">
                                    {/* Prompt History */}
                                    {promptHistory.length > 0 && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`size-9 rounded-full text-muted-foreground hover:text-foreground ${showHistory ? 'bg-muted/40' : ''}`}
                                                    onClick={() => setShowHistory(!showHistory)}
                                                >
                                                    <History className="size-[18px]" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">Lịch sử prompt</TooltipContent>
                                        </Tooltip>
                                    )}

                                    {/* Image Upload */}
                                    {isMobile ? (
                                        <Drawer open={isImagePopoverOpen} onOpenChange={setIsImagePopoverOpen}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DrawerTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground hover:text-foreground">
                                                            <ImageIcon className="size-[18px]" />
                                                        </Button>
                                                    </DrawerTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">Ảnh tham chiếu</TooltipContent>
                                            </Tooltip>
                                            <DrawerContent>
                                                <DrawerHeader className="text-left px-4">
                                                    <DrawerTitle className="text-sm flex items-center gap-2">
                                                        <ImageIcon className="size-4 text-primary" />
                                                        Cung cấp ảnh tham chiếu
                                                    </DrawerTitle>
                                                    <DrawerDescription className="text-xs">
                                                        AI sẽ dùng các ảnh này để làm hình mẫu.
                                                    </DrawerDescription>
                                                </DrawerHeader>
                                                {renderReferenceImageContent()}
                                            </DrawerContent>
                                        </Drawer>
                                    ) : (
                                        <Popover open={isImagePopoverOpen} onOpenChange={setIsImagePopoverOpen}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground hover:text-foreground">
                                                            <ImageIcon className="size-[18px]" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">Ảnh tham chiếu</TooltipContent>
                                            </Tooltip>
                                            <PopoverContent side="top" align="start" className="w-80 p-0" onOpenAutoFocus={(e) => e.preventDefault()} onWheel={(e) => e.stopPropagation()}>
                                                <div className="p-4 border-b border-border/50">
                                                    <div className="flex items-center gap-2 font-medium text-sm">
                                                        <ImageIcon className="size-4 text-primary" />
                                                        Cung cấp ảnh tham chiếu
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        AI sẽ dùng các ảnh này để làm phân tích (Image-to-Image / ControlNet).
                                                    </p>
                                                </div>
                                                {renderReferenceImageContent()}
                                            </PopoverContent>
                                        </Popover>
                                    )}

                                    {/* Settings */}
                                    {isMobile ? (
                                        <Drawer>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DrawerTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground hover:text-foreground">
                                                            <Settings2 className="size-[18px]" />
                                                        </Button>
                                                    </DrawerTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">Cài đặt kiến tạo</TooltipContent>
                                            </Tooltip>
                                            <DrawerContent>
                                                <DrawerHeader className="text-left px-4">
                                                    <DrawerTitle className="text-sm flex items-center gap-2">
                                                        <Wand2 className="size-4 text-primary" />
                                                        Thông số kiến tạo
                                                    </DrawerTitle>
                                                    <DrawerDescription className="text-xs">
                                                        Tuỳ chỉnh chi tiết hình ảnh được sinh ra.
                                                    </DrawerDescription>
                                                </DrawerHeader>
                                                {renderSettingsContent()}
                                            </DrawerContent>
                                        </Drawer>
                                    ) : (
                                        <Popover>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground hover:text-foreground">
                                                            <Settings2 className="size-[18px]" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">Cài đặt kiến tạo</TooltipContent>
                                            </Tooltip>
                                            <PopoverContent side="top" align="start" className="w-[320px] p-0" onWheel={(e) => e.stopPropagation()}>
                                                <div className="p-4 border-b border-border/50">
                                                    <div className="flex items-center gap-2 font-medium text-sm">
                                                        <Wand2 className="size-4 text-primary" />
                                                        Thông số kiến tạo
                                                    </div>
                                                </div>
                                                {renderSettingsContent()}
                                            </PopoverContent>
                                        </Popover>
                                    )}

                                    {/* Model Select (Desktop) */}
                                    <div className="hidden sm:block ml-1">
                                        <Select value={model} onValueChange={setModel}>
                                            <SelectTrigger className="h-9 border-transparent bg-transparent hover:bg-muted/60 text-xs font-medium rounded-full px-3 shadow-none focus:ring-0">
                                                <SelectValue placeholder="Model" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableModels.map((m) => (
                                                    <SelectItem key={m.model_id} value={m.model_id}>
                                                        {m.name} <span className="text-muted-foreground">({m.gems_cost} xu)</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Badges */}
                                    <Badge variant="secondary" className="hidden lg:inline-flex items-center justify-center text-[10px] leading-none py-0 h-6 pt-[1px] rounded-full font-medium px-2.5 bg-background/50 border-border/50">
                                        {getAspectRatio(aspectRatioValue).label}
                                    </Badge>
                                    <Badge variant="secondary" className="hidden lg:inline-flex items-center justify-center text-[10px] leading-none py-0 h-6 pt-[1px] rounded-full font-medium px-2 bg-background/50 border-border/50">
                                        ×{imageCount}
                                    </Badge>
                                </div>

                                {/* Send Action */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            className={`rounded-full shrink-0 size-10 ${prompt.trim() ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" : "bg-muted text-muted-foreground"}`}
                                            disabled={isGenerating || !prompt.trim()}
                                            onClick={handleGenerate}
                                        >
                                            {isGenerating ? (
                                                <Spinner className="size-4" />
                                            ) : (
                                                <ArrowUp className="size-[18px]" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                        Tạo ảnh <span className="text-muted-foreground ml-1">↵</span>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>

        {/* === CUSTOM DRAG AVATAR PORTAL === */}
        {dragState && typeof document !== 'undefined' && createPortal(
            <div
                className="fixed pointer-events-none z-[9999]"
                style={{
                    left: dragState.x,
                    top: dragState.y,
                    transform: 'translate(-50%, -50%)',
                    animation: 'drag-wobble 0.8s ease-in-out infinite alternate',
                }}
            >
                <div
                    style={{
                        width: 110,
                        height: 110,
                        borderRadius: 14,
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.15)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        transform: 'rotate(-4deg) scale(1.05)',
                    }}
                >
                    <img
                        src={dragState.url}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        alt=""
                    />
                </div>
                {/* small badge khi nó đang khửng */}
                <div style={{
                    position: 'absolute',
                    bottom: -6,
                    right: -6,
                    background: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}>
                    +
                </div>
            </div>,
            document.body
        )}

        {/* CSS for drag-wobble @keyframes */}
        <style>{`
            @keyframes drag-wobble {
                0% { transform: translate(-50%, -50%) rotate(-4deg) scale(1.05); }
                25% { transform: translate(-50%, -50%) rotate(2deg) scale(1.08) translateY(-4px); }
                50% { transform: translate(-50%, -50%) rotate(-2deg) scale(1.06) translateY(2px); }
                75% { transform: translate(-50%, -50%) rotate(4deg) scale(1.09) translateY(-3px); }
                100% { transform: translate(-50%, -50%) rotate(-3deg) scale(1.07) translateY(1px); }
            }
        `}</style>
        </>
    )
}
