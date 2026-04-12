import { useState } from "react"
import { toast } from "sonner"
import { ToolPageLayout } from "./ToolPageLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolTipsCard } from "./shared/ToolTipsCard"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { TOOL_TIPS } from "./shared/toolExamples"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const STYLES = [
    { id: "anime", label: "Anime", emoji: "🎌", desc: "Phong cách hoạt hình Nhật Bản" },
    { id: "oil-painting", label: "Sơn dầu", emoji: "🖼️", desc: "Tranh sơn dầu cổ điển" },
    { id: "watercolor", label: "Màu nước", emoji: "🎨", desc: "Tranh màu nước nhẹ nhàng" },
    { id: "cyberpunk", label: "Cyberpunk", emoji: "🌃", desc: "Tương lai neon rực rỡ" },
    { id: "pixel-art", label: "Pixel Art", emoji: "👾", desc: "Phong cách game retro" },
    { id: "3d-render", label: "3D Render", emoji: "💎", desc: "Dựng hình 3D chân thực" },
] as const

const INTENSITIES = [
    { value: "light", label: "Nhẹ" },
    { value: "medium", label: "Vừa" },
    { value: "strong", label: "Mạnh" },
] as const

export function StyleTransferPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("style-transfer")
    const [images, setImages] = useState<string[]>([])
    const [style, setStyle] = useState<string>("anime")
    const [intensity, setIntensity] = useState("medium")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.styleTransfer({ image: images[0], target_style: style, intensity })
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

    const handleUseAsInput = (url: string) => {
        setImages([url])
        setResult(null)
    }

    return (
        <ToolPageLayout title="Chuyển phong cách" description="Biến ảnh thường thành tranh anime, sơn dầu, hoạt hình, cyberpunk,...">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} label="Tải ảnh gốc" />
                    <div className="space-y-2">
                        <Label>Chọn phong cách</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {STYLES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStyle(s.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center",
                                        style === s.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                                    )}
                                >
                                    <span className="text-2xl">{s.emoji}</span>
                                    <span className="text-xs font-medium">{s.label}</span>
                                    <span className="text-[10px] text-muted-foreground leading-tight">{s.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Cường độ chuyển đổi</Label>
                        <ToggleGroup type="single" value={intensity} onValueChange={(v) => v && setIntensity(v)} className="justify-start">
                            {INTENSITIES.map((i) => (
                                <ToggleGroupItem key={i.value} value={i.value} className="text-xs px-4 h-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                    {i.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                    <ToolTipsCard tips={TOOL_TIPS['style-transfer']} />
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={2} label="Chuyển phong cách" gemsBalance={gems} />
                </div>
                <div className="space-y-4">
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        beforeImageUrl={images[0]}
                        onUseAsInput={handleUseAsInput}
                        emptyHint="Tải ảnh lên và chọn phong cách để bắt đầu"
                    />
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
