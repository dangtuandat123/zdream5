import { useState, useCallback } from "react"
import { toast } from "sonner"
import { ToolPageShell } from "./shared/ToolPageShell"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolCanvasGrid } from "./shared/ToolCanvasGrid"
import { MaskPainter } from "./shared/MaskPainter"

import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
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

    const controls = (
        <div className="space-y-4">
            {/* Mode toggle */}
            <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit">
                <button
                    onClick={() => setMode("remove")}
                    className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                        mode === "remove" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Trash2 className="size-3.5" />
                    Xóa vật thể
                </button>
                <button
                    onClick={() => setMode("replace")}
                    className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                        mode === "replace" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <PenTool className="size-3.5" />
                    Thay thế nội dung
                </button>
            </div>

            {!images[0] ? (
                <ToolImageUpload images={images} onImagesChange={handleImagesChange} label={mode === "remove" ? "Tải ảnh cần xóa vật thể" : "Tải ảnh cần chỉnh sửa"} />
            ) : (
                <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs">{mode === "remove" ? "Tô lên vật thể cần xóa" : "Tô lên vùng cần thay thế"}</Label>
                        <button onClick={() => handleImagesChange([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Đổi ảnh
                        </button>
                    </div>
                    <MaskPainter imageUrl={images[0]} onMaskChange={setMaskBase64} />
                </div>
            )}

            {images[0] && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={mode === "remove"
                            ? "VD: Xóa người đứng bên phải, xóa watermark..."
                            : "VD: Thay bằng bông hoa hồng đỏ, thêm cái ghế gỗ..."
                        }
                        rows={mode === "remove" ? 2 : 3}
                        maxLength={1000}
                        className="text-sm"
                    />
                    {mode === "remove" && !maskBase64 && (
                        <p className="text-[10px] text-muted-foreground">
                            💡 Tô trực tiếp lên ảnh để chọn chính xác vùng cần xóa, hoặc chỉ nhập mô tả để AI tự tìm
                        </p>
                    )}
                </div>
            )}
        </div>
    )

    return (
        <ToolPageShell
            title="Chỉnh sửa ảnh"
            description="Tô lên vùng cần chỉnh sửa — xóa vật thể hoặc thay thế bằng nội dung mới"
            icon={PenTool}
            gradient="bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent"
            hasCanvasContent={!!result || loading || history.length > 0}
            controls={controls}
            submitButton={
                <ToolSubmitButton
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!images[0] || (mode === "replace" ? (!maskBase64 || !description.trim()) : (!maskBase64 && !description.trim()))}
                    gemsCost={2}
                    label={mode === "remove" ? "Xóa vật thể" : "Thay thế"}
                    gemsBalance={gems}
                />
            }
            canvas={
                <ToolCanvasGrid
                    resultUrl={result}
                    loading={loading}
                    history={history}
                    historyLoading={historyLoading}
                    emptyHint={mode === "remove" ? "Tải ảnh lên và tô vùng cần xóa" : "Tải ảnh → tô vùng → mô tả nội dung mới"}
                    onUseAsInput={(url) => handleImagesChange([url])}
                />
            }
        />
    )
}
