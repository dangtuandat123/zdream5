import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Copy, Check, ArrowRight, Loader2, Sparkles, Download, FileText } from "lucide-react"
import { ToolWorkspaceLayout } from "./ToolWorkspaceLayout"
import { ToolImageUpload } from "./shared/ToolImageUpload"
import { ToolResultDisplay } from "./shared/ToolResultDisplay"
import { ToolSubmitButton } from "./shared/ToolSubmitButton"
import { ToolHistoryPanel } from "./shared/ToolHistoryPanel"
import { useToolPanel } from "./ToolPanelContext"

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

    // Đẩy controls lên Dynamic Panel (Col 2)
    useToolPanel({
        title: "Ảnh thành Prompt",
        icon: FileText,
        controls: (
            <div className={cn("space-y-4 animate-in fade-in transition-all duration-300", !images[0] ? "opacity-40 grayscale-[0.5] pointer-events-none select-none" : "")}>
                <div className="space-y-2">
                    <Label className="text-xs flex items-center justify-between">
                        Ngôn ngữ prompt
                        {!images[0] && <span className="text-[10px] text-muted-foreground font-normal italic">Xem trước</span>}
                    </Label>
                    <div className="flex gap-1.5">
                        {[{ v: "en", l: "English" }, { v: "vi", l: "Tiếng Việt" }].map((lang) => (
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
            </div>
        ),
        submitButton: (
            <div className="space-y-4">
                <ToolSubmitButton
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!images[0]}
                    gemsCost={0}
                    label="Phân tích ảnh"
                    gemsBalance={gems}
                />
            </div>
        ),
        historyPanel: <ToolHistoryPanel history={history} loading={historyLoading} onSelectImage={(url) => setImages([url])} selectedUrl={result} />
    }, [images, language, loading, result, history, historyLoading, gems])

    return (
        <ToolWorkspaceLayout
            canvas={
                !images[0] ? (
                    <ToolImageUpload images={images} onImagesChange={setImages} variant="huge" className="w-full max-w-2xl mx-auto" label="Ảnh gốc cần dùng AI phân tích cấu trúc" />
                ) : (
                    <div className="w-full max-w-2xl flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
                        {loading && (
                            <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl border bg-muted/10 w-full min-h-[300px]">
                                <div className="relative">
                                    <div className="size-16 rounded-full border-4 border-primary/20" />
                                    <div className="absolute inset-0 size-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                </div>
                                <p className="text-sm font-medium">Hệ thống đang phân tích ảnh<span className="animate-pulse">...</span></p>
                            </div>
                        )}
                        {result && !loading && !generatedImage && (
                            <div className="space-y-4 w-full bg-muted/5 p-6 rounded-2xl border shadow-inner">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-5 text-primary" />
                                        <h3 className="font-semibold">Prompt được trích xuất</h3>
                                    </div>
                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleCopy}>
                                        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                                        {copied ? "Đã sao chép" : "Sao chép"}
                                    </Button>
                                </div>
                                <Textarea
                                    value={editedPrompt}
                                    onChange={(e) => setEditedPrompt(e.target.value)}
                                    rows={6}
                                    className="text-sm leading-relaxed resize-none font-mono"
                                    placeholder="Chỉnh sửa prompt trước khi tạo ảnh..."
                                />
                                <p className="text-[10px] text-muted-foreground">Bạn có thể tự do chỉnh sửa chi tiết prompt này trước khi tạo ảnh để đạt độ chính xác cao nhất.</p>
                            </div>
                        )}
                        {result && !loading && (
                            <Button
                                onClick={handleGenerateFromPrompt}
                                disabled={generating || !editedPrompt.trim() || (gems !== undefined && gems < 1)}
                                className="w-full h-11 gap-2 text-sm font-semibold"
                                size="lg"
                            >
                                {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                                {generating ? "Đang tạo ảnh..." : "Bắt đầu tạo ảnh mới từ prompt này (1 💎)"}
                            </Button>
                        )}
                        {generating && (
                            <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl border bg-muted/10 min-h-[200px] w-full">
                                <div className="relative">
                                    <div className="size-12 rounded-full border-2 border-primary/20" />
                                    <div className="absolute inset-0 size-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                </div>
                                <p className="text-sm font-medium">Hệ thống đang sinh ảnh theo prompt<span className="animate-pulse">...</span></p>
                            </div>
                        )}
                        {generatedImage && (
                            <div className="space-y-3 animate-in fade-in duration-200 w-full flex flex-col items-center">
                                <div className="rounded-xl overflow-hidden border bg-muted w-full max-w-2xl flex justify-center shadow-lg">
                                    <img src={generatedImage} alt="Generated" className="w-full object-contain" />
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button size="sm" className="gap-1.5 shadow-sm px-6" onClick={handleDownload}>
                                        <Download className="size-4" />
                                        Tải ảnh mới về máy
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setImages([generatedImage]); setResult(null); setEditedPrompt(""); setGeneratedImage(null) }}>
                                        <ArrowRight className="size-3.5" />
                                        Tiếp tục phân tích ảnh mới này
                                    </Button>
                                </div>
                            </div>
                        )}
                        {!loading && !result && !generating && !generatedImage && (
                             <ToolResultDisplay emptyHint="Ảnh đã được tải lên. Nhấn 'Phân tích ảnh' để trích xuất prompt." />
                        )}
                    </div>
                )
            }
        />
    )
}
