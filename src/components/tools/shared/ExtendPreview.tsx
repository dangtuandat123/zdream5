import { cn } from "@/lib/utils"

interface ExtendPreviewProps {
    imageUrl: string
    directions: string[]
    extendRatio: string
    className?: string
}

const HATCH = "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.08) 4px, rgba(255,255,255,0.08) 8px)"

export function ExtendPreview({ imageUrl, directions, extendRatio, className }: ExtendPreviewProps) {
    const ratio = parseInt(extendRatio) / 100  // 0.25, 0.5, or 1.0
    const extPct = Math.round(ratio / (1 + ratio) * 100)  // percentage of total for extend areas

    const hasTop = directions.includes("top")
    const hasBottom = directions.includes("bottom")
    const hasLeft = directions.includes("left")
    const hasRight = directions.includes("right")

    return (
        <div className={cn("rounded-xl overflow-hidden border bg-muted/50 p-3", className)}>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
                Xem trước vùng mở rộng ({extendRatio}%)
            </div>
            <div className="relative flex flex-col items-center">
                {/* Top extend zone */}
                {hasTop && (
                    <div
                        className="w-full rounded-t-lg border border-dashed border-primary/30 flex items-center justify-center text-[10px] text-primary/60"
                        style={{ height: `${extPct}px`, background: HATCH, minHeight: 24 }}
                    >
                        ↑ Mở rộng
                    </div>
                )}

                <div className="flex w-full">
                    {/* Left extend zone */}
                    {hasLeft && (
                        <div
                            className="rounded-l-lg border border-dashed border-primary/30 flex items-center justify-center text-[10px] text-primary/60 shrink-0"
                            style={{ width: `${extPct}px`, background: HATCH, minWidth: 24 }}
                        >
                            ←
                        </div>
                    )}

                    {/* Center image */}
                    <div className="flex-1 min-w-0">
                        <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-full max-h-[200px] object-contain"
                            draggable={false}
                        />
                    </div>

                    {/* Right extend zone */}
                    {hasRight && (
                        <div
                            className="rounded-r-lg border border-dashed border-primary/30 flex items-center justify-center text-[10px] text-primary/60 shrink-0"
                            style={{ width: `${extPct}px`, background: HATCH, minWidth: 24 }}
                        >
                            →
                        </div>
                    )}
                </div>

                {/* Bottom extend zone */}
                {hasBottom && (
                    <div
                        className="w-full rounded-b-lg border border-dashed border-primary/30 flex items-center justify-center text-[10px] text-primary/60"
                        style={{ height: `${extPct}px`, background: HATCH, minHeight: 24 }}
                    >
                        ↓ Mở rộng
                    </div>
                )}

                {directions.length === 0 && (
                    <div className="py-8 text-xs text-muted-foreground">Chọn hướng mở rộng để xem preview</div>
                )}
            </div>
        </div>
    )
}
