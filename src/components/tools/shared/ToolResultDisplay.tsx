import { Download, Copy, Check, ImageIcon, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BeforeAfterSlider } from "./BeforeAfterSlider"

interface ToolResultDisplayProps {
    imageUrl?: string | null
    textResult?: string | null
    loading?: boolean
    prompt?: string | null
    beforeImageUrl?: string | null
    onUseAsInput?: (url: string) => void
    emptyHint?: string
    showGenerateFromPrompt?: boolean
}

export function ToolResultDisplay({
    imageUrl,
    textResult,
    loading,
    prompt,
    beforeImageUrl,
    onUseAsInput,
    emptyHint,
    showGenerateFromPrompt,
}: ToolResultDisplayProps) {
    const [copied, setCopied] = useState(false)
    const navigate = useNavigate()

    const handleDownload = async () => {
        if (!imageUrl) return
        try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `zdream-${Date.now()}.png`
            a.click()
            URL.revokeObjectURL(url)
        } catch { /* ignore */ }
    }

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl border bg-muted/30 min-h-[300px]">
                <div className="relative">
                    <div className="size-12 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 size-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium">AI đang xử lý ảnh<span className="animate-pulse">...</span></p>
                    <p className="text-[11px] text-muted-foreground">Thường mất 10-30 giây, vui lòng đợi</p>
                </div>
            </div>
        )
    }

    if (textResult) {
        return (
            <div className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Kết quả</h3>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => handleCopy(textResult)}>
                        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                        {copied ? "Đã sao chép" : "Sao chép"}
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{textResult}</p>
                {showGenerateFromPrompt && (
                    <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => navigate(`/app/generate?prompt=${encodeURIComponent(textResult)}`)}
                    >
                        <ArrowRight className="size-3.5" />
                        Tạo ảnh từ prompt này
                    </Button>
                )}
            </div>
        )
    }

    if (imageUrl) {
        return (
            <div className="space-y-3">
                {beforeImageUrl ? (
                    <BeforeAfterSlider beforeUrl={beforeImageUrl} afterUrl={imageUrl} />
                ) : (
                    <div className="relative rounded-xl overflow-hidden border bg-muted">
                        <img src={imageUrl} alt="Result" className="w-full max-h-[500px] object-contain" />
                    </div>
                )}
                <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={handleDownload}>
                        <Download className="size-3.5" />
                        Tải về
                    </Button>
                    {prompt && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleCopy(prompt)}>
                            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                            Prompt
                        </Button>
                    )}
                    {onUseAsInput && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onUseAsInput(imageUrl)}>
                            <RotateCcw className="size-3.5" />
                            Dùng làm đầu vào
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border border-dashed border-border/50 min-h-[300px]">
            <div className="flex items-center justify-center size-12 rounded-xl bg-muted">
                <ImageIcon className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center">{emptyHint || "Kết quả sẽ hiển thị ở đây"}</p>
        </div>
    )
}
