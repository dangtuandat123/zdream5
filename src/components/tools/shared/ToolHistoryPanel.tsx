import { History } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import type { GeneratedImageData } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ToolHistoryPanelProps {
    history: GeneratedImageData[]
    loading?: boolean
    onSelectImage?: (url: string) => void
    selectedUrl?: string | null
}

export function ToolHistoryPanel({ history, loading, onSelectImage, selectedUrl }: ToolHistoryPanelProps) {
    if (loading) {
        return (
            <div className="space-y-2 bg-background/80 backdrop-blur-xl border rounded-2xl p-3 shadow-lg shadow-black/5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground ml-1">
                    <History className="size-3.5" />
                    Lịch sử
                </div>
                <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="size-16 rounded-lg bg-muted animate-pulse shrink-0" />
                    ))}
                </div>
            </div>
        )
    }

    if (history.length === 0) return null

    return (
        <div className="space-y-2 bg-background/80 backdrop-blur-xl border rounded-2xl p-3 shadow-lg shadow-black/5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground ml-1">
                <History className="size-3.5" />
                Lịch sử ({history.length})
            </div>
            <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                    {history.map((img) => (
                        <button
                            key={img.id}
                            onClick={() => onSelectImage?.(img.file_url)}
                            className={cn(
                                "relative size-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all hover:opacity-90",
                                selectedUrl === img.file_url ? "border-primary ring-1 ring-primary/30" : "border-border/50"
                            )}
                        >
                            <img src={img.file_url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}
