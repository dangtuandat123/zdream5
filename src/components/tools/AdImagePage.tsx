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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const PLATFORM_RATIOS: Record<string, string> = {
    facebook: "16:9",
    instagram: "1:1",
    tiktok: "9:16",
}

const RATIOS = ["1:1", "4:5", "9:16", "16:9"] as const

export function AdImagePage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("ad-image")
    const [images, setImages] = useState<string[]>([])
    const [description, setDescription] = useState("")
    const [platform, setPlatform] = useState("facebook")
    const [aspectRatio, setAspectRatio] = useState("16:9")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handlePlatformChange = (value: string) => {
        setPlatform(value)
        setAspectRatio(PLATFORM_RATIOS[value] || "1:1")
    }

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh sản phẩm")
        if (!description.trim()) return toast.error("Vui lòng mô tả quảng cáo")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.adImage({ image: images[0], description, platform, aspect_ratio: aspectRatio })
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
        <ToolPageLayout title="Ảnh quảng cáo" description="Tạo ảnh quảng cáo sản phẩm bắt mắt cho Facebook, Instagram, TikTok">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} label="Tải ảnh sản phẩm" />
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Mô tả quảng cáo</Label>
                            <span className="text-[10px] text-muted-foreground">{description.length}/1000</span>
                        </div>
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
                            <Select value={platform} onValueChange={handlePlatformChange}>
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
                    <ToolTipsCard tips={TOOL_TIPS['ad-image']} />
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0] || !description.trim()} gemsCost={2} gemsBalance={gems} />
                </div>
                <div className="space-y-4">
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        emptyHint="Tải ảnh sản phẩm và mô tả quảng cáo để bắt đầu"
                    />
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
