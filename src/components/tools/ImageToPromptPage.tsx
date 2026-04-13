import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Copy, Check, ArrowRight, Loader2, Sparkles, Download, FileText } from "lucide-react"
import { ToolPageLayout } from "./ToolPageLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"

import { toolsApi, imageApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToolHistory } from "@/hooks/use-tool-history"
import { useInputFromUrl } from "@/hooks/use-input-from-url"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function ImageToPromptPage() {
    const { refreshUser, gems } = useAuth()
    const { history, loading: historyLoading, refresh: refreshHistory } = useToolHistory("image-to-prompt")
    const [images, setImages] = useState<string[]>([])
    const [language, setLanguage] = useState("en")
    const [result, setResult] = useState<string | null>(null)
    const [editedPrompt, setEditedPrompt] = useState("")
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    useInputFromUrl(useCallback((url: string) => setImages([url]), []))

    // Generate from prompt state
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [generating, setGenerating] = useState(false)

    const handleSubmit = async () => {
        if (!images[0]) return toast.error("Vui lòng tải ảnh lên")
        setLoading(true)
        setResult(null)
        setGeneratedImage(null)
        try {
            const res = await toolsApi.imageToPrompt({ image: images[0], language })
            setResult(res.result.prompt)
            setEditedPrompt(res.result.prompt)
            refreshUser()
            refreshHistory()
            toast.success(res.message)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async () => {
        if (!editedPrompt) return
        await navigator.clipboard.writeText(editedPrompt)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleGenerateFromPrompt = async () => {
        if (!editedPrompt.trim()) return toast.error("Prompt trống")
        setGenerating(true)
        setGeneratedImage(null)
        try {
            const res = await imageApi.generate({ prompt: editedPrompt })
            if (res.images?.[0]?.file_url) {
                setGeneratedImage(res.images[0].file_url)
                refreshUser()
                toast.success("Tạo ảnh thành công!")
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setGenerating(false)
        }
    }

    const handleDownload = async () => {
        if (!generatedImage) return
        try {
            const response = await fetch(generatedImage)
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `zdream-from-prompt-${Date.now()}.png`
            a.click()
            URL.revokeObjectURL(url)
        } catch { /* ignore */ }
    }

    return (
        <ToolPageLayout
            title="Ảnh thành Prompt"
            description="AI phân tích ảnh và viết prompt chi tiết để bạn tái tạo hoặc cải tiến"
            icon={FileText}
            gradient="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <ToolImageUpload images={images} onImagesChange={setImages} />

                    {/* Language — compact inline chips */}
                    <div className="space-y-2">
                        <Label className="text-xs">Ngôn ngữ prompt</Label>
                        <div className="flex gap-1.5">
                            {[{ v: "en", l: "🇬🇧 English" }, { v: "vi", l: "🇻🇳 Tiếng Việt" }].map((lang) => (
                                <button
                                    key={lang.v}
                                    onClick={() => setLanguage(lang.v)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                        language === lang.v
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                    )}
                                >
                                    {lang.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ToolSubmitButton onClick={handleSubmit} loading={loading} disabled={!images[0]} gemsCost={1} label="Phân tích" gemsBalance={gems} />
                </div>
                <div className="space-y-4">
                    {loading ? (
                        <ToolResultDisplay loading={loading} emptyHint="" />
                    ) : result ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Editable prompt result */}
                            <div className="rounded-xl border bg-card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">Prompt được tạo</h3>
                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleCopy}>
                                        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                                        {copied ? "Đã sao chép" : "Sao chép"}
                                    </Button>
                                </div>
                                <Textarea
                                    value={editedPrompt}
                                    onChange={(e) => setEditedPrompt(e.target.value)}
                                    rows={5}
                                    className="text-sm leading-relaxed resize-none"
                                    placeholder="Chỉnh sửa prompt trước khi tạo ảnh..."
                                />
                                <p className="text-[10px] text-muted-foreground">Chỉnh sửa prompt phía trên rồi nhấn tạo ảnh — không cần rời trang</p>
                            </div>

                            {/* Generate button inline */}
                            <Button
                                onClick={handleGenerateFromPrompt}
                                disabled={generating || !editedPrompt.trim() || (gems !== undefined && gems < 1)}
                                className="w-full h-11 gap-2 text-sm font-semibold"
                                size="lg"
                            >
                                {generating ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Sparkles className="size-4" />
                                )}
                                {generating ? "Đang tạo ảnh..." : "Tạo ảnh từ prompt (1 💎)"}
                            </Button>

                            {/* Generated image result */}
                            {generating && (
                                <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl border bg-muted/30 min-h-[200px]">
                                    <div className="relative">
                                        <div className="size-12 rounded-full border-2 border-primary/20" />
                                        <div className="absolute inset-0 size-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                    </div>
                                    <p className="text-sm font-medium">Đang tạo ảnh từ prompt<span className="animate-pulse">...</span></p>
                                </div>
                            )}
                            {generatedImage && (
                                <div className="space-y-3 animate-in fade-in duration-200">
                                    <div className="rounded-xl overflow-hidden border bg-muted">
                                        <img src={generatedImage} alt="Generated" className="w-full max-h-[400px] object-contain" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="gap-1.5" onClick={handleDownload}>
                                            <Download className="size-3.5" />
                                            Tải về
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setImages([generatedImage]); setResult(null); setEditedPrompt(""); setGeneratedImage(null) }}>
                                            <ArrowRight className="size-3.5" />
                                            Phân tích lại ảnh này
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <ToolResultDisplay emptyHint="Tải ảnh lên để AI phân tích và viết prompt" />
                    )}
                    <ToolHistoryPanel history={history} loading={historyLoading} />
                </div>
            </div>
        </ToolPageLayout>
    )
}
