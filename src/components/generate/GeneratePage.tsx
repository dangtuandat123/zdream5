import { useState, useCallback, useMemo } from "react"
import {
    Wand2,
    Download,
    Share2,
    Settings2,
    ArrowUp,
    Sparkles,
    Trash2,
    RotateCcw,
    ZoomIn,
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
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { AspectRatio } from "@/components/ui/aspect-ratio"

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

// Ảnh demo
const DEMO_URLS = [
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633177317976-3f9bc45e1d1d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1200&auto=format&fit=crop",
]

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
                url: DEMO_URLS[(images.length + i) % DEMO_URLS.length],
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
                {/* Nền gradient giống hero section landing page */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-[5%] left-[0%] w-[120vw] h-[120vw] md:w-[40vw] md:h-[40vw] bg-[#FF0055]/50 md:bg-[#FF0055]/30 rounded-full blur-[100px] md:blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[-10%] w-[130vw] h-[130vw] md:w-[45vw] md:h-[45vw] bg-[#7700FF]/50 md:bg-[#7700FF]/30 rounded-full blur-[100px] md:blur-[130px]" />
                    <div className="absolute top-[30%] left-[30%] w-[100vw] h-[100vw] md:w-[35vw] md:h-[35vw] bg-[#00D4FF]/30 md:bg-[#00D4FF]/20 rounded-full blur-[80px] md:blur-[140px]" />
                </div>

                {/* === CANVAS AREA === */}
                <div className="relative z-10 flex-1 flex flex-col p-4 lg:p-6">
                    {/* Empty State — Nghệ thuật & Tương lai (Liquid Glass Portal) */}
                    {images.length === 0 && !isGenerating && (
                        <div className="flex-1 flex flex-col items-center justify-center w-full animate-in fade-in zoom-in-[0.98] duration-1000 -mt-10">

                            {/* Animated Liquid Portal */}
                            <div className="relative size-48 sm:size-56 mb-8 group">
                                {/* Glow layers */}
                                <div className="absolute inset-0 bg-blue-500/30 dark:bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/40 transition-colors duration-1000" />

                                {/* Liquid spinning blobs */}
                                <div className="absolute inset-2 z-0 rounded-[40%_60%_70%_30%] bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-pink-500/40 dark:from-blue-600/40 dark:via-purple-600/40 dark:to-pink-600/40 blur-md animate-[spin_8s_linear_infinite]" />
                                <div className="absolute inset-0 z-0 rounded-[60%_40%_30%_70%] bg-gradient-to-bl from-pink-500/40 via-purple-500/40 to-cyan-500/40 dark:from-pink-600/40 dark:via-purple-600/40 dark:to-cyan-600/40 blur-md animate-[spin_12s_linear_infinite_reverse]" />

                                {/* Glass core */}
                                <div className="absolute inset-3 z-10 rounded-[40%_50%_60%_50%] backdrop-blur-xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center animate-[spin_15s_linear_infinite]">
                                    <div className="animate-[spin_15s_linear_infinite_reverse] w-full h-full flex flex-col items-center justify-center pointer-events-none">
                                        {/* Căn bằng nội dung nằm im trong khi viền xoay */}
                                        <span className="text-xl sm:text-2xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/50 uppercase ml-1">
                                            ZDream
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Cinematic Typography */}
                            <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-center mb-4">
                                Khung vẽ trống rỗng.
                                <br className="sm:hidden" />
                                <span className="text-muted-foreground font-light"> Tâm trí vô hạn.</span>
                            </h2>

                            <p className="text-muted-foreground/80 text-center max-w-sm sm:max-w-md text-sm sm:text-base leading-relaxed font-light">
                                Đánh thức trí tưởng tượng. Viết ra bất kỳ điều gì, chúng tôi sẽ vẽ nó thành hiện thực.
                            </p>

                            {/* Elegant decorative line */}
                            <div className="mt-12 w-12 h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                        </div>
                    )}

                    {/* Loading Skeleton — giống batch card nhưng đang shimmer */}
                    {isGenerating && (() => {
                        const count = parseInt(imageCount)
                        const skeletonGrid = count === 1
                            ? "grid-cols-1 max-w-sm sm:max-w-md"
                            : count === 2
                                ? "grid-cols-2 max-w-2xl"
                                : count === 3
                                    ? "grid-cols-3"
                                    : "grid-cols-2 md:grid-cols-4"

                        return (
                            <div className="mb-6">
                                <Card className="overflow-hidden p-0 bg-card/50 backdrop-blur-sm ring-2 ring-primary/40 shadow-[0_0_20px_rgba(168,85,247,0.25)] animate-in fade-in-0 duration-500">
                                    {/* Header giống batch card */}
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        <Spinner className="size-3.5 text-primary shrink-0" />

                                        <p className="text-sm font-medium truncate flex-1 min-w-0 text-muted-foreground">
                                            {prompt.slice(0, 80)}
                                        </p>

                                        <span className="text-[10px] text-primary/60 shrink-0 animate-pulse">
                                            Đang tạo...
                                        </span>
                                    </div>

                                    {/* Grid skeleton ảnh */}
                                    <div className="px-1 pb-1">
                                        <div className={`grid gap-1 ${skeletonGrid}`}>
                                            {Array.from({ length: count }).map((_, i) => (
                                                <div key={`skeleton-${i}`} className="relative overflow-hidden rounded-lg">
                                                    <AspectRatio ratio={getAspectRatio(aspectRatioValue).ratio}>
                                                        <Skeleton className="absolute inset-0 h-full w-full rounded-lg" />
                                                        {/* Shimmer gradient overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_ease-in-out_infinite] rounded-lg" />
                                                    </AspectRatio>

                                                    {/* Centered icon placeholder */}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Sparkles className="size-5 text-primary/20 animate-pulse" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )
                    })()}

                    {/* Batch Gallery — nhóm theo lần tạo */}
                    {batches.length > 0 && (
                        <div className="space-y-4">
                            {/* Danh sách batch — full width */}
                            <div className="space-y-4">
                                {batches.map((batch) => {
                                    // Grid cột thông minh: 1 ảnh → 1 cột (giới hạn width), 2 → 2, 3 → 3, 4+ → 4
                                    const count = batch.images.length
                                    const gridClass = count === 1
                                        ? "grid-cols-1 max-w-sm sm:max-w-md"
                                        : count === 2
                                            ? "grid-cols-2 max-w-2xl"
                                            : count === 3
                                                ? "grid-cols-3"
                                                : "grid-cols-2 md:grid-cols-4"

                                    return (
                                        <Card
                                            key={batch.batchId}
                                            className={`overflow-hidden p-0 bg-card/50 backdrop-blur-sm transition-all ${batch.isNew
                                                ? "ring-2 ring-primary/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-in fade-in-0 zoom-in-[0.98] duration-500"
                                                : ""
                                                }`}
                                        >
                                            {/* Compact header — 1 dòng prompt + metadata + actions */}
                                            <div className="flex items-start sm:items-center w-full min-w-0 gap-3 px-3 py-3">
                                                <div className="bg-muted/50 p-1.5 rounded-full shrink-0">
                                                    <Wand2 className="size-3.5 text-muted-foreground" />
                                                </div>

                                                {/* Wrap in flex-1 min-w-0 to absolutely trap overflow bounds */}
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="text-sm font-medium line-clamp-2 break-all text-ellipsis leading-snug"
                                                        title={batch.prompt}
                                                    >
                                                        {batch.prompt}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                                        {batch.model.toUpperCase()} · {batch.aspectLabel}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground/60">
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

                                            {/* Media container */}
                                            <div className="px-1 pb-1">
                                                {/* Hiển thị ảnh tham chiếu (Input) độc lập phía trên lưới Output */}
                                                {batch.referenceImages && batch.referenceImages.length > 0 && (
                                                    <div className="flex gap-1 overflow-x-auto scrollbar-none mb-1">
                                                        {batch.referenceImages.map((src, i) => (
                                                            <div
                                                                key={`ref-${i}`}
                                                                className={`group/ref relative shrink-0 overflow-hidden bg-muted/20 w-20 sm:w-24 aspect-square ring-1 ring-border/10 ${batch.images.length === 1 ? 'rounded-lg' : 'rounded-md'}`}
                                                            >
                                                                <img
                                                                    src={src}
                                                                    className="absolute inset-0 h-full w-full object-cover opacity-95 transition-transform duration-500 group-hover/ref:scale-[1.02]"
                                                                    alt="ref"
                                                                />
                                                                <div className="absolute top-1.5 left-1.5 bg-black/60 text-white backdrop-blur-md px-1.5 py-0.5 rounded-[4px] text-[8px] sm:text-[9px] font-medium flex items-center gap-1 shadow-sm">
                                                                    <ImageIcon className="size-2.5" />
                                                                    Input
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Image grid (Output) */}
                                                <div className={`grid gap-1 ${gridClass}`}>
                                                    {batch.images.map((img) => (
                                                        <div
                                                            key={img.id}
                                                            className="group/img relative cursor-pointer overflow-hidden rounded-lg"
                                                            onClick={() => setSelectedImage(img)}
                                                        >
                                                            <AspectRatio ratio={img.aspectRatio}>
                                                                <img
                                                                    src={img.url}
                                                                    alt={img.prompt}
                                                                    className="absolute inset-0 h-full w-full object-cover"
                                                                />
                                                            </AspectRatio>

                                                            {/* Hover overlay */}
                                                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors duration-200 rounded-lg" />

                                                            {/* Hover actions */}
                                                            <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200">
                                                                <Button
                                                                    size="icon"
                                                                    variant="secondary"
                                                                    className="size-6 rounded-full"
                                                                    onClick={(e) => { e.stopPropagation() }}
                                                                >
                                                                    <Download className="size-3" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="secondary"
                                                                    className="size-6 rounded-full"
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(img.id) }}
                                                                >
                                                                    <Trash2 className="size-3" />
                                                                </Button>
                                                            </div>

                                                            {/* Hover zoom */}
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                                <ZoomIn className="size-5 text-white drop-shadow-md" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    )}
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

                                        {/* Invisible SVG forcing the perfectly bounded aspect ratio shrink-wrap via native object-contain */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-auto h-auto max-w-full max-h-full object-contain invisible"
                                            style={{
                                                maxHeight: isMobile ? 'calc(100vh - 4rem)' : 'calc(85vh - 4rem)',
                                                maxWidth: '100%'
                                            }}
                                            viewBox={`0 0 ${selectedImage.aspectRatio * 1000} 1000`}
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
                {/* === PROMPT BAR — Giao diện chuẩn LLM có Hào quang (Aura Glow) === */}
                <div className="sticky bottom-0 z-50 mx-auto w-full max-w-3xl px-4 pb-6 pt-10">
                    <div className="relative w-full">
                        {/* Hào quang (Aura) rực rỡ nghệ thuật phía sau */}
                        <div className="absolute -inset-1 -z-10 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 blur-2xl rounded-[32px] opacity-80" />

                        {/* Pill Container (Khung chính) */}
                        <div className="relative flex flex-col w-full bg-muted/70 hover:bg-muted/90 focus-within:bg-muted/90 transition-colors border border-border/50 shadow-lg rounded-[28px] backdrop-blur-xl">

                            {/* 1. Preview Ảnh Tham Chiếu (Top) */}
                            {referenceImages.length > 0 && (
                                <div className="px-4 pt-4 pb-1 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
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
                            <div className="flex items-end px-2 pt-2 pb-1">
                                <textarea
                                    placeholder="Mô tả ý tưởng kiến tạo của bạn..."
                                    className="w-full min-h-[44px] max-h-[35vh] resize-none border-0 bg-transparent py-2.5 px-3 text-[15px] focus:ring-0 outline-none placeholder:text-muted-foreground/60 leading-relaxed custom-scrollbar"
                                    rows={1}
                                    value={prompt}
                                    onChange={(e) => {
                                        setPrompt(e.target.value)
                                        e.target.style.height = 'auto'
                                        e.target.style.height = e.target.scrollHeight + 'px'
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
                            <div className="flex items-center justify-between px-3 pb-3">
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
                                            className={`size-10 rounded-full transition-all duration-300 ${prompt.trim() ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" : "bg-muted text-muted-foreground"}`}
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
    )
}
