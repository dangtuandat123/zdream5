import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Maximize, Undo2, Trash2 } from "lucide-react"
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
        <div className={cn("space-y-2", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap h-9">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mr-auto bg-muted/60 px-3 h-8 rounded-md">
                    <Maximize className="size-3.5" />
                    Kéo chuột để khoanh vùng vật thể
                </div>

                <div className="w-px h-5 bg-border" />

                <Button size="icon" variant="ghost" className="size-8" onClick={undoBox} disabled={boxes.length === 0 || isDrawing}>
                    <Undo2 className="size-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="size-8" onClick={clearAllBoxes} disabled={boxes.length === 0 || isDrawing}>
                    <Trash2 className="size-3.5" />
                </Button>
            </div>

            {/* Canvas */}
            <div className="relative rounded-xl overflow-hidden border bg-muted select-none flex items-center justify-center min-h-[100px]">
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
                        className="max-h-[500px] w-auto h-auto pointer-events-none"
                        onLoad={handleImageLoad}
                        draggable={false}
                    />
                    
                    {/* Wrapper for unified opacity logic - prevents overlapping multiplier */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.45]">
                        {/* Render Saved Boxes */}
                        {boxes.map((b, idx) => (
                            <div
                                key={idx}
                                className="absolute bg-[#ff3c50] pointer-events-none transition-all duration-200"
                                style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                            />
                        ))}

                        {/* The Current Drawing Box */}
                        <div 
                            className="absolute bg-[#ff3c50] pointer-events-none"
                            style={boxStyle}
                        />
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
                Khoanh vùng để chọn nhiều đối tượng cùng lúc
            </p>
        </div>
    )
}
