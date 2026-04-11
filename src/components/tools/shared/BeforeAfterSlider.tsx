import { useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface BeforeAfterSliderProps {
    beforeUrl: string
    afterUrl: string
    beforeLabel?: string
    afterLabel?: string
    className?: string
}

export function BeforeAfterSlider({
    beforeUrl,
    afterUrl,
    beforeLabel = "Trước",
    afterLabel = "Sau",
    className,
}: BeforeAfterSliderProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)

    const updatePosition = useCallback((clientX: number) => {
        const container = containerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        const x = clientX - rect.left
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setPosition(pct)
    }, [])

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault()
        setIsDragging(true)
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        updatePosition(e.clientX)
    }, [updatePosition])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging) return
        updatePosition(e.clientX)
    }, [isDragging, updatePosition])

    const handlePointerUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    return (
        <div
            ref={containerRef}
            className={cn("relative rounded-xl overflow-hidden border bg-muted select-none cursor-col-resize", className)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: "none" }}
        >
            {/* Before image (full) */}
            <img src={beforeUrl} alt="Before" className="w-full max-h-[500px] object-contain" draggable={false} />

            {/* After image (clipped) */}
            <img
                src={afterUrl}
                alt="After"
                className="absolute inset-0 w-full max-h-[500px] object-contain"
                style={{ clipPath: `inset(0 0 0 ${position}%)` }}
                draggable={false}
            />

            {/* Divider line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                style={{ left: `${position}%` }}
            >
                {/* Handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full bg-white shadow-lg border-2 border-primary flex items-center justify-center">
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-primary rounded-full" />
                        <div className="w-0.5 h-3 bg-primary rounded-full" />
                    </div>
                </div>
            </div>

            {/* Labels */}
            <span className="absolute top-2 left-2 text-[10px] font-medium bg-black/50 text-white px-1.5 py-0.5 rounded z-10">{beforeLabel}</span>
            <span className="absolute top-2 right-2 text-[10px] font-medium bg-black/50 text-white px-1.5 py-0.5 rounded z-10">{afterLabel}</span>
        </div>
    )
}
