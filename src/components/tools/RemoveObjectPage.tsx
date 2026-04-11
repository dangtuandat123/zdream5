import { useState } from "react"
import { toast } from "sonner"
import { ToolPageLayout } from "./ToolPageLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolTipsCard } from "./shared/ToolTipsCard"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { MaskPainter } from "./shared/MaskPainter"
import { TOOL_TIPS } from "./shared/toolExamples"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function RemoveObjectPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("remove-object")
    const [images, setImages] = useState<string[]>([])
    const [maskBase64, setMaskBase64] = useState("")
    const [description, setDescription] = useState("")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        if (!maskBase64 && !description.trim()) return toast.error("Vui lòng tô vùng cần xóa hoặc mô tả vật cần xóa")

        setLoading(true)
        setResult(null)
        try {
            let res
            if (maskBase64) {
                // Dùng inpainting API khi có mask — chính xác hơn
                res = await toolsApi.inpainting({
                    image: images[0],
                    mask: maskBase64,
                    description: description.trim() || "Remove everything in the painted area completely and fill the background naturally, as if the object was never there",
                })
            } else {
                // Fallback: chỉ có text description
                res = await toolsApi.removeObject({ image: images[0], description })
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

    const handleImagesChange = (newImages: string[]) => {
        setImages(newImages)
        setMaskBase64("")
        setResult(null)
    }

    return (
        <ToolPageLayout title="Xóa vật thể" description="Tô lên vật thể thừa trên ảnh và AI sẽ xóa sạch, lấp đầy tự nhiên">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {!images[0] ? (
                        <ToolImageUpload images={images} onImagesChange={handleImagesChange} />
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Tô lên vật thể cần xóa</Label>
                                <button onClick={() => handleImagesChange([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    Đổi ảnh
                                </button>
                            </div>
                            <MaskPainter imageUrl={images[0]} onMaskChange={setMaskBase64} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Mô tả thêm (tùy chọn)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="VD: Xóa người đứng bên phải, xóa watermark..."
                            rows={2}
                            maxLength={500}
                        />
                    </div>
                    <ToolTipsCard tips={TOOL_TIPS['remove-object']} />
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0] || (!maskBase64 && !description.trim())} gemsCost={2} label="Xóa vật thể" gemsBalance={gems} />
                </div>
                <div className="space-y-4">
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        beforeImageUrl={images[0]}
                        onUseAsInput={(url) => { handleImagesChange([url]) }}
                        emptyHint="Tải ảnh lên và tô vùng cần xóa"
                    />
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
