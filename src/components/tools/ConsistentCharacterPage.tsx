import { useState } from "react"
import { toast } from "sonner"
import { Info, UserCheck, Sparkles } from "lucide-react"
import { ToolWorkspaceLayout } from "./ToolWorkspaceLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolTipsCard } from "./shared/ToolTipsCard"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { useToolPanel } from "./ToolPanelContext"
import { TOOL_TIPS } from "./shared/toolExamples"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function ConsistentCharacterPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("consistent-character")
    const [images, setImages] = useState<string[]>([])
    const [scene, setScene] = useState("")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images.length) return toast.error("Vui lòng tải ảnh nhân vật")
        if (!scene.trim()) return toast.error("Vui lòng mô tả bối cảnh mới")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.consistentCharacter({ images, scene_description: scene })
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
        title: "Nhân vật AI",
        icon: UserCheck,
        controls: (
            <div className={cn("space-y-4 animate-in fade-in transition-all duration-300", !images.length ? "opacity-40 grayscale-[0.5] pointer-events-none select-none" : "")}>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                    <Info className="size-3.5 shrink-0 mt-0.5" />
                    <span>Dùng 2-3 ảnh cùng nhân vật từ các góc khác nhau để AI hiểu khuôn mặt và đặc điểm tốt hơn.</span>
                </div>
                
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả bối cảnh mới</Label>
                    <Textarea
                        value={scene}
                        onChange={(e) => setScene(e.target.value)}
                        placeholder="VD: Nhân vật đứng trên đỉnh núi lúc hoàng hôn, mặc áo choàng đỏ..."
                        rows={4}
                        maxLength={2000}
                        className="text-sm resize-none"
                    />
                </div>
                <ToolTipsCard tips={TOOL_TIPS['consistent-character']} />
            </div>
        ),
        submitButton: <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images.length || !scene.trim()} gemsCost={2} label="Tạo bối cảnh" gemsBalance={gems} />,
        historyPanel: <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
    }, [images, scene, loading, result, history, historyLoading, gems])

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
                            <span>Ảnh đã tải lên. Hãy thiết lập thông số bên trái và nhấn xử lý!</span>
                        </div>
                    </div>
                ) : (
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        emptyHint="Đã xảy ra lỗi khi hiển thị kết quả."
                    />
                )
            }
        />
    )
}
