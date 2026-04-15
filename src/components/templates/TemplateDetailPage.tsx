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
    LayoutTemplate,
    ArrowLeft
} from "lucide-react"

import { ImageLightbox } from "@/components/ui/image-lightbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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

// === Loading skeleton khi đang tạo ảnh — color-shifting blobs ===
function GenerateSkeleton({ progress, aspectRatio }: { progress: number, aspectRatio?: string }) {
    const [elapsed, setElapsed] = useState(0)
    useEffect(() => {
        const t = setInterval(() => setElapsed(s => s + 1), 1000)
        return () => clearInterval(t)
    }, [])

    return (
        <div 
            className={`relative w-full rounded-2xl overflow-hidden border border-border/20 shadow-xl flex flex-col items-center justify-center isolate bg-[#050505] ${!aspectRatio ? 'aspect-square' : ''}`}
            style={aspectRatio ? { aspectRatio: aspectRatio.replace(":", "/") } : undefined}
        >
            {/* Cinematic sweeps and moving grids */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                
                <div
                    className="absolute size-[250px] rounded-full blur-[80px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0.1) 100%)',
                        animation: 'loadingBlob1 8s ease-in-out infinite alternate',
                    }}
                />
                <div
                    className="absolute size-[200px] rounded-full blur-[80px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(99,102,241,0.1) 100%)',
                        animation: 'loadingBlob2 10s ease-in-out infinite alternate',
                    }}
                />
                
                {/* Sweep light */}
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-sweep" />
            </div>
            
            <style>{`
                @keyframes loadingBlob1 {
                    0% { transform: translate(-20%, -20%) scale(1); opacity: 0.5; }
                    50% { transform: translate(30%, 15%) scale(1.2); opacity: 0.8; }
                    100% { transform: translate(-5%, 40%) scale(0.9); opacity: 0.4; }
                }
                @keyframes loadingBlob2 {
                    0% { transform: translate(20%, 30%) scale(1); opacity: 0.4; }
                    50% { transform: translate(-30%, -10%) scale(1.3); opacity: 0.7; }
                    100% { transform: translate(15%, -20%) scale(0.85); opacity: 0.3; }
                }
                @keyframes sweep {
                    0% { top: 0%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>

            {/* Spinner */}
            <div className="relative size-12 z-10">
                <div className="absolute inset-0 rounded-full border-[1.5px] border-primary/15" />
                <div className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-primary/60 animate-spin" style={{ animationDuration: '1.8s' }} />
                <div className="absolute inset-1.5 rounded-full border border-primary/10" />
                <div className="absolute inset-1.5 rounded-full border border-transparent border-b-primary/40 animate-spin" style={{ animationDuration: '2.5s', animationDirection: 'reverse' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Wand2 className="size-3.5 text-primary animate-pulse" style={{ animationDuration: '2s' }} />
                </div>
            </div>

            <p className="text-[11px] text-muted-foreground/80 mt-3 z-10 tabular-nums">
                {elapsed > 0 && <>{elapsed}s · </>}{Math.round(progress)}%
            </p>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20 z-10">
                <div className="h-full bg-primary/50 transition-all duration-300 ease-out" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
        </div>
    )
}

// Helper: Dynamic Grid cho Canvas dựa trên số lượng ảnh và tỷ lệ
function getDynamicGridClass(count: number, aspectRatio?: string) {
    if (count === 1) {
        // Nhóm tỉ lệ dọc (Portrait)
        if (["9:16", "4:5", "2:3", "3:4"].includes(aspectRatio || "")) {
            return "grid grid-cols-1 w-full max-w-sm mx-auto gap-4" // ~384px
        }
        // Nhóm tỉ lệ vuông (Square)
        if (aspectRatio === "1:1") {
            return "grid grid-cols-1 w-full max-w-md mx-auto gap-4" // ~448px
        }
        // Mặc định dọc ngang (Landscape / Base)
        return "grid grid-cols-1 w-full max-w-2xl mx-auto gap-4" // ~672px
    }
    if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto gap-4"
    if (count === 3) return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto gap-4"
    return "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto gap-4"
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
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]) // Chỉ ảnh tạo trong session hiện tại
    const [historyImages, setHistoryImages] = useState<GeneratedImage[]>([]) // Lịch sử từ API
    const [historyLoading, setHistoryLoading] = useState(true)
    const [outputSize, setOutputSize] = useState("1:1")
    const [imageSize, setImageSize] = useState("1K")
    const [optionsOpen, setOptionsOpen] = useState(false)
    const [imageCount, setImageCount] = useState(1)
    const [hasError, setHasError] = useState(false)
    const [effectSelections, setEffectSelections] = useState<Record<string, string>>({})
    const [extraPrompt, setExtraPrompt] = useState("")
    const [viewerOpen, setViewerOpen] = useState(false)
    const [viewerSource, setViewerSource] = useState<"sample" | "generated" | "history">("sample")
    const [viewerIndex, setViewerIndex] = useState(0)

    // Tải lịch sử ảnh đã tạo từ template này — tách biệt khỏi canvas
    useEffect(() => {
        if (!slug) return
        setHistoryLoading(true)
        imageApi.list(1, 50, null, null, slug)
            .then((res) => {
                const history: GeneratedImage[] = res.data.map((img) => ({
                    id: img.id,
                    url: img.file_url,
                    timestamp: new Date(img.created_at ?? Date.now()).getTime(),
                    aspectRatio: img.aspect_ratio ?? "1:1",
                    effects: {},
                    prompt: img.prompt ?? "",
                    gems_cost: img.gems_cost,
                    reference_images: img.reference_images,
                }))
                setHistoryImages(history)
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
            
            // Lọc các khoảng trắng thừa và nối lại
            let finalPrompt = parts.filter(Boolean).join(". ").trim()

            // Fallback cực kỳ quan trọng: Backend Laravel ZDream5 mặc định yêu cầu trường 'prompt'.
            // Nếu mẫu này không có system_prompt và user để trống "mô tả thêm", API sẽ báo lỗi 422.
            // Do đó tự padding 1 câu lệnh hợp lý nêó rỗng để bypass validation.
            if (!finalPrompt) {
                finalPrompt = `Transform image using template: ${template.name}`
            }

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
            // Thêm vào history luôn để lần sau hiện
            setHistoryImages(prev => [...newImages, ...prev])
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
    const openHistoryViewer = (index: number) => {
        setViewerSource("history")
        setViewerIndex(index)
        setViewerOpen(true)
    }
    const currentViewerImages = viewerSource === "generated"
        ? generatedImages.map(img => img.url)
        : viewerSource === "history"
            ? historyImages.map(img => img.url)
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
                    <div className="flex justify-start">
                        <Link to="/app/tools/templates" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors py-1">
                            <ArrowLeft className="size-3" />
                            Đổi mẫu thiết kế khác
                        </Link>
                    </div>
                </div>
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

    // === Canvas content — redesigned to match other tools ===
    const CanvasContent = (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className={`space-y-6 ${generatedImages.length > 0 ? 'pb-20' : ''}`}>

                {/* State: Ảnh đã upload, chưa tạo — hiện ảnh preview + hint */}
                {uploadedImage && !isGenerating && generatedImages.length === 0 && (
                    <div className="flex flex-col justify-center min-h-[calc(100vh-180px)] gap-6 w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                        <ToolImageUpload images={[uploadedImage]} onImagesChange={(urls) => setUploadedImage(urls[0] || null)} className="border-0 bg-transparent shadow-none p-0 overflow-visible" />
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 py-3 rounded-lg w-full shrink-0 border border-border/20 shadow-sm">
                            <Sparkles className="size-4 animate-pulse text-primary" />
                            <span>Ảnh đã tải lên. Thiết lập thông số bên trái rồi nhấn <strong className="text-foreground">Tạo ảnh</strong>!</span>
                        </div>
                    </div>
                )}

                {/* State: Đang tạo ảnh — blob loading skeleton */}
                {isGenerating && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Wand2 className="size-4 text-primary animate-pulse" />
                            <span className="text-sm font-medium">Đang tạo {imageCount} ảnh...</span>
                        </div>
                        <div className={getDynamicGridClass(imageCount, outputSize)}>
                            {Array.from({ length: imageCount }).map((_, i) => (
                                <GenerateSkeleton key={`gen-skeleton-${i}`} progress={generateProgress} aspectRatio={outputSize} />
                            ))}
                        </div>
                    </div>
                )}

                {/* State: Có kết quả — result grid */}
                {generatedImages.length > 0 && (
                    <div className="space-y-3">
                        {/* Header + compact change image */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-primary" />
                                <span className="text-sm font-medium">Kết quả</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {uploadedImage && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <img src={uploadedImage} alt="" className="size-6 rounded object-cover border" />
                                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => setUploadedImage(null)}>Đổi ảnh</Button>
                                    </div>
                                )}
                                <Badge variant="outline" className="text-xs">{generatedImages.length} ảnh</Badge>
                            </div>
                        </div>
                        <div className={getDynamicGridClass(generatedImages.length, generatedImages[0]?.aspectRatio || outputSize)}>
                            {generatedImages.map((img, idx) => (
                                <div
                                    key={img.id}
                                    className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ring-1 ring-border/20 hover:ring-primary/50 bg-muted/20"
                                    onClick={() => openGeneratedViewer(idx)}
                                >
                                    <div className="relative w-full">
                                        <img
                                            src={img.url}
                                            alt={`Kết quả ${idx + 1}`}
                                            className="w-full h-auto max-h-[400px] object-contain transition-transform duration-500 group-hover:scale-105"
                                            draggable={false}
                                        />
                                        {/* Gradient overlay */}
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
            </div>
        </div>
    )

    // === History Panel cho sidebar ===
    const HistoryPanel = (
        <div className="space-y-3">
            {historyLoading ? (
                <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={`hist-sk-${i}`} className="aspect-square rounded-lg" />
                    ))}
                </div>
            ) : historyImages.length === 0 ? (
                <div className="py-8 text-center">
                    <Sparkles className="size-6 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Chưa có ảnh nào từ mẫu này</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {historyImages.map((img, idx) => (
                        <div
                            key={img.id}
                            className="group relative rounded-lg overflow-hidden cursor-pointer ring-1 ring-border/20 hover:ring-primary/50 transition-all"
                            onClick={() => openHistoryViewer(idx)}
                        >
                            <img
                                src={img.url}
                                alt={`Lịch sử ${idx + 1}`}
                                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-1 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] text-white/80 font-medium">
                                    {new Date(img.timestamp).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    // === Push controls lên Dynamic Panel (Col 2) ===
    useToolPanel({
        title: template?.name || "Template",
        icon: LayoutTemplate,
        controls: template ? ControlsBlock : null,
        submitButton: template ? GenerateButton : null,
        historyPanel: HistoryPanel,
    }, [template, uploadedImage, effectSelections, outputSize, imageCount, imageSize, optionsOpen, extraPrompt, isGenerating, hasError, generateProgress, historyImages, historyLoading])

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
                    !uploadedImage && generatedImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] w-full max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
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
    source: "sample" | "generated" | "history"
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
