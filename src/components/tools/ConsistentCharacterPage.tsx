import { useState } from "react"
import { toast } from "sonner"
import { Info, UserCheck, Sparkles, Image as ImageIcon, Download, RotateCcw } from "lucide-react"
import { ToolWorkspaceLayout } from "./ToolWorkspaceLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { useToolPanel } from "./ToolPanelContext"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Tỉ lệ ảnh đầu ra
const ASPECT_RATIOS = [
    { value: "auto", label: "Tự động", desc: "Theo ảnh gốc" },
    { value: "1:1", label: "1:1", desc: "Vuông" },
    { value: "4:3", label: "4:3", desc: "Ngang chuẩn" },
    { value: "3:4", label: "3:4", desc: "Dọc chuẩn" },
    { value: "16:9", label: "16:9", desc: "Widescreen" },
    { value: "9:16", label: "9:16", desc: "Story/Reels" },
] as const

// Gợi ý prompt nhanh
const PROMPT_EXAMPLES = [
    "Đứng trên đỉnh núi lúc hoàng hôn, mặc áo choàng đỏ",
    "Ngồi trong quán cà phê, ánh đèn ấm, đang đọc sách",
    "Chiến binh giáp sắt trong trận chiến dưới mưa",
    "Mặc đồ formal trước tòa nhà hiện đại, tay cầm cặp",
    "Phong cách anime, tóc bay, nền hoa anh đào",
]

export function ConsistentCharacterPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("consistent-character")
    const [images, setImages] = useState<string[]>([])
    const [scene, setScene] = useState("")
    const [aspectRatio, setAspectRatio] = useState("auto")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images.length) return toast.error("Vui lòng tải ảnh nhân vật")
        if (!scene.trim()) return toast.error("Vui lòng mô tả bối cảnh mới")
        setLoading(true)
        setResult(null)
        try {
            const payload: { images: string[]; scene_description: string; aspect_ratio?: string } = { images, scene_description: scene }
            if (aspectRatio !== "auto") payload.aspect_ratio = aspectRatio
            const res = await toolsApi.consistentCharacter(payload)
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
        title: "Nhân vật nhất quán",
        icon: UserCheck,
        controls: (
            <div className={cn("space-y-4 animate-in fade-in transition-all duration-300", !images.length ? "opacity-40 grayscale-[0.5] pointer-events-none select-none" : "")}>
                
                {/* Hướng dẫn */}
                <Card className="p-3 bg-blue-500/5 border-blue-500/15">
                    <div className="flex items-start gap-2 text-xs text-blue-400">
                        <Info className="size-3.5 shrink-0 mt-0.5" />
                        <span>Tải 1-3 ảnh cùng nhân vật từ <span className="font-semibold">các góc khác nhau</span> để AI hiểu khuôn mặt tốt hơn.</span>
                    </div>
                </Card>

                {/* Số ảnh đã tải */}
                {images.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ImageIcon className="size-3.5" />
                        <span>Đã tải <span className="font-semibold text-foreground">{images.length}/3</span> ảnh tham chiếu</span>
                    </div>
                )}
                
                {/* Mô tả bối cảnh */}
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground/90 uppercase tracking-wider">Mô tả bối cảnh mới</Label>
                    <Textarea
                        value={scene}
                        onChange={(e) => setScene(e.target.value)}
                        placeholder="VD: Nhân vật đứng trên đỉnh núi lúc hoàng hôn, mặc áo choàng đỏ..."
                        rows={3}
                        maxLength={2000}
                        className="text-sm resize-none"
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{scene.length}/2000</span>
                    </div>
                </div>

                {/* Gợi ý prompt nhanh */}
                <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground">Gợi ý nhanh</Label>
                    <div className="flex flex-wrap gap-1">
                        {PROMPT_EXAMPLES.map((example, i) => (
                            <button
                                key={i}
                                onClick={() => setScene(example)}
                                className="text-[10px] px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors truncate max-w-full"
                            >
                                {example.length > 35 ? example.slice(0, 35) + "..." : example}
                            </button>
                        ))}
                    </div>
                </div>

                <Separator className="opacity-50" />

                {/* Tỉ lệ ảnh đầu ra */}
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground/90 uppercase tracking-wider">Tỉ lệ ảnh đầu ra</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {ASPECT_RATIOS.map((ratio) => {
                            const active = aspectRatio === ratio.value
                            return (
                                <button
                                    key={ratio.value}
                                    onClick={() => setAspectRatio(ratio.value)}
                                    className={cn(
                                        "flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border transition-all text-center",
                                        active
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-border/40 hover:border-border hover:bg-muted/40 text-muted-foreground"
                                    )}
                                >
                                    <span className={cn("text-xs font-semibold", active && "text-primary")}>{ratio.label}</span>
                                    <span className="text-[9px] opacity-70">{ratio.desc}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

            </div>
        ),
        submitButton: <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images.length || !scene.trim()} gemsCost={2} label="Tạo ảnh nhân vật" gemsBalance={gems} />,
        historyPanel: <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
    }, [images, scene, aspectRatio, loading, result, history, historyLoading, gems])

    return (
        <ToolWorkspaceLayout
            canvas={
                !images.length ? (
                    <ToolImageUpload images={images} onImagesChange={setImages} multiple maxFiles={3} variant="huge" className="w-full max-w-2xl mx-auto" label="Tải ảnh nhân vật tham chiếu (1-3 ảnh)" />
                ) : !result && !loading ? (
                    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                        <ToolImageUpload images={images} onImagesChange={setImages} multiple maxFiles={3} className="border-0 bg-transparent shadow-none p-0" />
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 py-2.5 rounded-lg w-full">
                            <Sparkles className="size-4 animate-pulse text-primary" />
                            <span>Ảnh đã tải lên. Mô tả bối cảnh mới bên trái rồi nhấn Tạo!</span>
                        </div>
                    </div>
                ) : result ? (
                    <div className="w-full h-full flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-500 delay-100">
                        <div className="flex-1 min-h-0 flex items-center justify-center">
                            <div className="relative rounded-xl overflow-hidden border border-border/60 bg-muted/30">
                                <img src={result} alt="Kết quả" className="w-full max-h-[55vh] object-contain" draggable={false} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 flex-wrap py-1">
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <Badge variant="secondary" className="text-[10px] h-5 px-2">{aspectRatio === "auto" ? "Tự động" : aspectRatio}</Badge>
                                <span className="text-muted-foreground/60">·</span>
                                <span className="font-medium">Nhân vật AI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" className="gap-1.5 h-8 px-4 text-xs" onClick={async () => {
                                    if (!result) return
                                    try {
                                        const response = await fetch(result)
                                        const blob = await response.blob()
                                        const url = URL.createObjectURL(blob)
                                        const a = document.createElement("a")
                                        a.href = url
                                        a.download = `zdream-character-${Date.now()}.png`
                                        a.click()
                                        URL.revokeObjectURL(url)
                                    } catch { /* ignore */ }
                                }}>
                                    <Download className="size-3.5" />
                                    Tải ảnh
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setResult(null)}>
                                    <RotateCcw className="size-3.5" />
                                    Thử lại
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        emptyHint="Đang tạo ảnh nhân vật..."
                    />
                )
            }
        />
    )
}
