import { useState, useCallback } from "react"
import { toast } from "sonner"
import { ToolWorkspaceLayout } from "./ToolWorkspaceLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { MaskPainter } from "./shared/MaskPainter"

import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Trash2, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"

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
        <ToolWorkspaceLayout
            title="Chỉnh sửa ảnh"
            icon={PenTool}
            hasInputImage={!!images[0]}
            currentInputUrl={images[0]}
            controls={
                <>
                    <ToolImageUpload images={images} onImagesChange={handleImagesChange} />
                    {images[0] && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Mode toggle */}
                            <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit">
                                <button
                                    onClick={() => setMode("remove")}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                                        mode === "remove"
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Trash2 className="size-3.5" />
                                    Xóa vật thể
                                </button>
                                <button
                                    onClick={() => setMode("replace")}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                                        mode === "replace"
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <PenTool className="size-3.5" />
                                    Thay thế nội dung
                                </button>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
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
                                        Tô trực tiếp lên phần ảnh bên trái để chọn chính xác vùng cần xóa, hoặc chỉ nhập mô tả bằng chữ để AI tự tìm
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </>
            }
            canvas={
                !images[0] ? (
                    <ToolImageUpload images={images} onImagesChange={handleImagesChange} variant="huge" className="w-full max-w-2xl mx-auto" label={mode === "remove" ? "Ảnh cần xóa vật thể" : "Ảnh cần thay thế nội dung"} />
                ) : loading || result ? (
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        beforeImageUrl={images[0]}
                        onUseAsInput={(url) => { handleImagesChange([url]) }}
                    />
                ) : (
                    <div className="w-full max-w-3xl flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
                        <div className="w-full bg-muted/20 p-4 rounded-xl border flex items-center justify-between shadow-sm">
                            <Label className="text-sm font-medium">{mode === "remove" ? "Vẽ 1 nét liền bao quanh vật thể hoặc vùng cần xóa" : "Vẽ 1 nét liền bao quanh vùng bạn muốn thay thế ảnh khác"}</Label>
                            <Button variant="outline" size="sm" onClick={() => handleImagesChange([])} className="h-8 text-xs">Đổi ảnh khởi tạo</Button>
                        </div>
                        <div className="w-full flex justify-center bg-muted/5 border rounded-2xl p-4 py-8 shadow-inner overflow-hidden relative">
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                            <MaskPainter imageUrl={images[0]} onMaskChange={setMaskBase64} />
                        </div>
                    </div>
                )
            }
            historyPanel={
                <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
            }
            submitButton={
                images[0] ? (
                    <ToolSubmitButton
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!images[0] || (mode === "replace" ? (!maskBase64 || !description.trim()) : (!maskBase64 && !description.trim()))}
                        gemsCost={2}
                        label={mode === "remove" ? "Xóa vật thể" : "Thay thế"}
                        gemsBalance={gems}
                    />
                ) : undefined
            }
        />
    )
}
