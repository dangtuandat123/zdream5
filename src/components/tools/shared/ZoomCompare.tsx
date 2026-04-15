import { useRef, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface ZoomCompareProps {
    beforeUrl: string
    afterUrl: string
    className?: string
}

const LENS_SIZE = 130
const ZOOM = 3

export function ZoomCompare({ beforeUrl, afterUrl, className }: ZoomCompareProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
    const [containerWidth, setContainerWidth] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [showAfter, setShowAfter] = useState(true)

    useEffect(() => {
        setIsMobile(window.matchMedia("(pointer: coarse)").matches)
    }, [])

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const observer = new ResizeObserver((entries) => {
            setContainerWidth(entries[0].contentRect.width)
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const container = containerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }, [])

    const handleMouseLeave = useCallback(() => {
        setMousePos(null)
    }, [])

    // Mobile: tap to toggle before/after
    if (isMobile) {
        return (
            <div className={cn("w-full", className)}>
                <div
                    ref={containerRef}
                    className="relative rounded-xl overflow-hidden border border-border/60 bg-muted/30 cursor-pointer active:scale-[0.995] transition-transform"
                    onClick={() => setShowAfter(!showAfter)}
                >
                    <img
                        src={showAfter ? afterUrl : beforeUrl}
                        alt={showAfter ? "Upscaled" : "Original"}
                        className="w-full max-h-[55vh] object-contain"
                        draggable={false}
                    />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded-md">
                        {showAfter ? "Sau upscale" : "Ảnh gốc"}
                    </span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1.5">Nhấn vào ảnh để chuyển đổi trước/sau</p>
            </div>
        )
    }

    return (
        <div className={cn("w-full", className)}>
            <div
                ref={containerRef}
                className="relative rounded-xl overflow-hidden border border-border/60 bg-muted/30 cursor-crosshair group"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <img
                    src={afterUrl}
                    alt="Upscaled"
                    className="w-full max-h-[55vh] object-contain"
                    draggable={false}
                />

                {/* Hover hint overlay — ẩn khi đang zoom */}
                {!mousePos && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                            <Search className="size-3" />
                            Di chuột để so sánh
                        </div>
                    </div>
                )}

                {mousePos && (
                    <div
                        className="absolute pointer-events-none z-10 flex gap-0.5"
                        style={{
                            left: mousePos.x - LENS_SIZE - 4,
                            top: mousePos.y - LENS_SIZE / 2,
                        }}
                    >
                        <div className="relative overflow-hidden rounded-lg border-2 border-white/80 shadow-xl" style={{ width: LENS_SIZE, height: LENS_SIZE }}>
                            <div
                                className="absolute"
                                style={{
                                    backgroundImage: `url(${beforeUrl})`,
                                    backgroundPosition: `-${mousePos.x * ZOOM - LENS_SIZE / 2}px -${mousePos.y * ZOOM - LENS_SIZE / 2}px`,
                                    backgroundSize: `${containerWidth * ZOOM}px auto`,
                                    backgroundRepeat: "no-repeat",
                                    width: LENS_SIZE,
                                    height: LENS_SIZE,
                                }}
                            />
                            <span className="absolute bottom-1 left-1 text-[8px] font-semibold bg-black/70 text-white px-1.5 py-0.5 rounded">Gốc</span>
                        </div>

                        <div className="relative overflow-hidden rounded-lg border-2 border-primary/80 shadow-xl" style={{ width: LENS_SIZE, height: LENS_SIZE }}>
                            <div
                                className="absolute"
                                style={{
                                    backgroundImage: `url(${afterUrl})`,
                                    backgroundPosition: `-${mousePos.x * ZOOM - LENS_SIZE / 2}px -${mousePos.y * ZOOM - LENS_SIZE / 2}px`,
                                    backgroundSize: `${containerWidth * ZOOM}px auto`,
                                    backgroundRepeat: "no-repeat",
                                    width: LENS_SIZE,
                                    height: LENS_SIZE,
                                }}
                            />
                            <span className="absolute bottom-1 left-1 text-[8px] font-semibold bg-primary/80 text-white px-1.5 py-0.5 rounded">Upscale</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
