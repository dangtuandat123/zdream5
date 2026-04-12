import { useState, useCallback } from "react"
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
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const STYLES = [
    { id: "anime", label: "Anime", emoji: "🎌", desc: "Phong cách hoạt hình Nhật Bản", color: "from-pink-500 to-purple-500" },
    { id: "oil-painting", label: "Sơn dầu", emoji: "🖼️", desc: "Tranh sơn dầu cổ điển", color: "from-amber-600 to-orange-500" },
    { id: "watercolor", label: "Màu nước", emoji: "🎨", desc: "Tranh màu nước nhẹ nhàng", color: "from-sky-400 to-blue-500" },
    { id: "cyberpunk", label: "Cyberpunk", emoji: "🌃", desc: "Tương lai neon rực rỡ", color: "from-violet-500 to-fuchsia-500" },
    { id: "pixel-art", label: "Pixel Art", emoji: "👾", desc: "Phong cách game retro", color: "from-green-500 to-emerald-500" },
    { id: "3d-render", label: "3D Render", emoji: "💎", desc: "Dựng hình 3D chân thực", color: "from-cyan-500 to-blue-600" },
    { id: "variation", label: "Biến thể", emoji: "🔄", desc: "Giữ ý tưởng, đổi góc nhìn", color: "from-gray-500 to-slate-600" },
    { id: "custom", label: "Tùy chỉnh", emoji: "✏️", desc: "Nhập phong cách riêng", color: "from-rose-500 to-red-500" },
] as const

const INTENSITIES = [
    { value: "light", label: "Nhẹ" },
    { value: "medium", label: "Vừa" },
    { value: "strong", label: "Mạnh" },
] as const

const STRENGTHS = [
    { value: "0.3", label: "Nhẹ" },
    { value: "0.5", label: "Vừa" },
    { value: "0.8", label: "Mạnh" },
] as const

export function StyleTransferPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("style-transfer")
    const [images, setImages] = useState<string[]>([])
    const [style, setStyle] = useState<string>("anime")
    const [customStyle, setCustomStyle] = useState("")
    const [intensity, setIntensity] = useState("medium")
    const [strength, setStrength] = useState("0.5")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useInputFromUrl(useCallback((url: string) => setImages([url]), []))

    const isVariation = style === "variation"
    const isCustom = style === "custom"

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        if (isCustom && !customStyle.trim()) return toast.error("Vui lòng nhập phong cách tùy chỉnh")
        setLoading(true)
        setResult(null)
        try {
            let res
            if (isVariation) {
                res = await toolsApi.imageVariation({ image: images[0], strength: parseFloat(strength) })
            } else {
                const targetStyle = isCustom ? customStyle.trim() : style
                res = await toolsApi.styleTransfer({ image: images[0], target_style: targetStyle, intensity })
            }
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
        <ToolPageLayout title="Chuyển phong cách" description="Biến ảnh thành tranh anime, sơn dầu, cyberpunk hoặc tạo biến thể mới">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} label="Tải ảnh gốc" />
                    <div className="space-y-2">
                        <Label>Chọn phong cách</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {STYLES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStyle(s.id)}
                                    className={cn(
                                        "relative flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center overflow-hidden",
                                        style === s.id ? "border-primary ring-1 ring-primary/20" : "border-border/50 hover:border-primary/30"
                                    )}
                                >
                                    {/* Gradient background hint */}
                                    <div className={cn(
                                        "absolute inset-0 bg-gradient-to-br opacity-[0.07] transition-opacity",
                                        s.color,
                                        style === s.id && "opacity-[0.15]"
                                    )} />
                                    <span className="text-xl relative">{s.emoji}</span>
                                    <span className="text-[11px] font-medium relative">{s.label}</span>
                                    <span className="text-[9px] text-muted-foreground leading-tight relative">{s.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom style input */}
                    {isCustom && (
                        <div className="space-y-2">
                            <Label>Phong cách tùy chỉnh</Label>
                            <Input
                                value={customStyle}
                                onChange={(e) => setCustomStyle(e.target.value)}
                                placeholder="VD: Studio Ghibli, Van Gogh, Art Nouveau, Ukiyo-e..."
                                maxLength={200}
                            />
                            <p className="text-[10px] text-muted-foreground">Nhập tên phong cách, họa sĩ, hoặc mô tả art style bạn muốn</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>{isVariation ? "Mức độ thay đổi" : "Cường độ chuyển đổi"}</Label>
                        <ToggleGroup
                            type="single"
                            value={isVariation ? strength : intensity}
                            onValueChange={(v) => { if (!v) return; isVariation ? setStrength(v) : setIntensity(v) }}
                            className="justify-start"
                        >
                            {(isVariation ? STRENGTHS : INTENSITIES).map((i) => (
                                <ToggleGroupItem key={i.value} value={i.value} className="text-xs px-4 h-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                    {i.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                    <ToolTipsCard tips={TOOL_TIPS['style-transfer']} />
                    <ToolSubmitButton
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!images[0] || (isCustom && !customStyle.trim())}
                        gemsCost={2}
                        label={isVariation ? "Tạo biến thể" : "Chuyển phong cách"}
                        gemsBalance={gems}
                    />
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
