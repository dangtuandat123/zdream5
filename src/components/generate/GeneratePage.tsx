import { useState, useCallback } from "react"
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
    LayoutGrid,
    RectangleHorizontal,
    RectangleVertical,
    Square,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
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

// === Types ===
interface GeneratedImage {
    id: string
    url: string
    prompt: string
    model: string
    style: string
    aspectRatio: number
    aspectLabel: string
    createdAt: Date
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
    const [isGenerating, setIsGenerating] = useState(false)
    const [prompt, setPrompt] = useState("")
    const [images, setImages] = useState<GeneratedImage[]>([])
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)

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

        const count = parseInt(imageCount)
        const ar = getAspectRatio(aspectRatioValue)

        setTimeout(() => {
            const newImages: GeneratedImage[] = Array.from({ length: count }, (_, i) => ({
                id: `img-${Date.now()}-${i}`,
                url: DEMO_URLS[(images.length + i) % DEMO_URLS.length],
                prompt: prompt.trim(),
                model,
                style,
                aspectRatio: ar.ratio,
                aspectLabel: ar.label,
                createdAt: new Date(),
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
                <div className="relative z-10 flex-1 p-4 lg:p-6">
                    {/* Empty State — sử dụng shadcn Empty component */}
                    {images.length === 0 && !isGenerating && (
                        <Empty className="py-24 border-0">
                            <EmptyHeader>
                                <EmptyMedia>
                                    <Sparkles className="size-10 text-primary" />
                                </EmptyMedia>
                                <EmptyTitle>Bắt đầu sáng tạo</EmptyTitle>
                                <EmptyDescription>
                                    Nhập mô tả vào thanh lệnh phía dưới để AI tạo ảnh cho bạn.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}

                    {/* Loading Skeletons — AspectRatio + Skeleton */}
                    {isGenerating && (
                        <div className={`mb-4 grid gap-4 ${parseInt(imageCount) > 1
                            ? "grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1 max-w-2xl mx-auto"
                            }`}>
                            {Array.from({ length: parseInt(imageCount) }).map((_, i) => (
                                <Card key={`skeleton-${i}`} className="overflow-hidden p-0">
                                    <div className="relative">
                                        <AspectRatio ratio={getAspectRatio(aspectRatioValue).ratio}>
                                            <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
                                        </AspectRatio>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                            <Spinner className="size-8 text-primary/40" />
                                            {i === 0 && (
                                                <p className="text-xs text-muted-foreground px-4 text-center truncate max-w-[200px]">
                                                    {prompt.slice(0, 50)}...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Image Gallery Grid */}
                    {images.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <LayoutGrid className="size-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{images.length} ảnh</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-muted-foreground"
                                    onClick={() => setImages([])}
                                >
                                    Xoá tất cả
                                </Button>
                            </div>

                            {/* Masonry layout — CSS columns cho mixed aspect ratios */}
                            <div className="columns-2 gap-3 lg:columns-3 xl:columns-4">
                                {images.map((img) => (
                                    <Card
                                        key={img.id}
                                        className={`group mb-3 cursor-pointer overflow-hidden break-inside-avoid transition-all hover:shadow-lg hover:border-primary/30 p-0 ${img.isNew
                                            ? "ring-2 ring-primary/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-in fade-in-0 zoom-in-95 duration-500"
                                            : ""
                                            }`}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        {/* Wrapper relative cho cả ảnh + overlay */}
                                        <div className="relative">
                                            <AspectRatio ratio={img.aspectRatio}>
                                                <img
                                                    src={img.url}
                                                    alt={img.prompt}
                                                    className="absolute inset-0 h-full w-full rounded-t-xl object-cover"
                                                />
                                            </AspectRatio>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 rounded-t-xl bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />

                                            {/* Hover Actions */}
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="size-7 rounded-full"
                                                            onClick={(e) => { e.stopPropagation() }}
                                                        >
                                                            <Download className="size-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">Tải xuống</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="size-7 rounded-full"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(img.id) }}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">Xoá</TooltipContent>
                                                </Tooltip>
                                            </div>

                                            {/* Hover Zoom */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                <ZoomIn className="size-6 text-white drop-shadow-md" />
                                            </div>

                                            {/* Bottom gradient + prompt text + badge */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-6">
                                                <div className="flex items-end justify-between gap-2">
                                                    <p className="text-xs text-white/90 truncate">{img.prompt}</p>
                                                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                                                        {img.aspectLabel}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* === IMAGE VIEWER DIALOG === */}
                <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                    <DialogContent className="max-w-4xl w-full p-0 overflow-hidden gap-0">
                        <DialogTitle className="sr-only">Xem ảnh chi tiết</DialogTitle>
                        {selectedImage && (
                            <div className="flex flex-col lg:flex-row">
                                {/* Ảnh */}
                                <div className="flex-1 flex items-center justify-center bg-muted/30 min-h-[300px] lg:min-h-[500px] p-4">
                                    <img
                                        src={selectedImage.url}
                                        alt={selectedImage.prompt}
                                        className="max-h-[70vh] max-w-full object-contain rounded-lg"
                                    />
                                </div>

                                {/* Info Panel */}
                                <div className="w-full lg:w-[280px] border-t lg:border-t-0 lg:border-l p-4 flex flex-col gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Prompt</Label>
                                            <p className="text-sm mt-1">{selectedImage.prompt}</p>
                                        </div>
                                        <Separator />
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
                <div className="sticky bottom-0 z-50 mx-auto w-full max-w-3xl px-4 py-3">
                    <Card className="bg-card border shadow-lg ring-1 ring-border">
                        <CardContent className="p-2">
                            <Textarea
                                placeholder="Mô tả ý tưởng của bạn..."
                                className="min-h-[56px] max-h-[120px] w-full resize-none border-0 bg-transparent px-3 py-2 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleGenerate()
                                    }
                                }}
                            />
                            <Separator className="my-1" />

                            <div className="flex items-center justify-between px-1 pt-1">
                                <div className="flex items-center gap-1.5">
                                    {/* Settings Popover */}
                                    <Popover>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-8 rounded-full">
                                                        <Settings2 className="size-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">Cài đặt</TooltipContent>
                                        </Tooltip>

                                        <PopoverContent side="top" align="start" className="w-[320px] p-4">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 font-medium text-sm">
                                                    <Wand2 className="size-4 text-primary" />
                                                    Thông số kiến tạo
                                                </div>
                                                <Separator />

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
                                        </PopoverContent>
                                    </Popover>

                                    {/* Model Select */}
                                    <Select value={model} onValueChange={setModel}>
                                        <SelectTrigger className="h-7 border-none bg-muted/50 hover:bg-muted text-[11px] font-medium rounded-full px-3 w-auto min-w-[120px] shadow-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                                            <SelectItem value="dalle3">DALL·E 3</SelectItem>
                                            <SelectItem value="midjourney">Midjourney V6</SelectItem>
                                            <SelectItem value="flux">Flux Pro</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Quick info badges */}
                                    <Badge variant="outline" className="text-[10px] h-6 rounded-full font-normal">
                                        {getAspectRatio(aspectRatioValue).label}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] h-6 rounded-full font-normal">
                                        ×{imageCount}
                                    </Badge>
                                </div>

                                {/* Generate */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            className="size-9 rounded-full"
                                            disabled={isGenerating || !prompt.trim()}
                                            onClick={handleGenerate}
                                        >
                                            {isGenerating ? (
                                                <Spinner className="size-4" />
                                            ) : (
                                                <ArrowUp className="size-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        Tạo ảnh <span className="text-muted-foreground text-[10px] ml-1">Enter</span>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TooltipProvider>
    )
}
