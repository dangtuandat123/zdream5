import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MonitorPlay, Smartphone, Square, RectangleHorizontal } from "lucide-react"
import { ToolPageLayout } from "./ToolPageLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolTipsCard } from "./shared/ToolTipsCard"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { ExtendPreview } from "./shared/ExtendPreview"
import { TOOL_TIPS } from "./shared/toolExamples"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

const DIRECTIONS = [
    { id: "top", label: "Trên", icon: ArrowUp },
    { id: "bottom", label: "Dưới", icon: ArrowDown },
    { id: "left", label: "Trái", icon: ArrowLeft },
    { id: "right", label: "Phải", icon: ArrowRight },
] as const

const EXTEND_RATIOS = [
    { value: "25", label: "25%" },
    { value: "50", label: "50%" },
    { value: "100", label: "100%" },
] as const

const RATIO_PRESETS = [
    { id: "youtube", label: "YouTube", sub: "16:9", icon: MonitorPlay, targetRatio: 16 / 9 },
    { id: "reels", label: "Reels", sub: "9:16", icon: Smartphone, targetRatio: 9 / 16 },
    { id: "square", label: "Vuông", sub: "1:1", icon: Square, targetRatio: 1 },
    { id: "banner", label: "Banner", sub: "3:1", icon: RectangleHorizontal, targetRatio: 3 },
] as const

export function ExtendPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("extend")
    const [images, setImages] = useState<string[]>([])
    const [directions, setDirections] = useState<string[]>([])
    const [extendRatio, setExtendRatio] = useState("50")
    const [description, setDescription] = useState("")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [activePreset, setActivePreset] = useState<string | null>(null)
    const [imageDims, setImageDims] = useState<{ w: number; h: number } | null>(null)

    useInputFromUrl(useCallback((url: string) => setImages([url]), []))

    useEffect(() => {
        if (!images[0]) { setImageDims(null); return }
        const img = new Image()
        img.onload = () => setImageDims({ w: img.naturalWidth, h: img.naturalHeight })
        img.src = images[0]
    }, [images])

    const toggleDirection = (dir: string) => {
        setActivePreset(null)
        setDirections((prev) => prev.includes(dir) ? prev.filter((d) => d !== dir) : [...prev, dir])
    }

    const applyPreset = (presetId: string) => {
        if (!imageDims) return toast.error("Tải ảnh lên trước")
        const preset = RATIO_PRESETS.find(p => p.id === presetId)
        if (!preset) return

        const currentRatio = imageDims.w / imageDims.h
        const target = preset.targetRatio
        const newDirs: string[] = []

        if (target > currentRatio) {
            newDirs.push("left", "right")
        } else if (target < currentRatio) {
            newDirs.push("top", "bottom")
        }
        if (newDirs.length === 0) newDirs.push("left", "right")

        const ratioDiff = Math.abs(target - currentRatio) / Math.max(target, currentRatio)
        let ratio = "25"
        if (ratioDiff > 0.5) ratio = "100"
        else if (ratioDiff > 0.2) ratio = "50"

        setDirections(newDirs)
        setExtendRatio(ratio)
        setActivePreset(presetId)
    }

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        if (!directions.length) return toast.error("Vui lòng chọn hướng mở rộng")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.extend({ image: images[0], directions, extend_ratio: extendRatio, description: description || undefined })
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
        <ToolPageLayout title="Mở rộng ảnh" description="Kéo dãn viền ảnh ra ngoài khung hình gốc, AI tự sinh nội dung phù hợp">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} />

                    {images[0] && (
                        <ExtendPreview imageUrl={images[0]} directions={directions} extendRatio={extendRatio} imageDims={imageDims} />
                    )}

                    {/* Smart ratio presets */}
                    {imageDims && (
                        <div className="space-y-2">
                            <Label>Mở rộng nhanh theo tỷ lệ</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {RATIO_PRESETS.map((p) => {
                                    const currentRatio = imageDims.w / imageDims.h
                                    const alreadyMatches = Math.abs(currentRatio - p.targetRatio) < 0.1
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => applyPreset(p.id)}
                                            disabled={alreadyMatches}
                                            className={cn(
                                                "flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center",
                                                activePreset === p.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30",
                                                alreadyMatches && "opacity-40 cursor-not-allowed"
                                            )}
                                        >
                                            <p.icon className={cn("size-4", activePreset === p.id ? "text-primary" : "text-muted-foreground")} />
                                            <span className="text-[10px] font-medium">{p.label}</span>
                                            <span className="text-[8px] text-muted-foreground">{alreadyMatches ? "Đã khớp" : p.sub}</span>
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Ảnh hiện tại: {imageDims.w}×{imageDims.h} ({(imageDims.w / imageDims.h).toFixed(2)})
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Hướng mở rộng</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {DIRECTIONS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => toggleDirection(id)}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                                        directions.includes(id) ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                                    )}
                                >
                                    <Icon className="size-4" />
                                    <span className="text-xs font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Mức mở rộng</Label>
                        <ToggleGroup type="single" value={extendRatio} onValueChange={(v) => { if (v) { setExtendRatio(v); setActivePreset(null) } }} className="justify-start">
                            {EXTEND_RATIOS.map((r) => (
                                <ToggleGroupItem key={r.value} value={r.value} className="text-xs px-4 h-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                    {r.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                        {imageDims && directions.length > 0 && (() => {
                            const ext = parseInt(extendRatio) / 100
                            const hDirs = directions.filter(d => d === "left" || d === "right").length
                            const vDirs = directions.filter(d => d === "top" || d === "bottom").length
                            const outW = Math.round(imageDims.w * (1 + ext * hDirs))
                            const outH = Math.round(imageDims.h * (1 + ext * vDirs))
                            return (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{imageDims.w}×{imageDims.h}</span>
                                    <span>→</span>
                                    <span className="text-foreground font-semibold">{outW}×{outH} px</span>
                                </div>
                            )
                        })()}
                    </div>
                    <div className="space-y-2">
                        <Label>Mô tả nội dung mở rộng (tùy chọn)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="VD: Mở rộng thêm bầu trời và cây cối..."
                            rows={2}
                            maxLength={1000}
                        />
                    </div>
                    <ToolTipsCard tips={TOOL_TIPS['extend']} />
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0] || !directions.length} gemsCost={2} label="Mở rộng" gemsBalance={gems} />
                </div>
                <div className="space-y-4">
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        beforeImageUrl={images[0]}
                        onUseAsInput={(url) => { setImages([url]); setResult(null); setDirections([]); setActivePreset(null) }}
                        emptyHint="Tải ảnh lên và chọn hướng mở rộng"
                    />
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
