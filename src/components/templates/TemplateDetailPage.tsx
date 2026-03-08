import { useState, useRef, useCallback, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { toast } from "sonner"
import {
    ArrowLeft,
    Upload,
    Download,
    ImageIcon,
    Sparkles,
    X,
    ChevronLeft,
    ChevronRight,
    Wand2,
    RectangleHorizontal,
    RectangleVertical,
    Check,
    Square,
    Copy,
    AlertCircle,
    Settings2,
    ChevronDown,
    Ban,
    Pencil,
    ZoomIn,
    Maximize2,
    Layers
} from "lucide-react"
import Zoom from "react-medium-image-zoom"
import "react-medium-image-zoom/dist/styles.css"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useIsMobile } from "@/hooks/use-mobile"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"

// === Dữ liệu mẫu ===
const TEMPLATES: Record<string, {
    name: string
    category: string
    description: string
    prompt: string
    sampleImages: string[]
}> = {
    "1": {
        name: "Chân dung Cyberpunk",
        category: "Chân dung",
        description: "Biến đổi ảnh thành phong cách Cyberpunk với ánh neon rực rỡ",
        prompt: "cyberpunk portrait, neon lights, cinematic",
        sampleImages: [
            "https://images.unsplash.com/photo-1542442828-287217bfb21f?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop",
        ],
    },
    "2": {
        name: "Phong cảnh Ghibli",
        category: "Anime",
        description: "Chuyển đổi ảnh phong cảnh thành phong cách Studio Ghibli",
        prompt: "studio ghibli style landscape, watercolor",
        sampleImages: [
            "https://images.unsplash.com/photo-1498453488252-0974dcabe0cb?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1506744626753-1fa44dfbb7c4?q=80&w=600&auto=format&fit=crop",
        ],
    },
    "3": { name: "Render sản phẩm 3D", category: "3D", description: "Tạo ảnh render 3D siêu thực cho sản phẩm", prompt: "3D product render, studio lighting, white background", sampleImages: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop"] },
    "4": { name: "Logo Minimalist", category: "Logo", description: "Thiết kế lại logo theo phong cách tối giản", prompt: "minimalist logo, clean lines, vector", sampleImages: [] },
    "5": { name: "Sơn dầu cổ điển", category: "Phong cảnh", description: "Mang vẻ đẹp cổ điển Baroque cho ảnh", prompt: "baroque oil painting, classical, dramatic", sampleImages: [] },
    "6": { name: "Anime Waifu", category: "Anime", description: "Tạo nhân vật anime từ ảnh chân dung", prompt: "anime character, waifu, cute style", sampleImages: [] },
}

// Tỷ lệ khung hình
const SIZE_OPTIONS = [
    { value: "1:1", label: "1:1", icon: Square },
    { value: "16:9", label: "16:9", icon: RectangleHorizontal },
    { value: "9:16", label: "9:16", icon: RectangleVertical },
    { value: "4:3", label: "4:3", icon: RectangleHorizontal },
]

// Số lượng ảnh
const COUNT_OPTIONS = [1, 2, 3, 4]

// Bối cảnh — mỗi option có ảnh preview + prompt snippet
const CONTEXT_OPTIONS = [
    { value: "default", label: "Mặc định", prompt: "", image: "" },
    { value: "showcase", label: "Hộp Trưng Bày", prompt: "in a showcase display box", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop" },
    { value: "studio", label: "Studio", prompt: "professional studio lighting", image: "https://images.unsplash.com/photo-1604754742629-3e5728249d73?q=80&w=300&auto=format&fit=crop" },
    { value: "outdoor", label: "Ngoài trời", prompt: "natural outdoor setting", image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=300&auto=format&fit=crop" },
    { value: "abstract", label: "Trừu tượng", prompt: "abstract colorful background", image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=300&auto=format&fit=crop" },
    { value: "gradient", label: "Gradient", prompt: "smooth gradient background", image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=300&auto=format&fit=crop" },
]

// Chất liệu — mỗi option có ảnh preview + prompt snippet
const MATERIAL_OPTIONS = [
    { value: "default", label: "Mặc định", prompt: "", image: "" },
    { value: "flocked", label: "Chất liệu Nhung", prompt: "flocked velvet texture", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=300&auto=format&fit=crop" },
    { value: "translucent", label: "Nhựa Trong Suốt", prompt: "translucent plastic material", image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=300&auto=format&fit=crop" },
    { value: "metallic", label: "Kim loại", prompt: "metallic chrome finish", image: "https://images.unsplash.com/photo-1589254065878-42c6bf5e6878?q=80&w=300&auto=format&fit=crop" },
    { value: "wood", label: "Gỗ tự nhiên", prompt: "natural wood texture", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=300&auto=format&fit=crop" },
    { value: "glass", label: "Thuỷ tinh", prompt: "transparent glass material", image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=300&auto=format&fit=crop" },
]

interface GeneratedImage {
    id: string
    url: string
    timestamp: number
    aspectRatio: string
    context: string
    material: string
    prompt: string
}

// === Component hiển thị ảnh có skeleton loading ===
function ImageWithSkeleton({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const [loaded, setLoaded] = useState(false)
    return (
        <>
            {!loaded && <Skeleton className="absolute inset-0 w-full h-full" />}
            <img
                src={src}
                alt={alt}
                className={`${className ?? ""} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300 pointer-events-none`}
                onLoad={() => setLoaded(true)}
                draggable={false}
            />
        </>
    )
}

// === Hook kéo chuột để scroll ngang (drag-to-scroll desktop) ===
function useDragScroll() {
    const ref = useRef<HTMLDivElement>(null)
    const dragging = useRef(false)
    const startX = useRef(0)
    const scrollStart = useRef(0)

    const handlers = {
        onMouseDown: (e: React.MouseEvent) => {
            if (!ref.current) return
            dragging.current = true
            startX.current = e.pageX
            scrollStart.current = ref.current.scrollLeft
            ref.current.style.cursor = "grabbing"
        },
        onMouseUp: () => {
            if (!ref.current) return
            dragging.current = false
            ref.current.style.cursor = "grab"
        },
        onMouseLeave: () => {
            if (!ref.current) return
            dragging.current = false
            ref.current.style.cursor = "grab"
        },
        onMouseMove: (e: React.MouseEvent) => {
            if (!dragging.current || !ref.current) return
            e.preventDefault()
            ref.current.scrollLeft = scrollStart.current - (e.pageX - startX.current)
        },
    }

    return { ref, ...handlers }
}

export function TemplateDetailPage() {
    const { id } = useParams<{ id: string }>()
    const template = TEMPLATES[id || "1"] || TEMPLATES["1"]
    const isMobile = useIsMobile()

    // === State ===
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generateProgress, setGenerateProgress] = useState(0)
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
    const [outputSize, setOutputSize] = useState("1:1")
    const [imageCount, setImageCount] = useState(1)
    const [isDragging, setIsDragging] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [optionsOpen, setOptionsOpen] = useState(false)
    const [context, setContext] = useState("default")
    const [material, setMaterial] = useState("default")
    const [extraPrompt, setExtraPrompt] = useState("")

    // Viewer state — tách biệt source (sample vs generated)
    const [viewerOpen, setViewerOpen] = useState(false)
    const [viewerSource, setViewerSource] = useState<"sample" | "generated">("sample")
    const [viewerIndex, setViewerIndex] = useState(0)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const contextScroll = useDragScroll()
    const materialScroll = useDragScroll()

    // === Handlers ===
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setUploadedImage(reader.result as string)
                toast.success("Ảnh đã sẵn sàng")
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
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = () => {
                setUploadedImage(reader.result as string)
                toast.success("Ảnh đã sẵn sàng")
            }
            reader.readAsDataURL(file)
        }
    }, [])

    const handleGenerate = useCallback(() => {
        if (!uploadedImage || isGenerating) return
        setIsGenerating(true)
        setGenerateProgress(0)
        setHasError(false)

        const interval = setInterval(() => {
            setGenerateProgress(prev => {
                if (prev >= 95) { clearInterval(interval); return 95 }
                return prev + Math.random() * 8
            })
        }, 150)

        // Mô phỏng — ngẫu nhiên thành công/thất bại để test error state
        const willFail = Math.random() < 0.1 // 10% lỗi giả lập
        setTimeout(() => {
            clearInterval(interval)
            if (willFail) {
                setIsGenerating(false)
                setGenerateProgress(0)
                setHasError(true)
                toast.error("Không thể tạo ảnh. Vui lòng thử lại.")
                return
            }
            setGenerateProgress(100)
                const newImages: GeneratedImage[] = Array.from({ length: imageCount }).map((_, i) => ({
                    id: Math.random().toString(),
                    url: template.sampleImages[i % template.sampleImages.length],
                    timestamp: Date.now(),
                    aspectRatio: outputSize,
                    context: CONTEXT_OPTIONS.find(o => o.value === context)?.label || "Mặc định",
                    material: MATERIAL_OPTIONS.find(o => o.value === material)?.label || "Mặc định",
                    prompt: extraPrompt
                }))
            setGeneratedImages(prev => [...newImages, ...prev])
            setIsGenerating(false)
            setGenerateProgress(0)
            toast.success("Tạo ảnh thành công!")
        }, 3000)
    }, [uploadedImage, isGenerating, outputSize, imageCount, context, material, extraPrompt, template.sampleImages])

    const handleDownload = useCallback((url: string) => {
        const a = document.createElement("a")
        a.href = url
        a.download = `zdream-${template.name.replace(/\s+/g, "-")}-${Date.now()}.png`
        a.click()
        toast.success("Đang tải xuống")
    }, [template.name])

    // Viewer helpers — tách biệt sample vs generated
    const openSampleViewer = (index: number) => {
        setViewerSource("sample")
        setViewerIndex(index)
        setViewerOpen(true)
    }
    const openGeneratedViewer = (index: number) => {
        setViewerSource("generated")
        setViewerIndex(index)
        setViewerOpen(true)
    }
    const currentViewerImages = viewerSource === "generated"
        ? generatedImages.map(img => img.url)
        : template.sampleImages

    // === Shared Controls Block (dùng cho cả desktop sidebar và mobile) ===
    const ControlsBlock = (
        <div className="space-y-4">
            {/* Ảnh mẫu — chỉ hiện 1 ảnh đại diện */}
            {template.sampleImages.length > 0 && (
                <div className="space-y-2">
                    <Card className="relative overflow-hidden cursor-pointer group rounded-xl border-accent/50 bg-muted/20 shadow-sm" onClick={() => openSampleViewer(0)}>
                        <div className="relative aspect-[4/3] w-full">
                            <ImageWithSkeleton src={template.sampleImages[0]} alt="Ảnh mẫu" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            
                            {/* Gradient Overlay for contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

                            {/* Top Badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
                                <Sparkles className="size-3 text-primary" />
                                <span className="text-[10px] font-medium text-white shadow-sm">Ảnh mẫu ({template.name})</span>
                            </div>

                            {/* Hover Zoom Icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 pointer-events-none">
                                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 text-white shadow-xl">
                                    <ZoomIn className="size-4" />
                                    <span className="text-xs font-medium">Bấm để phóng to</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Upload ảnh */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Ảnh đầu vào</Label>
                {!uploadedImage ? (
                    <Card
                        id="upload-dropzone"
                        className={`cursor-pointer border-dashed transition-colors ${isDragging ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <CardContent className="flex flex-col items-center justify-center py-6 gap-1.5">
                            <Upload className="size-7 text-muted-foreground" />
                            <p className="text-sm font-medium">Kéo thả hoặc nhấp để tải ảnh</p>
                            <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP · Tối đa 10MB</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden relative flex flex-col items-center justify-center py-6 h-[106px]">
                        <img src={uploadedImage} alt="Ảnh đầu vào" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                            <Button size="icon" variant="secondary" className="size-7 shadow-md" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="size-3" />
                            </Button>
                            <Button size="icon" variant="destructive" className="size-7 shadow-md" onClick={() => setUploadedImage(null)}>
                                <X className="size-3" />
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            <Separator />

            {/* Tỷ lệ khung hình */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">TỶ LỆ KHUNG HÌNH</Label>
                <div className="grid grid-cols-4 gap-2">
                    {SIZE_OPTIONS.map(opt => {
                        const Icon = opt.icon
                        const isActive = outputSize === opt.value
                        return (
                            <Button
                                key={opt.value}
                                id={`size-${opt.value.replace(":", "x")}`}
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                className="flex flex-col items-center gap-1 h-auto py-2"
                                onClick={() => setOutputSize(opt.value)}
                            >
                                <Icon className="size-4" />
                                <span className="text-[10px]">{opt.label}</span>
                            </Button>
                        )
                    })}
                </div>
            </div>

            {/* Số lượng ảnh */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">SỐ LƯỢNG ẢNH</Label>
                <div className="grid grid-cols-4 gap-2">
                    {COUNT_OPTIONS.map(n => (
                        <Button
                            key={n}
                            variant={imageCount === n ? "default" : "outline"}
                            size="sm"
                            onClick={() => setImageCount(n)}
                        >
                            {n}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Option thêm — collapsible */}
            <Collapsible open={optionsOpen} onOpenChange={setOptionsOpen}>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between gap-2 h-9 px-2">
                        <div className="flex items-center gap-2">
                            <Settings2 className="size-4 text-primary" />
                            <span className="text-sm font-medium">Hiệu ứng thêm</span>
                        </div>
                        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${optionsOpen ? "rotate-180" : ""}`} />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                    {/* Bối cảnh — image cards */}
                    <div className="space-y-2 overflow-hidden">
                        <Label className="text-xs font-medium text-muted-foreground">Bối cảnh</Label>
                        <div ref={contextScroll.ref} onMouseDown={contextScroll.onMouseDown} onMouseUp={contextScroll.onMouseUp} onMouseLeave={contextScroll.onMouseLeave} onMouseMove={contextScroll.onMouseMove} className="flex gap-2 overflow-x-auto pb-1 w-0 min-w-full clean-horizontal-scroll" style={{ cursor: 'grab' }}>
                            {CONTEXT_OPTIONS.map(opt => {
                                const isActive = context === opt.value
                                return (
                                    <div key={opt.value} className="flex flex-col items-center gap-1 cursor-pointer shrink-0 w-20 select-none" onClick={() => setContext(opt.value)}>
                                        <div className={`relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-all ${
                                            isActive ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground/40"
                                        }`}>
                                            {opt.image ? (
                                                <ImageWithSkeleton src={opt.image} alt={opt.label} className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                                    <Ban className="size-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            {isActive && (
                                                <div className="absolute top-1 right-1 size-5 rounded-full bg-primary flex items-center justify-center">
                                                    <Check className="size-3 text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-h-[28px] flex items-start justify-center mt-0.5">
                                            <span className={`text-[10px] text-center leading-tight font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{opt.label}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Chất liệu — image cards */}
                    <div className="space-y-2 overflow-hidden">
                        <Label className="text-xs font-medium text-muted-foreground">Chất liệu</Label>
                        <div ref={materialScroll.ref} onMouseDown={materialScroll.onMouseDown} onMouseUp={materialScroll.onMouseUp} onMouseLeave={materialScroll.onMouseLeave} onMouseMove={materialScroll.onMouseMove} className="flex gap-2 overflow-x-auto pb-1 w-0 min-w-full clean-horizontal-scroll" style={{ cursor: 'grab' }}>
                            {MATERIAL_OPTIONS.map(opt => {
                                const isActive = material === opt.value
                                return (
                                    <div key={opt.value} className="flex flex-col items-center gap-1 cursor-pointer shrink-0 w-20 select-none" onClick={() => setMaterial(opt.value)}>
                                        <div className={`relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-all ${
                                            isActive ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground/40"
                                        }`}>
                                            {opt.image ? (
                                                <ImageWithSkeleton src={opt.image} alt={opt.label} className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                                    <Ban className="size-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            {isActive && (
                                                <div className="absolute top-1 right-1 size-5 rounded-full bg-primary flex items-center justify-center">
                                                    <Check className="size-3 text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-h-[28px] flex items-start justify-center mt-0.5">
                                            <span className={`text-[10px] text-center leading-tight font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{opt.label}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Mô tả thêm */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Pencil className="size-3" />
                            Mô tả thêm <span className="text-muted-foreground/60">(Tùy chọn)</span>
                        </Label>
                        <Textarea
                            placeholder="VD: tóc dài, đeo kính, áo trắng..."
                            className="resize-none text-sm min-h-[60px]"
                            value={extraPrompt}
                            onChange={(e) => setExtraPrompt(e.target.value)}
                        />
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )

    // === Generate Button Block ===
    const GenerateButton = (
        <div className="space-y-2">
            {/* Error state */}
            {hasError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>Tạo ảnh thất bại.</span>
                </div>
            )}

            {isGenerating ? (
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Đang tạo ảnh...</span>
                        <span>{Math.round(generateProgress)}%</span>
                    </div>
                    <Progress value={generateProgress} className="h-2" />
                </div>
            ) : (
                <Button
                    id="generate-button"
                    className="w-full gap-2"
                    size="lg"
                    disabled={!uploadedImage}
                    onClick={handleGenerate}
                >
                    <Wand2 className="size-4" />
                    {hasError ? "Thử lại" : "Tạo ảnh"}
                </Button>
            )}
        </div>
    )

    // === Canvas content — ảnh mẫu luôn hiện, kết quả nằm trên ảnh mẫu ===
    const CanvasContent = (
        <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
                {/* Kết quả đã tạo */}
                {generatedImages.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-primary" />
                                <span className="text-sm font-medium">Kết quả</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{generatedImages.length} ảnh</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                            {generatedImages.map((img, idx) => (
                                <Card
                                    key={img.id}
                                    className="group overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                    onClick={() => openGeneratedViewer(idx)}
                                >
                                    <div className="relative aspect-square">
                                        <ImageWithSkeleton
                                            src={img.url}
                                            alt={`Kết quả ${idx + 1}`}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                                            <Badge variant="secondary" className="text-[10px]">
                                                {new Date(img.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </Badge>
                                            <Button size="icon" variant="secondary" className="size-7" onClick={(e) => { e.stopPropagation(); handleDownload(img.url) }}>
                                                <Download className="size-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state — chỉ hiện khi chưa có kết quả */}
                {generatedImages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <ImageIcon className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-semibold mb-1">Chưa có ảnh nào</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Tải ảnh lên{isMobile ? " ở trên" : " bên trái"}, chọn kích thước rồi nhấn <strong>Tạo ảnh</strong> để bắt đầu.
                        </p>
                    </div>
                )}
            </div>
        </ScrollArea>
    )

    // ============================
    // MOBILE LAYOUT — luồng đơn, scroll tự nhiên
    // ============================
    if (isMobile) {
        return (
            <div className="flex flex-col min-h-0 h-full">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
                    <Button variant="ghost" size="icon" className="shrink-0" asChild>
                        <Link to="/app/templates"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-sm font-semibold truncate">{template.name}</h1>
                        <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">{template.category}</Badge>
                </div>

                {/* Scrollable content */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        {/* Controls */}
                        {ControlsBlock}

                        {/* Generate */}
                        {GenerateButton}

                        <Separator />

                        {/* Canvas */}
                        <div className="space-y-4">
                            {/* Kết quả đã tạo */}
                            {generatedImages.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="size-4 text-primary" />
                                            <span className="text-sm font-medium">Kết quả</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{generatedImages.length} ảnh</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {generatedImages.map((img, idx) => (
                                            <Card
                                                key={img.id}
                                                className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                                onClick={() => openGeneratedViewer(idx)}
                                            >
                                                <div className="relative aspect-square">
                                                    <ImageWithSkeleton src={img.url} alt={`Kết quả ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty state khi chưa có kết quả */}
                            {generatedImages.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-muted p-3 mb-3">
                                        <ImageIcon className="size-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Tải ảnh lên rồi nhấn <strong>Tạo ảnh</strong></p>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                {/* Viewer Dialog */}
                <ViewerDialog
                    open={viewerOpen}
                    onOpenChange={setViewerOpen}
                    images={currentViewerImages}
                    index={viewerIndex}
                    setIndex={setViewerIndex}
                    source={viewerSource}
                    generatedImages={generatedImages}
                    onDownload={handleDownload}
                    uploadedImage={uploadedImage}
                />
            </div>
        )
    }

    // ============================
    // DESKTOP LAYOUT — 2 panel cố định, không scroll toàn trang
    // ============================
    return (
        <div className="flex flex-col h-[100dvh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
                <Button variant="ghost" size="icon" className="shrink-0" asChild>
                    <Link to="/app/templates"><ArrowLeft className="size-4" /></Link>
                </Button>
                <div className="min-w-0 flex-1">
                    <h1 className="text-base font-semibold truncate">{template.name}</h1>
                    <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">{template.category}</Badge>
            </div>

            {/* 2-column layout */}
            <div className="flex flex-1 min-h-0">
                {/* LEFT: Controls */}
                <div className="w-[30%] shrink-0 border-r flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1">
                        <div className="p-4">
                            {ControlsBlock}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t shrink-0">
                        {GenerateButton}
                    </div>
                </div>

                {/* RIGHT: Canvas */}
                <div className="w-[70%] shrink-0 flex flex-col min-h-0">
                    {CanvasContent}
                </div>
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {/* Viewer Dialog */}
            <ViewerDialog
                open={viewerOpen}
                onOpenChange={setViewerOpen}
                images={currentViewerImages}
                index={viewerIndex}
                setIndex={setViewerIndex}
                source={viewerSource}
                generatedImages={generatedImages}
                onDownload={handleDownload}
                uploadedImage={uploadedImage}
            />
        </div>
    )
}

// === Viewer Dialog Component — tách riêng, logic rõ ràng ===
function ViewerDialog({
    open, onOpenChange, images, index, setIndex, source, generatedImages, onDownload, uploadedImage
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    images: string[]
    index: number
    setIndex: (i: number) => void
    source: "sample" | "generated"
    generatedImages: GeneratedImage[]
    onDownload: (url: string) => void
    uploadedImage: string | null
}) {
    const safeIndex = Math.min(index, images.length - 1)
    const currentImgUrl = images[safeIndex]
    
    // Default mock data if not generated
    const currentGenData = source === "generated" && safeIndex < generatedImages.length ? generatedImages[safeIndex] : null

    // Keyboard navigation: ArrowLeft/Right
    useEffect(() => {
        if (!open || images.length <= 1) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") setIndex((safeIndex - 1 + images.length) % images.length)
            if (e.key === "ArrowRight") setIndex((safeIndex + 1) % images.length)
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [open, safeIndex, images.length, setIndex])

    if (images.length === 0) return null

    // Use a fixed aspect ratio for the spacer if unknown
    const defaultAspectRatio = 1

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[100vw] sm:max-w-[95vw] lg:max-w-6xl w-full h-[100dvh] sm:h-[85vh] p-0 overflow-hidden gap-0 border-0 sm:border rounded-none sm:rounded-xl bg-background">
                <DialogTitle className="sr-only">Chi tiết hình ảnh</DialogTitle>
                
                <div className="flex flex-col lg:flex-row h-full overflow-hidden w-full">
                    {/* Left Panel: Image + Nav */}
                    <div className="h-[55vh] lg:h-auto flex-none lg:flex-1 flex items-center justify-center bg-muted/20 min-h-0 relative p-4 md:p-8 lg:p-12 group/viewer">
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-lg sm:opacity-0 sm:group-hover/viewer:opacity-100 transition-opacity hover:bg-background"
                                    onClick={() => setIndex((safeIndex - 1 + images.length) % images.length)}
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                                <button
                                    className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-lg sm:opacity-0 sm:group-hover/viewer:opacity-100 transition-opacity hover:bg-background"
                                    onClick={() => setIndex((safeIndex + 1) % images.length)}
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                            </>
                        )}

                        {/* Spacer box config */}
                        <div className="relative flex max-w-[100%] max-h-[100%] gap-4 mx-auto w-full justify-center">

                            {/* Result Image */}
                            <div className="relative flex min-w-0 max-h-full rounded-xl shadow-2xl border border-border/40 overflow-hidden bg-black/5 max-w-full flex-1 items-center justify-center">
                                {source === "generated" && uploadedImage && (
                                    <Badge variant="default" className="absolute top-4 left-4 shadow-md z-10 hidden sm:flex">Kết quả Generation</Badge>
                                )}
                                

                                
                                <img
                                    src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${defaultAspectRatio * 10000}" height="10000"></svg>`)}`}
                                    alt="spacer"
                                    className="w-auto h-auto max-w-[100%] max-h-[100%] lg:max-h-[70vh] object-contain invisible pointer-events-none"
                                />

                                <div className="absolute inset-0 w-full h-full group flex items-center justify-center">
                                    <Zoom zoomMargin={40} classDialog="custom-zoom-overlay">
                                        <img
                                            src={currentImgUrl}
                                            alt="Khung nhìn ảnh"
                                            className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
                                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                                        />
                                    </Zoom>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-md overflow-hidden shadow-inner hidden md:flex">
                                        <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" />
                                        <div className="bg-background/90 text-foreground backdrop-blur-md px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 shadow-xl ring-1 ring-border/50 translate-y-2 group-hover:translate-y-0 transition-all duration-300 relative z-10">
                                            <Maximize2 className="size-4" />
                                            Xem chuẩn gốc
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Keyboard hint */}
                        {images.length > 1 && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60 opacity-0 group-hover/viewer:opacity-100 transition-opacity hidden sm:block">
                                ← → để chuyển ảnh
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Data & Actions (GeneratePage strict style) */}
                    <div className="w-full lg:w-[320px] flex-1 lg:flex-none lg:h-full border-t lg:border-t-0 lg:border-l p-5 lg:pt-14 flex flex-col gap-5 bg-background overflow-y-auto custom-scrollbar min-h-0">
                        
                        <div className="space-y-4">
                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-semibold mb-2 block">Chi tiết ảnh</Label>
                            
                            {currentGenData ? (
                                <>
                                    <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                                        <div>
                                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium block mb-1">Tỷ lệ</Label>
                                            <p className="text-sm font-medium text-foreground">{currentGenData.aspectRatio}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium block mb-1">Thời gian</Label>
                                            <p className="text-sm font-medium text-foreground">
                                                {new Date(currentGenData.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                        <div className="col-span-2 pt-1">
                                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium block mb-2">Hiệu ứng áp dụng</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {currentGenData.context !== "Mặc định" && (
                                                    <Badge variant="secondary" className="bg-muted/40 hover:bg-muted text-foreground/90 font-medium px-3 py-1 border-border/40 transition-colors">
                                                        <Layers className="size-[14px] mr-1.5 opacity-60" />
                                                        Bối cảnh: {currentGenData.context}
                                                    </Badge>
                                                )}
                                                {currentGenData.material !== "Mặc định" && (
                                                    <Badge variant="secondary" className="bg-muted/40 hover:bg-muted text-foreground/90 font-medium px-3 py-1 border-border/40 transition-colors">
                                                        <Layers className="size-[14px] mr-1.5 opacity-60" />
                                                        Chất liệu: {currentGenData.material}
                                                    </Badge>
                                                )}
                                                {currentGenData.context === "Mặc định" && currentGenData.material === "Mặc định" && (
                                                    <div className="text-sm text-muted-foreground/60 italic w-full pl-1">Không sử dụng</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {currentGenData.prompt && (
                                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/40">
                                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium block">Mô tả thêm</Label>
                                            <div className="text-[13px] leading-relaxed bg-muted/20 p-3.5 rounded-xl max-h-[120px] overflow-y-auto custom-scrollbar break-words whitespace-pre-wrap border border-border/30 text-foreground/90 shadow-sm">
                                                {currentGenData.prompt}
                                            </div>
                                        </div>
                                    )}

                    {source === "generated" && uploadedImage && (
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/40">
                            <div className="flex items-center gap-2">
                                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium">Ảnh tham chiếu</Label>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <div className="relative group/ref shrink-0">
                                    <img
                                        src={uploadedImage}
                                        alt="Reference Input"
                                        className="h-14 w-14 rounded-xl object-cover border border-border/60 shadow-sm bg-muted/30 transition-transform duration-300 origin-top-left group-hover/ref:scale-[2.5] hover:z-50 relative z-10"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground leading-relaxed">
                                    Đây là ảnh mẫu tham khảo dành cho template này. Các thông số AI cụ thể sẽ hiển thị khi bạn bắt đầu tạo ảnh.
                                </div>
                            )}
                        </div>

                        {/* Actions (Strict GeneratePage style) */}
                        <div className="flex flex-col gap-2 mt-auto">
                            <Button size="sm" className="w-full border shadow-sm font-medium" onClick={() => onDownload(currentImgUrl)}>
                                <Download className="mr-2 size-4" /> Tải xuống
                            </Button>
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                className="w-full border shadow-sm font-medium bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground"
                                onClick={() => {
                                    navigator.clipboard.writeText(currentImgUrl)
                                    toast.success("Đã sao chép liên kết vào bộ nhớ tạm")
                                }}
                            >
                                <Copy className="mr-2 size-3.5" /> Sao chép liên kết
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
