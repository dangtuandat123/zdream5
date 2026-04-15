import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Download, Sparkles, Focus, Brush, ZoomIn, Camera, Smile, Wand2 } from "lucide-react"
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

const ENHANCE_MODES = [
    { id: "realistic", label: "Ảnh thật", icon: Camera, desc: "Chân dung, cảnh thật" },
    { id: "art", label: "Tranh & 2D", icon: Brush, desc: "Mượt nét vẽ, Anime" },
    { id: "texture", label: "3D & Chi tiết", icon: Focus, desc: "Kết cấu, kiến trúc" },
] as const

export function UpscalePage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("upscale")
    
    // Core parameters
    const [images, setImages] = useState<string[]>([])
    const [scaleFactor, setScaleFactor] = useState("2x")
    const [enhanceMode, setEnhanceMode] = useState("realistic")
    
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

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        setLoading(true)
        setResult(null)
        try {
            // Note: Sending extra parameters in case API supports it later
            const res = await toolsApi.upscale({
                image: images[0],
                scale_factor: scaleFactor,
                enhance_mode: enhanceMode,
                denoise,
                // @ts-ignore
                face_enhance: faceEnhance,
                // @ts-ignore
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
                
                {/* 1. Hệ số phân giải */}
                <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-foreground/90 uppercase tracking-wider">Độ phân giải hiển thị</Label>
                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            onClick={() => setScaleFactor("2x")}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all relative overflow-hidden group",
                                scaleFactor === "2x" ? "border-primary bg-primary/10 shadow-sm" : "border-border/50 hover:border-primary/40 bg-card hover:bg-muted/50"
                            )}
                        >
                            <span className={cn("text-xl font-bold tracking-tight mb-0.5", scaleFactor === "2x" ? "text-primary" : "text-foreground")}>2x</span>
                            <span className={cn("text-[10px] font-medium transition-colors", scaleFactor === "2x" ? "text-primary/80" : "text-muted-foreground")}>Lên tới 2K</span>
                            <span className="text-[9px] text-muted-foreground/80 mt-1 uppercase">Tiêu chuẩn</span>
                        </button>
                        <button
                            onClick={() => setScaleFactor("4x")}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all relative overflow-hidden group",
                                scaleFactor === "4x" ? "border-primary bg-primary/10 shadow-sm" : "border-border/50 hover:border-primary/40 bg-card hover:bg-muted/50"
                            )}
                        >
                            <span className={cn("text-xl font-bold tracking-tight mb-0.5 flex items-center gap-1.5", scaleFactor === "4x" ? "text-primary" : "text-foreground")}>
                                4x <Sparkles className={cn("size-3.5", scaleFactor === "4x" ? "animate-pulse" : "")} />
                            </span>
                            <span className={cn("text-[10px] font-medium transition-colors", scaleFactor === "4x" ? "text-primary/80" : "text-muted-foreground")}>Siêu nét 4K/8K</span>
                            <span className="text-[9px] text-muted-foreground/80 mt-1 uppercase">Cao Cấp</span>
                        </button>
                    </div>
                </div>

                {/* 2. Thể loại ảnh */}
                <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-foreground/90 uppercase tracking-wider">Phân loại ảnh</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {ENHANCE_MODES.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setEnhanceMode(m.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center",
                                    enhanceMode === m.id ? "border-primary bg-primary/10 shadow-sm" : "border-border/50 hover:border-primary/40 bg-card"
                                )}
                            >
                                <m.icon className={cn("size-5", enhanceMode === m.id ? "text-primary" : "text-muted-foreground/60")} />
                                <div className="flex flex-col gap-0.5">
                                    <span className={cn("text-[11px] font-bold leading-none", enhanceMode === m.id ? "text-primary": "text-foreground")}>{m.label}</span>
                                    <span className="text-[9px] text-muted-foreground leading-tight">{m.desc}</span>
                                </div>
                            </button>
                        ))}
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
        submitButton: <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={scaleFactor === "4x" ? 5 : 2} label={scaleFactor === "4x" ? "Upscale 4K" : "Upscale Cơ Bản"} gemsBalance={gems} />,
        historyPanel: <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
    }, [images, scaleFactor, enhanceMode, denoise, faceEnhance, creativeDetail, loading, result, history, historyLoading, gems])

    return (
        <ToolWorkspaceLayout
            canvas={
                !images[0] ? (
                    <ToolImageUpload images={images} onImagesChange={setImages} variant="huge" className="w-full max-w-2xl mx-auto" label="Tải ảnh cần Upscale" />
                ) : !result && !loading ? (
                    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                        <ToolImageUpload images={images} onImagesChange={setImages} className="border-0 bg-transparent shadow-none p-0" />
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 py-2.5 rounded-lg w-full">
                            <Sparkles className="size-4 animate-pulse text-primary" />
                            <span>Ảnh đã tải lên. Hãy chọn thông số làm nét bên trái và nhấn Upscale!</span>
                        </div>
                        {imageDims && (
                            <p className="text-[10px] text-muted-foreground text-center animate-in fade-in">
                                Kích thước ước tính sau khi upscale ({scaleFactor}): ~<span className="font-semibold text-foreground/80">{scaleFactor === "4x" ? (imageDims.w * 4) : (imageDims.w * 2)}x{scaleFactor === "4x" ? (imageDims.h * 4) : (imageDims.h * 2)} px</span>
                            </p>
                        )}
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
