import { useState } from "react"
import { toast } from "sonner"
import { ToolPageLayout } from "./ToolPageLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function InpaintingPage() {
    const { refreshUser } = useAuth()
    const [images, setImages] = useState<string[]>([])
    const [mask, setMask] = useState<string[]>([])
    const [description, setDescription] = useState("")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh gốc")
        if (!mask[0]) return toast.error("Vui lòng tải ảnh mask")
        if (!description.trim()) return toast.error("Vui lòng mô tả nội dung thay thế")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.inpainting({ image: images[0], mask: mask[0], description })
            setResult(res.image.file_url)
            refreshUser()
            toast.success(res.message)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ToolPageLayout title="Chỉnh sửa vùng chọn" description="Khoanh vùng bất kỳ trên ảnh và mô tả nội dung mới để AI vẽ lại">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Ảnh gốc</Label>
                        <ToolImageUpload images={images} onImagesChange={setImages} label="Tải ảnh gốc" />
                    </div>
                    <div className="space-y-2">
                        <Label>Ảnh mask (vùng trắng = vùng cần sửa)</Label>
                        <ToolImageUpload images={mask} onImagesChange={setMask} label="Tải ảnh mask" />
                    </div>
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
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0] || !mask[0] || !description.trim()} gemsCost={2} label="Chỉnh sửa" />
                </div>
                <ToolResultDisplay imageUrl={result} loading={loading} />
            </div>
        </ToolPageLayout>
    )
}
