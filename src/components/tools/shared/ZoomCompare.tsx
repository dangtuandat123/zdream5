import { useRef, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ZoomCompareProps {
    beforeUrl: string
    afterUrl: string
    className?: string
}

const LENS_SIZE = 120
const ZOOM = 3

export function ZoomCompare({ beforeUrl, afterUrl, className }: ZoomCompareProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
    const [containerWidth, setContainerWidth] = useState(0)

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

    return (
        <div className={cn("space-y-2", className)}>
            {/* Main image with zoom on hover */}
            <div
                ref={containerRef}
                className="relative rounded-xl overflow-hidden border bg-muted cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <img src={afterUrl} alt="Upscaled" className="w-full max-h-[500px] object-contain" draggable={false} />

                {/* Zoom lenses */}
                {mousePos && (
                    <div
                        className="absolute pointer-events-none z-10 flex gap-0.5"
                        style={{
                            left: mousePos.x - LENS_SIZE - 4,
                            top: mousePos.y - LENS_SIZE / 2,
                        }}
                    >
                        {/* Before lens */}
                        <div className="relative overflow-hidden rounded-lg border-2 border-white/80 shadow-lg" style={{ width: LENS_SIZE, height: LENS_SIZE }}>
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
                            <span className="absolute bottom-0.5 left-1 text-[8px] font-medium bg-black/60 text-white px-1 rounded">Gốc</span>
                        </div>

                        {/* After lens */}
                        <div className="relative overflow-hidden rounded-lg border-2 border-primary/80 shadow-lg" style={{ width: LENS_SIZE, height: LENS_SIZE }}>
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
                            <span className="absolute bottom-0.5 left-1 text-[8px] font-medium bg-primary/80 text-white px-1 rounded">Upscale</span>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-[10px] text-muted-foreground text-center">Di chuột lên ảnh để so sánh chi tiết</p>
        </div>
    )
}
