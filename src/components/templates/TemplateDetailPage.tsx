import { useState, useRef, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { toast } from "sonner"
import {
    ArrowLeftIcon,
    Upload,
    Download,
    Share2,
    ImageIcon,
    Sparkles,
    Settings2,
    ArrowUp,
    X,
    RotateCcw,
    Copy,
    Maximize2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Dữ liệu mẫu
const TEMPLATES: Record<string, { name: string; category: string; description: string; prompt: string }> = {
    "1": { name: "Chân dung Cyberpunk", category: "Chân dung", description: "Biến đổi ảnh thành phong cách Cyberpunk với ánh neon rực rỡ", prompt: "cyberpunk portrait, neon lights, cinematic" },
    "2": { name: "Phong cảnh Ghibli", category: "Anime", description: "Chuyển đổi ảnh phong cảnh thành phong cách Studio Ghibli", prompt: "studio ghibli style landscape, watercolor" },
    "3": { name: "Render sản phẩm 3D", category: "3D", description: "Tạo ảnh render 3D siêu thực cho sản phẩm", prompt: "3D product render, studio lighting, white background" },
    "4": { name: "Logo Minimalist", category: "Logo", description: "Thiết kế lại logo theo phong cách tối giản", prompt: "minimalist logo, clean lines, vector" },
    "5": { name: "Sơn dầu cổ điển", category: "Phong cảnh", description: "Mang vẻ đẹp cổ điển Baroque cho ảnh", prompt: "baroque oil painting, classical, dramatic" },
    "6": { name: "Anime Waifu", category: "Anime", description: "Tạo nhân vật anime từ ảnh chân dung", prompt: "anime character, waifu, cute style" },
    "7": { name: "Ảnh thời trang", category: "Chân dung", description: "Ảnh chân dung thời trang cao cấp", prompt: "fashion photography, editorial, high-end" },
    "8": { name: "Concept Art", category: "Phong cảnh", description: "Concept art game/phim", prompt: "concept art, game environment, cinematic" },
    "9": { name: "Mockup sản phẩm", category: "Sản phẩm", description: "Ảnh mockup sản phẩm chuyên nghiệp", prompt: "product mockup, professional photography" },
    "10": { name: "Chibi Avatar", category: "Anime", description: "Avatar chibi dễ thương", prompt: "chibi character, cute, kawaii" },
    "11": { name: "Pixel Art", category: "3D", description: "Pixel art retro game", prompt: "pixel art, retro game, 16-bit" },
    "12": { name: "Watercolor Portrait", category: "Chân dung", description: "Chân dung phong cách màu nước", prompt: "watercolor portrait, soft colors, artistic" },
}

interface GeneratedImage {
    id: string
    url: string
    timestamp: number
}

export function TemplateDetailPage() {
    const { id } = useParams<{ id: string }>()
    const template = TEMPLATES[id || "1"] || TEMPLATES["1"]

    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generateProgress, setGenerateProgress] = useState(0)
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
    const [strength, setStrength] = useState([70])
    const [quality, setQuality] = useState("high")
    const [isDragging, setIsDragging] = useState(false)
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isCopied, setIsCopied] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setUploadedImage(reader.result as string)
                toast.success('Ảnh đã sẵn sàng')
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = () => {
                setUploadedImage(reader.result as string)
                toast.success('Ảnh đã sẵn sàng')
            }
            reader.readAsDataURL(file)
        }
    }, [])

    const handleGenerate = useCallback(() => {
        if (!uploadedImage || isGenerating) return
        setIsGenerating(true)
        setGenerateProgress(0)

        // Mô phỏng tiến trình (0 → 95% trong 2.5s)
        const interval = setInterval(() => {
            setGenerateProgress(prev => {
                if (prev >= 95) { clearInterval(interval); return 95 }
                return prev + Math.random() * 8
            })
        }, 150)

        // Mô phỏng kết quả sau 3s
        setTimeout(() => {
            clearInterval(interval)
            setGenerateProgress(100)

            const newImage: GeneratedImage = {
                id: `template-${Date.now()}`,
                url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
                timestamp: Date.now(),
            }
            setGeneratedImages(prev => [newImage, ...prev])
            setIsGenerating(false)
            setGenerateProgress(0)
            toast.success('Tạo ảnh thành công!')
        }, 3000)
    }, [uploadedImage, isGenerating])

    const handleDownload = useCallback((url: string) => {
        const a = document.createElement('a')
        a.href = url
        a.download = `zdream-${template.name}-${Date.now()}.png`
        a.click()
        toast.success('Đang tải xuống')
    }, [template.name])

    const navigateImage = useCallback((direction: 'prev' | 'next') => {
        const newIndex = direction === 'prev'
            ? (selectedIndex - 1 + generatedImages.length) % generatedImages.length
            : (selectedIndex + 1) % generatedImages.length
        setSelectedIndex(newIndex)
        setSelectedImage(generatedImages[newIndex])
    }, [selectedIndex, generatedImages])

    return (
        <TooltipProvider>
            <div className="relative flex h-full w-full flex-col overflow-hidden bg-muted/10">
                {/* Top Bar */}
                <div className="flex items-center justify-between border-b px-4 py-3 lg:px-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                            <Link to="/app/templates">
                                <ArrowLeftIcon className="size-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-semibold">{template.name}</h1>
                            <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                        </div>
                    </div>
                    <p className="hidden text-xs text-muted-foreground sm:block max-w-xs truncate">
                        {template.description}
                    </p>
                </div>

                {/* Canvas Area + Gallery */}
                <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pb-36">
                    {/* Ảnh gốc đã upload */}
                    {uploadedImage && (
                        <div className="px-4 pt-4 lg:px-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Ảnh gốc</Label>
                                <button
                                    className="text-[10px] text-muted-foreground/50 hover:text-foreground transition-colors"
                                    onClick={() => { setUploadedImage(null); toast('Đã xoá ảnh gốc') }}
                                >
                                    Xoá
                                </button>
                            </div>
                            <div className="relative w-fit">
                                <img
                                    src={uploadedImage}
                                    alt="Original"
                                    className="h-32 rounded-xl object-cover border border-border/40"
                                />
                                <button
                                    onClick={() => setUploadedImage(null)}
                                    className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 shadow-sm hover:bg-muted"
                                >
                                    <X className="size-3 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Thanh tiến trình khi đang tạo */}
                    {isGenerating && (
                        <div className="px-4 pt-4 lg:px-6">
                            <div className="relative rounded-2xl border bg-background/50 overflow-hidden">
                                {/* Shimmer overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[shimmer_2s_infinite]" />

                                <div className="flex flex-col items-center justify-center py-16 gap-4 relative z-10">
                                    <Spinner className="size-6 text-primary" />
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-medium">Đang biến đổi theo "{template.name}"</p>
                                        <p className="text-xs text-muted-foreground">{Math.round(generateProgress)}%</p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="h-0.5 bg-muted">
                                    <div
                                        className="h-full bg-primary transition-all duration-300 ease-out"
                                        style={{ width: `${generateProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gallery kết quả */}
                    {generatedImages.length > 0 && (
                        <div className="px-4 pt-4 lg:px-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Kết quả</Label>
                                <Badge variant="secondary" className="h-4 px-1.5 text-[9px] rounded-sm font-medium">{generatedImages.length}</Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {generatedImages.map((img, idx) => (
                                    <div
                                        key={img.id}
                                        className="group relative aspect-square rounded-xl overflow-hidden border border-border/30 bg-muted/20 cursor-pointer"
                                        onClick={() => { setSelectedImage(img); setSelectedIndex(idx) }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`Result ${idx + 1}`}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                        />
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="absolute bottom-2 left-2 right-2 flex gap-1.5">
                                                <Button size="sm" variant="secondary" className="h-7 px-2 text-[10px] bg-white/10 backdrop-blur-md border-white/10 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleDownload(img.url) }}>
                                                    <Download className="size-3 mr-1" /> Tải
                                                </Button>
                                                <Button size="sm" variant="secondary" className="h-7 px-2 text-[10px] bg-white/10 backdrop-blur-md border-white/10 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation() }}>
                                                    <Maximize2 className="size-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State — khi chưa có ảnh nào và không đang generate */}
                    {generatedImages.length === 0 && !isGenerating && !uploadedImage && (
                        <div
                            className="flex-1 flex flex-col items-center justify-center text-center px-6 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className={`flex flex-col items-center gap-5 transition-all duration-200 ${isDragging ? 'scale-105' : 'opacity-50 hover:opacity-70'}`}>
                                <div className={`flex size-20 items-center justify-center rounded-3xl border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/40'}`}>
                                    <Upload className={`size-9 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-medium tracking-tight">Tải ảnh gốc lên</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Kéo thả hoặc nhấp để chọn ảnh. AI sẽ biến đổi theo mẫu <strong>"{template.name}"</strong>
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/50">PNG, JPG, WEBP · tối đa 10MB</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Khi đã có ảnh upload nhưng chưa có kết quả */}
                    {uploadedImage && generatedImages.length === 0 && !isGenerating && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                            <div className="flex flex-col items-center gap-4 opacity-40">
                                <Sparkles className="size-10 text-muted-foreground" />
                                <div className="space-y-1.5">
                                    <p className="text-sm font-medium">Ảnh đã sẵn sàng</p>
                                    <p className="text-xs text-muted-foreground">Nhấn nút ⬆ bên dưới để bắt đầu tạo</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Floating Bottom Bar — phong cách giống GeneratePage */}
                <div className="absolute bottom-6 left-1/2 w-full max-w-2xl -translate-x-1/2 px-4 z-50">
                    <div
                        className="flex items-center justify-between rounded-[22px] border border-border/30 p-3"
                        style={{ backgroundColor: '#37393b' }}
                    >
                        {/* Left: Upload + Settings */}
                        <div className="flex items-center gap-1.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-9 rounded-full text-muted-foreground hover:text-foreground"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="size-[18px]" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">{uploadedImage ? "Đổi ảnh gốc" : "Tải ảnh lên"}</TooltipContent>
                            </Tooltip>

                            <Popover>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground hover:text-foreground">
                                                <Settings2 className="size-[18px]" />
                                            </Button>
                                        </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Thông số</TooltipContent>
                                </Tooltip>

                                <PopoverContent side="top" align="start" className="w-[300px] p-0">
                                    <div className="p-4 border-b border-border/50">
                                        <div className="flex items-center gap-2 font-medium text-sm">
                                            <Sparkles className="size-4 text-primary" />
                                            Thông số biến đổi
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {/* Strength Slider */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Mức biến đổi</Label>
                                                <span className="text-xs font-medium tabular-nums">{strength[0]}%</span>
                                            </div>
                                            <Slider value={strength} onValueChange={setStrength} max={100} step={1} />
                                            <p className="text-[11px] text-muted-foreground">
                                                Cao = sáng tạo hơn · Thấp = giữ nguyên ảnh gốc
                                            </p>
                                        </div>
                                        <Separator />
                                        {/* Quality Select */}
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Chất lượng</Label>
                                            <Select value={quality} onValueChange={setQuality}>
                                                <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="standard">Chuẩn (512×512)</SelectItem>
                                                    <SelectItem value="high">Cao (1024×1024)</SelectItem>
                                                    <SelectItem value="ultra">Siêu nét (2048×2048)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Info badges */}
                            <div className="hidden sm:flex items-center gap-1.5 ml-1">
                                <Badge variant="secondary" className="text-[10px] h-6 rounded-full font-medium px-2.5 bg-background/50 border-border/50">
                                    {strength[0]}%
                                </Badge>
                                <Badge variant="secondary" className="text-[10px] h-6 rounded-full font-medium px-2.5 bg-background/50 border-border/50 capitalize">
                                    {quality === 'standard' ? 'Chuẩn' : quality === 'high' ? 'Cao' : 'Siêu nét'}
                                </Badge>
                            </div>
                        </div>

                        {/* Center: Template name */}
                        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground truncate max-w-[180px]">
                            <ImageIcon className="size-3.5 shrink-0" />
                            <span className="truncate">{template.name}</span>
                        </div>

                        {/* Right: Generate */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    className={`rounded-full shrink-0 size-10 ${uploadedImage ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" : "bg-muted text-muted-foreground"}`}
                                    disabled={isGenerating || !uploadedImage}
                                    onClick={handleGenerate}
                                >
                                    {isGenerating ? (
                                        <Spinner className="size-4" />
                                    ) : (
                                        <ArrowUp className="size-[18px]" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={10}>
                                {!uploadedImage ? 'Tải ảnh gốc trước' : 'Tạo ảnh'}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Image Viewer Dialog */}
                {selectedImage && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
                        <div className="flex h-full" onClick={(e) => e.stopPropagation()}>
                            {/* Main Image */}
                            <div className="flex-1 flex items-center justify-center p-8 relative">
                                <button
                                    className="absolute top-4 right-4 z-10 bg-background/20 hover:bg-background/40 rounded-full p-2 backdrop-blur-md transition-colors"
                                    onClick={() => setSelectedImage(null)}
                                >
                                    <X className="size-5 text-white" />
                                </button>

                                {/* Navigation arrows */}
                                {generatedImages.length > 1 && (
                                    <>
                                        <button
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-md rounded-full p-2 transition-colors"
                                            onClick={(e) => { e.stopPropagation(); navigateImage('prev') }}
                                        >
                                            <ChevronLeft className="size-5 text-white" />
                                        </button>
                                        <button
                                            className="absolute right-4 lg:right-[340px] top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-md rounded-full p-2 transition-colors"
                                            onClick={(e) => { e.stopPropagation(); navigateImage('next') }}
                                        >
                                            <ChevronRight className="size-5 text-white" />
                                        </button>
                                    </>
                                )}

                                <img
                                    src={selectedImage.url}
                                    alt="Selected"
                                    className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
                                />
                            </div>

                            {/* Info Panel */}
                            <div className="w-full lg:w-[320px] flex-1 lg:flex-none lg:h-full border-t lg:border-t-0 lg:border-l p-5 lg:pt-14 flex flex-col gap-5 bg-background overflow-y-auto custom-scrollbar min-h-0">
                                <div className="space-y-3">
                                    {/* Template info */}
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Mẫu</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{template.name}</span>
                                            <Badge variant="secondary" className="text-[9px]">{template.category}</Badge>
                                        </div>
                                    </div>

                                    {/* Prompt */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Prompt</Label>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-6 rounded-md hover:bg-muted"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(template.prompt)
                                                    setIsCopied(true)
                                                    toast.success('Đã sao chép prompt')
                                                    setTimeout(() => setIsCopied(false), 2000)
                                                }}
                                            >
                                                {isCopied ? <Copy className="size-3.5 text-green-500" /> : <Copy className="size-3.5 text-muted-foreground" />}
                                            </Button>
                                        </div>
                                        <div className="text-sm leading-relaxed bg-muted/40 p-3.5 rounded-lg break-words whitespace-pre-wrap border border-foreground/5">
                                            {template.prompt}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Settings info */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Mức biến đổi</Label>
                                            <p className="text-xs font-medium mt-0.5">{strength[0]}%</p>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Chất lượng</Label>
                                            <p className="text-xs font-medium mt-0.5 capitalize">
                                                {quality === 'standard' ? 'Chuẩn' : quality === 'high' ? 'Cao' : 'Siêu nét'}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <Button className="w-full gap-2" onClick={() => handleDownload(selectedImage.url)}>
                                            <Download className="size-4" /> Tải xuống
                                        </Button>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" className="gap-1.5 text-xs" onClick={() => {
                                                navigator.clipboard.writeText(selectedImage.url)
                                                toast.success('Đã sao chép link')
                                            }}>
                                                <Share2 className="size-3.5" /> Chia sẻ
                                            </Button>
                                            <Button variant="outline" className="gap-1.5 text-xs" onClick={() => {
                                                setSelectedImage(null)
                                                handleGenerate()
                                            }}>
                                                <RotateCcw className="size-3.5" /> Tạo lại
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}
