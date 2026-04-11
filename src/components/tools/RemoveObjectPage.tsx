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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const QUICK_SUGGESTIONS = [
    "Người đứng phía sau",
    "Watermark / logo",
    "Text chữ trên ảnh",
    "Vật thể thừa ở góc",
]

export function RemoveObjectPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("remove-object")
    const [images, setImages] = useState<string[]>([])
    const [description, setDescription] = useState("")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        if (!description.trim()) return toast.error("Vui lòng mô tả vật cần xóa")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.removeObject({ image: images[0], description })
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
        <ToolPageLayout title="Xóa vật thể" description="Mô tả vật thể thừa và AI sẽ xóa sạch, lấp đầy tự nhiên">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} />
                    <div className="space-y-2">
                        <Label>Mô tả vật cần xóa</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="VD: Xóa người đứng bên phải, xóa cái bàn ở góc trái..."
                            rows={3}
                            maxLength={500}
                        />
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_SUGGESTIONS.map((s) => (
                                <Badge
                                    key={s}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors text-[10px]"
                                    onClick={() => setDescription((prev) => prev ? `${prev}, ${s.toLowerCase()}` : s)}
                                >
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <ToolTipsCard tips={TOOL_TIPS['remove-object']} />
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0] || !description.trim()} gemsCost={2} label="Xóa vật thể" gemsBalance={gems} />
                </div>
                <div className="space-y-4">
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        beforeImageUrl={images[0]}
                        onUseAsInput={(url) => { setImages([url]); setResult(null) }}
                        emptyHint="Tải ảnh lên và mô tả vật cần xóa"
                    />
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
