import { useState, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
    Sparkles, Download, ZoomIn, Wand2, ImageIcon,
    Copy, Check, ArrowRight, RotateCcw,
    Eraser, Expand, PenTool
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageLightbox } from "@/components/ui/image-lightbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { GeneratedImageData } from "@/lib/api"

const CROSS_TOOLS = [
    { path: "/app/tools/style-transfer", label: "Chuyển phong cách", icon: Wand2 },
    { path: "/app/tools/upscale", label: "Upscale ảnh", icon: ZoomIn },
    { path: "/app/tools/remove-bg", label: "Xóa nền", icon: Eraser },
    { path: "/app/tools/image-edit", label: "Chỉnh sửa ảnh", icon: PenTool },
    { path: "/app/tools/extend", label: "Mở rộng ảnh", icon: Expand },
]

// Skeleton loading khi đang tạo ảnh
function GenerateSkeleton() {
    return (
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted/20 border border-border/40 flex flex-col items-center justify-center isolate">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <Skeleton className="absolute inset-0 h-full w-full rounded-none opacity-20" />
            <div className="flex flex-col items-center gap-3 z-10">
                <Wand2 className="size-6 text-muted-foreground/40 animate-pulse" />
                <div className="flex gap-1.5 items-center">
                    <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="size-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    )
}

// Image card with skeleton loading
function ImageCard({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const [loaded, setLoaded] = useState(false)
    return (
        <>
            {!loaded && <Skeleton className="absolute inset-0 w-full h-full" />}
            <img
                src={src}
                alt={alt}
                className={`${className ?? ""} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300 pointer-events-none`}
                onLoad={() => setLoaded(true)}
                draggable={false}
            />
        </>
    )
}

interface ToolCanvasGridProps {
    /** Current result image URL */
    resultUrl?: string | null
    /** Text result (for ImageToPrompt) */
    textResult?: string | null
    /** Loading state */
    loading?: boolean
    /** History images */
    history: GeneratedImageData[]
    /** History loading */
    historyLoading?: boolean
    /** Empty state hint text */
    emptyHint?: string
    /** Callback when user wants to use an image as input */
    onUseAsInput?: (url: string) => void
    /** Extra content to show above grid (e.g. ZoomCompare, BackgroundPreviewer) */
    extraContent?: React.ReactNode
    /** Show "generate from prompt" button for text results */
    showGenerateFromPrompt?: boolean
}

export function ToolCanvasGrid({
    resultUrl,
    textResult,
    loading,
    history,
    historyLoading,
    emptyHint,
    onUseAsInput,
    extraContent,
    showGenerateFromPrompt,
}: ToolCanvasGridProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const [viewerOpen, setViewerOpen] = useState(false)
    const [viewerIndex, setViewerIndex] = useState(0)
    const [copied, setCopied] = useState(false)

    const crossTools = CROSS_TOOLS.filter(t => !location.pathname.startsWith(t.path))

    // Build gallery: current result first, then history
    const allImages: { url: string; id: string | number; timestamp?: number }[] = []
    if (resultUrl) {
        allImages.push({ url: resultUrl, id: "current-result", timestamp: Date.now() })
    }
    for (const img of history) {
        // Avoid duplicate if result is same as first history item
        if (img.file_url === resultUrl) continue
        allImages.push({ url: img.file_url, id: img.id, timestamp: new Date(img.created_at ?? Date.now()).getTime() })
    }

    const handleDownload = useCallback(async (url: string) => {
        try {
            const res = await fetch(url)
            const blob = await res.blob()
            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = blobUrl
            a.download = `zdream-${Date.now()}.png`
            a.click()
            URL.revokeObjectURL(blobUrl)
        } catch {
            window.open(url, "_blank")
        }
    }, [])

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            {/* Extra content (tool-specific: ZoomCompare, BackgroundPreviewer, etc.) */}
            {extraContent}

            {/* Text result (ImageToPrompt) */}
            {textResult && (
                <div className="rounded-xl border bg-card p-4 space-y-3 animate-in fade-in duration-300">
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
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Wand2 className="size-4 text-primary animate-pulse" />
                        <span className="text-sm font-medium">Đang xử lý...</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        <GenerateSkeleton />
                    </div>
                </div>
            )}

            {/* Result + History grid */}
            {allImages.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4 text-primary" />
                            <span className="text-sm font-medium">Kết quả</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{allImages.length} ảnh</Badge>
                    </div>

                    {/* Action bar for latest result */}
                    {resultUrl && (
                        <div className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => handleDownload(resultUrl)}>
                                <Download className="size-3" />
                                Tải về
                            </Button>
                            {onUseAsInput && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => onUseAsInput(resultUrl)}>
                                    <RotateCcw className="size-3" />
                                    Dùng làm đầu vào
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                                        <ArrowRight className="size-3" />
                                        Tiếp tục với...
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {crossTools.map((tool) => (
                                        <DropdownMenuItem
                                            key={tool.path}
                                            onClick={() => navigate(`${tool.path}?input=${encodeURIComponent(resultUrl)}`)}
                                            className="gap-2 text-xs"
                                        >
                                            <tool.icon className="size-3.5" />
                                            {tool.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {allImages.map((img, idx) => (
                            <div
                                key={img.id}
                                className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ring-1 ring-border/20 hover:ring-primary/50"
                                onClick={() => { setViewerIndex(idx); setViewerOpen(true) }}
                            >
                                <div className="relative aspect-square bg-muted/20">
                                    <ImageCard
                                        src={img.url}
                                        alt={`Kết quả ${idx + 1}`}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-2.5 py-2 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                        {img.timestamp && (
                                            <Badge variant="secondary" className="text-[10px] bg-black/40 backdrop-blur-sm text-white border-0 shadow-sm">
                                                {new Date(img.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </Badge>
                                        )}
                                        <Button size="icon" variant="ghost" className="size-7 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleDownload(img.url) }}>
                                            <Download className="size-3.5" />
                                        </Button>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="size-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                                            <ZoomIn className="size-3.5 text-white" />
                                        </div>
                                    </div>
                                    {idx === 0 && resultUrl && (
                                        <div className="absolute top-2 left-2">
                                            <Badge className="text-[10px] bg-primary/90 text-primary-foreground border-0">Mới nhất</Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* History loading skeleton */}
            {historyLoading && allImages.length === 0 && !loading && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={`hist-sk-${i}`} className="aspect-square rounded-xl" />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && !historyLoading && allImages.length === 0 && !textResult && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <ImageIcon className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold mb-1">Chưa có ảnh nào</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        {emptyHint || "Tải ảnh lên và nhấn Tạo ảnh để bắt đầu"}
                    </p>
                </div>
            )}

            {/* Lightbox viewer */}
            {allImages.length > 0 && (
                <ImageLightbox
                    images={allImages.map(img => img.url)}
                    open={viewerOpen}
                    onClose={() => setViewerOpen(false)}
                    currentIndex={viewerIndex}
                    onIndexChange={setViewerIndex}
                />
            )}
        </div>
    )
}
