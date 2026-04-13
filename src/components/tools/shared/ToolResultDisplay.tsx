import { Download, Copy, Check, ArrowRight, RotateCcw, Wand2, ZoomIn, Eraser, Expand, PenTool, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { BeforeAfterSlider } from "./BeforeAfterSlider"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const CROSS_TOOLS = [
    { path: "/app/tools/style-transfer", label: "Chuyển phong cách", icon: Wand2 },
    { path: "/app/tools/upscale", label: "Upscale ảnh", icon: ZoomIn },
    { path: "/app/tools/remove-bg", label: "Xóa nền", icon: Eraser },
    { path: "/app/tools/image-edit", label: "Chỉnh sửa ảnh", icon: PenTool },
    { path: "/app/tools/extend", label: "Mở rộng ảnh", icon: Expand },
]

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
    const location = useLocation()

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

    const crossTools = CROSS_TOOLS.filter(t => !location.pathname.startsWith(t.path))

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-5 p-10 rounded-2xl border bg-gradient-to-b from-muted/50 to-muted/20 min-h-[300px]">
                <div className="relative">
                    <div className="size-14 rounded-full bg-primary/5" />
                    <div className="absolute inset-0 size-14 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 size-14 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-semibold">AI đang xử lý<span className="animate-pulse">...</span></p>
                    <p className="text-[11px] text-muted-foreground">Thường mất 10–30 giây</p>
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
            <div className="space-y-3 animate-in fade-in duration-300">
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1.5">
                                <ArrowRight className="size-3.5" />
                                Tiếp tục với...
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {crossTools.map((tool) => (
                                <DropdownMenuItem
                                    key={tool.path}
                                    onClick={() => navigate(`${tool.path}?input=${encodeURIComponent(imageUrl)}`)}
                                    className="gap-2 text-xs"
                                >
                                    <tool.icon className="size-3.5" />
                                    {tool.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border border-dashed border-border/40 min-h-[300px] bg-gradient-to-b from-muted/30 to-transparent">
            <div className="flex items-center justify-center size-14 rounded-2xl bg-muted/50">
                <Sparkles className="size-6 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{emptyHint || "Kết quả sẽ hiển thị ở đây"}</p>
                <p className="text-[10px] text-muted-foreground/60">Kết quả AI sẽ xuất hiện ở đây sau khi xử lý</p>
            </div>
        </div>
    )
}
