import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Maximize, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BoundingBoxImageProps {
    src: string
    onBboxChange: (bbox: [number, number, number, number] | null) => void
    className?: string
}

export function BoundingBoxImage({ src, onBboxChange, className }: BoundingBoxImageProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    const [isDrawing, setIsDrawing] = useState(false)
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
    const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null)
    const [savedBox, setSavedBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
    
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

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const pos = getMousePosition(e.nativeEvent)
        if (!pos) return
        setIsDrawing(true)
        setStartPos(pos)
        setCurrentPos(pos)
        setSavedBox(null)
        onBboxChange(null)
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
        
        const rect = containerRef.current.getBoundingClientRect()
        
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
            setSavedBox(null)
            onBboxChange(null)
            return
        }

        setSavedBox({ x: xMin, y: yMin, w, h })

        // Convert UI coordinates back to original image pixels
        const scaleX = naturalSize.w / rect.width
        const scaleY = naturalSize.h / rect.height

        const finalBbox: [number, number, number, number] = [
            Math.round(xMin * scaleX),
            Math.round(yMin * scaleY),
            Math.round(xMax * scaleX),
            Math.round(yMax * scaleY)
        ]

        onBboxChange(finalBbox)
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
    } else if (savedBox) {
        boxStyle = {
            left: savedBox.x,
            top: savedBox.y,
            width: savedBox.w,
            height: savedBox.h,
            display: "block"
        }
    }

    const clearBox = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSavedBox(null)
        setStartPos(null)
        setCurrentPos(null)
        onBboxChange(null)
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
                {savedBox && (
                    <div className="absolute inset-0 bg-black/40 pointer-events-none rounded-md" />
                )}

                {/* The Box */}
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

                    {savedBox && (
                        <div className="absolute top-1 right-1 pointer-events-auto">
                            <Button 
                                size="icon" 
                                variant="destructive" 
                                className="size-6 rounded-full opacity-80 hover:opacity-100 shadow-md"
                                onClick={clearBox}
                            >
                                <X className="size-3" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Instruction tooltip when empty */}
            {!savedBox && !isDrawing && (
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
