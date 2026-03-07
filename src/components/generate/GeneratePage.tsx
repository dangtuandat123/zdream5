import { useState, useCallback, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import {
    Wand2,
    Download,
    Share2,
    Settings2,
    ArrowUp,
    Trash2,
    RotateCcw,
    Maximize2,
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
    ChevronLeft,
    ChevronRight,
    History,
    CheckSquare,
    Dices,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"


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
} from "@/components/ui/alert-dialog"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

// === Types ===
interface GeneratedImage {
    id: string
    batchId: string
    url: string
    prompt: string
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
    | { type: 'skeleton'; ratio: number; key: string }
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

    const rows = computeRows(items, containerWidth, targetHeight, gap)

    return (
        <div ref={containerRef} className="w-full flex flex-col" style={{ gap: `${gap}px` }}>
            {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex w-full" style={{ gap: `${gap}px` }}>
                    {row.items.map((item) => {
                        const w = row.height * item.ratio

                        const itemStyle: React.CSSProperties = {
                            width: `${w}px`,
                            height: `${row.height}px`,
                            flexShrink: 1,
                            minWidth: 0,
                        }

                        if (item.type === 'skeleton') {
                            return (
                                <div
                                    key={item.key}
                                    className="relative rounded-xl overflow-hidden bg-muted/20 border border-border/40 flex flex-col items-center justify-center isolate"
                                    style={itemStyle}
                                >
                                    {/* Shimmer overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                    <Skeleton className="absolute inset-0 h-full w-full rounded-none opacity-20" />

                                    <div className="flex flex-col items-center gap-3 z-10">
                                        <Wand2 className="size-6 text-muted-foreground/40 animate-pulse" />
                                        <div className="flex gap-1.5 items-center">
                                            <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            <span className="text-[10px] text-muted-foreground/50 ml-1.5 tabular-nums">{Math.round(progress)}%</span>
                                        </div>
                                    </div>

                                    {/* Progress bar dưới cùng */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted/30">
                                        <div
                                            className="h-full bg-primary/60 transition-all duration-300 ease-out"
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        }

                        const img = item.img
                        const isSelected = selectedIds.has(img.id)
                        return (
                            <div
                                key={item.key}
                                className={`group/img relative cursor-pointer overflow-hidden rounded-xl border border-border/40 select-none ${isSelected ? 'ring-2 ring-primary' : ''} ${img.isNew ? 'animate-in fade-in-0 zoom-in-[0.98] slide-in-from-bottom-4 duration-700 ease-out fill-mode-both' : ''}`}
                                style={{ ...itemStyle, WebkitTouchCallout: 'none' }}
                                onClick={() => selectionMode ? onToggleSelection(img.id) : onSelectImage(img)}
                                draggable
                                onDragStart={(e) => onImageDragStart(e, img.url)}
                                onContextMenu={(e) => {
                                    // Chặn menu ngữ cảnh gốc trên mobile (để không cản trở Long Press 1.5s)
                                    e.preventDefault()
                                }}
                                onTouchStart={(e) => {
                                    const touch = e.touches[0]
                                    onImageTouchStart(img.url, touch.clientX, touch.clientY)
                                }}
                            >
                                <img
                                    src={img.url}
                                    alt={img.prompt}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />

                                {/* Batch selection checkbox */}
                                {selectionMode && (
                                    <div className={`absolute top-2 left-2 size-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-white/70 bg-black/30'}`}>
                                        {isSelected && <Check className="size-3 text-primary-foreground" />}
                                    </div>
                                )}

                                <div className="absolute bottom-1.5 right-1.5 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size="icon" variant="secondary" className="size-6 rounded-full bg-black/50 hover:bg-black/70 border-0 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onSetReferenceImage(img.url) }}>
                                                <ImageIcon className="size-3 text-white" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">Dùng làm ảnh tham chiếu</TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size="icon" variant="secondary" className="size-6 rounded-full bg-black/50 hover:bg-black/70 border-0 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onDownloadImage(img.url, img.id) }}>
                                                <Download className="size-3 text-white" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">Tải xuống</TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size="icon" variant="secondary" className="size-6 rounded-full bg-black/50 hover:bg-black/70 border-0 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id) }}>
                                                <Trash2 className="size-3 text-white" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">Xoá</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

// Ảnh demo — tạo URL đúng tỉ lệ theo aspect ratio đang chọn
const getDemoUrl = (aspectRatio: string, seed: number) => {
    // Kích thước gốc tương ứng từng tỉ lệ
    const sizes: Record<string, [number, number]> = {
        "1": [800, 800],       // 1:1
        "16/9": [1200, 675],   // 16:9
        "9/16": [675, 1200],   // 9:16
        "4/3": [1000, 750],    // 4:3
    }
    const [w, h] = sizes[aspectRatio] || [800, 800]
    return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

// Aspect ratio configs — value dùng cho AspectRatio component
const ASPECT_RATIOS = [
    { value: "1", label: "1:1", ratio: 1, icon: Square },
    { value: "16/9", label: "16:9", ratio: 16 / 9, icon: RectangleHorizontal },
    { value: "9/16", label: "9:16", ratio: 9 / 16, icon: RectangleVertical },
    { value: "4/3", label: "4:3", ratio: 4 / 3, icon: RectangleHorizontal },
]
export function GeneratePage() {
    // === State ===
    const isMobile = useIsMobile()
    const [isGenerating, setIsGenerating] = useState(false)
    const [prompt, setPrompt] = useState("")
    const [images, setImages] = useState<GeneratedImage[]>([])
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
    const [referenceImages, setReferenceImages] = useState<string[]>([])
    const [refImageUrlInput, setRefImageUrlInput] = useState("")
    const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    // New states for 12 upgrades
    const [negativePrompt, setNegativePrompt] = useState("")
    const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 999999999))
    const [generateProgress, setGenerateProgress] = useState(0)
    const [selectionMode, setSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [promptHistory, setPromptHistory] = useState<string[]>(getPromptHistory)
    const [showHistory, setShowHistory] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [showZoomHint, setShowZoomHint] = useState(true)
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

    // Reset copied + zoom hint khi image thay đổi
    useEffect(() => {
        setIsCopied(false)
        if (selectedImage) setShowZoomHint(true)
    }, [selectedImage])

    // Auto-hide zoom hint sau 3s khi mở Dialog
    useEffect(() => {
        if (!selectedImage || !showZoomHint) return
        const t = setTimeout(() => setShowZoomHint(false), 3000)
        return () => clearTimeout(t)
    }, [selectedImage, showZoomHint])

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
                        setReferenceImages(prev => prev.includes(url) ? prev : [...prev, url])
                        toast.success('Đã thêm vào ảnh tham chiếu')
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
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const promptContainerRef = useRef<HTMLDivElement>(null)

    // Settings
    const [model, setModel] = useState("sdxl")
    const [style, setStyle] = useState("photorealistic")
    const [aspectRatioValue, setAspectRatioValue] = useState("1")
    const [creativity, setCreativity] = useState([75])
    const [highRes, setHighRes] = useState(false)
    const [imageCount, setImageCount] = useState("1")

    // Helper
    const getAspectRatio = (value: string) =>
        ASPECT_RATIOS.find((r) => r.value === value) || ASPECT_RATIOS[0]




    // === Handlers ===
    const handleGenerate = useCallback(() => {
        if (!prompt.trim() || isGenerating) return
        setIsGenerating(true)
        setGenerateProgress(0)

        // Parse @Ảnh 1, @Ảnh 2... in prompt → [Ảnh tham chiếu X]
        let finalPrompt = prompt.trim()
        const anhRegex = /@Ảnh (\d+)/g
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

        // Progress simulation (0 → 95% trong 2.3s)
        const interval = setInterval(() => {
            setGenerateProgress(prev => {
                if (prev >= 95) { clearInterval(interval); return 95 }
                return prev + Math.random() * 8 + 2
            })
        }, 100)
        progressIntervalRef.current = interval

        // Chạy tới 100% khi hết timeout giả lập
        setTimeout(() => {
            clearInterval(interval)
            progressIntervalRef.current = null
            setGenerateProgress(100)

            // Đợi thêm 400ms để animation progress bar chạy tới đích (transition 300ms)
            setTimeout(() => {
                const newImages: GeneratedImage[] = Array.from({ length: count }, (_, i) => ({
                    id: `img-${Date.now()}-${i}`,
                    batchId,
                    url: getDemoUrl(aspectRatioValue, Date.now() + i),
                    prompt: finalPrompt,
                    negativePrompt: currentNeg || undefined,
                    seed: currentSeed + i,
                    model,
                    style,
                    aspectRatio: ar.ratio,
                    aspectLabel: ar.label,
                    createdAt: new Date(),
                    referenceImages: currentRefs.length > 0 ? currentRefs : undefined,
                    isNew: true,
                }))

                setImages((prev) => [...newImages, ...prev])
                setIsGenerating(false)
                setGenerateProgress(0)
                
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
        }, 2200)
    }, [prompt, isGenerating, imageCount, model, style, aspectRatioValue, negativePrompt, seed, referenceImages])

    const handleDelete = useCallback((id: string) => {
        setDeleteConfirm({ type: 'single', id })
    }, [])

    // Xác nhận xoá thực sự
    const confirmDelete = useCallback(() => {
        if (!deleteConfirm) return
        if (deleteConfirm.type === 'single') {
            setImages(prev => prev.filter(img => img.id !== deleteConfirm.id))
            if (selectedImage?.id === deleteConfirm.id) setSelectedImage(null)
            toast('Đã xoá ảnh', { icon: '🗑️' })
        } else {
            setImages(prev => prev.filter(img => !selectedIds.has(img.id)))
            if (selectedImage && selectedIds.has(selectedImage.id)) setSelectedImage(null)
            toast(`Đã xoá ${selectedIds.size} ảnh`, { icon: '🗑️' })
            setSelectedIds(new Set())
            setSelectionMode(false)
        }
        setDeleteConfirm(null)
    }, [deleteConfirm, selectedImage, selectedIds])

    const handleRegenerate = useCallback((img: GeneratedImage) => {
        setPrompt(img.prompt)
        if (img.negativePrompt) setNegativePrompt(img.negativePrompt)
        setModel(img.model)
        setStyle(img.style)
        setSelectedImage(null)
    }, [])

    // Keyboard navigation trong Dialog (← →)
    useEffect(() => {
        if (!selectedImage) return
        const handler = (e: KeyboardEvent) => {
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
                toast('Tất cả ảnh này đã có trong tham chiếu rồi', { icon: 'ℹ️' })
                return prev
            }
            toast.success(`Đã thêm ${newUrls.length} ảnh vào tham chiếu`)
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
            setReferenceImages(prev => {
                const newUrls = urls.filter(u => !prev.includes(u))
                return [...prev, ...newUrls]
            })
            toast.success(`Đã thêm ${files.length} ảnh tham chiếu`)
            return
        }

        // 2. Xử lý Drop Text (Dữ liệu URL kéo từ gallery xuống)
        const textData = e.dataTransfer.getData('text/plain')
        if (textData && (textData.startsWith('http') || textData.startsWith('blob:') || textData.startsWith('data:'))) {
            setReferenceImages(prev => {
                if (prev.includes(textData)) {
                    toast('Ảnh này đã có trong phần tham chiếu rồi', { icon: 'ℹ️' })
                    return prev
                }
                toast.success('Đã thêm ảnh tham chiếu')
                return [...prev, textData]
            })
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            const urls = files.map(file => URL.createObjectURL(file))
            setReferenceImages(prev => [...prev, ...urls])
            setIsImagePopoverOpen(false) // Tự động đóng Popover khi chọn xong file từ máy
        }
        // Cho phép chọn lại file vừa xoá
        if (e.target) {
            e.target.value = ""
        }
    }

    const handleUrlSubmit = () => {
        if (refImageUrlInput.trim()) {
            setReferenceImages(prev => [...prev, refImageUrlInput.trim()])
            setRefImageUrlInput("")
        }
    }

    const renderReferenceImageContent = () => (
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
            <Tabs defaultValue="upload" className="w-full">
                <div className="px-4 pt-3 pb-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="text-xs"><Upload className="size-3 mr-1.5" /> Tải lên</TabsTrigger>
                        <TabsTrigger value="url" className="text-xs"><Link className="size-3 mr-1.5" /> Link URL</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="upload" className="p-4 pt-0 m-0">
                    <label
                        htmlFor="ref-image-upload"
                        className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-border/50 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                        <Upload className="size-5 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground font-medium">Chọn ảnh từ máy</span>
                        <input
                            id="ref-image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </label>
                </TabsContent>
                <TabsContent value="url" className="p-4 pt-0 m-0">
                    <div className="flex gap-2">
                        <Input
                            placeholder="https://example.com/image.jpg"
                            className="h-8 text-xs"
                            value={refImageUrlInput}
                            onChange={(e) => setRefImageUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                        />
                        <Button size="icon" className="size-8 shrink-0" onClick={handleUrlSubmit}>
                            <Check className="size-4" />
                        </Button>
                    </div>
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
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                        <SelectItem value="dalle3">DALL·E 3</SelectItem>
                        <SelectItem value="midjourney">Midjourney V6</SelectItem>
                        <SelectItem value="flux">Flux Pro</SelectItem>
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
                    className="grid grid-cols-4 gap-1.5"
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

            {/* Creativity */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Sáng tạo</Label>
                    <span className="text-xs font-medium">{creativity[0]}%</span>
                </div>
                <Slider value={creativity} onValueChange={setCreativity} max={100} step={1} />
            </div>

            {/* High-res */}
            <div className="flex items-center justify-between">
                <Label htmlFor="hr" className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">HD (2x)</Label>
                <Switch id="hr" checked={highRes} onCheckedChange={setHighRes} />
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

    return (
        <>  
        <TooltipProvider>
            <div className="relative flex flex-1 flex-col min-w-0">
                {/* Nền sạch, không gradient blob */}

                {/* === CANVAS AREA — Gallery full-width, justified layout === */}
                <div className="relative z-10 flex-1 flex flex-col p-3 sm:p-4 lg:p-6 min-w-0">
                    <div className="w-full flex flex-col flex-1 min-w-0">
                        {/* Empty State — Premium AI Studio */}
                        {images.length === 0 && !isGenerating && (
                            <div className="flex-1 flex flex-col items-center justify-center w-full animate-in fade-in duration-700 px-4 -mt-12">

                                {/* Ethereal Aura - The "Core" */}
                                <div className="relative mb-8 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-pink-500/20 blur-3xl rounded-full size-48 animate-pulse" style={{ animationDuration: '6s' }} />
                                    <div className="relative size-20 sm:size-24 rounded-full border border-white/5 bg-white/5 backdrop-blur-xl flex items-center justify-center shadow-2xl ring-1 ring-inset ring-white/10 overflow-hidden">
                                        <Wand2 className="size-8 text-foreground/70 animate-pulse" style={{ animationDuration: '4s' }} />
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
                                    </div>
                                </div>

                                {/* Typography */}
                                <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-center mb-3 text-foreground/90">
                                    Đánh thức trí tưởng tượng
                                </h1>
                                <p className="text-muted-foreground/60 text-center text-sm mb-10 max-w-sm leading-relaxed">
                                    ZDream biến mọi giới hạn của ngôn từ thành những không gian thị giác vô tận.
                                </p>

                                {/* Creative Suggestion Cards — Responsive: 2 on mobile */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-4xl w-full">
                                    {[
                                        { tag: "Nghệ thuật", title: "Sơn dầu trừu tượng", desc: "Sắc màu rực rỡ, nét cọ mạnh mẽ", icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.866 8.21 8.21 0 003 2.48z" },
                                        { tag: "Tương lai", title: "Thành phố Cyberpunk", desc: "Neon, mưa kỹ thuật số, công nghệ cao", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
                                        { tag: "Nhiếp ảnh", title: "Chân dung Cinematic", desc: "Ánh sáng dramatic, bokeh sâu", icon: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z M18.75 10.5h.008v.008h-.008V10.5z" },
                                        { tag: "Kỳ ảo", title: "Thế giới cổ mộc", desc: "Rừng già phát sáng, sinh vật huyền bí", icon: "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" },
                                    ].map((item) => (
                                        <button
                                            key={item.title}
                                            className="group relative flex flex-col text-left p-4 rounded-2xl border border-border/40 bg-muted/10 hover:bg-muted/30 transition-all duration-300 hover:border-border/80 hover:shadow-lg overflow-hidden cursor-pointer"
                                            onClick={() => setPrompt(`${item.title}, ${item.desc}`)}
                                        >
                                            {/* Watermark Icon */}
                                            <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-20">
                                                    <path fillRule="evenodd" d={item.icon} clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-2 z-10">
                                                {item.tag}
                                            </span>
                                            <span className="text-sm font-semibold text-foreground/90 mb-1.5 z-10 transition-colors group-hover:text-primary">
                                                {item.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground/70 pr-4 leading-relaxed z-10 hidden sm:block">
                                                {item.desc}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* === Gallery — Justified rows (Google Photos style) === */}
                        {(images.length > 0 || isGenerating) && (() => {
                            // Xây dựng danh sách item: skeleton trước, ảnh thật sau
                            const GAP = 6 // gap giữa ảnh (px)
                            const TARGET_H = Math.max(160, Math.min(window.innerWidth * 0.22, 280))

                            // Tạo items list: skeleton + ảnh
                            const items: GalleryItem[] = []

                            if (isGenerating) {
                                const count = parseInt(imageCount)
                                const ratio = getAspectRatio(aspectRatioValue).ratio
                                for (let i = 0; i < count; i++) {
                                    items.push({ type: 'skeleton', ratio, key: `skeleton-${i}` })
                                }
                            }
                            for (const img of images) {
                                items.push({ type: 'image', img, ratio: img.aspectRatio, key: img.id })
                            }

                            return (
                                <div className="flex flex-col gap-3">
                                    {/* Stats bar */}
                                    {images.length > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                {images.length} ảnh đã tạo
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant={selectionMode ? "secondary" : "ghost"}
                                                    size="sm"
                                                    className="h-7 text-xs rounded-full px-3"
                                                    onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()) }}
                                                >
                                                    <CheckSquare className="size-3.5 mr-1.5" />
                                                    {selectionMode ? "Bỏ chọn" : "Chọn"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <JustifiedGallery
                                        items={items}
                                        targetHeight={TARGET_H}
                                        gap={GAP}
                                        onSelectImage={setSelectedImage}
                                        onDeleteImage={handleDelete}
                                        onDownloadImage={(url, id) => downloadImage(url, `zdream-${id}.jpg`)}
                                        onSetReferenceImage={(url) => {
                                            setReferenceImages(prev => prev.includes(url) ? prev : [...prev, url])
                                            toast.success('Đã thêm vào ảnh tham chiếu')
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

                                </div>
                            )
                        })()}
                    </div>
                </div>

                {/* === IMAGE VIEWER — Dialog modal === */}
                <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                    {selectedImage && (() => {
                        const currentIdx = images.findIndex(img => img.id === selectedImage.id)
                        return (
                        <DialogContent className="max-w-[100vw] sm:max-w-[95vw] lg:max-w-6xl w-full h-[100dvh] sm:h-[85vh] p-0 overflow-hidden gap-0 border-0 sm:border rounded-none sm:rounded-xl">
                            <DialogTitle className="sr-only">Chi tiết hình ảnh</DialogTitle>
                            <div className="flex flex-col lg:flex-row h-full overflow-hidden w-full">

                                {/* Ảnh + Nav arrows */}
                                <div className="h-[45vh] lg:h-auto flex-none lg:flex-1 flex items-center justify-center bg-muted/20 min-h-0 relative p-4 lg:p-8 group/viewer">
                                    {/* Nav arrow Left (← ảnh mới hơn, index - 1) */}
                                    {currentIdx > 0 && (
                                        <button
                                            className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-lg sm:opacity-0 sm:group-hover/viewer:opacity-100 transition-opacity hover:bg-background"
                                            onClick={() => setSelectedImage(images[currentIdx - 1])}
                                        >
                                            <ChevronLeft className="size-5" />
                                        </button>
                                    )}
                                    {/* Nav arrow Right (→ ảnh cũ hơn, index + 1) */}
                                    {currentIdx < images.length - 1 && (
                                        <button
                                            className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-lg sm:opacity-0 sm:group-hover/viewer:opacity-100 transition-opacity hover:bg-background"
                                            onClick={() => setSelectedImage(images[currentIdx + 1])}
                                        >
                                            <ChevronRight className="size-5" />
                                        </button>
                                    )}

                                    {/* Khối chứa ép tỉ lệ (SVG Spacer Bounding Box) */}
                                    <div className="relative flex max-w-full max-h-full rounded-xl shadow-2xl border border-border/40 overflow-hidden bg-black/5">

                                        {/* Invisible SVG spacer for aspect ratio */}
                                        <img
                                            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${selectedImage.aspectRatio * 10000}" height="10000"></svg>`)}`}
                                            alt="spacer"
                                            className="w-auto h-auto max-w-full max-h-full object-contain invisible pointer-events-none"
                                            style={{
                                                maxHeight: isMobile ? 'calc(100vh - 12rem)' : 'calc(85vh - 4rem)',
                                            }}
                                        />

                                        {/* Actual image */}
                                        <div className="absolute inset-0 w-full h-full group">
                                            <Zoom zoomMargin={isMobile ? 0 : 40} classDialog="custom-zoom-overlay">
                                                <img
                                                    src={selectedImage.url}
                                                    alt={selectedImage.prompt}
                                                    className="w-full h-full object-cover rounded-md cursor-grab active:cursor-grabbing"
                                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData('text/plain', selectedImage.url)
                                                        // Ẩn native ghost
                                                        const emptyCanvas = document.createElement('canvas')
                                                        emptyCanvas.width = 1; emptyCanvas.height = 1
                                                        document.body.appendChild(emptyCanvas)
                                                        e.dataTransfer.setDragImage(emptyCanvas, 0, 0)
                                                        setTimeout(() => document.body.removeChild(emptyCanvas), 0)
                                                        // Kích hoạt custom floating overlay
                                                        const initial = { url: selectedImage.url, x: e.clientX, y: e.clientY }
                                                        dragStateRef.current = initial
                                                        setDragState(initial)
                                                    }}
                                                />
                                            </Zoom>

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-md overflow-hidden shadow-inner">
                                                <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" />
                                                <div className="bg-background/90 text-foreground backdrop-blur-md px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 shadow-xl ring-1 ring-border/50 translate-y-2 group-hover:translate-y-0 transition-all duration-300 relative z-10">
                                                    <Maximize2 className="size-4" />
                                                    Xem chuẩn gốc
                                                </div>
                                            </div>

                                            {/* Mobile zoom hint — auto-hide được xử lý bởi useEffect */}
                                            {isMobile && showZoomHint && (
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full animate-pulse pointer-events-none z-20">
                                                    Chạm để phóng to
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Keyboard hint (desktop only) */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60 opacity-0 group-hover/viewer:opacity-100 transition-opacity hidden sm:block">
                                        ← → để chuyển ảnh
                                    </div>
                                </div>

                                {/* Info Panel */}
                                <div className="w-full lg:w-[320px] flex-1 lg:flex-none lg:h-full border-t lg:border-t-0 lg:border-l p-5 lg:pt-14 flex flex-col gap-5 bg-background overflow-y-auto custom-scrollbar min-h-0">
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Prompt</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-6 rounded-md hover:bg-muted"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(selectedImage.prompt)
                                                        setIsCopied(true)
                                                        toast.success('Đã sao chép prompt')
                                                        setTimeout(() => setIsCopied(false), 2000)
                                                    }}
                                                    title="Sao chép prompt"
                                                >
                                                    {isCopied ? (
                                                        <Check className="size-3.5 text-green-500" />
                                                    ) : (
                                                        <Copy className="size-3.5 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="text-sm leading-relaxed bg-muted/40 hover:bg-muted/60 transition-colors p-3.5 rounded-lg max-h-[180px] overflow-y-auto custom-scrollbar break-words whitespace-pre-wrap shadow-inner border border-foreground/5 relative group">
                                                {selectedImage.prompt.split(/(\[Ảnh tham chiếu \d+\]|@Ảnh \d+)/g).map((part, i) =>
                                                    /^(\[Ảnh tham chiếu \d+\]|@Ảnh \d+)$/.test(part)
                                                        ? <span key={i} className="text-primary bg-primary/15 rounded px-1 py-0.5 text-xs font-medium">{part}</span>
                                                        : <span key={i}>{part}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Negative Prompt */}
                                        {selectedImage.negativePrompt && (
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Negative Prompt</Label>
                                                <div className="text-xs leading-relaxed bg-muted/30 p-3 rounded-lg max-h-[100px] overflow-y-auto custom-scrollbar break-words whitespace-pre-wrap border border-border/30">
                                                    {selectedImage.negativePrompt}
                                                </div>
                                            </div>
                                        )}

                                        <Separator />
                                        {selectedImage.referenceImages && selectedImage.referenceImages.length > 0 && (
                                            <>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Ảnh tham chiếu</Label>
                                                        <Badge variant="secondary" className="h-4 px-1.5 text-[9px] rounded-sm font-medium">{selectedImage.referenceImages.length}</Badge>
                                                    </div>
                                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                                        {selectedImage.referenceImages.map((src, i) => (
                                                            <div key={i} className="aspect-square relative group">
                                                                <img src={src} className="absolute inset-0 w-full h-full rounded-xl object-cover border border-border/40" alt="ref" />
                                                                <div className="absolute top-0.5 left-0.5 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold size-3.5 rounded-full flex items-center justify-center border border-white/20">{i + 1}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Separator />
                                            </>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Model</Label>
                                                <p className="text-xs font-medium mt-0.5">{selectedImage.model.toUpperCase()}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Phong cách</Label>
                                                <p className="text-xs font-medium mt-0.5 capitalize">{selectedImage.style}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Tỷ lệ</Label>
                                                <p className="text-xs font-medium mt-0.5">{selectedImage.aspectLabel}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Thời gian</Label>
                                                <p className="text-xs font-medium mt-0.5">
                                                    {selectedImage.createdAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Seed</Label>
                                                <p className="text-xs font-medium mt-0.5 tabular-nums">{selectedImage.seed}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-auto">
                                        <Button size="sm" className="w-full" onClick={() => downloadImage(selectedImage.url, `zdream-${selectedImage.id}.jpg`)}>
                                            <Download className="mr-2 size-4" /> Tải xuống
                                        </Button>
                                        <Button size="sm" variant="secondary" className="w-full border shadow-sm font-medium" onClick={() => {
                                            setReferenceImages(prev => prev.includes(selectedImage.url) ? prev : [...prev, selectedImage.url]);
                                            toast.success('Đã thêm vào ảnh tham chiếu');
                                        }}>
                                            <ImageIcon className="mr-2 size-4" /> Dùng làm ảnh tham chiếu
                                        </Button>
                                        <Button size="sm" variant="outline" className="w-full hidden">
                                            <Share2 className="mr-2 size-4" /> Chia sẻ
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" className="flex-1" onClick={() => handleRegenerate(selectedImage)}>
                                                <RotateCcw className="mr-2 size-3.5" /> Tạo lại
                                            </Button>
                                            <Button size="sm" variant="ghost" className="flex-1 text-destructive hover:text-destructive" onClick={() => handleDelete(selectedImage.id)}>
                                                <Trash2 className="mr-2 size-3.5" /> Xoá
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                        )
                    })()}
                </Dialog>

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
                <div ref={promptContainerRef} className="sticky bottom-0 z-50 mx-auto w-full max-w-3xl px-4 pb-4 pt-6">
                    <div className="relative w-full">

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
                            <div ref={historyRef} className="absolute bottom-full mb-1 left-0 right-0 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
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
                            className={`relative flex flex-col w-full transition-all duration-300 border rounded-[22px] ${isDragging ? 'border-primary/80 border-2 bg-primary/5 scale-[1.02] shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]' : 'border-border/30'}`}
                            style={{ backgroundColor: isDragging ? undefined : '#37393b' }}
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
                                                className="h-16 w-16 rounded-xl object-cover border border-border/40 bg-muted/30"
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

                            {/* 2. Text Input (Middle) — with highlight overlay for @mentions */}
                            <div className="relative px-2 pt-2 pb-1">
                                {/* @Mention popover — hiện khi gõ @ và có ảnh tham chiếu */}
                                {showMentionPopover && (
                                    <div className="absolute bottom-full mb-2 left-2 right-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                                        <div className="bg-[#1c1c1e] border border-[#333] rounded-xl shadow-lg p-2">
                                            <p className="text-[10px] text-[#888] px-1 mb-1.5 select-none">Ảnh tham chiếu</p>
                                            {referenceImages.length > 0 ? (
                                                <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                                                    {referenceImages.map((src, idx) => (
                                                        <button
                                                            key={idx}
                                                            className="relative shrink-0 group"
                                                            onClick={() => {
                                                                const mention = `@Ảnh ${idx + 1} `
                                                                const pos = mentionInsertPosRef.current
                                                                const before = prompt.slice(0, pos)
                                                                const after = prompt.slice(pos + 1)
                                                                const newPrompt = before + mention + after
                                                                setPrompt(newPrompt)
                                                                setShowMentionPopover(false)
                                                                requestAnimationFrame(() => {
                                                                    if (textareaRef.current) {
                                                                        const newPos = pos + mention.length
                                                                        textareaRef.current.focus()
                                                                        textareaRef.current.setSelectionRange(newPos, newPos)
                                                                        textareaRef.current.style.height = 'auto'
                                                                        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
                                                                    }
                                                                })
                                                            }}
                                                        >
                                                            <img src={src} alt={`Ảnh ${idx + 1}`} className="size-14 rounded-lg object-cover border-2 border-transparent group-hover:border-primary transition-colors" />
                                                            <span className="absolute bottom-0.5 left-0.5 bg-black/70 text-[9px] text-white font-medium px-1 py-px rounded">{idx + 1}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-1 py-1.5">
                                                    <div className="size-7 rounded-md border border-dashed border-[#444] flex items-center justify-center">
                                                        <ImageIcon className="size-3.5 text-[#555]" />
                                                    </div>
                                                    <span className="text-[11px] text-[#666]">Chưa có ảnh tham chiếu</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* @Mention Highlight — textarea text ẩn, overlay render toàn bộ text */}
                                <div className="relative">
                                    {/* Overlay: render toàn bộ text, mention = màu primary, text thường = màu foreground */}
                                    <div
                                        className="absolute inset-0 pointer-events-none px-3 text-[15px] leading-relaxed py-2 overflow-hidden whitespace-pre-wrap break-words"
                                        style={{ fontFamily: 'inherit', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                        aria-hidden="true"
                                    >
                                        {prompt ? prompt.split(/(@Ảnh \d+)/g).map((part, i) =>
                                            /^@Ảnh \d+$/.test(part)
                                                ? <span key={i} className="text-primary bg-primary/15 rounded">{part}</span>
                                                : <span key={i} className="text-foreground">{part}</span>
                                        ) : null}
                                    </div>

                                    {/* Textarea: text trong suốt, chỉ hiện caret (con trỏ) */}
                                    <textarea
                                        ref={textareaRef}
                                        placeholder="Mô tả ý tưởng kiến tạo của bạn..."
                                        className="w-full resize-none border-0 bg-transparent px-3 text-[15px] focus:ring-0 outline-none placeholder:text-muted-foreground/60 leading-relaxed custom-scrollbar min-h-[44px] max-h-[120px] py-2 overflow-y-auto relative"
                                        style={{ color: 'transparent', caretColor: 'white' }}
                                    rows={1}
                                    value={prompt}
                                    onChange={(e) => {
                                        const newVal = e.target.value
                                        const cursorPos = e.target.selectionStart || 0
                                        setPrompt(newVal)

                                        // Phát hiện nếu vừa gõ '@'
                                        const charBefore = newVal[cursorPos - 1]
                                        if (charBefore === '@') {
                                            // Ghi lại vị trí '@' để thay thế khi chọn mention
                                            mentionInsertPosRef.current = cursorPos - 1
                                            setShowMentionPopover(true)
                                        } else if (showMentionPopover) {
                                            // Đóng popover nếu xoá '@' hoặc gõ thêm ký tự khác
                                            const textSinceAt = newVal.slice(mentionInsertPosRef.current, cursorPos)
                                            if (!textSinceAt.startsWith('@')) {
                                                setShowMentionPopover(false)
                                            }
                                        }

                                        // Auto-grow tới max-h-[120px], sau đó scroll nội bộ
                                        e.target.style.height = 'auto'
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                                    }}
                                    onKeyDown={(e) => {
                                        if (showMentionPopover && e.key === 'Escape') {
                                            e.preventDefault()
                                            setShowMentionPopover(false)
                                            return
                                        }
                                        // Backspace: xoá toàn bộ mention (@Ảnh X) cùng lúc
                                        if (e.key === 'Backspace') {
                                            const ta = e.target as HTMLTextAreaElement
                                            const cursor = ta.selectionStart
                                            const selEnd = ta.selectionEnd
                                            // Chỉ xử lý khi không có text được select (cursor đơn)
                                            if (cursor === selEnd && cursor > 0) {
                                                // Tìm mention pattern trước cursor
                                                const textBefore = prompt.slice(0, cursor)
                                                const mentionMatch = textBefore.match(/@Ảnh \d+\s?$/)
                                                if (mentionMatch) {
                                                    e.preventDefault()
                                                    const mentionStart = cursor - mentionMatch[0].length
                                                    const newPrompt = prompt.slice(0, mentionStart) + prompt.slice(cursor)
                                                    setPrompt(newPrompt)
                                                    requestAnimationFrame(() => {
                                                        if (textareaRef.current) {
                                                            textareaRef.current.setSelectionRange(mentionStart, mentionStart)
                                                            textareaRef.current.style.height = 'auto'
                                                            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
                                                        }
                                                    })
                                                    return
                                                }
                                            }
                                        }
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            setShowMentionPopover(false)
                                            handleGenerate()
                                        }
                                    }}
                                />
                                </div>
                            </div>

                            {/* 3. Tools & Send Button (Bottom) */}
                            <div className="flex items-center justify-between px-3 pb-3">
                                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pr-2">
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
                                                            <Plus className="size-5" />
                                                        </Button>
                                                    </DrawerTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">Đính kèm ảnh</TooltipContent>
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
                                                            <Plus className="size-5" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">Đính kèm ảnh</TooltipContent>
                                            </Tooltip>
                                            <PopoverContent side="top" align="start" className="w-80 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
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
                                            <PopoverContent side="top" align="start" className="w-[320px] p-0">
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
                                            <SelectTrigger className="h-8 border-transparent bg-transparent hover:bg-muted/60 text-xs font-medium rounded-full px-3 shadow-none focus:ring-0">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                                                <SelectItem value="dalle3">DALL·E 3</SelectItem>
                                                <SelectItem value="midjourney">Midjourney V6</SelectItem>
                                                <SelectItem value="flux">Flux Pro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Badges */}
                                    <Badge variant="secondary" className="hidden lg:inline-flex text-[10px] h-6 rounded-full font-medium px-2.5 bg-background/50 border-border/50">
                                        {getAspectRatio(aspectRatioValue).label}
                                    </Badge>
                                    <Badge variant="secondary" className="hidden lg:inline-flex text-[10px] h-6 rounded-full font-medium px-2 bg-background/50 border-border/50">
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
