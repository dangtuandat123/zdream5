import { useState } from "react"
import { toast } from "sonner"
import { ToolPageLayout } from "./ToolPageLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { toolsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const STYLES = [
    { id: "anime", label: "Anime", emoji: "🎌" },
    { id: "oil-painting", label: "Sơn dầu", emoji: "🖼️" },
    { id: "watercolor", label: "Màu nước", emoji: "🎨" },
    { id: "cyberpunk", label: "Cyberpunk", emoji: "🌃" },
    { id: "pixel-art", label: "Pixel Art", emoji: "👾" },
    { id: "3d-render", label: "3D Render", emoji: "💎" },
] as const

export function StyleTransferPage() {
    const { refreshUser } = useAuth()
    const [images, setImages] = useState<string[]>([])
    const [style, setStyle] = useState<string>("anime")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.styleTransfer({ image: images[0], target_style: style })
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
        <ToolPageLayout title="Chuyển phong cách" description="Biến ảnh thường thành tranh anime, sơn dầu, hoạt hình, cyberpunk,...">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} label="Tải ảnh gốc" />
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Chọn phong cách</label>
                        <div className="grid grid-cols-3 gap-2">
                            {STYLES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStyle(s.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",
                                        style === s.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                                    )}
                                >
                                    <span className="text-2xl">{s.emoji}</span>
                                    <span className="text-xs font-medium">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={2} />
                </div>
                <ToolResultDisplay imageUrl={result} loading={loading} />
            </div>
        </ToolPageLayout>
    )
}
