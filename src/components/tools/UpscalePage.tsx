import { useState } from "react"
import { toast } from "sonner"
import { ToolPageLayout } from "./ToolPageLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function UpscalePage() {
    const { refreshUser } = useAuth()
    const [images, setImages] = useState<string[]>([])
    const [scaleFactor, setScaleFactor] = useState("2x")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.upscale({ image: images[0], scale_factor: scaleFactor })
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
        <ToolPageLayout title="Upscale ảnh" description="Phóng to ảnh lên 2x-4x mà vẫn giữ chi tiết sắc nét nhờ AI">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} />
                    <div className="space-y-2">
                        <Label>Hệ số phóng to</Label>
                        <ToggleGroup type="single" value={scaleFactor} onValueChange={(v) => v && setScaleFactor(v)} className="justify-start">
                            <ToggleGroupItem value="2x" className="rounded-full px-6 h-9 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">2x</ToggleGroupItem>
                            <ToggleGroupItem value="4x" className="rounded-full px-6 h-9 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">4x</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={2} label="Upscale" />
                </div>
                <ToolResultDisplay imageUrl={result} loading={loading} />
            </div>
        </ToolPageLayout>
    )
}
