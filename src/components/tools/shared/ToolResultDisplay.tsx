import { Download, Copy, Check, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ToolResultDisplayProps {
    imageUrl?: string | null
    textResult?: string | null
    loading?: boolean
    prompt?: string | null
}

export function ToolResultDisplay({ imageUrl, textResult, loading, prompt }: ToolResultDisplayProps) {
    const [copied, setCopied] = useState(false)

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
            <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border bg-muted/30 min-h-[300px]">
                <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Đang xử lý...</p>
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
            </div>
        )
    }

    if (imageUrl) {
        return (
            <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border bg-muted">
                    <img src={imageUrl} alt="Result" className="w-full max-h-[500px] object-contain" />
                </div>
                <div className="flex gap-2">
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
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border border-dashed border-border/50 min-h-[300px]">
            <div className="flex items-center justify-center size-12 rounded-xl bg-muted">
                <ImageIcon className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Kết quả sẽ hiển thị ở đây</p>
        </div>
    )
}
