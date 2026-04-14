import { useState, useRef, useCallback, useEffect } from "react"

import { useParams, Link } from "react-router-dom"
import { toast } from "sonner"
import {
    Download,
    Sparkles,
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
    Layers,
    Ruler,
    Clock,
    LayoutTemplate
} from "lucide-react"

import { ImageLightbox } from "@/components/ui/image-lightbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout"
import { ToolImageUpload } from "@/components/tools/shared/ToolImageUpload"

import { useToolPanel } from "@/components/tools/ToolPanelContext"

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
    reference_images?: string[] | null
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
    const [optionsOpen, setOptionsOpen] = useState(false)
    const [imageCount, setImageCount] = useState(1)
    const [hasError, setHasError] = useState(false)
    const [effectSelections, setEffectSelections] = useState<Record<string, string>>({})
    const [extraPrompt, setExtraPrompt] = useState("")
    const [viewerOpen, setViewerOpen] = useState(false)
    const [viewerSource, setViewerSource] = useState<"sample" | "generated">("sample")
    const [viewerIndex, setViewerIndex] = useState(0)

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
                    reference_images: img.reference_images,
                }))
                setGeneratedImages(historyImages)
            })
            .catch(() => {})
            .finally(() => setHistoryLoading(false))
    }, [slug])

    // Mặc định chọn option đầu tiên của mỗi effect group
    useEffect(() => {
        if (effectGroups.length === 0) return
        const defaults: Record<string, string> = {}
        for (const group of effectGroups) {
            if (group.options.length > 0) {
                defaults[group.name] = group.options[0].value
            }
        }
        setEffectSelections(defaults)
    }, [template])

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
                reference_images: img.reference_images,
            }))
            setGeneratedImages(prev => [...newImages, ...prev])
            toast.success(`Tạo ${newImages.length} ảnh thành công!`)
        } catch (err) {
            clearInterval(interval)
            setHasError(true)
            const msg = err instanceof Error ? err.message : ''
            if (msg.includes('429') || msg.includes('Too Many')) {
                toast.error('Bạn đang tạo quá nhanh. Vui lòng đợi 1 phút.')
            } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
                toast.warning('Mất kết nối. Ảnh có thể vẫn đang tạo — kiểm tra Thư viện sau.', { duration: 8000 })
            } else {
                toast.error(msg || "Không thể tạo ảnh. Vui lòng thử lại.")
            }
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

            {/* Tương tác Controls cho ảnh đầu vào: CHỈ HIỂN THỊ khi ĐÃ CÓ ẢNH */}
            {uploadedImage && (
                <>
                    <div className="space-y-2">
                        <ToolImageUpload 
                            images={[uploadedImage]} 
                            onImagesChange={(urls) => setUploadedImage(urls[0] || null)} 
                            label="Ảnh đầu vào gốc"
                        />
                    </div>
                    <Separator />
                </>
            )}

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
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="space-y-6 pb-20">
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
                            <Sparkles className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-semibold mb-1">Thiết kế mẫu siêu tốc</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Kéo ảnh vào giao diện này, sau đó nhấn <strong>Tạo ảnh</strong> để sáng tạo bức ảnh độc nhất theo filter có sẵn.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )

    // === Push controls lên Dynamic Panel (Col 2) ===
    useToolPanel({
        title: template?.name || "Template",
        icon: LayoutTemplate,
        controls: template ? (
            <div className={`transition-all duration-300 ${!uploadedImage ? "opacity-40 grayscale-[0.5] pointer-events-none select-none" : ""}`}>
                {ControlsBlock}
            </div>
        ) : null,
        submitButton: template ? GenerateButton : null,
    }, [template, uploadedImage, effectSelections, outputSize, imageCount, imageSize, optionsOpen, extraPrompt, isGenerating, hasError, generateProgress])

    // Loading / not found guard
    if (templateLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] bg-background">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
                <p className="text-sm text-muted-foreground animate-pulse">Đang tải cấu hình mẫu...</p>
            </div>
        )
    }
    if (!template) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 bg-background">
                <LayoutTemplate className="size-10 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">Không tìm thấy mẫu thiết kế</p>
                <Link to="/app/tools" className="text-sm text-primary underline hover:text-primary/80 transition-colors">← Quay lại công cụ AI</Link>
            </div>
        )
    }

    // ============================
    // UNIFIED DESKTOP / MOBILE LAYOUT via ToolWorkspaceLayout
    // ============================
    return (
        <>
            <ToolWorkspaceLayout
                canvas={
                    !uploadedImage ? (
                        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-semibold">Tạo ảnh với mẫu: <span className="text-primary">{template.name}</span></h3>
                                <p className="text-sm text-muted-foreground">Tải ảnh gốc của bạn lên để AI bắt đầu áp dụng hiệu ứng thiết kế.</p>
                            </div>
                            <ToolImageUpload 
                                images={[]} 
                                onImagesChange={(urls) => setUploadedImage(urls[0] || null)} 
                                variant="huge"
                                label="Tải ảnh gốc của bạn lên"
                                className="w-full"
                            />
                        </div>
                    ) : (
                        CanvasContent
                    )
                }
            />

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
            />
        </>
    )
}

// === Viewer Lightbox — dùng shared ImageLightbox component ===
function ViewerDialog({
    open, onOpenChange, images, index, setIndex, source, generatedImages, onDownload
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    images: string[]
    index: number
    setIndex: (i: number) => void
    source: "sample" | "generated"
    generatedImages: GeneratedImage[]
    onDownload: (url: string) => void
}) {
    const safeIndex = Math.min(index, images.length - 1)
    const currentImgUrl = images[safeIndex]
    const currentGenData = source === "generated" && safeIndex < generatedImages.length ? generatedImages[safeIndex] : null

    return (
        <ImageLightbox
            open={open}
            onClose={() => onOpenChange(false)}
            images={images}
            currentIndex={safeIndex}
            onIndexChange={setIndex}
            maxZoom={5}
            badge={
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm border ${source === 'generated' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-white/10 text-white/70 border-white/20'}`}>
                    {source === 'generated' ? <Wand2 className="size-3.5" /> : <Sparkles className="size-3.5" />}
                    {source === 'generated' ? 'AI' : 'Mẫu'}
                </div>
            }
            showInfoButton={!!currentGenData}
            actions={<>
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
            </>}
            infoPanel={currentGenData ? <>
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
                {source === "generated" && currentGenData?.reference_images && currentGenData.reference_images.length > 0 && (
                    <div className="px-5 py-3 space-y-2">
                        <div className="flex items-center gap-1.5">
                            <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Ảnh tham chiếu</p>
                            <span className="text-[9px] font-bold bg-white/10 text-white/60 px-1.5 py-0.5 rounded">{currentGenData.reference_images.length}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {currentGenData.reference_images.map((src, i) => (
                                <div key={i} className="aspect-square relative">
                                    <img src={src} className="absolute inset-0 w-full h-full rounded-lg object-cover border border-white/10" alt={`ref ${i + 1}`} />
                                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-white border border-white/20 text-[9px] font-bold h-4 w-4 rounded-full shadow-sm flex items-center justify-center z-10">
                                        {i + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </> : undefined}
        />
    )
}
