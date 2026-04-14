import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MonitorPlay, Smartphone, Square, RectangleHorizontal, Expand } from "lucide-react"
import { ToolWorkspaceLayout } from "./ToolWorkspaceLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { ExtendPreview } from "./shared/ExtendPreview"
import { useToolPanel } from "./ToolPanelContext"

import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DIRECTIONS = [
    { id: "top", label: "Trên", icon: ArrowUp },
    { id: "bottom", label: "Dưới", icon: ArrowDown },
    { id: "left", label: "Trái", icon: ArrowLeft },
    { id: "right", label: "Phải", icon: ArrowRight },
] as const

const EXTEND_RATIOS = [
    { value: "25", label: "Nhẹ (25%)" },
    { value: "50", label: "Vừa (50%)" },
    { value: "100", label: "Gấp đôi" },
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

    // Đẩy controls lên Dynamic Panel (Col 2)
    useToolPanel({
        title: "Mở rộng ảnh",
        icon: Expand,
        controls: (
            <>
                {!images[0] ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 opacity-60">
                        <Expand className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Vui lòng tải ảnh lên ở vùng bên phải để bắt đầu thiết lập</p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {imageDims && (
                            <div className="space-y-2">
                                <Label className="text-xs">Mở rộng nhanh theo tỷ lệ</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {RATIO_PRESETS.map((p) => {
                                        const currentRatio = imageDims.w / imageDims.h
                                        const alreadyMatches = Math.abs(currentRatio - p.targetRatio) < 0.1
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => applyPreset(p.id)}
                                                disabled={alreadyMatches}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                                    activePreset === p.id
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "bg-muted hover:bg-muted/80 text-muted-foreground",
                                                    alreadyMatches && "opacity-40 cursor-not-allowed"
                                                )}
                                            >
                                                <p.icon className="size-3.5" />
                                                {p.label} {p.sub}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-xs">Hướng mở rộng</Label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {DIRECTIONS.map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => toggleDirection(id)}
                                            className={cn(
                                                "flex items-center gap-1.5 p-2 rounded-lg border-2 transition-all text-xs font-medium",
                                                directions.includes(id) ? "border-primary bg-primary/5 text-primary" : "border-border/50 hover:border-primary/30 text-muted-foreground"
                                            )}
                                        >
                                            <Icon className="size-3.5" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Mức mở rộng</Label>
                                <div className="flex flex-col gap-1.5">
                                    {EXTEND_RATIOS.map((r) => (
                                        <button
                                            key={r.value}
                                            onClick={() => { setExtendRatio(r.value); setActivePreset(null) }}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-xs font-medium transition-all text-left",
                                                extendRatio === r.value
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                            )}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả bù đắp cho nội dung nếu được mở rộng ra (Tùy chọn)..."
                            rows={2}
                            maxLength={1000}
                            className="text-sm"
                        />
                    </div>
                )}
            </>
        ),
        submitButton: <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0] || !directions.length} gemsCost={2} label="Mở rộng" gemsBalance={gems} />,
        historyPanel: <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />,
    })

    return (
        <ToolWorkspaceLayout
            canvas={
                !images[0] ? (
                    <ToolImageUpload images={images} onImagesChange={setImages} variant="huge" className="w-full max-w-2xl mx-auto" label="Mở rộng & Vẽ thêm" />
                ) : (
                    <>
                        {!loading && !result ? (
                            <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
                                <div className="w-full bg-muted/20 p-4 rounded-xl border flex items-center justify-between shadow-sm">
                                    <Label className="text-sm font-medium">Bản xem trước lưới hiển thị diện tích ảnh sẽ mở rộng ra</Label>
                                    <Button variant="outline" size="sm" onClick={() => { setImages([]); setResult(null) }} className="h-8 text-xs">Đổi ảnh khởi tạo</Button>
                                </div>
                                <div className="w-full flex justify-center bg-muted/5 border rounded-2xl p-4 py-8 shadow-inner overflow-hidden relative">
                                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                                    <ExtendPreview imageUrl={images[0]} directions={directions} extendRatio={extendRatio} imageDims={imageDims} />
                                </div>
                            </div>
                        ) : (
                            <ToolResultDisplay
                                imageUrl={result}
                                loading={loading}
                                beforeImageUrl={images[0]}
                                onUseAsInput={(url) => { setImages([url]); setResult(null); setDirections([]); setActivePreset(null) }}
                                emptyHint="Ảnh đã được tải lên. Nhấn 'Mở rộng' để bắt đầu xử lý."
                            />
                        )}
                    </>
                )
            }
        />
    )
}
