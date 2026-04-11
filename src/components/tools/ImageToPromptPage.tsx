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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function ImageToPromptPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("image-to-prompt")
    const [images, setImages] = useState<string[]>([])
    const [language, setLanguage] = useState("en")
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        setLoading(true)
        setResult(null)
        try {
            const res = await toolsApi.imageToPrompt({ image: images[0] })
            setResult(res.result.prompt)
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
        <ToolPageLayout title="Ảnh thành Prompt" description="AI phân tích ảnh và viết prompt chi tiết để bạn tái tạo hoặc cải tiến">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} />
                    <div className="space-y-2">
                        <Label>Ngôn ngữ prompt</Label>
                        <ToggleGroup type="single" value={language} onValueChange={(v) => v && setLanguage(v)} className="justify-start">
                            <ToggleGroupItem value="en" className="text-xs px-4 h-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">English</ToggleGroupItem>
                            <ToggleGroupItem value="vi" className="text-xs px-4 h-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Tiếng Việt</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <ToolTipsCard tips={TOOL_TIPS['image-to-prompt']} />
                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={1} label="Phân tích" gemsBalance={gems} />
                </div>
                <div className="space-y-4">
                    <ToolResultDisplay
                        textResult={result}
                        loading={loading}
                        showGenerateFromPrompt
                        emptyHint="Tải ảnh lên để AI phân tích và viết prompt"
                    />
                    <ToolHistoryPanel history={history} loading={historyLoading} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
