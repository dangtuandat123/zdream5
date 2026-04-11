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
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const BG_OPTIONS = [
    { id: "transparent", label: "Trong suốt", color: "bg-[conic-gradient(#80808040_25%,transparent_25%,transparent_50%,#80808040_50%,#80808040_75%,transparent_75%)]" },
    { id: "white", label: "Trắng", color: "bg-white" },
    { id: "black", label: "Đen", color: "bg-black" },
] as const

export function RemoveBgPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("remove-bg")
    const [images, setImages] = useState<string[]>([])
    const [bgOption, setBgOption] = useState("transparent")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.removeBg({ image: images[0] })
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
        <ToolPageLayout title="Xóa nền ảnh" description="Tách chủ thể khỏi phông nền chỉ với một click">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} />
                    <div className="space-y-2">
                        <Label>Màu nền thay thế</Label>
                        <div className="flex gap-2">
                            {BG_OPTIONS.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setBgOption(opt.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium",
                                        bgOption === opt.id ? "border-primary" : "border-border/50 hover:border-primary/30"
                                    )}
                                >
                                    <span className={cn("size-4 rounded border border-border/50 shrink-0", opt.color, opt.id === "transparent" && "bg-[length:8px_8px]")} />
                                    {opt.label}
                                </button>
                            ))}
                        </div>
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
                    <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setResult(url)} selectedUrl={result} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
