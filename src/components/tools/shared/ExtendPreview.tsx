import { cn } from "@/lib/utils"

interface ExtendPreviewProps {
    imageUrl: string
    directions: string[]
    extendRatio: string
    imageDims?: { w: number; h: number } | null
    className?: string
}

const HATCH = "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.08) 4px, rgba(255,255,255,0.08) 8px)"

// OpenRouter image_size=1K ≈ 1024px cạnh dài
const BASE_LONG_SIDE = 1024

export function ExtendPreview({ imageUrl, directions, extendRatio, imageDims, className }: ExtendPreviewProps) {
    const extPct = parseInt(extendRatio) / 100 // 0.25, 0.5, 1.0

    const hasTop = directions.includes("top")
    const hasBottom = directions.includes("bottom")
    const hasLeft = directions.includes("left")
    const hasRight = directions.includes("right")

    // Estimate output dimensions based on new aspect ratio + image_size=1K
    const outputEstimate = imageDims && directions.length > 0 ? (() => {
        const newRatioW = 1 + extPct * ((hasLeft ? 1 : 0) + (hasRight ? 1 : 0))
        const newRatioH = 1 + extPct * ((hasTop ? 1 : 0) + (hasBottom ? 1 : 0))
        const newAspect = (imageDims.w * newRatioW) / (imageDims.h * newRatioH)
        const outW = newAspect >= 1 ? BASE_LONG_SIDE : Math.round(BASE_LONG_SIDE * newAspect)
        const outH = newAspect >= 1 ? Math.round(BASE_LONG_SIDE / newAspect) : BASE_LONG_SIDE
        return { w: outW, h: outH }
    })() : null

    // For CSS: use flex ratios so extend zones are proportional to image
    // Image = 1 unit, each extend side = extPct units
    const imgFlex = 1
    const hFlex = extPct // flex for left/right zones
    const vFlex = extPct // flex for top/bottom zones

    return (
        <div className={cn("rounded-3xl overflow-hidden border bg-background/50 p-6 shadow-sm", className)}>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 font-medium px-2">
                <span>Xem trước vùng ảnh được mở rộng</span>
                {outputEstimate && (
                    <span className="text-foreground font-medium">~{outputEstimate.w}×{outputEstimate.h} px</span>
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
