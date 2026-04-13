import { cn } from "@/lib/utils"

interface ExtendPreviewProps {
    imageUrl: string
    directions: string[]
    extendRatio: string
    className?: string
}

const HATCH = "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.08) 4px, rgba(255,255,255,0.08) 8px)"

export function ExtendPreview({ imageUrl, directions, extendRatio, className }: ExtendPreviewProps) {
    const extPct = parseInt(extendRatio) / 100 // 0.25, 0.5, 1.0

    const hasTop = directions.includes("top")
    const hasBottom = directions.includes("bottom")
    const hasLeft = directions.includes("left")
    const hasRight = directions.includes("right")

    // For CSS: use flex ratios so extend zones are proportional to image
    // Image = 1 unit, each extend side = extPct units
    const imgFlex = 1
    const hFlex = extPct // flex for left/right zones
    const vFlex = extPct // flex for top/bottom zones

    return (
        <div className={cn("rounded-xl overflow-hidden border bg-muted/50 p-3", className)}>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                <span>Xem trước vùng mở rộng</span>
                {directions.length > 0 && (
                    <span className="text-foreground font-medium">+{extendRatio}% mỗi hướng</span>
                )}
            </div>
            <div className="relative flex flex-col items-center">
                {/* Top extend zone */}
                {hasTop && (
                    <div
                        className="w-full rounded-t-lg border border-dashed border-primary/30 flex items-center justify-center text-[10px] text-primary/60"
                        style={{ height: 0, paddingBottom: `${vFlex * 100 / (imgFlex + (hasTop ? vFlex : 0) + (hasBottom ? vFlex : 0))}%`, background: HATCH, minHeight: 20 }}
                    >
                        ↑ +{extendRatio}%
                    </div>
                )}

                <div className="flex w-full" style={{ flex: imgFlex }}>
                    {/* Left extend zone */}
                    {hasLeft && (
                        <div
                            className="rounded-l-lg border border-dashed border-primary/30 flex items-center justify-center text-[10px] text-primary/60 shrink-0"
                            style={{ width: `${hFlex / (imgFlex + (hasLeft ? hFlex : 0) + (hasRight ? hFlex : 0)) * 100}%`, background: HATCH, minWidth: 20 }}
                        >
                            ←
                        </div>
                    )}

                    {/* Center image */}
                    <div style={{ flex: imgFlex }} className="min-w-0">
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
                            style={{ width: `${hFlex / (imgFlex + (hasLeft ? hFlex : 0) + (hasRight ? hFlex : 0)) * 100}%`, background: HATCH, minWidth: 20 }}
                        >
                            →
                        </div>
                    )}
                </div>

                {/* Bottom extend zone */}
                {hasBottom && (
                    <div
                        className="w-full rounded-b-lg border border-dashed border-primary/30 flex items-center justify-center text-[10px] text-primary/60"
                        style={{ height: 0, paddingBottom: `${vFlex * 100 / (imgFlex + (hasTop ? vFlex : 0) + (hasBottom ? vFlex : 0))}%`, background: HATCH, minHeight: 20 }}
                    >
                        ↓ +{extendRatio}%
                    </div>
                )}

                {directions.length === 0 && (
                    <div className="py-8 text-xs text-muted-foreground">Chọn hướng mở rộng để xem preview</div>
                )}
            </div>
        </div>
    )
}
