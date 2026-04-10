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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const RATIOS = ["1:1", "4:5", "9:16", "16:9"] as const

export function AdImagePage() {
    const { refreshUser } = useAuth()
    const [images, setImages] = useState<string[]>([])
    const [description, setDescription] = useState("")
    const [platform, setPlatform] = useState("facebook")
    const [aspectRatio, setAspectRatio] = useState("1:1")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh sản phẩm")
        if (!description.trim()) return toast.error("Vui lòng mô tả quảng cáo")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.adImage({ image: images[0], description, platform, aspect_ratio: aspectRatio })
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
        <ToolPageLayout title="Ảnh quảng cáo" description="Tạo ảnh quảng cáo sản phẩm bắt mắt cho Facebook, Instagram, TikTok">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} label="Tải ảnh sản phẩm" />
                    <div className="space-y-2">
                        <Label>Mô tả quảng cáo</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="VD: Quảng cáo cho chai nước hoa cao cấp, phong cách sang trọng..."
                            rows={3}
                            maxLength={1000}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nền tảng</Label>
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="tiktok">TikTok</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tỉ lệ</Label>
                            <ToggleGroup type="single" value={aspectRatio} onValueChange={(v) => v && setAspectRatio(v)} className="justify-start">
                                {RATIOS.map((r) => (
                                    <ToggleGroupItem key={r} value={r} className="text-xs px-2.5 h-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                        {r}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                    </div>
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0] || !description.trim()} gemsCost={2} />
                </div>
                <ToolResultDisplay imageUrl={result} loading={loading} />
            </div>
        </ToolPageLayout>
    )
}
