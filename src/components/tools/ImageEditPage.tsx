import { useState, useCallback } from "react"
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
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Trash2, PenTool } from "lucide-react"

type EditMode = "remove" | "replace"

export function ImageEditPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("image-edit")
    const [images, setImages] = useState<string[]>([])
    const [maskBase64, setMaskBase64] = useState("")
    const [description, setDescription] = useState("")
    const [mode, setMode] = useState<EditMode>("remove")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useInputFromUrl(useCallback((url: string) => setImages([url]), []))

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")

        if (mode === "replace") {
            if (!maskBase64) return toast.error("Vui lòng tô vùng cần thay thế trên ảnh")
            if (!description.trim()) return toast.error("Vui lòng mô tả nội dung thay thế")
        } else {
            if (!maskBase64 && !description.trim()) return toast.error("Vui lòng tô vùng cần xóa hoặc mô tả vật cần xóa")
        }

        setLoading(true)
        setResult(null)
        try {
            let res
            if (maskBase64) {
                const desc = mode === "remove"
                    ? (description.trim() || "Remove everything in the painted area completely and fill the background naturally, as if the object was never there")
                    : description
                res = await toolsApi.inpainting({ image: images[0], mask: maskBase64, description: desc })
            } else {
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
        <ToolPageLayout title="Chỉnh sửa ảnh" description="Tô lên vùng cần chỉnh sửa — xóa vật thể hoặc thay thế bằng nội dung mới">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {/* Mode toggle */}
                    <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as EditMode)} className="justify-start">
                        <ToggleGroupItem value="remove" className="gap-1.5 px-4 h-9 rounded-full text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                            <Trash2 className="size-3.5" />
                            Xóa vật thể
                        </ToggleGroupItem>
                        <ToggleGroupItem value="replace" className="gap-1.5 px-4 h-9 rounded-full text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                            <PenTool className="size-3.5" />
                            Thay thế nội dung
                        </ToggleGroupItem>
                    </ToggleGroup>

                    {/* Image upload or mask painter */}
                    {!images[0] ? (
                        <ToolImageUpload images={images} onImagesChange={handleImagesChange} label={mode === "remove" ? "Tải ảnh cần xóa vật thể" : "Tải ảnh cần chỉnh sửa"} />
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>{mode === "remove" ? "Tô lên vật thể cần xóa" : "Tô lên vùng cần thay thế"}</Label>
                                <button onClick={() => handleImagesChange([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    Đổi ảnh
                                </button>
                            </div>
                            <MaskPainter imageUrl={images[0]} onMaskChange={setMaskBase64} />
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>{mode === "remove" ? "Mô tả thêm (tùy chọn)" : "Nội dung thay thế"}</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={mode === "remove"
                                ? "VD: Xóa người đứng bên phải, xóa watermark..."
                                : "VD: Thay bằng bông hoa hồng đỏ, thêm cái ghế gỗ..."
                            }
                            rows={mode === "remove" ? 2 : 3}
                            maxLength={1000}
                        />
                    </div>

                    <ToolTipsCard tips={TOOL_TIPS['image-edit']} />
                    <ToolSubmitButton
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!images[0] || (mode === "replace" ? (!maskBase64 || !description.trim()) : (!maskBase64 && !description.trim()))}
                        gemsCost={2}
                        label={mode === "remove" ? "Xóa vật thể" : "Thay thế"}
                        gemsBalance={gems}
                    />
                </div>
                <div className="space-y-4">
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        beforeImageUrl={images[0]}
                        onUseAsInput={(url) => { handleImagesChange([url]) }}
                        emptyHint={mode === "remove" ? "Tải ảnh lên và tô vùng cần xóa" : "Tải ảnh → tô vùng → mô tả nội dung mới"}
                    />
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
