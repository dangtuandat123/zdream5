import { useState } from "react"
import { toast } from "sonner"
import { Shuffle } from "lucide-react"
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
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function ImageVariationPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("image-variation")
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
            refreshHistory()
            toast.success(res.message)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const strengthLabel = strength > 0.7 ? "Mạnh mẽ" : strength > 0.4 ? "Cân bằng" : "Tinh tế"
    const strengthColor = strength > 0.7 ? "text-red-400" : strength > 0.4 ? "text-yellow-400" : "text-green-400"

    return (
        <ToolPageLayout title="Biến thể ảnh" description="Upload ảnh gốc và tạo ra phiên bản tương tự với phong cách khác nhau">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} />
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Mức độ biến đổi</Label>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${strengthColor}`}>{strengthLabel} ({strength.toFixed(1)})</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-6"
                                    onClick={() => setStrength(Math.round((Math.random() * 0.9 + 0.1) * 10) / 10)}
                                >
                                    <Shuffle className="size-3" />
                                </Button>
                            </div>
                        </div>
                        <Slider value={[strength]} onValueChange={([v]) => setStrength(v)} min={0.1} max={1} step={0.1} />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Tinh tế</span>
                            <span>Cân bằng</span>
                            <span>Mạnh mẽ</span>
                        </div>
                    </div>
                    <ToolTipsCard tips={TOOL_TIPS['image-variation']} />
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={2} gemsBalance={gems} />
                </div>
                <div className="space-y-4">
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        beforeImageUrl={images[0]}
                        onUseAsInput={(url) => { setImages([url]); setResult(null) }}
                        emptyHint="Tải ảnh lên và điều chỉnh cường độ biến đổi"
                    />
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
