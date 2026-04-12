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

export function InpaintingPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("inpainting")
    const [images, setImages] = useState<string[]>([])
    const [maskBase64, setMaskBase64] = useState("")
    const [description, setDescription] = useState("")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh gốc")
        if (!maskBase64) return toast.error("Vui lòng tô vùng cần chỉnh sửa trên ảnh")
        if (!description.trim()) return toast.error("Vui lòng mô tả nội dung thay thế")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.inpainting({ image: images[0], mask: maskBase64, description })
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
        <ToolPageLayout title="Chỉnh sửa vùng chọn" description="Tô lên vùng cần sửa trên ảnh, mô tả nội dung mới và AI sẽ vẽ lại">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {!images[0] ? (
                        <ToolImageUpload images={images} onImagesChange={handleImagesChange} label="Tải ảnh cần chỉnh sửa" />
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Tô vùng cần chỉnh sửa</Label>
                                <button onClick={() => handleImagesChange([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    Đổi ảnh
                                </button>
                            </div>
                            <MaskPainter imageUrl={images[0]} onMaskChange={setMaskBase64} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Nội dung thay thế</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="VD: Thay thế bằng một bông hoa hồng đỏ, thêm cái ghế gỗ..."
                            rows={3}
                            maxLength={1000}
                        />
                    </div>
                    <ToolTipsCard tips={TOOL_TIPS['inpainting']} />
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0] || !maskBase64 || !description.trim()} gemsCost={2} label="Chỉnh sửa" gemsBalance={gems} />
                </div>
                <div className="space-y-4">
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        beforeImageUrl={images[0]}
                        onUseAsInput={(url) => { handleImagesChange([url]) }}
                        emptyHint="Tải ảnh → tô vùng cần sửa → mô tả nội dung mới"
                    />
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
