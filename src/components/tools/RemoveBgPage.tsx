import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"
import { Download, Eraser, Sparkles } from "lucide-react"
import { ToolWorkspaceLayout } from "./ToolWorkspaceLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { BackgroundPreviewer } from "./shared/BackgroundPreviewer"
import { useToolPanel } from "./ToolPanelContext"

import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const SUBJECT_TYPES = [
    { id: "auto", label: "Tự động", emoji: "✨" },
    { id: "person", label: "Người", emoji: "👤" },
    { id: "product", label: "Sản phẩm", emoji: "📦" },
    { id: "animal", label: "Động vật", emoji: "🐾" },
] as const

const EDGE_OPTIONS = [
    { id: "standard", label: "Tiêu chuẩn" },
    { id: "fine", label: "Mịn (tóc, lông)" },
    { id: "hard", label: "Sắc nét" },
] as const

export function RemoveBgPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("remove-bg")
    const [images, setImages] = useState<string[]>([])
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [subjectType, setSubjectType] = useState("auto")
    const [edgeRefine, setEdgeRefine] = useState("standard")

    useInputFromUrl(useCallback((url: string) => setImages([url]), []))
    const bgPreviewerRef = useRef<{ getCompositeDataUrl: () => string | null }>(null)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.removeBg({
                image: images[0],
                subject_type: subjectType,
                edge_refine: edgeRefine,
            })
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

    const handleDownloadWithBg = async () => {
        if (!result) return
        const compositeUrl = bgPreviewerRef.current?.getCompositeDataUrl()
        if (compositeUrl) {
            const a = document.createElement("a")
            a.href = compositeUrl
            a.download = `zdream-nobg-${Date.now()}.png`
            a.click()
        } else {
            try {
                const response = await fetch(result)
                const blob = await response.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `zdream-nobg-${Date.now()}.png`
                a.click()
                URL.revokeObjectURL(url)
            } catch { /* ignore */ }
        }
    }

    // Đẩy controls lên Dynamic Panel (Col 2) qua context
    useToolPanel({
        title: "Xóa nền ảnh",
        icon: Eraser,
        controls: (
            <div className={cn("space-y-4 animate-in fade-in transition-all duration-300", !images[0] ? "opacity-40 grayscale-[0.5] pointer-events-none select-none" : "")}>
                <div className="space-y-2">
                    <Label className="text-xs">Loại chủ thể</Label>
                    <div className="flex flex-wrap gap-1.5">
                        {SUBJECT_TYPES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSubjectType(t.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                    subjectType === t.id
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                )}
                            >
                                <span>{t.emoji}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs flex items-center justify-between">
                        Chất lượng viền
                        {!images[0] && <span className="text-[10px] text-muted-foreground font-normal italic">Xem trước</span>}
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                        {EDGE_OPTIONS.map((e) => (
                            <button
                                key={e.id}
                                onClick={() => setEdgeRefine(e.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                    edgeRefine === e.id
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                )}
                            >
                                {e.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        ),
        submitButton: <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={2} label="Xóa nền" gemsBalance={gems} />,
        historyPanel: <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />,
    }, [images, subjectType, edgeRefine, loading, result, history, historyLoading, gems])

    return (
        <ToolWorkspaceLayout
            canvas={
                !images[0] ? (
                    <ToolImageUpload images={images} onImagesChange={setImages} variant="huge" className="w-full max-w-2xl mx-auto" label="Ảnh Gốc Cần Xóa Nền" />
                ) : !result && !loading ? (
                    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                        <ToolImageUpload images={images} onImagesChange={setImages} className="border-0 bg-transparent shadow-none p-0" />
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 py-2.5 rounded-lg w-full">
                            <Sparkles className="size-4 animate-pulse text-primary" />
                            <span>Ảnh đã tải lên. Hãy thiết lập thông số bên trái và nhấn xử lý!</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <ToolResultDisplay
                            imageUrl={result}
                            loading={loading}
                            beforeImageUrl={images[0]}
                            onUseAsInput={(url) => { setImages([url]); setResult(null) }}
                            emptyHint="Ảnh đã được tải lên. Nhấn 'Xóa nền' để bắt đầu xử lý."
                        />
                        {result && (
                            <div className="flex flex-col items-center gap-3 mt-4 animate-in slide-in-from-bottom-2">
                                <BackgroundPreviewer ref={bgPreviewerRef} imageUrl={result} />
                                <Button size="sm" variant="outline" className="gap-1.5 shadow-sm" onClick={handleDownloadWithBg}>
                                    <Download className="size-3.5" />
                                    Tải về với nền đang chọn
                                </Button>
                            </div>
                        )}
                    </>
                )
            }
        />
    )
}
