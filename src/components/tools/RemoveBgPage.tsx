import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"
import { Download } from "lucide-react"
import { ToolPageLayout } from "./ToolPageLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolTipsCard } from "./shared/ToolTipsCard"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { BackgroundPreviewer } from "./shared/BackgroundPreviewer"
import { TOOL_TIPS } from "./shared/toolExamples"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

const SUBJECT_TYPES = [
    { id: "auto", label: "Tự động", desc: "AI tự nhận diện" },
    { id: "person", label: "Người", desc: "Chân dung, toàn thân" },
    { id: "product", label: "Sản phẩm", desc: "Đồ vật, thương mại" },
    { id: "animal", label: "Động vật", desc: "Thú cưng, hoang dã" },
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

    return (
        <ToolPageLayout title="Xóa nền ảnh" description="Tách chủ thể khỏi phông nền chỉ với một click">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} />

                    {/* Subject type — helps AI know what to preserve */}
                    <div className="space-y-2">
                        <Label>Loại chủ thể</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {SUBJECT_TYPES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSubjectType(t.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-0.5 p-2.5 rounded-xl border-2 transition-all text-center",
                                        subjectType === t.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                                    )}
                                >
                                    <span className="text-[11px] font-medium">{t.label}</span>
                                    <span className="text-[9px] text-muted-foreground leading-tight">{t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Edge quality */}
                    <div className="space-y-2">
                        <Label>Chất lượng viền</Label>
                        <ToggleGroup type="single" value={edgeRefine} onValueChange={(v) => v && setEdgeRefine(v)} className="justify-start">
                            <ToggleGroupItem value="standard" className="text-xs px-4 h-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Tiêu chuẩn</ToggleGroupItem>
                            <ToggleGroupItem value="fine" className="text-xs px-4 h-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Mịn (tóc, lông)</ToggleGroupItem>
                            <ToggleGroupItem value="hard" className="text-xs px-4 h-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Sắc nét</ToggleGroupItem>
                        </ToggleGroup>
                        <p className="text-[10px] text-muted-foreground">
                            {edgeRefine === "fine" ? "Tốt cho tóc, lông thú, chi tiết mịn" :
                             edgeRefine === "hard" ? "Tốt cho sản phẩm, kiến trúc, vật thể rõ ràng" :
                             "Phù hợp cho hầu hết ảnh"}
                        </p>
                    </div>

                    <ToolTipsCard tips={TOOL_TIPS['remove-bg']} />
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={2} label="Xóa nền" gemsBalance={gems} />
                </div>
                <div className="space-y-4">
                    <ToolResultDisplay
                        imageUrl={result}
                        loading={loading}
                        beforeImageUrl={images[0]}
                        onUseAsInput={(url) => { setImages([url]); setResult(null) }}
                        emptyHint="Tải ảnh lên để xóa nền tự động"
                    />
                    {result && (
                        <>
                            <BackgroundPreviewer ref={bgPreviewerRef} imageUrl={result} />
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleDownloadWithBg}>
                                <Download className="size-3.5" />
                                Tải về với nền đang chọn
                            </Button>
                        </>
                    )}
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
