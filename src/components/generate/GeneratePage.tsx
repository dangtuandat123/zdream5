import { useState, useCallback } from "react"
import {
    Wand2,
    Download,
    Share2,
    Settings2,
    ArrowUp,
    Sparkles,
    Loader2,
    Trash2,
    RotateCcw,
    ZoomIn,
    LayoutGrid,
    RectangleHorizontal,
    RectangleVertical,
    Square,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ScrollArea } from "@/components/ui/scroll-area"

// === Types ===
interface GeneratedImage {
    id: string
    url: string
    prompt: string
    model: string
    style: string
    aspectRatio: string
    createdAt: Date
}

// Ảnh demo cho simulate
const DEMO_URLS = [
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633177317976-3f9bc45e1d1d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1200&auto=format&fit=crop",
]

// Aspect ratio configs
const ASPECT_RATIOS = [
    { value: "1:1", label: "1:1", icon: Square, css: "aspect-square" },
    { value: "16:9", label: "16:9", icon: RectangleHorizontal, css: "aspect-video" },
    { value: "9:16", label: "9:16", icon: RectangleVertical, css: "aspect-[9/16]" },
    { value: "4:3", label: "4:3", icon: RectangleHorizontal, css: "aspect-[4/3]" },
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
    const [aspectRatio, setAspectRatio] = useState("1:1")
    const [creativity, setCreativity] = useState([75])
    const [highRes, setHighRes] = useState(false)
    const [imageCount, setImageCount] = useState("1")

    // === Handlers ===
    const handleGenerate = useCallback(() => {
        if (!prompt.trim() || isGenerating) return
        setIsGenerating(true)

        const count = parseInt(imageCount)

        // Simulate API: tạo N ảnh
        setTimeout(() => {
            const newImages: GeneratedImage[] = Array.from({ length: count }, (_, i) => ({
                id: `img-${Date.now()}-${i}`,
                url: DEMO_URLS[(images.length + i) % DEMO_URLS.length],
                prompt: prompt.trim(),
                model,
                style,
                aspectRatio,
                createdAt: new Date(),
            }))

            setImages((prev) => [...newImages, ...prev])
            setIsGenerating(false)
        }, 2500)
    }, [prompt, isGenerating, imageCount, images.length, model, style, aspectRatio])

    const handleDelete = useCallback((id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id))
        if (selectedImage?.id === id) setSelectedImage(null)
    }, [selectedImage])

    const handleRegenerate = useCallback((img: GeneratedImage) => {
        setPrompt(img.prompt)
        setModel(img.model)
        setStyle(img.style)
        setAspectRatio(img.aspectRatio)
    }, [])

    const getAspectCss = (ratio: string) =>
        ASPECT_RATIOS.find((r) => r.value === ratio)?.css || "aspect-square"

    return (
        <TooltipProvider>
            <div className="relative flex h-full w-full flex-col overflow-hidden">
                {/* === CANVAS AREA === */}
                <ScrollArea className="flex-1 pb-36">
                    <div className="p-4 lg:p-6">
                        {/* Empty State */}
                        {images.length === 0 && !isGenerating && (
                            <div className="flex flex-col items-center justify-center text-center py-32 max-w-md mx-auto space-y-6 opacity-60">
                                <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20">
                                    <Sparkles className="size-10 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-medium tracking-tight">Bắt đầu sáng tạo</h3>
                                    <p className="text-muted-foreground">
                                        Nhập mô tả vào thanh lệnh phía dưới để AI tạo ảnh cho bạn.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading Skeletons — hiện ngay trên đầu grid khi đang generate */}
                        {isGenerating && (
                            <div className="mb-4">
                                <div className={`grid gap-4 ${parseInt(imageCount) > 1
                                    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
                                    : "grid-cols-1 max-w-2xl mx-auto"
                                    }`}>
                                    {Array.from({ length: parseInt(imageCount) }).map((_, i) => (
                                        <div
                                            key={`skeleton-${i}`}
                                            className={`relative rounded-xl border bg-background/50 overflow-hidden ${getAspectCss(aspectRatio)}`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 animate-pulse" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="size-8 animate-spin text-primary/40" />
                                                {i === 0 && (
                                                    <p className="text-xs text-muted-foreground animate-pulse px-4 text-center truncate max-w-[200px]">
                                                        {prompt.slice(0, 50)}...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                                    {images.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-muted-foreground"
                                            onClick={() => setImages([])}
                                        >
                                            Xoá tất cả
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {images.map((img) => (
                                        <div
                                            key={img.id}
                                            className="group relative cursor-pointer rounded-xl border bg-background overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                                            onClick={() => setSelectedImage(img)}
                                        >
                                            {/* Image */}
                                            <div className={`relative ${getAspectCss(img.aspectRatio)}`}>
                                                <img
                                                    src={img.url}
                                                    alt={img.prompt}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />

                                                {/* Hover Actions */}
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="secondary"
                                                                className="size-7 rounded-full backdrop-blur-md bg-background/80"
                                                                onClick={(e) => { e.stopPropagation(); /* download logic */ }}
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
                                                                className="size-7 rounded-full backdrop-blur-md bg-background/80"
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(img.id) }}
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom">Xoá</TooltipContent>
                                                    </Tooltip>
                                                </div>

                                                {/* Hover Zoom Icon */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                    <div className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                                        <ZoomIn className="size-5 text-white" />
                                                    </div>
                                                </div>

                                                {/* Aspect Ratio Badge */}
                                                <Badge
                                                    variant="secondary"
                                                    className="absolute bottom-2 left-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md bg-background/80"
                                                >
                                                    {img.aspectRatio}
                                                </Badge>
                                            </div>

                                            {/* Card Footer */}
                                            <div className="p-2.5">
                                                <p className="text-xs text-muted-foreground truncate">{img.prompt}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* === IMAGE VIEWER DIALOG === */}
                <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                    <DialogContent className="max-w-4xl w-full p-0 overflow-hidden gap-0">
                        <DialogTitle className="sr-only">Xem ảnh chi tiết</DialogTitle>
                        {selectedImage && (
                            <div className="flex flex-col lg:flex-row">
                                {/* Image */}
                                <div className="flex-1 flex items-center justify-center bg-black/5 dark:bg-white/5 min-h-[300px] lg:min-h-[500px] p-4">
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
                                                <p className="text-xs font-medium mt-0.5">{selectedImage.aspectRatio}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Thời gian</Label>
                                                <p className="text-xs font-medium mt-0.5">
                                                    {selectedImage.createdAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 mt-auto">
                                        <Button size="sm" className="w-full">
                                            <Download className="mr-2 size-4" /> Tải xuống
                                        </Button>
                                        <Button size="sm" variant="outline" className="w-full">
                                            <Share2 className="mr-2 size-4" /> Chia sẻ
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex-1"
                                                onClick={() => {
                                                    handleRegenerate(selectedImage)
                                                    setSelectedImage(null)
                                                }}
                                            >
                                                <RotateCcw className="mr-2 size-3.5" /> Tạo lại
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex-1 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(selectedImage.id)}
                                            >
                                                <Trash2 className="mr-2 size-3.5" /> Xoá
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* === FLOATING PROMPT BAR === */}
                <div className="absolute bottom-6 left-1/2 w-full max-w-3xl -translate-x-1/2 px-4 z-50">
                    <div className="flex flex-col rounded-[24px] border border-border/50 bg-background/80 backdrop-blur-2xl p-2 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background/95">
                        {/* Textarea */}
                        <Textarea
                            placeholder="Mô tả ý tưởng của bạn..."
                            className="min-h-[56px] max-h-[120px] w-full resize-none border-0 bg-transparent px-4 py-2.5 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleGenerate()
                                }
                            }}
                        />

                        {/* Control Bar */}
                        <div className="flex items-center justify-between px-2 pt-1.5 border-t border-border/30">
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

                                    <PopoverContent side="top" align="start" className="w-[320px] p-4 rounded-xl">
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
                                                    value={aspectRatio}
                                                    onValueChange={(v) => v && setAspectRatio(v)}
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

                                            {/* Image Count */}
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

                                {/* Quick Model Selector */}
                                <Select value={model} onValueChange={setModel}>
                                    <SelectTrigger className="h-7 border-none bg-muted/50 hover:bg-muted text-[11px] font-medium rounded-full px-3 w-auto min-w-[120px] shadow-none">
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                                        <SelectItem value="dalle3">DALL·E 3</SelectItem>
                                        <SelectItem value="midjourney">Midjourney V6</SelectItem>
                                        <SelectItem value="flux">Flux Pro</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Quick Aspect Ratio */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 rounded-full text-[11px] text-muted-foreground">
                                            {ASPECT_RATIOS.find(r => r.value === aspectRatio)?.label}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Tỷ lệ khung hình</TooltipContent>
                                </Tooltip>

                                {/* Quick Count */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 rounded-full text-[11px] text-muted-foreground">
                                            ×{imageCount}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Số lượng ảnh mỗi lần tạo</TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Generate Button */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="size-9 rounded-full bg-primary hover:scale-105 transition-transform"
                                        disabled={isGenerating || !prompt.trim()}
                                        onClick={handleGenerate}
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="size-4 animate-spin" />
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
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
