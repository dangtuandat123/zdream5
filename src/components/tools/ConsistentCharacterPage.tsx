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

export function ConsistentCharacterPage() {
    const { refreshUser } = useAuth()
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
            toast.success(res.message)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ToolPageLayout title="Nhân vật AI" description="Tạo nhân vật riêng và giữ nhất quán qua mọi bối cảnh">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images.length || !scene.trim()} gemsCost={2} />
                </div>
                <ToolResultDisplay imageUrl={result} loading={loading} />
            </div>
        </ToolPageLayout>
    )
}
