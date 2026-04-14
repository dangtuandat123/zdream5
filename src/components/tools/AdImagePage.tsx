import { useState } from "react"
import { toast } from "sonner"
import { ImageIcon, LayoutTemplate } from "lucide-react"
import { ToolWorkspaceLayout } from "./ToolWorkspaceLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolTipsCard } from "./shared/ToolTipsCard"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { TOOL_TIPS } from "./shared/toolExamples"
import { useToolPanel } from "./ToolPanelContext"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const AD_STYLES = [
    { id: "elegant", label: "Sang trọng", emoji: "✨", desc: "Tinh tế, cao cấp" },
    { id: "bold", label: "Nổi bật", emoji: "🔥", desc: "Mạnh mẽ, thu hút" },
    { id: "playful", label: "Vui nhộn", emoji: "🎉", desc: "Tươi sáng, năng động" },
    { id: "minimal", label: "Tối giản", emoji: "🤍", desc: "Sạch sẽ, hiện đại" },
] as const

const PLATFORM_RATIOS: Record<string, string> = {
    facebook: "16:9",
    instagram: "1:1",
    tiktok: "9:16",
}

const RATIOS = ["1:1", "4:5", "9:16", "16:9"] as const

export function AdImagePage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("ad-image")
    const [images, setImages] = useState<string[]>([])
    const [description, setDescription] = useState("")
    const [adStyle, setAdStyle] = useState("elegant")
    const [platform, setPlatform] = useState("facebook")
    const [aspectRatio, setAspectRatio] = useState("16:9")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const [ratioManuallySet, setRatioManuallySet] = useState(false)

    const handlePlatformChange = (value: string) => {
        setPlatform(value)
        if (!ratioManuallySet) {
            setAspectRatio(PLATFORM_RATIOS[value] || "1:1")
        }
    }

    const handleRatioChange = (value: string) => {
        if (!value) return
        setAspectRatio(value)
        setRatioManuallySet(true)
    }

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh sản phẩm")
        if (!description.trim()) return toast.error("Vui lòng mô tả quảng cáo")
        setLoading(true)
        setResult(null)
        try {
            const styleLabel = AD_STYLES.find(s => s.id === adStyle)?.label ?? adStyle
            const fullDesc = `${description}. Phong cách quảng cáo: ${styleLabel}`
            const res = await toolsApi.adImage({ image: images[0], description: fullDesc, platform, aspect_ratio: aspectRatio })
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
        title: "Ảnh quảng cáo",
        icon: ImageIcon,
        controls: (
            <>
                {!images[0] ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 opacity-60">
                        <LayoutTemplate className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Vui lòng tải ảnh lên ở vùng bên phải để bắt đầu thiết lập</p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Mô tả quảng cáo</Label>
                        <span className="text-[10px] text-muted-foreground">{description.length}/1000</span>
                    </div>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="VD: Quảng cáo cho chai nước hoa cao cấp, phong cách sang trọng..."
                        rows={3}
                        maxLength={1000}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Phong cách quảng cáo</Label>
                    <div className="grid grid-cols-4 gap-2">
                        {AD_STYLES.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setAdStyle(s.id)}
                                className={cn(
                                    "flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center",
                                    adStyle === s.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                                )}
                            >
                                <span className="text-xl">{s.emoji}</span>
                                <span className="text-xs font-medium">{s.label}</span>
                                <span className="text-[10px] text-muted-foreground leading-tight">{s.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nền tảng</Label>
                        <Select value={platform} onValueChange={handlePlatformChange}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Tỉ lệ</Label>
                        <ToggleGroup type="single" value={aspectRatio} onValueChange={handleRatioChange} className="justify-start">
                            {RATIOS.map((r) => (
                                <ToggleGroupItem key={r} value={r} className="text-xs px-2.5 h-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                    {r}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                </div>
                    <div className="space-y-4">
                        <ToolTipsCard tips={TOOL_TIPS['ad-image']} />
                    </div>
                </div>
                )}
            </>
        ),
        submitButton: <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0] || !description.trim()} gemsCost={2} label="Tạo ảnh quảng cáo" gemsBalance={gems} />,
        historyPanel: <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
    }, [images, description, adStyle, platform, aspectRatio, loading, result, history, historyLoading, gems])

    return (
        <ToolWorkspaceLayout
            canvas={
                !images[0] ? (
                    <ToolImageUpload images={images} onImagesChange={setImages} variant="huge" className="w-full max-w-2xl mx-auto" label="Ảnh Mẫu Sản Phẩm (Tạo Quảng Cáo)" />
                ) : (
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        emptyHint="Tải ảnh sản phẩm và mô tả quảng cáo để bắt đầu"
                    />
                )
            }
        />
    )
}
