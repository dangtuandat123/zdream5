import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Download, Sparkles, ZoomIn, Smile, Wand2 } from "lucide-react"
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

    const sizeIndex = scaleFactor === "4x" ? 2 : scaleFactor === "2x" ? 1 : 0

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
            })
            setResult(res.image.file_url)
            refreshUser()
            refreshHistory()
            toast.success(res.message)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    useToolPanel({
        title: "Upscale siêu sáng tạo",
        icon: ZoomIn,
        controls: (
            <div className={cn("space-y-6 animate-in fade-in transition-all duration-300", !images[0] ? "opacity-40 grayscale-[0.5] pointer-events-none select-none" : "")}>
                
                {/* 1. Độ phân giải đầu ra */}
                <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-foreground/90 uppercase tracking-wider">Độ phân giải đầu ra</Label>
                    <div className="grid grid-cols-3 gap-2.5">
                        <button
                            onClick={() => setScaleFactor("1x")}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all relative overflow-hidden group justify-between",
                                scaleFactor === "1x" ? "border-primary bg-primary/10 shadow-sm" : "border-border/50 hover:border-primary/40 bg-card hover:bg-muted/50"
                            )}
                        >
                            <span className={cn("text-base font-bold tracking-tight mb-0.5", scaleFactor === "1x" ? "text-primary" : "text-foreground")}>HD</span>
                            <span className={cn("text-[10px] font-medium transition-colors text-center w-full truncate", scaleFactor === "1x" ? "text-primary/80" : "text-muted-foreground")}>
                                {imageDims ? `${getOutputDims(imageDims.w, imageDims.h, 0).w}×${getOutputDims(imageDims.w, imageDims.h, 0).h}` : "~1K px"}
                            </span>
                            <span className="text-[8px] text-muted-foreground/80 mt-1 uppercase tracking-tighter">Làm Nét</span>
                        </button>
                        <button
                            onClick={() => setScaleFactor("2x")}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all relative overflow-hidden group justify-between",
                                scaleFactor === "2x" ? "border-primary bg-primary/10 shadow-sm" : "border-border/50 hover:border-primary/40 bg-card hover:bg-muted/50"
                            )}
                        >
                            <span className={cn("text-base font-bold tracking-tight mb-0.5", scaleFactor === "2x" ? "text-primary" : "text-foreground")}>Full HD</span>
                            <span className={cn("text-[10px] font-medium transition-colors text-center w-full truncate", scaleFactor === "2x" ? "text-primary/80" : "text-muted-foreground")}>
                                {imageDims ? `${getOutputDims(imageDims.w, imageDims.h, 1).w}×${getOutputDims(imageDims.w, imageDims.h, 1).h}` : "~2K px"}
                            </span>
                            <span className="text-[8px] text-muted-foreground/80 mt-1 uppercase tracking-tighter">Tiêu chuẩn</span>
                        </button>
                        <button
                            onClick={() => setScaleFactor("4x")}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all relative overflow-hidden group justify-between",
                                scaleFactor === "4x" ? "border-primary bg-primary/10 shadow-sm" : "border-border/50 hover:border-primary/40 bg-card hover:bg-muted/50"
                            )}
                        >
                            <span className={cn("text-base font-bold tracking-tight mb-0.5 flex items-center gap-1.5", scaleFactor === "4x" ? "text-primary" : "text-foreground")}>
                                Ultra HD <Sparkles className={cn("size-3.5", scaleFactor === "4x" ? "animate-pulse" : "")} />
                            </span>
                            <span className={cn("text-[10px] font-medium transition-colors text-center w-full truncate", scaleFactor === "4x" ? "text-primary/80" : "text-muted-foreground")}>
                                {imageDims ? `${getOutputDims(imageDims.w, imageDims.h, 2).w}×${getOutputDims(imageDims.w, imageDims.h, 2).h}` : "~4K px"}
                            </span>
                            <span className="text-[8px] text-muted-foreground/80 mt-1 uppercase tracking-tighter">Cao Cấp</span>
                        </button>
                    </div>
                </div>

                {/* 3. Bộ công cụ tối ưu */}
                <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-foreground/90 uppercase tracking-wider">Bảng điều khiển AI nâng cao</Label>
                    <div className="rounded-xl border border-border/80 divide-y overflow-hidden bg-card shadow-sm">
                        
                        <div className="flex items-center justify-between p-3.5 transition-colors hover:bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shadow-[inset_0_0_12px_rgba(0,0,0,0.05)]">
                                    <Smile className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold text-foreground">Khôi phục mặt (Face)</span>
                                    <span className="text-[10px] text-muted-foreground leading-tight max-w-[160px]">Chỉnh sửa mặt bị nhòe hoặc biến dạng (Rất tốt cho ảnh AI)</span>
                                </div>
                            </div>
                            <Switch checked={faceEnhance} onCheckedChange={setFaceEnhance} />
                        </div>

                        <div className="flex items-center justify-between p-3.5 transition-colors hover:bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shadow-[inset_0_0_12px_rgba(0,0,0,0.05)]">
                                    <Wand2 className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold text-foreground">Sáng tạo chi tiết AI</span>
                                    <span className="text-[10px] text-muted-foreground leading-tight max-w-[160px]">Trí tuệ nhân tạo sẽ tự phân tích và vẽ thêm sợi tóc, da, nét vải</span>
                                </div>
                            </div>
                            <Switch checked={creativeDetail} onCheckedChange={setCreativeDetail} />
                        </div>

                        <div className="flex items-center justify-between p-3.5 transition-colors hover:bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-zinc-500/10 text-zinc-500 shadow-[inset_0_0_12px_rgba(0,0,0,0.05)]">
                                    <div className="size-4 opacity-70 flex items-center justify-center">
                                        <div className="size-1 bg-current rounded-full" style={{boxShadow: "4px 4px 0, 4px -4px 0, -4px 4px 0, -4px -4px 0"}} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold text-foreground">Khử nhiễu (Denoise)</span>
                                    <span className="text-[10px] text-muted-foreground leading-tight max-w-[160px]">Dọn các hạt sạn rỗ, tốt cho ảnh cũ hoặc chụp ban đêm thiếu sáng</span>
                                </div>
                            </div>
                            <Switch checked={denoise} onCheckedChange={setDenoise} />
                        </div>

                    </div>
                </div>

            </div>
        ),
        submitButton: <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={scaleFactor === "4x" ? 5 : scaleFactor === "2x" ? 2 : 1} label={scaleFactor === "4x" ? "Upscale Ultra HD" : scaleFactor === "2x" ? "Upscale Full HD" : "Làm Nét HD"} gemsBalance={gems} />,
        historyPanel: <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
    }, [images, scaleFactor, denoise, faceEnhance, creativeDetail, loading, result, history, historyLoading, gems])

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
                            <span>Ảnh đã tải lên. Hãy chọn thông số làm nét bên trái và nhấn Xử lý!</span>
                        </div>
                        {imageDims && (() => {
                            const dims = getOutputDims(imageDims.w, imageDims.h, sizeIndex as 0 | 1 | 2)
                            return (
                                <p className="text-[10px] text-muted-foreground text-center animate-in fade-in">
                                    Độ phân giải đầu ra: <span className="font-semibold text-foreground/80">{dims.w}×{dims.h} px</span>
                                </p>
                            )
                        })()}
                    </div>
                ) : (
                    <>
                        {result && images[0] ? (
                            <div className="space-y-4 w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 delay-100">
                                <ZoomCompare beforeUrl={images[0]} afterUrl={result} />
                                <div className="flex gap-2">
                                    <Button size="sm" className="gap-1.5 px-6 shadow-sm" onClick={async () => {
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
                                    }}>
                                        <Download className="size-4" />
                                        Tải ảnh siêu nét
                                    </Button>
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
