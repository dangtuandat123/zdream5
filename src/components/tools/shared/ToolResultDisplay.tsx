import { Download, Copy, Check, ArrowRight, RotateCcw, Wand2, ZoomIn, Eraser, Expand, PenTool, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { BeforeAfterSlider } from "./BeforeAfterSlider"
import { getDynamicGridClass } from "./ToolHelpers"
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

// Loading với hiệu ứng background đổi màu
function LoadingProgress({ expectedCount = 1 }: { expectedCount?: number }) {
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => setElapsed(s => s + 1), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center gap-7 py-16 px-10 rounded-2xl border border-border/40 min-h-[360px] relative overflow-hidden bg-background">

            {/* Animated color-shifting blobs — opacity cao cho dark mode */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                
                <div
                    className="absolute size-96 rounded-full blur-[80px] top-[-20%] left-[-15%]"
                    style={{
                        background: 'linear-gradient(135deg, #a855f7, #3b82f6, #06b6d4)',
                        animation: 'loadingBlob1 6s ease-in-out infinite alternate',
                    }}
                />
                <div
                    className="absolute size-80 rounded-full blur-[80px] bottom-[-20%] right-[-10%]"
                    style={{
                        background: 'linear-gradient(225deg, #f472b6, #8b5cf6, #6366f1)',
                        animation: 'loadingBlob2 8s ease-in-out infinite alternate',
                    }}
                />
                
                {/* Sweep light */}
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-sweep" />
            </div>

            {/* Inline keyframes */}
            <style>{`
                @keyframes loadingBlob1 {
                    0% { transform: translate(0, 0) scale(1); opacity: 0.25; }
                    33% { transform: translate(25%, 15%) scale(1.15); opacity: 0.35; }
                    66% { transform: translate(-10%, 30%) scale(0.95); opacity: 0.2; }
                    100% { transform: translate(15%, 5%) scale(1.1); opacity: 0.3; }
                }
                @keyframes loadingBlob2 {
                    0% { transform: translate(0, 0) scale(1); opacity: 0.2; }
                    50% { transform: translate(-25%, -15%) scale(1.2); opacity: 0.35; }
                    100% { transform: translate(10%, -20%) scale(0.9); opacity: 0.15; }
                }
                @keyframes sweep {
                    0% { top: 0%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>

            {/* Spinner */}
            <div className="relative size-[72px] z-10">
                {/* Vòng ngoài quay chậm */}
                <div className="absolute inset-0 rounded-full border-[1.5px] border-primary/20" />
                <div
                    className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-primary/70 animate-spin"
                    style={{ animationDuration: '1.8s' }}
                />
                {/* Vòng trong quay ngược */}
                <div className="absolute inset-2.5 rounded-full border border-primary/15" />
                <div
                    className="absolute inset-2.5 rounded-full border border-transparent border-b-primary/50 animate-spin"
                    style={{ animationDuration: '2.5s', animationDirection: 'reverse' }}
                />
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="size-5 text-primary animate-pulse" style={{ animationDuration: '2s' }} />
                </div>
            </div>

            {/* Text */}
            <div className="text-center space-y-1.5 relative z-10">
                <p className="text-[13px] font-medium text-foreground/90">
                    {expectedCount > 1 ? `AI đang xử lý ${expectedCount} ảnh` : 'AI đang xử lý'}
                    <span className="animate-pulse">...</span>
                </p>
                <p className="text-[11px] text-muted-foreground/70 tabular-nums">
                    {elapsed > 0 && <>{elapsed}s · </>}Thường mất 15–40 giây
                </p>
            </div>
        </div>
    )
}

interface ToolResultDisplayProps {
    imageUrl?: string | null
    images?: string[] | null
    expectedCount?: number
    aspectRatio?: string
    textResult?: string | null
    loading?: boolean
    prompt?: string | null
    beforeImageUrl?: string | null
    onUseAsInput?: (url: string) => void
    emptyHint?: string
    showGenerateFromPrompt?: boolean
    infoContent?: React.ReactNode
}

export function ToolResultDisplay({
    imageUrl,
    images: imagesProp,
    expectedCount = 1,
    aspectRatio,
    textResult,
    loading,
    prompt,
    beforeImageUrl,
    onUseAsInput,
    emptyHint,
    showGenerateFromPrompt,
    infoContent,
}: ToolResultDisplayProps) {
    const [copied, setCopied] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const handleDownloadUrl = async (url: string) => {
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = blobUrl
            a.download = `zdream-${Date.now()}.png`
            a.click()
            URL.revokeObjectURL(blobUrl)
        } catch { /* ignore */ }
    }

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const crossTools = CROSS_TOOLS.filter(t => !location.pathname.startsWith(t.path))

    const displayImages = imagesProp && imagesProp.length > 0 ? imagesProp : (imageUrl ? [imageUrl] : [])

    if (loading) {
        return <LoadingProgress expectedCount={expectedCount} />
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

    if (displayImages.length > 0) {
        return (
            <div className="space-y-4 animate-in fade-in duration-300 w-full">
                {beforeImageUrl && displayImages[0] ? (
                    <BeforeAfterSlider beforeUrl={beforeImageUrl} afterUrl={displayImages[0]} />
                ) : (
                    <div className={displayImages.length > 1 ? getDynamicGridClass(displayImages.length, aspectRatio) : "relative w-full overflow-hidden"}>
                        {displayImages.map((src, idx) => (
                            <div key={idx} className="relative rounded-xl overflow-hidden border bg-muted shadow-sm group">
                                <img src={src} alt={`Result ${idx + 1}`} className="w-full max-h-[500px] object-contain" />
                                
                                {/* Bottom-anchored action toolbar for multi-image overlay */}
                                {displayImages.length > 1 && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-center gap-1.5">
                                            <Button size="sm" variant="secondary" onClick={() => handleDownloadUrl(src)} className="gap-1.5 h-8 text-xs rounded-lg hover:bg-white hover:text-black transition-colors px-3">
                                                <Download className="size-3.5 shrink-0" />
                                                Tải xuống
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="secondary" className="gap-1.5 h-8 text-xs rounded-lg hover:bg-white hover:text-black transition-colors px-3">
                                                        <ArrowRight className="size-3.5 shrink-0" />
                                                        Xử lý tiếp
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side="top" align="center" className="rounded-xl border-border/40 shadow-xl mb-1">
                                                    {crossTools.map((tool) => (
                                                        <DropdownMenuItem
                                                            key={tool.path}
                                                            onClick={() => navigate(`${tool.path}?input=${encodeURIComponent(src)}`)}
                                                            className="gap-2.5 text-xs py-2 px-3 cursor-pointer"
                                                        >
                                                            <tool.icon className="size-3.5 text-muted-foreground" />
                                                            <span className="font-medium">{tool.label}</span>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {infoContent && (
                    <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground mt-2 mb-1">
                        {infoContent}
                    </div>
                )}
                
                {/* Global Action Bar (Glass Pill for Multi-image, Standard left-aligned for Single) */}
                <div className={displayImages.length > 1 
                    ? "flex gap-2.5 flex-wrap items-center justify-center backdrop-blur-md bg-secondary/30 border border-border/40 shadow-sm rounded-2xl px-5 py-3 ml-auto mr-auto w-fit mt-4 transition-all" 
                    : "flex gap-2.5 flex-wrap items-center mt-3"
                }>
                    {/* [1] Nút Download */}
                    {displayImages.length === 1 ? (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2 h-9 rounded-xl px-4 border border-border/40 shadow-sm transition-all hover:bg-secondary/80"
                            onClick={() => handleDownloadUrl(displayImages[0])}
                        >
                            <Download className="size-3.5" />
                            <span className="text-xs font-semibold">Tải về</span>
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2 h-9 rounded-xl px-4 border border-border/40 shadow-sm transition-all bg-primary/10 hover:bg-primary/20 text-primary"
                            onClick={() => displayImages.forEach(src => handleDownloadUrl(src))}
                        >
                            <Download className="size-3.5" />
                            <span className="text-xs font-semibold">Tải tất cả ({displayImages.length})</span>
                        </Button>
                    )}

                    {/* [2] Nút Prompt (Luôn hiển thị vì prompt dùng chung cho tất cả ảnh) */}
                    {prompt && (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2 h-9 rounded-xl px-4 border border-border/40 shadow-sm transition-all hover:bg-secondary/80"
                            onClick={() => handleCopy(prompt)}
                        >
                            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                            <span className="text-xs font-semibold">Prompt</span>
                        </Button>
                    )}

                    {/* [3] Single Image Only Actions: Làm đầu vào & Tiếp tục với */}
                    {displayImages.length === 1 && (
                        <>
                            {onUseAsInput && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="gap-2 h-9 rounded-xl px-4 border border-border/40 shadow-sm transition-all hover:bg-secondary/80"
                                    onClick={() => onUseAsInput(displayImages[0])}
                                >
                                    <RotateCcw className="size-3.5" />
                                    <span className="text-xs font-semibold">Dùng làm đầu vào</span>
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="gap-2 h-9 rounded-xl px-4 border border-border/40 shadow-sm transition-all hover:bg-secondary/80"
                                    >
                                        <ArrowRight className="size-3.5" />
                                        <span className="text-xs font-semibold">Tiếp tục với...</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="rounded-xl border-border/40 shadow-xl">
                                    {crossTools.map((tool) => (
                                        <DropdownMenuItem
                                            key={tool.path}
                                            onClick={() => navigate(`${tool.path}?input=${encodeURIComponent(displayImages[0])}`)}
                                            className="gap-2.5 text-xs py-2 px-3 cursor-pointer"
                                        >
                                            <tool.icon className="size-3.5 text-muted-foreground" />
                                            <span className="font-medium">{tool.label}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
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
