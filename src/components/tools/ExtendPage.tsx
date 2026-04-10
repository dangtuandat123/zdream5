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
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

const DIRECTIONS = [
    { id: "top", label: "Trên", icon: ArrowUp },
    { id: "bottom", label: "Dưới", icon: ArrowDown },
    { id: "left", label: "Trái", icon: ArrowLeft },
    { id: "right", label: "Phải", icon: ArrowRight },
] as const

export function ExtendPage() {
    const { refreshUser } = useAuth()
    const [images, setImages] = useState<string[]>([])
    const [directions, setDirections] = useState<string[]>([])
    const [description, setDescription] = useState("")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const toggleDirection = (dir: string) => {
        setDirections((prev) => prev.includes(dir) ? prev.filter((d) => d !== dir) : [...prev, dir])
    }

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        if (!directions.length) return toast.error("Vui lòng chọn hướng mở rộng")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.extend({ image: images[0], directions, description: description || undefined })
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
        <ToolPageLayout title="Mở rộng ảnh" description="Kéo dãn viền ảnh ra ngoài khung hình gốc, AI tự sinh nội dung phù hợp">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} />
                    <div className="space-y-2">
                        <Label>Hướng mở rộng</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {DIRECTIONS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => toggleDirection(id)}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                                        directions.includes(id) ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                                    )}
                                >
                                    <Icon className="size-4" />
                                    <span className="text-xs font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Mô tả nội dung mở rộng (tùy chọn)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="VD: Mở rộng thêm bầu trời và cây cối..."
                            rows={2}
                            maxLength={1000}
                        />
                    </div>
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0] || !directions.length} gemsCost={2} label="Mở rộng" />
                </div>
                <ToolResultDisplay imageUrl={result} loading={loading} />
            </div>
        </ToolPageLayout>
    )
}
