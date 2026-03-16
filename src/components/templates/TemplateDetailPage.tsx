import { useState, useRef, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
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
    ZoomOut,
    Maximize2,
    Info,
    Layers,
    Ruler,
    Clock
} from "lucide-react"

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

import { templateApi, imageApi, type TemplateData, type EffectGroup } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

// Tỷ lệ khung hình — đầy đủ 10 tỉ lệ theo OpenRouter API
const SIZE_OPTIONS = [
    { value: "1:1", label: "1:1", icon: Square },
    { value: "2:3", label: "2:3", icon: RectangleVertical },
    { value: "3:2", label: "3:2", icon: RectangleHorizontal },
    { value: "3:4", label: "3:4", icon: RectangleVertical },
    { value: "4:3", label: "4:3", icon: RectangleHorizontal },
    { value: "4:5", label: "4:5", icon: RectangleVertical },
    { value: "5:4", label: "5:4", icon: RectangleHorizontal },
    { value: "9:16", label: "9:16", icon: RectangleVertical },
    { value: "16:9", label: "16:9", icon: RectangleHorizontal },
    { value: "21:9", label: "21:9", icon: RectangleHorizontal },
]

// Số lượng ảnh
const COUNT_OPTIONS = [1, 2, 3, 4]

// Độ phân giải — theo OpenRouter image_config.image_size
const RESOLUTION_OPTIONS = [
    { value: "1K", label: "1K", desc: "Chuẩn" },
    { value: "2K", label: "2K", desc: "Nét hơn" },
    { value: "4K", label: "4K", desc: "Siêu nét" },
]

// Hook cho drag-to-scroll ngang (giống app chỉnh ảnh)
function useDragScroll() {
    const ref = useRef<HTMLDivElement>(null)
    const state = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false })

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const onDown = (e: MouseEvent) => {
            state.current = { isDown: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false }
            el.style.cursor = 'grabbing'
        }
        const onLeave = () => { state.current.isDown = false; el.style.cursor = 'grab' }
        const onUp = () => { state.current.isDown = false; el.style.cursor = 'grab' }
        const onMove = (e: MouseEvent) => {
            if (!state.current.isDown) return
            e.preventDefault()
            const x = e.pageX - el.offsetLeft
            const walk = (x - state.current.startX) * 1.5
            if (Math.abs(walk) > 3) state.current.moved = true
            el.scrollLeft = state.current.scrollLeft - walk
        }

        el.addEventListener('mousedown', onDown)
        el.addEventListener('mouseleave', onLeave)
        el.addEventListener('mouseup', onUp)
        el.addEventListener('mousemove', onMove)
        return () => {
            el.removeEventListener('mousedown', onDown)
            el.removeEventListener('mouseleave', onLeave)
            el.removeEventListener('mouseup', onUp)
            el.removeEventListener('mousemove', onMove)
        }
    }, [])

    return { ref, wasDragged: () => state.current.moved }
}

// Wrapper component cho mỗi effect group row
function DragScrollRow({ children, className }: { children: React.ReactNode; className?: string }) {
    const { ref, wasDragged } = useDragScroll()
    return (
        <div
            ref={ref}
            className={className}
            onClickCapture={(e) => { if (wasDragged()) e.stopPropagation() }}
        >
            {children}
        </div>
    )
}

interface GeneratedImage {
    id: string | number
    url: string
    timestamp: number
    aspectRatio: string
    effects: Record<string, string>
    prompt: string
    gems_cost?: number
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

// === Skeleton placeholder khi đang tạo ảnh ===
function GenerateSkeleton({ progress }: { progress: number }) {
    return (
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted/20 border border-border/40 flex flex-col items-center justify-center isolate">
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

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted/30">
                <div
                    className="h-full bg-primary/60 transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
        </div>
    )
}

export function TemplateDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const isMobile = useIsMobile()
    const { updateGems } = useAuth()
    const [template, setTemplate] = useState<TemplateData | null>(null)
    const [templateLoading, setTemplateLoading] = useState(true)

    useEffect(() => {
        if (!slug) return
        setTemplateLoading(true)
        templateApi.get(slug)
            .then((data) => setTemplate(data))
            .catch(() => toast.error("Không tìm thấy template"))
            .finally(() => setTemplateLoading(false))
    }, [slug])

    // Derived options from template
    const effectGroups: EffectGroup[] = template?.effect_groups ?? []
    const sampleImages: string[] = template?.thumbnail ? [template.thumbnail] : []

    // === State ===
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generateProgress, setGenerateProgress] = useState(0)
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
    const [historyLoading, setHistoryLoading] = useState(true)
    const [outputSize, setOutputSize] = useState("1:1")
    const [imageSize, setImageSize] = useState("1K")
    const [imageCount, setImageCount] = useState(1)
    const [isDragging, setIsDragging] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [optionsOpen, setOptionsOpen] = useState(false)

    // Tải lịch sử ảnh đã tạo từ template này
    useEffect(() => {
        if (!slug) return
        setHistoryLoading(true)
        imageApi.list(1, 50, null, null, slug)
            .then((res) => {
                const historyImages: GeneratedImage[] = res.data.map((img) => ({
                    id: img.id,
                    url: img.file_url,
                    timestamp: new Date(img.created_at ?? Date.now()).getTime(),
                    aspectRatio: img.aspect_ratio ?? "1:1",
                    effects: {},
                    prompt: img.prompt ?? "",
                    gems_cost: img.gems_cost,
                }))
                setGeneratedImages(historyImages)
            })
            .catch(() => { /* Không cần hiển thị lỗi nếu không load được lịch sử */ })
            .finally(() => setHistoryLoading(false))
    }, [slug])
    const [effectSelections, setEffectSelections] = useState<Record<string, string>>({})
    const [extraPrompt, setExtraPrompt] = useState("")

    // Viewer state — tách biệt source (sample vs generated)
    const [viewerOpen, setViewerOpen] = useState(false)
    const [viewerSource, setViewerSource] = useState<"sample" | "generated">("sample")
    const [viewerIndex, setViewerIndex] = useState(0)

    const fileInputRef = useRef<HTMLInputElement>(null)

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

    const handleGenerate = useCallback(async () => {
        if (!uploadedImage || isGenerating || !template) return
        setIsGenerating(true)
        setGenerateProgress(0)
        setHasError(false)

        // Progress bar giả lập trong khi chờ API
        const interval = setInterval(() => {
            setGenerateProgress(prev => {
                if (prev >= 90) { clearInterval(interval); return 90 }
                return prev + Math.random() * 6
            })
        }, 200)

        try {
            // Ghép prompt từ system_prompt + hiệu ứng đã chọn + mô tả thêm
            const parts: string[] = []
            if (template.system_prompt) parts.push(template.system_prompt)

            // Thêm prompt từ các effect option đã chọn
            for (const group of effectGroups) {
                const selectedValue = effectSelections[group.name]
                if (selectedValue) {
                    const opt = group.options.find(o => o.value === selectedValue)
                    if (opt?.prompt) parts.push(opt.prompt)
                }
            }

            if (extraPrompt.trim()) parts.push(extraPrompt.trim())
            const finalPrompt = parts.join(". ")

            // Gọi API tạo ảnh thật
            const response = await imageApi.generate({
                prompt: finalPrompt,
                model: template.model || undefined,
                aspect_ratio: outputSize,
                image_size: imageSize,
                count: imageCount,
                reference_images: [uploadedImage],
                template_slug: slug,
            })

            clearInterval(interval)
            setGenerateProgress(100)

            // Cập nhật gems
            updateGems(response.gems_remaining)

            // Thêm ảnh kết quả vào danh sách
            const newImages: GeneratedImage[] = response.images.map((img) => ({
                id: img.id,
                url: img.file_url,
                timestamp: Date.now(),
                aspectRatio: outputSize,
                effects: { ...effectSelections },
                prompt: finalPrompt,
                gems_cost: img.gems_cost,
            }))
            setGeneratedImages(prev => [...newImages, ...prev])
            toast.success(`Tạo ${newImages.length} ảnh thành công!`)
        } catch (err) {
            clearInterval(interval)
            setHasError(true)
            toast.error(err instanceof Error ? err.message : "Không thể tạo ảnh. Vui lòng thử lại.")
        } finally {
            setIsGenerating(false)
            setGenerateProgress(0)
        }
    }, [uploadedImage, isGenerating, template, outputSize, imageSize, imageCount, effectSelections, extraPrompt, effectGroups, updateGems, slug])

    const handleDownload = useCallback(async (url: string) => {
        try {
            // Fetch blob để tránh lỗi cross-origin download
            const res = await fetch(url)
            const blob = await res.blob()
            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = blobUrl
            a.download = `zdream-${(template?.name ?? "template").replace(/\s+/g, "-")}-${Date.now()}.png`
            a.click()
            URL.revokeObjectURL(blobUrl)
            toast.success("Đang tải xuống")
        } catch {
            // Fallback: mở tab mới
            window.open(url, "_blank")
        }
    }, [template?.name])

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
        : sampleImages

    // === Shared Controls Block (dùng cho cả desktop sidebar và mobile) ===
    const ControlsBlock = (
        <div className="space-y-4">
            {/* Ảnh mẫu — chỉ hiện 1 ảnh đại diện */}
            {sampleImages.length > 0 && (
                <div className="space-y-2">
                    <Card className="relative overflow-hidden cursor-pointer group rounded-xl border-accent/50 bg-muted/20 shadow-sm" onClick={() => openSampleViewer(0)}>
                        <div className="relative aspect-[4/3] w-full">
                            <ImageWithSkeleton src={sampleImages[0]} alt="Ảnh mẫu" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            
                            {/* Gradient Overlay for contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

                            {/* Top Badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
                                <Sparkles className="size-3 text-primary" />
                                <span className="text-[10px] font-medium text-white shadow-sm">Ảnh mẫu ({template?.name})</span>
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
                <div className="grid grid-cols-5 gap-1.5">
                    {SIZE_OPTIONS.map(opt => {
                        const Icon = opt.icon
                        const isActive = outputSize === opt.value
                        return (
                            <Button
                                key={opt.value}
                                id={`size-${opt.value.replace(":", "x")}`}
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-1"
                                onClick={() => setOutputSize(opt.value)}
                            >
                                <Icon className="size-3.5" />
                                <span className="text-[9px]">{opt.label}</span>
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

            {/* Độ phân giải */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">ĐỘ PHÂN GIẢI</Label>
                <div className="grid grid-cols-3 gap-2">
                    {RESOLUTION_OPTIONS.map(opt => (
                        <Button
                            key={opt.value}
                            variant={imageSize === opt.value ? "default" : "outline"}
                            size="sm"
                            className="flex flex-col items-center gap-0.5 h-auto py-2"
                            onClick={() => setImageSize(opt.value)}
                        >
                            <span className="text-xs font-semibold">{opt.label}</span>
                            <span className="text-[9px] opacity-60">{opt.desc}</span>
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
                    {/* Dynamic Effect Groups */}
                    {effectGroups.map((group, gi) => (
                        <div key={gi} className="space-y-2 overflow-hidden">
                            <Label className="text-xs font-medium text-muted-foreground">{group.name}</Label>
                            <DragScrollRow className="flex gap-2 overflow-x-auto pb-1 w-0 min-w-full clean-horizontal-scroll cursor-grab">
                                {group.options.map(opt => {
                                    const isActive = effectSelections[group.name] === opt.value
                                    return (
                                        <div key={opt.value} className="flex flex-col items-center gap-1 cursor-pointer shrink-0 w-20 select-none" onClick={() => setEffectSelections(prev => ({ ...prev, [group.name]: opt.value }))}>
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
                            </DragScrollRow>
                        </div>
                    ))}

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
                {/* Skeleton khi đang tạo ảnh */}
                {isGenerating && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Wand2 className="size-4 text-primary animate-pulse" />
                            <span className="text-sm font-medium">Đang tạo ảnh...</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                            {Array.from({ length: imageCount }).map((_, i) => (
                                <GenerateSkeleton key={`gen-skeleton-${i}`} progress={generateProgress} />
                            ))}
                        </div>
                    </div>
                )}

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
                                <div
                                    key={img.id}
                                    className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ring-1 ring-border/20 hover:ring-primary/50"
                                    onClick={() => openGeneratedViewer(idx)}
                                >
                                    <div className="relative aspect-square bg-muted/20">
                                        <ImageWithSkeleton
                                            src={img.url}
                                            alt={`Kết quả ${idx + 1}`}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {/* Gradient overlay — luôn nhẹ, đậm hơn khi hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                                        {/* Action bar */}
                                        <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-2.5 py-2 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                            <Badge variant="secondary" className="text-[10px] bg-black/40 backdrop-blur-sm text-white border-0 shadow-sm">
                                                {new Date(img.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </Badge>
                                            <Button size="icon" variant="ghost" className="size-7 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleDownload(img.url) }}>
                                                <Download className="size-3.5" />
                                            </Button>
                                        </div>
                                        {/* Zoom hint */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="size-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                                                <ZoomIn className="size-3.5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading lịch sử */}
                {historyLoading && generatedImages.length === 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={`hist-sk-${i}`} className="aspect-square rounded-xl" />
                        ))}
                    </div>
                )}

                {/* Empty state — chỉ hiện khi chưa có kết quả và không loading */}
                {!isGenerating && !historyLoading && generatedImages.length === 0 && (
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

    // Loading / not found guard
    if (templateLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
        )
    }
    if (!template) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <p className="text-muted-foreground">Không tìm thấy template</p>
                <Link to="/app/templates" className="text-sm text-primary underline">← Quay lại</Link>
            </div>
        )
    }

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
                        <h1 className="text-sm font-semibold truncate">{template?.name}</h1>
                        <p className="text-xs text-muted-foreground truncate">{template?.description}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">{template?.category}</Badge>
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
                            {/* Skeleton khi đang tạo ảnh */}
                            {isGenerating && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Wand2 className="size-4 text-primary animate-pulse" />
                                        <span className="text-sm font-medium">Đang tạo ảnh...</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Array.from({ length: imageCount }).map((_, i) => (
                                            <GenerateSkeleton key={`m-gen-sk-${i}`} progress={generateProgress} />
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                            <div
                                                key={img.id}
                                                className="relative rounded-xl overflow-hidden cursor-pointer shadow-sm active:scale-[0.97] transition-all duration-200 ring-1 ring-border/20"
                                                onClick={() => openGeneratedViewer(idx)}
                                            >
                                                <div className="relative aspect-square bg-muted/20">
                                                    <ImageWithSkeleton src={img.url} alt={`Kết quả ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                                                    {/* Gradient overlay luôn hiện */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                                    {/* Action bar luôn hiện trên mobile */}
                                                    <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-2.5 py-2">
                                                        <Badge variant="secondary" className="text-[10px] bg-black/40 backdrop-blur-sm text-white border-0 shadow-sm">
                                                            {new Date(img.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </Badge>
                                                        <Button size="icon" variant="ghost" className="size-8 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleDownload(img.url) }}>
                                                            <Download className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Loading lịch sử */}
                            {historyLoading && generatedImages.length === 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={`m-hist-sk-${i}`} className="aspect-square rounded-xl" />
                                    ))}
                                </div>
                            )}

                            {/* Empty state khi chưa có kết quả */}
                            {!isGenerating && !historyLoading && generatedImages.length === 0 && (
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
                    <h1 className="text-base font-semibold truncate">{template?.name}</h1>
                    <p className="text-xs text-muted-foreground truncate">{template?.description}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">{template?.category}</Badge>
            </div>

            {/* 2-column layout */}
            <div className="flex flex-1 min-h-0">
                {/* LEFT: Controls */}
                <div className="w-[380px] shrink-0 border-r flex flex-col overflow-hidden">
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
                <div className="flex-1 flex flex-col min-h-0">
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

// === Viewer Lightbox — Fullscreen portal, đồng bộ GeneratePage (zoom/pan đầy đủ) ===
const MAX_VIEWER_ZOOM = 5

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
    const [showInfo, setShowInfo] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const safeIndex = Math.min(index, images.length - 1)
    const currentImgUrl = images[safeIndex]
    const currentGenData = source === "generated" && safeIndex < generatedImages.length ? generatedImages[safeIndex] : null

    // Zoom/pan refs (giống GeneratePage — zero React re-render khi gesture)
    const transformRef = useRef({ x: 0, y: 0, zoom: 1 })
    const gestureActive = useRef(false)
    const mouseDragStart = useRef({ x: 0, y: 0 })
    const isMouseDragging = useRef(false)
    const dimsCache = useRef({ cw: 0, ch: 0, dw: 0, dh: 0 })
    const imageContainerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const dragStart = useRef({ x: 0, y: 0 })
    const lastTouchDistance = useRef<number | null>(null)
    const lastTouchCenter = useRef<{ x: number; y: number } | null>(null)
    const isTouchPanning = useRef(false)
    const touchStartPos = useRef<{ x: number; y: number } | null>(null)
    const lastTapTime = useRef(0)

    const updateDimsCache = () => {
        const container = imageContainerRef.current
        const img = imgRef.current
        if (!container || !img) return
        const cw = container.clientWidth, ch = container.clientHeight
        const nw = img.naturalWidth || cw, nh = img.naturalHeight || ch
        const r = nw / nh, cr = cw / ch
        dimsCache.current = {
            cw, ch,
            dw: r > cr ? cw : ch * r,
            dh: r > cr ? cw / r : ch,
        }
    }

    const clampPos = (x: number, y: number, z: number) => {
        const { cw, ch, dw, dh } = dimsCache.current
        if (cw === 0) return { x, y }
        const mx = Math.max(0, (dw * z - cw) / 2)
        const my = Math.max(0, (dh * z - ch) / 2)
        return { x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) }
    }

    const applyTransformDOM = () => {
        const img = imgRef.current
        if (!img) return
        const { x, y, zoom: z } = transformRef.current
        img.style.transitionDuration = '0ms'
        img.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${z})`
    }

    const syncToState = useCallback(() => {
        const { x, y, zoom: z } = transformRef.current
        setZoom(z)
        setPosition({ x, y })
        if (imgRef.current) imgRef.current.style.transitionDuration = '200ms'
    }, [])

    const resetZoom = useCallback(() => {
        transformRef.current = { x: 0, y: 0, zoom: 1 }
        applyTransformDOM()
        syncToState()
    }, [syncToState])

    const applyZoom = useCallback((newZ: number) => {
        const z = Math.min(Math.max(newZ, 1), MAX_VIEWER_ZOOM)
        const pos = z === 1 ? { x: 0, y: 0 } : clampPos(transformRef.current.x, transformRef.current.y, z)
        transformRef.current = { ...pos, zoom: z }
        applyTransformDOM()
        syncToState()
    }, [syncToState])

    const handleZoomIn = useCallback(() => applyZoom(transformRef.current.zoom + 0.5), [applyZoom])
    const handleZoomOut = useCallback(() => applyZoom(transformRef.current.zoom - 0.5), [applyZoom])

    // Reset zoom khi thay đổi ảnh
    useEffect(() => {
        transformRef.current = { x: 0, y: 0, zoom: 1 }
        applyTransformDOM()
        syncToState()
        const img = imgRef.current
        if (img) {
            const onLoad = () => updateDimsCache()
            img.addEventListener('load', onLoad)
            requestAnimationFrame(updateDimsCache)
            return () => img.removeEventListener('load', onLoad)
        }
    }, [safeIndex, syncToState])

    // Mouse drag pan (desktop)
    const handleMouseDownPan = (e: React.MouseEvent) => {
        if (transformRef.current.zoom <= 1) return
        e.preventDefault()
        isMouseDragging.current = true
        mouseDragStart.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y }
    }
    const handleMouseMovePan = (e: React.MouseEvent) => {
        if (!isMouseDragging.current) return
        e.preventDefault()
        const z = transformRef.current.zoom
        const p = clampPos(e.clientX - mouseDragStart.current.x, e.clientY - mouseDragStart.current.y, z)
        transformRef.current = { ...p, zoom: z }
        applyTransformDOM()
    }
    const handleMouseUpPan = () => {
        if (!isMouseDragging.current) return
        isMouseDragging.current = false
        syncToState()
    }
    const handleWheelZoom = (e: React.WheelEvent) => {
        if (e.deltaY < 0) handleZoomIn()
        else handleZoomOut()
    }

    const handleClose = useCallback(() => { onOpenChange(false); setShowInfo(false); resetZoom() }, [onOpenChange, resetZoom])
    const handlePrev = useCallback(() => { if (safeIndex > 0) setIndex(safeIndex - 1) }, [safeIndex, setIndex])
    const handleNext = useCallback(() => { if (safeIndex < images.length - 1) setIndex(safeIndex + 1) }, [safeIndex, images.length, setIndex])

    // Refs for touch swipe (tránh stale closures)
    const handleNextRef = useRef(handleNext)
    const handlePrevRef = useRef(handlePrev)
    useEffect(() => { handleNextRef.current = handleNext }, [handleNext])
    useEffect(() => { handlePrevRef.current = handlePrev }, [handlePrev])

    // Native touch listeners — zero React re-renders during gesture
    useEffect(() => {
        const el = imageContainerRef.current
        if (!el || !open) return
        updateDimsCache()

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault()
                gestureActive.current = true
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                lastTouchDistance.current = Math.hypot(dx, dy)
                lastTouchCenter.current = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                }
                isTouchPanning.current = false
                touchStartPos.current = null
            } else if (e.touches.length === 1) {
                const t = e.touches[0]
                touchStartPos.current = { x: t.clientX, y: t.clientY }
                if (transformRef.current.zoom > 1) {
                    gestureActive.current = true
                    isTouchPanning.current = true
                    dragStart.current = { x: t.clientX - transformRef.current.x, y: t.clientY - transformRef.current.y }
                }
                // Double-tap
                const now = Date.now()
                if (now - lastTapTime.current < 300) {
                    e.preventDefault()
                    if (transformRef.current.zoom > 1) resetZoom()
                    else applyZoom(2.5)
                    lastTapTime.current = 0
                    touchStartPos.current = null
                } else {
                    lastTapTime.current = now
                }
            }
        }

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && lastTouchDistance.current !== null) {
                e.preventDefault()
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                const distance = Math.hypot(dx, dy)
                const scale = distance / lastTouchDistance.current
                const newZ = Math.min(Math.max(transformRef.current.zoom * scale, 1), MAX_VIEWER_ZOOM)
                if (newZ === 1) {
                    transformRef.current = { x: 0, y: 0, zoom: 1 }
                } else if (lastTouchCenter.current) {
                    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
                    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
                    const np = clampPos(
                        transformRef.current.x + (cx - lastTouchCenter.current.x),
                        transformRef.current.y + (cy - lastTouchCenter.current.y),
                        newZ
                    )
                    transformRef.current = { ...np, zoom: newZ }
                    lastTouchCenter.current = { x: cx, y: cy }
                } else {
                    transformRef.current.zoom = newZ
                }
                applyTransformDOM()
                lastTouchDistance.current = distance
            } else if (e.touches.length === 1 && isTouchPanning.current && transformRef.current.zoom > 1) {
                e.preventDefault()
                const t = e.touches[0]
                const np = clampPos(t.clientX - dragStart.current.x, t.clientY - dragStart.current.y, transformRef.current.zoom)
                transformRef.current = { ...np, zoom: transformRef.current.zoom }
                applyTransformDOM()
            }
        }

        const onTouchEnd = (e: TouchEvent) => {
            // Swipe navigation (not zoomed)
            if (touchStartPos.current && transformRef.current.zoom <= 1 && e.changedTouches.length === 1) {
                const dx = e.changedTouches[0].clientX - touchStartPos.current.x
                const dy = e.changedTouches[0].clientY - touchStartPos.current.y
                if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                    if (dx > 0) handlePrevRef.current()
                    else handleNextRef.current()
                }
            }
            lastTouchDistance.current = null
            lastTouchCenter.current = null
            isTouchPanning.current = false
            touchStartPos.current = null
            if (gestureActive.current) {
                gestureActive.current = false
                syncToState()
            }
        }

        el.addEventListener('touchstart', onTouchStart, { passive: false })
        el.addEventListener('touchmove', onTouchMove, { passive: false })
        el.addEventListener('touchend', onTouchEnd)
        return () => {
            el.removeEventListener('touchstart', onTouchStart)
            el.removeEventListener('touchmove', onTouchMove)
            el.removeEventListener('touchend', onTouchEnd)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, safeIndex, syncToState, resetZoom, applyZoom])

    // Keyboard: ← → ESC
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { handleClose(); return }
            if (e.key === 'ArrowLeft') handlePrev()
            if (e.key === 'ArrowRight') handleNext()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, handleClose, handlePrev, handleNext])

    // Lock body scroll khi mở
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
            return () => { document.body.style.overflow = '' }
        }
    }, [open])

    if (!open || images.length === 0) return null

    return createPortal(
        <div className="fixed inset-0 z-50 bg-black/95 text-slate-200" style={{ touchAction: 'none' }}>
            <div className="relative w-full h-[100dvh] flex overflow-hidden">
                {/* === Phần chính: ảnh + controls === */}
                <div className={`relative flex-1 flex items-center justify-center transition-all duration-300 ${showInfo ? 'lg:mr-[360px]' : ''}`}>
                    {/* Top bar */}
                    <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-3 sm:p-4 pointer-events-none">
                        {/* Trái: counter + badge */}
                        <div className="flex items-center gap-2.5 pointer-events-auto">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm border ${source === 'generated' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-white/10 text-white/70 border-white/20'}`}>
                                {source === 'generated' ? <Wand2 className="size-3.5" /> : <Sparkles className="size-3.5" />}
                                {source === 'generated' ? 'AI' : 'Mẫu'}
                            </div>
                            {images.length > 1 && (
                                <span className="text-xs text-white/50 font-medium tabular-nums">
                                    {safeIndex + 1} / {images.length}
                                </span>
                            )}
                        </div>

                        {/* Phải: info toggle + close */}
                        <div className="flex items-center gap-1.5 pointer-events-auto">
                            {currentGenData && (
                                <Button
                                    variant="ghost"
                                    className={`rounded-full h-9 px-3.5 shadow-lg transition-colors gap-1.5 text-xs font-medium ${showInfo ? 'border border-white bg-white text-black hover:bg-neutral-200 hover:text-black' : 'bg-black/60 text-white hover:bg-black/80'}`}
                                    onClick={() => setShowInfo(!showInfo)}
                                >
                                    <Info className="size-3.5" />
                                    <span className="hidden sm:inline">Chi tiết</span>
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full bg-white text-black hover:bg-neutral-200 hover:text-black border-none shadow-lg h-9 w-9"
                                onClick={handleClose}
                            >
                                <X className="size-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Bottom action bar — zoom controls + actions, giống GeneratePage */}
                    <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto">
                        {/* Group: Zoom Controls */}
                        <div className="flex items-center gap-0.5 sm:gap-1 border-r border-white/10 pr-1.5 sm:pr-2 mr-0.5 sm:mr-1">
                            <Button variant="ghost" size="icon" title="Thu nhỏ" className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 py-0 rounded-xl" onClick={handleZoomOut} disabled={zoom <= 1}>
                                <ZoomOut className="size-4" />
                            </Button>
                            <span className="text-[11px] sm:text-xs font-medium w-9 sm:w-10 text-center text-white/80 select-none tabular-nums">
                                {Math.round(zoom * 100)}%
                            </span>
                            <Button variant="ghost" size="icon" title="Phóng to" className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 py-0 rounded-xl" onClick={handleZoomIn} disabled={zoom >= MAX_VIEWER_ZOOM}>
                                <ZoomIn className="size-4" />
                            </Button>
                            {zoom > 1 && (
                                <Button variant="ghost" size="icon" title="Đặt lại" className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 py-0 rounded-xl" onClick={resetZoom}>
                                    <Maximize2 className="size-4" />
                                </Button>
                            )}
                        </div>

                        {/* Group: Actions */}
                        <Button variant="ghost" size="icon" title="Tải xuống" className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 py-0 rounded-xl" onClick={() => onDownload(currentImgUrl)}>
                            <Download className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            title="Sao chép liên kết"
                            className="text-white hover:bg-white/20 gap-1.5 h-8 sm:h-9 rounded-xl px-2 sm:px-3"
                            onClick={() => {
                                navigator.clipboard.writeText(currentImgUrl)
                                toast.success('Đã sao chép liên kết')
                            }}
                        >
                            <Copy className="size-4" />
                            <span className="hidden sm:inline text-xs font-medium">Sao chép</span>
                        </Button>
                    </div>

                    {/* Nút Previous */}
                    <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
                        <Button
                            variant="outline"
                            size="icon"
                            className={`size-9 sm:size-12 rounded-full bg-white/80 sm:bg-white text-black hover:bg-neutral-200 hover:text-black border-none shadow-lg transition-opacity pointer-events-auto ${safeIndex === 0 ? 'opacity-0 !pointer-events-none' : 'opacity-100'}`}
                            onClick={(e) => { e.stopPropagation(); handlePrev() }}
                        >
                            <ChevronLeft className="size-5 sm:size-8" />
                        </Button>
                    </div>

                    {/* Nút Next */}
                    <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
                        <Button
                            variant="outline"
                            size="icon"
                            className={`size-9 sm:size-12 rounded-full bg-white/80 sm:bg-white text-black hover:bg-neutral-200 hover:text-black border-none shadow-lg transition-opacity pointer-events-auto ${safeIndex === images.length - 1 ? 'opacity-0 !pointer-events-none' : 'opacity-100'}`}
                            onClick={(e) => { e.stopPropagation(); handleNext() }}
                        >
                            <ChevronRight className="size-5 sm:size-8" />
                        </Button>
                    </div>

                    {/* Container Hình Ảnh (Pan & Zoom Wrapper) — giống GeneratePage */}
                    <div
                        ref={imageContainerRef}
                        className={`w-full h-full p-0 flex items-center justify-center relative overflow-hidden select-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                        style={{ touchAction: 'none' }}
                        onWheel={handleWheelZoom}
                        onMouseDown={handleMouseDownPan}
                        onMouseMove={handleMouseMovePan}
                        onMouseUp={handleMouseUpPan}
                        onMouseLeave={handleMouseUpPan}
                        onDoubleClick={zoom > 1 ? resetZoom : handleZoomIn}
                    >
                        <img
                            ref={imgRef}
                            src={currentImgUrl}
                            alt="Xem ảnh"
                            className="max-w-[90vw] max-h-[80dvh] object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] will-change-transform"
                            style={{
                                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                                transitionProperty: 'transform',
                                transitionTimingFunction: 'ease-out',
                                transitionDuration: '0ms',
                            }}
                            draggable={false}
                        />
                    </div>
                </div>

                {/* === Info Panel — sidebar desktop, bottom sheet mobile === */}
                {showInfo && currentGenData && (
                    <div className="fixed lg:absolute inset-x-0 bottom-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[360px] z-[60] bg-neutral-900/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10 overflow-y-auto animate-in slide-in-from-bottom lg:slide-in-from-right duration-300 max-h-[70vh] lg:max-h-none rounded-t-2xl lg:rounded-t-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-neutral-900/80 backdrop-blur-md border-b border-white/5">
                            <h3 className="text-sm font-semibold text-white">Chi tiết ảnh</h3>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-white/60 hover:text-white hover:bg-white/10" onClick={() => setShowInfo(false)}>
                                <X className="size-4" />
                            </Button>
                        </div>

                        {/* Metadata */}
                        <div className="px-5 py-3 border-b border-white/5">
                            <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-3">Thông số</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Ruler className="size-3" />
                                        <span className="text-[11px]">Tỷ lệ</span>
                                    </div>
                                    <p className="text-xs text-white/80 font-medium">{currentGenData.aspectRatio}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Clock className="size-3" />
                                        <span className="text-[11px]">Thời gian</span>
                                    </div>
                                    <p className="text-xs text-white/80 font-medium">
                                        {new Date(currentGenData.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hiệu ứng */}
                        {currentGenData.effects && Object.keys(currentGenData.effects).length > 0 && (
                            <div className="px-5 py-3 border-b border-white/5 space-y-2">
                                <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Hiệu ứng</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(currentGenData.effects).map(([groupName, value]) => (
                                        <Badge key={groupName} variant="secondary" className="bg-white/10 text-white/80 border-white/10 font-medium">
                                            <Layers className="size-3 mr-1.5 opacity-60" />
                                            {groupName}: {value}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mô tả thêm */}
                        {currentGenData.prompt && (
                            <div className="px-5 py-3 border-b border-white/5 space-y-2">
                                <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Mô tả thêm</p>
                                <p className="text-sm text-white/85 leading-relaxed">{currentGenData.prompt}</p>
                            </div>
                        )}

                        {/* Ảnh tham chiếu */}
                        {source === "generated" && uploadedImage && (
                            <div className="px-5 py-3 space-y-2">
                                <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Ảnh tham chiếu</p>
                                <div className="flex gap-2 mt-1">
                                    <img
                                        src={uploadedImage}
                                        alt="Reference"
                                        className="h-14 w-14 rounded-lg object-cover border border-white/10 shadow-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
