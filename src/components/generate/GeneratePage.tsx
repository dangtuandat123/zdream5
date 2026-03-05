import { useState, useCallback, useRef, useEffect } from "react"
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



// === Justified Gallery Component ===
type GalleryItem =
    | { type: 'skeleton'; ratio: number; key: string }
    | { type: 'image'; img: GeneratedImage; ratio: number; key: string }

interface JustifiedRow {
    items: GalleryItem[]
    height: number
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

    // Hàng cuối — giữ target height, không kéo giãn
    if (currentItems.length > 0) {
        rows.push({ items: currentItems, height: targetHeight })
    }

    return rows
}

function JustifiedGallery({
    items,
    targetHeight,
    gap,
    onSelectImage,
    onDeleteImage,
}: {
    items: GalleryItem[]
    targetHeight: number
    gap: number
    onSelectImage: (img: GeneratedImage) => void
    onDeleteImage: (id: string) => void
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
        <div ref={containerRef} className="w-full overflow-hidden">
            {rows.map((row, rowIdx) => (
                <div
                    key={rowIdx}
                    className="flex"
                    style={{ gap: `${gap}px`, marginBottom: `${gap}px` }}
                >
                    {row.items.map(item => {
                        // Pixel width chính xác = height × ratio → đúng tỉ lệ
                        // flex-shrink: 1 → co lại mượt khi sidebar mở (tạm thời, cho đến khi ResizeObserver recompute)
                        const w = row.height * item.ratio
                        const itemStyle = {
                            width: `${w}px`,
                            height: `${row.height}px`,
                            flexShrink: 1,
                            minWidth: 0,
                        }

                        if (item.type === 'skeleton') {
                            return (
                                <div
                                    key={item.key}
                                    className="relative rounded-md overflow-hidden bg-muted/20 border border-border/10 flex flex-col items-center justify-center isolate"
                                    style={itemStyle}
                                >
                                    {/* Shimmer overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                    <Skeleton className="absolute inset-0 h-full w-full rounded-none opacity-20" />

                                    <div className="flex flex-col items-center gap-3 z-10">
                                        <Wand2 className="size-6 text-muted-foreground/40 animate-pulse" />
                                        <div className="flex gap-1.5">
                                            <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        const img = item.img
                        return (
                            <div
                                key={item.key}
                                className={`group/img relative cursor-pointer overflow-hidden rounded-md ${img.isNew ? 'animate-in fade-in-0 zoom-in-[0.98] slide-in-from-bottom-4 duration-700 ease-out fill-mode-both' : ''}`}
                                style={itemStyle}
                                onClick={() => onSelectImage(img)}
                            >
                                <img
                                    src={img.url}
                                    alt={img.prompt}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-1.5 right-1.5 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                                    <Button size="icon" variant="secondary" className="size-6 rounded-full bg-black/50 hover:bg-black/70 border-0 backdrop-blur-sm" onClick={(e) => { e.stopPropagation() }}>
                                        <Download className="size-3 text-white" />
                                    </Button>
                                    <Button size="icon" variant="secondary" className="size-6 rounded-full bg-black/50 hover:bg-black/70 border-0 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id) }}>
                                        <Trash2 className="size-3 text-white" />
                                    </Button>
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

                                {/* Creative Suggestion Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-4xl w-full">
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
                                            <span className="text-xs text-muted-foreground/70 pr-4 leading-relaxed z-10">
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
                                <JustifiedGallery
                                    items={items}
                                    targetHeight={TARGET_H}
                                    gap={GAP}
                                    onSelectImage={setSelectedImage}
                                    onDeleteImage={handleDelete}
                                />
                            )
                        })()}
                    </div>
                </div>

                {/* === IMAGE VIEWER — Dialog modal === */}
                <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                    {selectedImage && (
                        <DialogContent className="max-w-[100vw] sm:max-w-[95vw] lg:max-w-6xl w-full h-[100dvh] sm:h-[85vh] p-0 overflow-hidden gap-0 border-0 sm:border rounded-none sm:rounded-xl">
                            <DialogTitle className="sr-only">Chi tiết hình ảnh</DialogTitle>
                            <div className="flex flex-col lg:flex-row h-full">

                                {/* Ảnh */}
                                <div className="flex-1 flex items-center justify-center bg-muted/20 min-h-0 relative p-4 lg:p-8">
                                    {/* Khối chứa ép tỉ lệ (SVG Spacer Bounding Box) */}
                                    <div className="relative flex max-w-full max-h-full rounded-md shadow-2xl ring-1 ring-border/10 overflow-hidden bg-black/5">

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
                                                    className="w-full h-full object-cover rounded-md"
                                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
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
                                        </div>
                                    </div>
                                </div>

                                {/* Info Panel */}
                                <div className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-l p-5 lg:pt-14 flex flex-col gap-5 bg-background overflow-y-auto custom-scrollbar">
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
                        </DialogContent>
                    )}
                </Dialog>

                {/* === PROMPT BAR — sticky dính đáy viewport === */}
                <div ref={promptContainerRef} className="sticky bottom-0 z-50 mx-auto w-full max-w-3xl px-4 pb-4 pt-6">
                    <div className="relative w-full">

                        {/* Pill Container */}
                        <div className="relative flex flex-col w-full transition-all duration-300 border border-border/30 rounded-[22px]" style={{ backgroundColor: '#37393b' }}>

                            {/* 1. Preview Ảnh Tham Chiếu (Top) — thu nhỏ khi compact */}
                            {referenceImages.length > 0 && (
                                <div className="px-4 pb-1 pt-4 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
                                    {referenceImages.map((src, idx) => (
                                        <div key={idx} className="relative shrink-0 group/ref">
                                            <img
                                                src={src}
                                                alt={`Reference ${idx + 1}`}
                                                className="h-16 w-16 rounded-md object-cover ring-1 ring-border/50 bg-muted/30"
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
                            <div className="flex items-center px-2 pt-2 pb-1">
                                <textarea
                                    ref={textareaRef}
                                    placeholder="Mô tả ý tưởng kiến tạo của bạn..."
                                    className="w-full resize-none border-0 bg-transparent px-3 text-[15px] focus:ring-0 outline-none placeholder:text-muted-foreground/60 leading-relaxed custom-scrollbar min-h-[44px] max-h-[120px] py-2 overflow-y-auto"
                                    rows={1}
                                    value={prompt}
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
    )
}
