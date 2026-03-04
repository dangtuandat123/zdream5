import { useState, useCallback, useMemo, useRef, useEffect } from "react"
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
    RefreshCw,
    ImageIcon,
    X,
    Link,
    Upload,
    Check,
    Plus,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

// === Types ===
interface GeneratedImage {
    id: string
    batchId: string
    url: string
    prompt: string
    model: string
    style: string
    aspectRatio: number
    aspectLabel: string
    createdAt: Date
    referenceImages?: string[]
    isNew?: boolean
}

interface Batch {
    batchId: string
    prompt: string
    model: string
    style: string
    aspectLabel: string
    createdAt: Date
    images: GeneratedImage[]
    referenceImages?: string[]
    isNew?: boolean
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

    // --- Prompt Bar: compact khi scroll xuống, expand khi scroll lên ---
    const [isCompact, setIsCompact] = useState(false)
    const isCompactRef = useRef(false)
    const topObserverRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const promptContainerRef = useRef<HTMLDivElement>(null)
    const sentinelVisibleRef = useRef(true)
    const compactTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // IntersectionObserver: sentinel + rootMargin hysteresis
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                sentinelVisibleRef.current = entry.isIntersecting
                if (entry.isIntersecting && isCompactRef.current) {
                    if (compactTimerRef.current) clearTimeout(compactTimerRef.current)
                    isCompactRef.current = false
                    setIsCompact(false)
                }
            },
            { threshold: 0, rootMargin: '0px 0px 150px 0px' }
        )
        if (topObserverRef.current) observer.observe(topObserverRef.current)
        return () => observer.disconnect()
    }, [])

    // Wheel event: debounce 300ms + double-check sentinel
    useEffect(() => {
        const handleWheel = () => {
            if (!sentinelVisibleRef.current && !isCompactRef.current) {
                if (compactTimerRef.current) clearTimeout(compactTimerRef.current)
                compactTimerRef.current = setTimeout(() => {
                    if (!sentinelVisibleRef.current) {
                        isCompactRef.current = true
                        setIsCompact(true)
                    }
                }, 300)
            }
        }
        window.addEventListener('wheel', handleWheel, { passive: true })
        return () => {
            window.removeEventListener('wheel', handleWheel)
            if (compactTimerRef.current) clearTimeout(compactTimerRef.current)
        }
    }, [])

    // Click outside prompt bar → compact (if scrolled down)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                !sentinelVisibleRef.current &&
                !isCompactRef.current &&
                promptContainerRef.current &&
                !promptContainerRef.current.contains(e.target as Node)
            ) {
                if (compactTimerRef.current) clearTimeout(compactTimerRef.current)
                isCompactRef.current = true
                setIsCompact(true)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus prompt → expand
    const handlePromptFocus = useCallback(() => {
        if (compactTimerRef.current) clearTimeout(compactTimerRef.current)
        isCompactRef.current = false
        setIsCompact(false)
    }, [])

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

    // Nhóm ảnh theo batch
    const batches = useMemo(() => {
        const map = new Map<string, Batch>()
        for (const img of images) {
            if (!map.has(img.batchId)) {
                map.set(img.batchId, {
                    batchId: img.batchId,
                    prompt: img.prompt,
                    model: img.model,
                    style: img.style,
                    aspectLabel: img.aspectLabel,
                    createdAt: img.createdAt,
                    images: [],
                    referenceImages: img.referenceImages,
                    isNew: img.isNew,
                })
            }
            map.get(img.batchId)!.images.push(img)
        }
        return Array.from(map.values())
    }, [images])


    // === Handlers ===
    const handleGenerate = useCallback(() => {
        if (!prompt.trim() || isGenerating) return
        setIsGenerating(true)

        const count = parseInt(imageCount)
        const ar = getAspectRatio(aspectRatioValue)
        const batchId = `batch-${Date.now()}`

        setTimeout(() => {
            const currentRefs = [...referenceImages]
            const newImages: GeneratedImage[] = Array.from({ length: count }, (_, i) => ({
                id: `img-${Date.now()}-${i}`,
                batchId,
                url: getDemoUrl(aspectRatioValue, Date.now() + i),
                prompt: prompt.trim(),
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

            // Tự tắt highlight sau 5 giây
            const newIds = newImages.map((img) => img.id)
            setTimeout(() => {
                setImages((prev) =>
                    prev.map((img) =>
                        newIds.includes(img.id) ? { ...img, isNew: false } : img
                    )
                )
            }, 5000)
        }, 2500)
    }, [prompt, isGenerating, imageCount, images.length, model, style, aspectRatioValue])

    const handleDelete = useCallback((id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id))
        if (selectedImage?.id === id) setSelectedImage(null)
    }, [selectedImage])

    const handleRegenerate = useCallback((img: GeneratedImage) => {
        setPrompt(img.prompt)
        setModel(img.model)
        setStyle(img.style)
        setSelectedImage(null)
    }, [])

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
        <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
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
        <div className="space-y-4 px-4 pb-6 pt-4 overflow-y-auto no-scrollbar max-h-[70vh]">
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
        </div>
    )

    return (
        <TooltipProvider>
            <div className="relative flex flex-1 flex-col">
                {/* Sentinel: khi element này trượt ra khỏi viewport → isCompact = true */}
                <div ref={topObserverRef} className="absolute top-0 left-0 w-full h-1 pointer-events-none" />
                {/* Nền sạch, không gradient blob */}

                {/* === CANVAS AREA — Gallery chiếm 60% bề ngang desktop, full-width mobile === */}
                <div className="relative z-10 flex-1 flex flex-col items-center p-4 lg:p-6">
                    <div className="w-full max-w-5xl mx-auto flex flex-col flex-1">
                        {/* Empty State — Premium AI Studio */}
                        {images.length === 0 && !isGenerating && (
                            <div className="flex-1 flex flex-col items-center justify-center w-full animate-in fade-in duration-700 -mt-6">

                                {/* Animated gradient mesh blob */}
                                <div className="relative mb-10">
                                    <div className="absolute -inset-16 opacity-30 blur-3xl bg-gradient-to-r from-violet-500/20 via-cyan-500/10 to-fuchsia-500/20 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
                                    <div className="relative flex flex-col items-center">
                                        {/* Grid decorativo */}
                                        <div className="grid grid-cols-3 gap-1.5 mb-8 opacity-40">
                                            {[...Array(9)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="size-8 sm:size-10 rounded-lg border border-border/40 bg-gradient-to-br from-muted/30 to-transparent"
                                                    style={{
                                                        animationDelay: `${i * 0.15}s`,
                                                        opacity: [0, 1, 2, 4, 6, 8].includes(i) ? 0.3 : 0.6,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Typography */}
                                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-center mb-2 text-foreground/90">
                                    Tưởng tượng. Mô tả. Kiến tạo.
                                </h2>
                                <p className="text-muted-foreground/60 text-center max-w-md text-sm leading-relaxed mb-8">
                                    Nhập prompt bên dưới để AI biến ý tưởng của bạn thành tác phẩm nghệ thuật.
                                </p>

                                {/* Gợi ý prompt — click để tự điền */}
                                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                                    {[
                                        "Phong cảnh núi lúc bình minh",
                                        "Chân dung cyberpunk",
                                        "Thành phố tương lai",
                                        "Hoa anh đào mùa xuân",
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            className="px-3 py-1.5 text-xs text-muted-foreground/70 border border-border/30 rounded-full hover:border-border/60 hover:text-foreground/80 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                                            onClick={() => setPrompt(suggestion)}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* === Loading Skeleton — Clean pulse === */}
                        {isGenerating && (() => {
                            const count = parseInt(imageCount)


                            return (
                                <div className="mb-8 animate-in fade-in-0 duration-500">
                                    {/* Mini header */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Spinner className="size-3 text-muted-foreground shrink-0" />
                                        <p className="text-sm text-muted-foreground truncate flex-1 min-w-0">{prompt.slice(0, 80)}...</p>
                                        <span className="text-[10px] text-muted-foreground/50 shrink-0 animate-pulse">Đang tạo...</span>
                                    </div>

                                    {/* Skeleton tiles — khớp grid thật */}
                                    {(() => {
                                        const ratio = getAspectRatio(aspectRatioValue).ratio
                                        const gridCls = count === 1
                                            ? 'grid-cols-1 max-w-md'
                                            : count === 2
                                                ? 'grid-cols-2'
                                                : count === 3
                                                    ? 'grid-cols-2 md:grid-cols-3'
                                                    : 'grid-cols-2 md:grid-cols-4'
                                        return (
                                            <div className={`grid gap-0.5 rounded-lg overflow-hidden ${gridCls}`}>
                                                {Array.from({ length: count }).map((_, i) => (
                                                    <div
                                                        key={`skeleton-${i}`}
                                                        className="relative overflow-hidden"
                                                        style={{ aspectRatio: ratio, maxHeight: ratio < 1 && count === 1 ? '500px' : undefined }}
                                                    >
                                                        <Skeleton className="absolute inset-0 h-full w-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    })()}
                                </div>
                            )
                        })()}

                        {/* === Batch Gallery — Modern, clean, creative === */}
                        {batches.length > 0 && (
                            <div className="space-y-6">
                                {batches.map((batch, batchIdx) => {
                                    const count = batch.images.length

                                    return (
                                        <div
                                            key={batch.batchId}
                                            className={batch.isNew
                                                ? "animate-in fade-in-0 slide-in-from-bottom-3 duration-500"
                                                : ""
                                            }
                                        >
                                            {/* Separator giữa các batch */}
                                            {batchIdx > 0 && (
                                                <Separator className="mb-6 opacity-30" />
                                            )}

                                            {/* Header batch — rõ ràng, dễ đọc */}
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <Wand2 className="size-3.5 text-muted-foreground shrink-0" />

                                                {/* Ref images inline thumbnails */}
                                                {batch.referenceImages && batch.referenceImages.length > 0 && (
                                                    <div className="flex -space-x-1.5 shrink-0">
                                                        {batch.referenceImages.slice(0, 3).map((src, i) => (
                                                            <img
                                                                key={`ref-${i}`}
                                                                src={src}
                                                                alt="ref"
                                                                className="size-5 rounded-full object-cover ring-1 ring-background"
                                                            />
                                                        ))}
                                                        {batch.referenceImages.length > 3 && (
                                                            <div className="size-5 rounded-full bg-muted flex items-center justify-center text-[8px] text-muted-foreground ring-1 ring-background">
                                                                +{batch.referenceImages.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <p className="text-sm text-foreground/80 truncate flex-1 min-w-0 font-medium" title={batch.prompt}>
                                                    {batch.prompt}
                                                </p>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-xs text-muted-foreground hidden sm:inline">
                                                        {batch.model.toUpperCase()} · {batch.aspectLabel}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground/60">
                                                        {batch.createdAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-6 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                                                        onClick={() => handleRegenerate(batch.images[0])}
                                                    >
                                                        <RefreshCw className="size-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Image Grid — responsive, đúng tỉ lệ */}
                                            {(() => {
                                                const gridCls = count === 1
                                                    ? 'grid-cols-1 max-w-md'
                                                    : count === 2
                                                        ? 'grid-cols-2'
                                                        : count === 3
                                                            ? 'grid-cols-2 md:grid-cols-3'
                                                            : 'grid-cols-2 md:grid-cols-4'
                                                return (
                                                    <div className={`grid gap-0.5 rounded-lg overflow-hidden ${gridCls}`}>
                                                        {batch.images.map(img => (
                                                            <div
                                                                key={img.id}
                                                                className="group/img relative cursor-pointer overflow-hidden"
                                                                style={{ aspectRatio: img.aspectRatio, maxHeight: img.aspectRatio < 1 && count === 1 ? '500px' : undefined }}
                                                                onClick={() => setSelectedImage(img)}
                                                            >
                                                                <img src={img.url} alt={img.prompt} className="h-full w-full object-cover" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                                                                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                                                                    <Button size="icon" variant="secondary" className="size-7 rounded-full bg-black/50 hover:bg-black/70 border-0 backdrop-blur-sm" onClick={(e) => { e.stopPropagation() }}>
                                                                        <Download className="size-3 text-white" />
                                                                    </Button>
                                                                    <Button size="icon" variant="secondary" className="size-7 rounded-full bg-black/50 hover:bg-black/70 border-0 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); handleDelete(img.id) }}>
                                                                        <Trash2 className="size-3 text-white" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* === IMAGE VIEWER DIALOG === */}
                <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                    <DialogContent className="max-w-[100vw] sm:max-w-[95vw] lg:max-w-6xl w-full h-[100dvh] sm:h-[85vh] p-0 overflow-hidden gap-0 border-0 sm:border rounded-none sm:rounded-xl">
                        <DialogTitle className="sr-only">Xem ảnh chi tiết</DialogTitle>
                        {selectedImage && (
                            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                                {/* Ảnh */}
                                <div className="flex-1 flex items-center justify-center bg-muted/20 min-h-0 relative p-4 lg:p-8">
                                    {/* Khối chứa ép tỉ lệ (SVG Spacer Bounding Box) */}
                                    <div className="relative flex max-w-full max-h-full rounded-xl md:rounded-2xl shadow-2xl ring-1 ring-border/10 overflow-hidden bg-black/5">

                                        {/* Invisible dynamic SVG Image forcing the perfectly bounded aspect ratio shrink-wrap via native replaced-element bounds */}
                                        <img
                                            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${selectedImage.aspectRatio * 10000}" height="10000"></svg>`)}`}
                                            alt="spacer"
                                            className="w-auto h-auto max-w-full max-h-full object-contain invisible pointer-events-none"
                                            style={{
                                                maxHeight: isMobile ? 'calc(100vh - 12rem)' : 'calc(85vh - 4rem)',
                                            }}
                                        />

                                        {/* Absolute container that exactly matches the SVG dimensions */}
                                        <div className="absolute inset-0 w-full h-full group">
                                            <Zoom zoomMargin={isMobile ? 0 : 40} classDialog="custom-zoom-overlay">
                                                <img
                                                    src={selectedImage.url}
                                                    alt={selectedImage.prompt}
                                                    className="w-full h-full object-cover rounded-xl md:rounded-2xl"
                                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                                                />
                                            </Zoom>

                                            {/* Hover Overlay mờ ảo được bo góc và căn vừa khít với ảnh */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl md:rounded-2xl overflow-hidden shadow-inner">
                                                <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" />
                                                <div className="bg-background/90 text-foreground backdrop-blur-md px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 shadow-xl ring-1 ring-border/50 translate-y-2 group-hover:translate-y-0 transition-all duration-300 relative z-10">
                                                    <Maximize2 className="size-4" />
                                                    Xem chuẩn gốc
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Panel */}
                                <div className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-l p-5 lg:pt-14 flex flex-col gap-5 bg-background overflow-y-auto">
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Prompt</Label>
                                            <div className="text-sm leading-relaxed bg-muted/40 hover:bg-muted/60 transition-colors p-3.5 rounded-lg max-h-[180px] overflow-y-auto custom-scrollbar break-all whitespace-pre-wrap shadow-inner border border-foreground/5">
                                                {selectedImage.prompt}
                                            </div>
                                        </div>
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
                                                                <img src={src} className="absolute inset-0 w-full h-full rounded-md object-cover ring-1 ring-border/50" alt="ref" />
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
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-auto">
                                        <Button size="sm" className="w-full">
                                            <Download className="mr-2 size-4" /> Tải xuống
                                        </Button>
                                        <Button size="sm" variant="outline" className="w-full">
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
                        )}
                    </DialogContent>
                </Dialog>

                {/* === PROMPT BAR — sticky dính đáy viewport === */}
                {/* Thu lại khi cuộn màn hình để tránh che khuất Gallery */}
                <div ref={promptContainerRef} className={`sticky bottom-0 z-50 mx-auto w-full max-w-3xl transition-[padding] duration-300 ease-out ${isCompact ? 'px-2 sm:px-4 pb-2 pt-3' : 'px-4 pb-4 pt-6'}`}>
                    <div className="relative w-full">

                        {/* Pill Container */}
                        <div className={`relative flex flex-col w-full transition-all duration-300 border backdrop-blur-2xl bg-muted/70 hover:bg-muted/80 focus-within:bg-muted/80 border-border/30 rounded-[22px]`}>

                            {/* 1. Preview Ảnh Tham Chiếu (Top) — thu nhỏ khi compact */}
                            {referenceImages.length > 0 && (
                                <div className={`px-4 pb-1 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 transition-all duration-300 ${isCompact ? 'pt-2 max-h-0 opacity-0 overflow-hidden' : 'pt-4'}`}>
                                    {referenceImages.map((src, idx) => (
                                        <div key={idx} className="relative shrink-0 group/ref">
                                            <img
                                                src={src}
                                                alt={`Reference ${idx + 1}`}
                                                className="h-16 w-16 rounded-xl object-cover ring-1 ring-border/50 bg-muted/30"
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

                            {/* 2. Text Input (Middle) */}
                            <div className={`flex items-center px-2 relative transition-all duration-300 ease-in-out ${isCompact ? 'pt-1 pb-0.5' : 'pt-2 pb-1'}`}>
                                {/* Compact + có nội dung: hiển thị 1 dòng truncate có ... Mờ đi khi expand */}
                                {prompt && (
                                    <div
                                        className={`absolute top-0 left-2 right-2 px-3 text-[15px] leading-snug truncate cursor-text text-foreground/80 transition-all duration-300 ease-in-out ${isCompact ? 'opacity-100 z-10 pointer-events-auto mt-2.5' : 'opacity-0 -z-10 pointer-events-none mt-4'}`}
                                        onClick={() => {
                                            handlePromptFocus()
                                            setTimeout(() => textareaRef.current?.focus(), 50)
                                        }}
                                    >
                                        {prompt}
                                    </div>
                                )}
                                {/* Textarea thật — mờ đi khi compact có nội dung, thu hẹp max-height mượt. Không dùng hidden */}
                                <textarea
                                    ref={textareaRef}
                                    placeholder="Mô tả ý tưởng kiến tạo của bạn..."
                                    className={`w-full resize-none border-0 bg-transparent px-3 text-[15px] focus:ring-0 outline-none placeholder:text-muted-foreground/60 leading-relaxed custom-scrollbar transition-all duration-300 ease-in-out ${isCompact && prompt ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${isCompact ? 'min-h-[36px] max-h-[36px] py-1.5 overflow-hidden' : 'min-h-[44px] max-h-[120px] py-2 overflow-y-auto'}`}
                                    rows={1}
                                    value={prompt}
                                    onFocus={handlePromptFocus}
                                    onChange={(e) => {
                                        setPrompt(e.target.value)
                                        // Auto-grow tới max-h-[120px], sau đó scroll nội bộ
                                        e.target.style.height = 'auto'
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleGenerate()
                                        }
                                    }}
                                />
                            </div>

                            {/* 3. Tools & Send Button (Bottom) */}
                            <div className={`flex items-center justify-between px-3 ${isCompact ? 'pb-2' : 'pb-3'}`}>
                                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pr-2">
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
                                            className={`rounded-full transition-[width,height] duration-300 shrink-0 ${isCompact ? 'size-8' : 'size-10'} ${prompt.trim() ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" : "bg-muted text-muted-foreground"}`}
                                            disabled={isGenerating || !prompt.trim()}
                                            onClick={handleGenerate}
                                        >
                                            {isGenerating ? (
                                                <Spinner className="size-4" />
                                            ) : (
                                                <ArrowUp className={isCompact ? "size-3.5" : "size-[18px]"} />
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
    )
}
