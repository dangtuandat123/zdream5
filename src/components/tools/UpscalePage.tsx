import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Download, Sparkles, Focus, Brush } from "lucide-react"
import { ToolPageLayout } from "./ToolPageLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolTipsCard } from "./shared/ToolTipsCard"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { ZoomCompare } from "./shared/ZoomCompare"
import { TOOL_TIPS } from "./shared/toolExamples"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

const ENHANCE_MODES = [
    { id: "sharp", label: "Sắc nét", icon: Focus, desc: "Tối ưu cho ảnh phong cảnh, kiến trúc" },
    { id: "soft", label: "Mịn màng", icon: Brush, desc: "Tối ưu cho chân dung, da mặt" },
    { id: "detail", label: "Chi tiết cao", icon: Sparkles, desc: "Tối ưu cho ảnh sản phẩm, texture" },
] as const

export function UpscalePage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("upscale")
    const [images, setImages] = useState<string[]>([])
    const [scaleFactor, setScaleFactor] = useState("2x")
    const [enhanceMode, setEnhanceMode] = useState("sharp")
    const [denoise, setDenoise] = useState(false)
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

    const scale = scaleFactor === "4x" ? 4 : 2

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.upscale({
                image: images[0],
                scale_factor: scaleFactor,
                enhance_mode: enhanceMode,
                denoise,
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

    return (
        <ToolPageLayout title="Upscale ảnh" description="Phóng to ảnh lên 2x-4x mà vẫn giữ chi tiết sắc nét nhờ AI">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} />

                    {/* Scale factor */}
                    <div className="space-y-2">
                        <Label>Hệ số phóng to</Label>
                        <ToggleGroup type="single" value={scaleFactor} onValueChange={(v) => v && setScaleFactor(v)} className="justify-start">
                            <ToggleGroupItem value="2x" className="rounded-full px-6 h-9 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">2x</ToggleGroupItem>
                            <ToggleGroupItem value="4x" className="rounded-full px-6 h-9 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">4x</ToggleGroupItem>
                        </ToggleGroup>
                        {imageDims && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{imageDims.w} × {imageDims.h}</span>
                                <span>→</span>
                                <span className="text-foreground font-semibold">{imageDims.w * scale} × {imageDims.h * scale} px</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                    {((imageDims.w * scale * imageDims.h * scale) / 1_000_000).toFixed(1)} MP
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Enhancement mode — THIS is what makes it different from /generate */}
                    <div className="space-y-2">
                        <Label>Chế độ nâng cấp</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {ENHANCE_MODES.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setEnhanceMode(m.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",
                                        enhanceMode === m.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                                    )}
                                >
                                    <m.icon className={cn("size-5", enhanceMode === m.id ? "text-primary" : "text-muted-foreground")} />
                                    <span className="text-[11px] font-medium">{m.label}</span>
                                    <span className="text-[9px] text-muted-foreground leading-tight">{m.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Denoise toggle */}
                    <div className="flex items-center justify-between rounded-xl border p-3">
                        <div>
                            <p className="text-xs font-medium">Giảm nhiễu (Denoise)</p>
                            <p className="text-[10px] text-muted-foreground">Làm sạch ảnh trước khi phóng to — tốt cho ảnh cũ, ảnh chụp tối</p>
                        </div>
                        <Switch checked={denoise} onCheckedChange={setDenoise} />
                    </div>

                    <ToolTipsCard tips={TOOL_TIPS['upscale']} />
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={2} label="Upscale" gemsBalance={gems} />
                </div>
                <div className="space-y-4">
                    {result && images[0] ? (
                        <div className="space-y-3">
                            <ZoomCompare beforeUrl={images[0]} afterUrl={result} />
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="gap-1.5" onClick={async () => {
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
                                    <Download className="size-3.5" />
                                    Tải về
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <ToolResultDisplay
                            imageUrl={result}
                            loading={loading}
                            emptyHint="Tải ảnh cần phóng to lên để bắt đầu"
                        />
                    )}
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
