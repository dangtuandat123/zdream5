import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BoundingBoxImageProps {
    src: string
    onBboxesChange: (bboxes: number[][] | null) => void
    className?: string
}

export function BoundingBoxImage({ src, onBboxesChange, className }: BoundingBoxImageProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    const [isDrawing, setIsDrawing] = useState(false)
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
    const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null)
    
    // Support multiple boxes
    const [boxes, setBoxes] = useState<{ x: number; y: number; w: number; h: number }[]>([])
    
    // Original image dimensions
    const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setNaturalSize({
            w: e.currentTarget.naturalWidth,
            h: e.currentTarget.naturalHeight
        })
    }

    const getMousePosition = (e: React.MouseEvent | MouseEvent | TouchEvent) => {
        if (!containerRef.current) return null
        const rect = containerRef.current.getBoundingClientRect()
        let clientX = 0
        let clientY = 0

        if ('touches' in e) {
            clientX = e.touches[0].clientX
            clientY = e.touches[0].clientY
        } else {
            clientX = (e as React.MouseEvent | MouseEvent).clientX
            clientY = (e as React.MouseEvent | MouseEvent).clientY
        }

        return {
            x: Math.max(0, Math.min(clientX - rect.left, rect.width)),
            y: Math.max(0, Math.min(clientY - rect.top, rect.height))
        }
    }

    const emitBboxes = (uiBoxes: { x: number; y: number; w: number; h: number }[]) => {
        if (!naturalSize || !containerRef.current) return
        if (uiBoxes.length === 0) {
            onBboxesChange(null)
            return
        }

        const rect = containerRef.current.getBoundingClientRect()
        const scaleX = naturalSize.w / rect.width
        const scaleY = naturalSize.h / rect.height

        const apiBboxes = uiBoxes.map(b => {
            const xMin = b.x
            const yMin = b.y
            const xMax = b.x + b.w
            const yMax = b.y + b.h
            return [
                Math.round(xMin * scaleX),
                Math.round(yMin * scaleY),
                Math.round(xMax * scaleX),
                Math.round(yMax * scaleY)
            ]
        })

        onBboxesChange(apiBboxes)
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const pos = getMousePosition(e.nativeEvent)
        if (!pos) return
        setIsDrawing(true)
        setStartPos(pos)
        setCurrentPos(pos)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        const pos = getMousePosition(e.nativeEvent)
        if (!pos) return
        setCurrentPos(pos)
    }

    const endDrawing = () => {
        if (!isDrawing || !startPos || !currentPos || !containerRef.current || !naturalSize) {
            setIsDrawing(false)
            return
        }
        
        setIsDrawing(false)
        
        const xMin = Math.min(startPos.x, currentPos.x)
        const yMin = Math.min(startPos.y, currentPos.y)
        const xMax = Math.max(startPos.x, currentPos.x)
        const yMax = Math.max(startPos.y, currentPos.y)
        
        const w = xMax - xMin
        const h = yMax - yMin

        // Ignore clicks or tiny boxes
        if (w < 10 || h < 10) {
            setStartPos(null)
            setCurrentPos(null)
            return
        }

        const newBoxes = [...boxes, { x: xMin, y: yMin, w, h }]
        setBoxes(newBoxes)
        emitBboxes(newBoxes)
        
        setStartPos(null)
        setCurrentPos(null)
    }

    // For rendering the active or saved box
    let boxStyle: React.CSSProperties = { display: "none" }
    
    if (isDrawing && startPos && currentPos) {
        const xMin = Math.min(startPos.x, currentPos.x)
        const yMin = Math.min(startPos.y, currentPos.y)
        const w = Math.abs(currentPos.x - startPos.x)
        const h = Math.abs(currentPos.y - startPos.y)
        boxStyle = {
            left: xMin,
            top: yMin,
            width: w,
            height: h,
            display: "block"
        }
    }

    const undoBox = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (boxes.length === 0) return
        const newBoxes = boxes.slice(0, -1)
        setBoxes(newBoxes)
        emitBboxes(newBoxes)
    }

    const clearAllBoxes = (e: React.MouseEvent) => {
        e.stopPropagation()
        setBoxes([])
        emitBboxes([])
    }

    return (
        <div className={cn("relative flex items-center justify-center p-2 border border-dashed rounded-xl bg-muted/20", className)}>
            <div 
                ref={containerRef}
                className="relative inline-block select-none cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
            >
                <img 
                    ref={imgRef}
                    src={src} 
                    alt="Target" 
                    className="max-h-[500px] w-auto h-auto rounded-md pointer-events-none"
                    onLoad={handleImageLoad}
                    draggable={false}
                />
                
                {/* Overlay darkening outside the box when saved */}
                {boxes.length > 0 && (
                    <div className="absolute inset-0 bg-black/40 pointer-events-none rounded-md" style={{ clipPath: "url(#boxesClip)" }}>
                        <svg width="0" height="0">
                            <defs>
                                <clipPath id="boxesClip" clipPathUnits="userSpaceOnUse">
                                    <rect width="100%" height="100%" fill="white" />
                                    {/* Subtractive trick in SVG does not work this way simply, so we disable the overlay darkening or just keep it simple. Let's keep it simple and just use an overlay layer with basic opacity for now, but without clip paths for cross-browser simplicity. Actually, we can remove the full darkening to prevent UI issues when multiple boxes are overlapping. */}
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                )}

                {/* Render Saved Boxes */}
                {boxes.map((b, idx) => (
                    <div
                        key={idx}
                        className="absolute border-2 border-primary/50 bg-primary/10 pointer-events-none transition-all duration-200"
                        style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                    >
                    </div>
                ))}

                {/* The Current Drawing Box */}
                <div 
                    className={cn(
                        "absolute border-2 border-primary bg-primary/20 pointer-events-none",
                        isDrawing && "border-dashed"
                    )}
                    style={boxStyle}
                >
                    {/* Corner handles (visual only) */}
                    <div className="absolute top-0 left-0 w-2 h-2 bg-primary -translate-x-1 -translate-y-1" />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-primary translate-x-1 -translate-y-1" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary -translate-x-1 translate-y-1" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary translate-x-1 translate-y-1" />
                </div>
            </div>

            {/* Top Toolbar (Undo / Clear) */}
            {boxes.length > 0 && (
                <div className="absolute top-4 right-4 pointer-events-auto flex items-center gap-1.5 bg-background/90 backdrop-blur-md shadow-md border px-1.5 py-1.5 rounded-full">
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-7 text-xs rounded-full px-3"
                        onClick={undoBox}
                    >
                        Hoàn tác
                    </Button>
                    <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-7 text-xs rounded-full px-3"
                        onClick={clearAllBoxes}
                    >
                        Xóa tất cả
                    </Button>
                </div>
            )}

            {/* Instruction tooltip when empty */}
            {boxes.length === 0 && !isDrawing && (
                <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
                    <div className="bg-background/80 backdrop-blur-md border shadow-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-foreground animate-pulse">
                        <Maximize className="size-3.5 text-primary" />
                        Kéo chuột khoanh vùng vật thể cần lấy
                    </div>
                </div>
            )}
        </div>
    )
}
