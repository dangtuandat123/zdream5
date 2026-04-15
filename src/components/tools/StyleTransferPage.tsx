import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Wand2, Sparkles } from "lucide-react"
import { ToolWorkspaceLayout } from "./ToolWorkspaceLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { useToolPanel } from "./ToolPanelContext"

import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const STYLES = [
    { id: "anime", label: "Anime", emoji: "🎌", desc: "Hoạt hình Nhật Bản", color: "from-pink-500 to-purple-500" },
    { id: "oil-painting", label: "Sơn dầu", emoji: "🖼️", desc: "Cổ điển", color: "from-amber-600 to-orange-500" },
    { id: "watercolor", label: "Màu nước", emoji: "🎨", desc: "Nhẹ nhàng", color: "from-sky-400 to-blue-500" },
    { id: "cyberpunk", label: "Cyberpunk", emoji: "🌃", desc: "Neon rực rỡ", color: "from-violet-500 to-fuchsia-500" },
    { id: "pixel-art", label: "Pixel Art", emoji: "👾", desc: "Game retro", color: "from-green-500 to-emerald-500" },
    { id: "3d-render", label: "3D Render", emoji: "💎", desc: "3D chân thực", color: "from-cyan-500 to-blue-600" },
    { id: "variation", label: "Biến thể", emoji: "🔄", desc: "Đổi góc nhìn", color: "from-gray-500 to-slate-600" },
    { id: "custom", label: "Tùy chỉnh", emoji: "✏️", desc: "Phong cách riêng", color: "from-rose-500 to-red-500" },
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
        } catch (e) {
            toast.error((e as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const handleUseAsInput = (url: string) => {
        setImages([url])
        setResult(null)
    }

    const intensityOptions = isVariation
        ? [{ v: "0.3", l: "Nhẹ" }, { v: "0.5", l: "Vừa" }, { v: "0.8", l: "Mạnh" }]
        : [{ v: "light", l: "Nhẹ" }, { v: "medium", l: "Vừa" }, { v: "strong", l: "Mạnh" }]

    const currentIntensity = isVariation ? strength : intensity

    // Đẩy controls lên Dynamic Panel (Col 2)
    useToolPanel({
        title: "Chuyển phong cách",
        icon: Wand2,
        controls: (
            <div className={cn("space-y-4 animate-in fade-in transition-all duration-300", !images[0] ? "opacity-40 grayscale-[0.5] pointer-events-none select-none" : "")}>
                <div className="space-y-2">
                    <Label className="text-xs">Chọn phong cách</Label>
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
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br opacity-[0.07] transition-opacity",
                                    s.color,
                                    style === s.id && "opacity-[0.15]"
                                )} />
                                <span className="text-lg relative">{s.emoji}</span>
                                <span className="text-[10px] font-medium relative leading-tight">{s.label}</span>
                                <span className="text-[8px] text-muted-foreground relative">{s.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
                {isCustom && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <Input
                            value={customStyle}
                            onChange={(e) => setCustomStyle(e.target.value)}
                            placeholder="VD: Studio Ghibli, Van Gogh, Art Nouveau..."
                            maxLength={200}
                        />
                    </div>
                )}
                <div className="space-y-2">
                    <Label className="text-xs flex items-center justify-between">
                        {isVariation ? "Mức độ thay đổi" : "Cường độ"}
                        {!images[0] && <span className="text-[10px] text-muted-foreground font-normal italic">Xem trước</span>}
                    </Label>
                    <div className="flex gap-1.5">
                        {intensityOptions.map((i) => (
                            <button
                                key={i.v}
                                onClick={() => isVariation ? setStrength(i.v) : setIntensity(i.v)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                                    currentIntensity === i.v
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                )}
                            >
                                {i.l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        ),
        submitButton: <ToolSubmitButton
            onClick={handleSubmit}
            loading={loading}
            disabled={!images[0] || (isCustom && !customStyle.trim())}
            gemsCost={2}
            label={isVariation ? "Tạo biến thể" : "Chuyển phong cách"}
            gemsBalance={gems}
        />,
        historyPanel: <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
    }, [images, isCustom, customStyle, style, intensity, strength, loading, result, history, historyLoading, gems, isVariation])

    return (
        <ToolWorkspaceLayout
            canvas={
                !images[0] ? (
                    <ToolImageUpload images={images} onImagesChange={setImages} variant="huge" className="w-full max-w-2xl mx-auto" label="Ảnh Cần Đổi Phong Cách" />
                ) : !result && !loading ? (
                    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                        <ToolImageUpload images={images} onImagesChange={setImages} className="border-0 bg-transparent shadow-none p-0" />
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 py-2.5 rounded-lg w-full">
                            <Sparkles className="size-4 animate-pulse text-primary" />
                            <span>Ảnh đã tải lên. Hãy thiết lập thông số bên trái và nhấn xử lý!</span>
                        </div>
                    </div>
                ) : (
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        beforeImageUrl={images[0]}
                        onUseAsInput={handleUseAsInput}
                        emptyHint="Ảnh đã được tải lên. Nhấn tải tạo ảnh để bắt đầu xử lý."
                    />
                )
            }
        />
    )
}
