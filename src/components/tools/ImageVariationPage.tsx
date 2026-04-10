import { useState } from "react"
import { toast } from "sonner"
import { ToolPageLayout } from "./ToolPageLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export function ImageVariationPage() {
    const { refreshUser } = useAuth()
    const [images, setImages] = useState<string[]>([])
    const [strength, setStrength] = useState(0.5)
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.imageVariation({ image: images[0], strength })
            setResult(res.image.file_url)
            refreshUser()
            toast.success(res.message)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const strengthLabel = strength > 0.7 ? "Mạnh" : strength > 0.4 ? "Trung bình" : "Nhẹ"

    return (
        <ToolPageLayout title="Biến thể ảnh" description="Upload ảnh gốc và tạo ra phiên bản tương tự với phong cách khác nhau">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} />
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Mức độ biến đổi</Label>
                            <span className="text-xs text-muted-foreground">{strengthLabel} ({strength.toFixed(1)})</span>
                        </div>
                        <Slider value={[strength]} onValueChange={([v]) => setStrength(v)} min={0.1} max={1} step={0.1} />
                    </div>
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={2} />
                </div>
                <ToolResultDisplay imageUrl={result} loading={loading} />
            </div>
        </ToolPageLayout>
    )
}
