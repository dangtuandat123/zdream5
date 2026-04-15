import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Download, Sparkles, ZoomIn, Smile, Wand2, Scan, Palette, Info, RotateCcw } from "lucide-react"
import { ToolWorkspaceLayout } from "./ToolWorkspaceLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { ZoomCompare } from "./shared/ZoomCompare"
import { useToolPanel } from "./ToolPanelContext"

import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"


/**
 * Pixel output cố định theo OpenRouter image_config.
 * Key = aspect_ratio, Values = [1K, 2K, 4K] pixel dimensions.
 */
const RESOLUTION_TABLE: Record<string, { w: number; h: number }[]> = {
    '1:1':  [{ w: 1024, h: 1024 }, { w: 2048, h: 2048 }, { w: 4096, h: 4096 }],
    '4:5':  [{ w: 896, h: 1152 },  { w: 1792, h: 2304 }, { w: 3584, h: 4608 }],
    '5:4':  [{ w: 1152, h: 896 },  { w: 2304, h: 1792 }, { w: 4608, h: 3584 }],
    '3:4':  [{ w: 864, h: 1184 },  { w: 1728, h: 2368 }, { w: 3456, h: 4736 }],
    '4:3':  [{ w: 1184, h: 864 },  { w: 2368, h: 1728 }, { w: 4736, h: 3456 }],
    '2:3':  [{ w: 832, h: 1248 },  { w: 1664, h: 2496 }, { w: 3328, h: 4992 }],
    '3:2':  [{ w: 1248, h: 832 },  { w: 2496, h: 1664 }, { w: 4992, h: 3328 }],
    '9:16': [{ w: 768, h: 1344 },  { w: 1536, h: 2688 }, { w: 3072, h: 5376 }],
    '16:9': [{ w: 1344, h: 768 },  { w: 2688, h: 1536 }, { w: 5376, h: 3072 }],
}

const GEMS_COST: Record<string, number> = { '1x': 1, '2x': 2, '4x': 5 }

/**
 * Detect closest standard ratio from actual pixel dimensions.
 */
const detectRatio = (w: number, h: number): string => {
    const ratio = w / h
    const standards: [string, number][] = [
        ['1:1', 1], ['4:5', 0.8], ['5:4', 1.25], ['3:4', 0.75], ['4:3', 1.333],
        ['2:3', 0.667], ['3:2', 1.5], ['9:16', 0.5625], ['16:9', 1.778],
    ]
    let closest = '1:1'
    let minDiff = Infinity
    for (const [label, val] of standards) {
        const diff = Math.abs(ratio - val)
        if (diff < minDiff) { minDiff = diff; closest = label }
    }
    return closest
}

/**
 * Trả pixel output chính xác theo OpenRouter spec.
 * sizeIndex: 0=1K, 1=2K, 2=4K
 */
const getOutputDims = (w: number, h: number, sizeIndex: 0 | 1 | 2) => {
    const ratio = detectRatio(w, h)
    const entry = RESOLUTION_TABLE[ratio] ?? RESOLUTION_TABLE['1:1']
    return entry[sizeIndex]
}

// Cấu hình các AI enhancement toggles
const AI_TOGGLES = [
    {
        id: 'face_enhance' as const,
        icon: Smile,
        label: 'Khôi phục mặt',
        desc: 'Sửa mặt nhòe, biến dạng — tốt cho ảnh AI',
        tip: 'AI phân tích khuôn mặt, sửa mắt nhòe, khôi phục chi tiết da và biểu cảm.',
        color: 'text-blue-500 bg-blue-500/10',
    },
    {
        id: 'creative_detail' as const,
        icon: Wand2,
        label: 'Sáng tạo chi tiết',
        desc: 'Thêm sợi tóc, nét vải, da — AI tự phân tích',
        tip: 'AI vẽ thêm chi tiết siêu nhỏ: sợi tóc đơn, lỗ chân lông, texture vải.',
        color: 'text-purple-500 bg-purple-500/10',
    },
    {
        id: 'denoise' as const,
        icon: Scan,
        label: 'Khử nhiễu',
        desc: 'Xóa hạt sạn — ảnh cũ, ban đêm, thiếu sáng',
        tip: 'Giảm noise, hạt sạn rỗ, grain ảnh ISO cao, ảnh scan cũ.',
        color: 'text-amber-500 bg-amber-500/10',
    },
    {
        id: 'color_enhance' as const,
        icon: Palette,
        label: 'Tăng cường màu',
        desc: 'Vivid hơn, contrast tốt hơn, tự nhiên',
        tip: 'Tăng độ bão hoà, cải thiện contrast và cân bằng trắng — giữ tự nhiên.',
        color: 'text-emerald-500 bg-emerald-500/10',
    },
] as const

export function UpscalePage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("upscale")

    
    // Core parameters
    const [images, setImages] = useState<string[]>([])
    const [scaleFactor, setScaleFactor] = useState("2x")
    
    // AI Enhancements
    const [denoise, setDenoise] = useState(true)
    const [faceEnhance, setFaceEnhance] = useState(false)
    const [creativeDetail, setCreativeDetail] = useState(false)
    const [colorEnhance, setColorEnhance] = useState(false)
    
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [imageDims, setImageDims] = useState<{ w: number; h: number } | null>(null)

    useInputFromUrl(useCallback((url: string) => setImages([url]), []))

    useEffect(() => {
        if (!images[0]) { setImageDims(null); return }
        const img = new Image()
        img.onload = () => setImageDims({ w: img.naturalWidth, h: img.naturalHeight })
        img.src = images[0]
    }, [images])

    const sizeIndex = (scaleFactor === "4x" ? 2 : scaleFactor === "2x" ? 1 : 0) as 0 | 1 | 2
    const detectedRatio = imageDims ? detectRatio(imageDims.w, imageDims.h) : null
    const outputDims = imageDims ? getOutputDims(imageDims.w, imageDims.h, sizeIndex) : null

    // Toggle state getter/setter map
    const toggleStates: Record<string, boolean> = { face_enhance: faceEnhance, creative_detail: creativeDetail, denoise, color_enhance: colorEnhance }
    const toggleSetters: Record<string, (v: boolean) => void> = { face_enhance: setFaceEnhance, creative_detail: setCreativeDetail, denoise: setDenoise, color_enhance: setColorEnhance }

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.upscale({
                image: images[0],
                scale_factor: scaleFactor,
                denoise,
                face_enhance: faceEnhance,
                creative_detail: creativeDetail,
                color_enhance: colorEnhance,
            })
            setResult(res.image.file_url)
            refreshUser()
            refreshHistory()
            toast.success(res.message)
        } catch (e) {
            toast.error((e as Error).message)
        } finally {
            setLoading(false)
        }
    }

    useToolPanel({
        title: "Upscale siêu sáng tạo",
        icon: ZoomIn,
        controls: (
            <TooltipProvider delayDuration={300}>
                <div className={cn("space-y-5 animate-in fade-in transition-all duration-300", !images[0] ? "opacity-40 grayscale-[0.5] pointer-events-none select-none" : "")}>
                    
                    {/* Thông tin ảnh gốc */}
                    {imageDims && (
                        <Card className="p-3 bg-muted/30 border-border/60">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Info className="size-3.5 shrink-0" />
                                <span>Ảnh gốc: <span className="font-semibold text-foreground">{imageDims.w}×{imageDims.h}</span> px</span>
                                {detectedRatio && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono">{detectedRatio}</Badge>}
                            </div>
                        </Card>
                    )}

                    {/* Độ phân giải đầu ra */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-foreground/90 uppercase tracking-wider">Độ phân giải đầu ra</Label>
                        <div className="space-y-1.5">
                            {([
                                { value: "1x", label: "HD", sub: "1K", cost: 1, desc: "Làm nét" },
                                { value: "2x", label: "Full HD", sub: "2K", cost: 2, desc: "Tiêu chuẩn" },
                                { value: "4x", label: "Ultra HD", sub: "4K", cost: 5, desc: "Cao cấp" },
                            ] as const).map((opt) => {
                                const active = scaleFactor === opt.value
                                const dims = imageDims ? getOutputDims(imageDims.w, imageDims.h, opt.value === "4x" ? 2 : opt.value === "2x" ? 1 : 0) : null
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setScaleFactor(opt.value)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all text-left group",
                                            active
                                                ? "border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
                                                : "border-border/50 hover:border-border hover:bg-muted/40"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Radio dot */}
                                            <div className={cn(
                                                "size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                                active ? "border-primary" : "border-muted-foreground/30"
                                            )}>
                                                {active && <div className="size-2 rounded-full bg-primary" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn("text-sm font-semibold flex items-center gap-1.5", active ? "text-primary" : "text-foreground")}>
                                                    {opt.label}
                                                    {opt.value === "4x" && <Sparkles className={cn("size-3.5", active && "animate-pulse")} />}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {dims ? `${dims.w} × ${dims.h} px` : `~${opt.sub} resolution`}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant={active ? "default" : "outline"} className={cn("text-[10px] h-5 px-2 shrink-0", !active && "opacity-60 group-hover:opacity-100")}>
                                            {opt.cost} 💎
                                        </Badge>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    {/* Bảng điều khiển AI nâng cao */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-foreground/90 uppercase tracking-wider">Bộ công cụ AI</Label>
                        <Card className="divide-y divide-border/60 overflow-hidden">
                            {AI_TOGGLES.map((toggle) => (
                                <Tooltip key={toggle.id}>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center justify-between p-3 transition-colors hover:bg-muted/30 cursor-default">
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn("p-1.5 rounded-lg shrink-0", toggle.color)}>
                                                    <toggle.icon className="size-3.5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-foreground leading-tight">{toggle.label}</span>
                                                    <span className="text-[10px] text-muted-foreground leading-tight">{toggle.desc}</span>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={toggleStates[toggle.id]}
                                                onCheckedChange={toggleSetters[toggle.id]}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-[200px] text-xs">
                                        {toggle.tip}
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </Card>
                    </div>

                </div>
            </TooltipProvider>
        ),
        submitButton: <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={GEMS_COST[scaleFactor] ?? 2} label={scaleFactor === "4x" ? "Upscale Ultra HD" : scaleFactor === "2x" ? "Upscale Full HD" : "Làm Nét HD"} gemsBalance={gems} />,
        historyPanel: <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
    }, [images, scaleFactor, denoise, faceEnhance, creativeDetail, colorEnhance, loading, result, history, historyLoading, gems, imageDims])

    return (
        <ToolWorkspaceLayout
            canvas={
                !images[0] ? (
                    <ToolImageUpload images={images} onImagesChange={setImages} variant="huge" className="w-full max-w-2xl mx-auto" label="Tải ảnh cần xử lý" />
                ) : !result && !loading ? (
                    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                        <ToolImageUpload images={images} onImagesChange={setImages} className="border-0 bg-transparent shadow-none p-0" />
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 py-2.5 rounded-lg w-full">
                            <Sparkles className="size-4 animate-pulse text-primary" />
                            <span>Ảnh đã tải lên. Hãy chọn thông số bên trái và nhấn Xử lý!</span>
                        </div>
                        {outputDims && (
                            <p className="text-[10px] text-muted-foreground text-center animate-in fade-in">
                                Độ phân giải đầu ra: <span className="font-semibold text-foreground/80">{outputDims.w}×{outputDims.h} px</span>
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        {result && images[0] ? (
                            <div className="w-full h-full flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-500 delay-100">
                                {/* Ảnh chiếm không gian có sẵn */}
                                <div className="flex-1 min-h-0 flex items-center justify-center">
                                    <ZoomCompare beforeUrl={images[0]} afterUrl={result} className="max-w-full" />
                                </div>

                                {/* Bottom bar: info + actions */}
                                <div className="flex items-center justify-between gap-3 flex-wrap py-1">
                                    {/* Info bên trái */}
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                        {outputDims && (
                                            <>
                                                <Badge variant="secondary" className="text-[10px] h-5 px-2 font-mono">
                                                    {outputDims.w}×{outputDims.h}
                                                </Badge>
                                                <span className="text-muted-foreground/60">·</span>
                                            </>
                                        )}
                                        <span className="font-medium">{scaleFactor === "4x" ? "Ultra HD" : scaleFactor === "2x" ? "Full HD" : "HD"}</span>
                                    </div>

                                    {/* Actions bên phải */}
                                    <div className="flex items-center gap-2.5">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="gap-2 h-9 rounded-xl px-4 border border-border/40 shadow-sm transition-all hover:bg-secondary/80"
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(result)
                                                    const blob = await response.blob()
                                                    const url = URL.createObjectURL(blob)
                                                    const a = document.createElement("a")
                                                    a.href = url
                                                    a.download = `zdream-upscale-${Date.now()}.png`
                                                    a.click()
                                                    URL.revokeObjectURL(url)
                                                } catch { /* ignore */ }
                                            }}
                                        >
                                            <Download className="size-3.5" />
                                            <span className="text-xs font-semibold">Tải ảnh</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="gap-2 h-9 rounded-xl px-4 border border-border/40 shadow-sm transition-all hover:bg-secondary/80"
                                            onClick={() => setResult(null)}
                                        >
                                            <RotateCcw className="size-3.5" />
                                            <span className="text-xs font-semibold">Thử lại</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <ToolResultDisplay
                                imageUrl={result}
                                loading={loading}
                                beforeImageUrl={images[0]}
                                emptyHint="Ảnh đã được tải lên. Nhấn 'Upscale' để bắt đầu xử lý."
                            />
                        )}
                    </>
                )
            }
        />
    )
}
