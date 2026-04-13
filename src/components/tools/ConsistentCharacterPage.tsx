import { useState } from "react"
import { toast } from "sonner"
import { Info } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

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

    return (
        <ToolPageLayout
            title="Nhân vật AI"
            description="Tạo nhân vật riêng và giữ nhất quán qua mọi bối cảnh"
            controls={
                <>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                        <Info className="size-3.5 shrink-0 mt-0.5" />
                        <span>Dùng 2-3 ảnh cùng nhân vật từ các góc khác nhau để AI hiểu khuôn mặt và đặc điểm tốt hơn.</span>
                    </div>
                    <div className="space-y-2">
                        <Label>Ảnh nhân vật tham chiếu (1-3 ảnh)</Label>
                        <ToolImageUpload images={images} onImagesChange={setImages} multiple maxFiles={3} label="Tải ảnh nhân vật" />
                    </div>
                    <div className="space-y-2">
                        <Label>Mô tả bối cảnh mới</Label>
                        <Textarea
                            value={scene}
                            onChange={(e) => setScene(e.target.value)}
                            placeholder="VD: Nhân vật đứng trên đỉnh núi lúc hoàng hôn, mặc áo choàng đỏ..."
                            rows={4}
                            maxLength={2000}
                        />
                    </div>
                    <ToolTipsCard tips={TOOL_TIPS['consistent-character']} />
                </>
            }
            canvas={
                <>
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        emptyHint="Tải ảnh nhân vật và mô tả bối cảnh mới để bắt đầu"
                    />
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </>
            }
            submitButton={<ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images.length || !scene.trim()} gemsCost={2} gemsBalance={gems} />}
        />
    )
}
