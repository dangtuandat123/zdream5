import { useRef, useState, useEffect, useCallback } from "react"
import { Paintbrush, Eraser, Undo2, Redo2, Trash2, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

interface Box {
    x: number
    y: number
    w: number
    h: number
}

interface HistorySnapshot {
    boxes: Box[]
    canvasData: ImageData | null
}

interface MaskPainterProps {
    imageUrl: string
    onMaskChange?: (maskBase64: string) => void
    onSelectionChange?: (payload: { maskBase64: string; bboxes: number[][] | null }) => void
    className?: string
}

const BRUSH_SIZES = [
    { id: "s", label: "S", size: 10 },
    { id: "m", label: "M", size: 25 },
    { id: "l", label: "L", size: 50 },
] as const

const PAINT_COLOR = "#ff3c50"

export function MaskPainter({ imageUrl, onMaskChange, onSelectionChange, className }: MaskPainterProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement | null>(null)
    const lastPointRef = useRef<{ x: number; y: number } | null>(null)

    // Tools & Modes
    const [tool, setTool] = useState<"brush" | "eraser" | "bbox">("bbox")
    const [brushSize, setBrushSize] = useState("m")
    
    // Live UI State
    const [isDrawing, setIsDrawing] = useState(false)
    const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })
    const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
    
    // Vector Boxes State
    const [boxes, setBoxes] = useState<Box[]>([])
    const [boxStart, setBoxStart] = useState<{ x: number; y: number } | null>(null)
    const [boxCurrent, setBoxCurrent] = useState<{ x: number; y: number } | null>(null)

    // Master History
    const [history, setHistory] = useState<HistorySnapshot[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)

    const currentBrushSize = BRUSH_SIZES.find(b => b.id === brushSize)?.size ?? 25

    const setupCanvas = useCallback((naturalWidth: number, naturalHeight: number) => {
        setNaturalSize({ w: naturalWidth, h: naturalHeight })
        const container = containerRef.current
        if (!container) return
        const containerWidth = container.clientWidth
        if (containerWidth <= 0) return
        const scale = containerWidth / naturalWidth
        const w = containerWidth
        const h = Math.round(naturalHeight * scale)
        setCanvasSize({ w, h })

        const canvas = canvasRef.current
        if (canvas) {
            // Save existing mask data before resize
            const oldCtx = canvas.getContext("2d")
            const oldData = (canvas.width > 0 && canvas.height > 0 && oldCtx)
                ? oldCtx.getImageData(0, 0, canvas.width, canvas.height) : null

            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext("2d")
            if (ctx) {
                if (oldData && oldData.width > 0) {
                    const tmpCanvas = document.createElement("canvas")
                    tmpCanvas.width = oldData.width
                    tmpCanvas.height = oldData.height
                    tmpCanvas.getContext("2d")!.putImageData(oldData, 0, 0)
                    ctx.drawImage(tmpCanvas, 0, 0, w, h)
                }
                const initialData = ctx.getImageData(0, 0, w, h)
                // Initialize history only if empty to preserve data across container resizes
                setHistory(prev => {
                    if (prev.length === 0) {
                        setHistoryIndex(0)
                        return [{ boxes: [], canvasData: initialData }]
                    }
                    return prev
                })
            }
        }
    }, [])

    useEffect(() => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            imgRef.current = img
            setupCanvas(img.naturalWidth, img.naturalHeight)
        }
        img.src = imageUrl
    }, [imageUrl, setupCanvas])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const observer = new ResizeObserver(() => {
            const img = imgRef.current
            if (img && img.naturalWidth > 0) {
                setupCanvas(img.naturalWidth, img.naturalHeight)
            }
        })
        observer.observe(container)
        return () => observer.disconnect()
    }, [setupCanvas])

    const getCanvasPoint = useCallback((e: React.PointerEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height),
        }
    }, [])

    const drawLine = useCallback((ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
    }, [])

    const exportData = useCallback((currentBoxes: Box[]) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const offscreen = document.createElement("canvas")
        offscreen.width = canvas.width
        offscreen.height = canvas.height
        const offCtx = offscreen.getContext("2d")
        if (!offCtx) return

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const maskData = offCtx.createImageData(canvas.width, canvas.height)

        let hasPaintedPixels = false
        for (let i = 0; i < imageData.data.length; i += 4) {
            const alpha = imageData.data[i + 3]
            const val = alpha > 10 ? 255 : 0
            if (val === 255) hasPaintedPixels = true
            maskData.data[i] = val
            maskData.data[i + 1] = val
            maskData.data[i + 2] = val
            maskData.data[i + 3] = 255
        }

        offCtx.putImageData(maskData, 0, 0)
        const maskBase64 = hasPaintedPixels ? offscreen.toDataURL("image/png") : ""

        let exportedBboxes: number[][] | null = null
        if (currentBoxes.length > 0 && containerRef.current && naturalSize) {
            const rect = containerRef.current.getBoundingClientRect()
            const scaleX = naturalSize.w / rect.width
            const scaleY = naturalSize.h / rect.height
            exportedBboxes = currentBoxes.map(b => [
                Math.round(b.x * scaleX),
                Math.round(b.y * scaleY),
                Math.round((b.x + b.w) * scaleX),
                Math.round((b.y + b.h) * scaleY)
            ])
        }

        if (onMaskChange) onMaskChange(maskBase64)
        if (onSelectionChange) onSelectionChange({ maskBase64, bboxes: exportedBboxes })
    }, [onMaskChange, onSelectionChange, naturalSize])

    const saveToHistory = useCallback((currentBoxes: Box[]) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1)
            newHistory.push({ boxes: currentBoxes, canvasData: data })
            return newHistory
        })
        setHistoryIndex(prev => prev + 1)
    }, [historyIndex])

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault()
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        setIsDrawing(true)
        canvas.setPointerCapture(e.pointerId)
        
        const point = getCanvasPoint(e)
        lastPointRef.current = point

        if (tool === "bbox") {
            setBoxStart(point)
            setBoxCurrent(point)
        } else {
            ctx.lineCap = "round"
            ctx.lineJoin = "round"
            ctx.lineWidth = currentBrushSize
            if (tool === "brush") {
                ctx.globalCompositeOperation = "source-over"
                ctx.strokeStyle = PAINT_COLOR
            } else {
                ctx.globalCompositeOperation = "destination-out"
                ctx.strokeStyle = "rgba(0,0,0,1)"
            }

            // Draw dot
            ctx.beginPath()
            ctx.arc(point.x, point.y, currentBrushSize / 2, 0, Math.PI * 2)
            ctx.fillStyle = tool === "brush" ? PAINT_COLOR : "rgba(0,0,0,1)"
            const prevOp = ctx.globalCompositeOperation
            ctx.fill()
            ctx.globalCompositeOperation = prevOp
        }
    }, [tool, currentBrushSize, getCanvasPoint])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const point = getCanvasPoint(e)

        if (tool === "bbox") {
            setBoxCurrent(point)
        } else {
            if (lastPointRef.current) {
                drawLine(ctx, lastPointRef.current, point)
            }
            lastPointRef.current = point
        }
    }, [isDrawing, tool, getCanvasPoint, drawLine])

    const handlePointerUp = useCallback(() => {
        if (!isDrawing) return
        setIsDrawing(false)
        lastPointRef.current = null

        let currentBoxes = boxes
        if (tool === "bbox" && boxStart && boxCurrent) {
            const xMin = Math.min(boxStart.x, boxCurrent.x)
            const yMin = Math.min(boxStart.y, boxCurrent.y)
            const w = Math.abs(boxCurrent.x - boxStart.x)
            const h = Math.abs(boxCurrent.y - boxStart.y)

            if (w > 10 && h > 10) {
                currentBoxes = [...boxes, { x: xMin, y: yMin, w, h }]
                setBoxes(currentBoxes)
            }
        }
        
        setBoxStart(null)
        setBoxCurrent(null)

        saveToHistory(currentBoxes)
        exportData(currentBoxes)
    }, [isDrawing, tool, boxStart, boxCurrent, boxes, saveToHistory, exportData])

    const undo = useCallback(() => {
        if (historyIndex <= 0) return
        const newIndex = historyIndex - 1
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        const snap = history[newIndex]

        if (ctx && snap.canvasData) ctx.putImageData(snap.canvasData, 0, 0)
        setBoxes(snap.boxes || [])
        setHistoryIndex(newIndex)
        exportData(snap.boxes || [])
    }, [historyIndex, history, exportData])

    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) return
        const newIndex = historyIndex + 1
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        const snap = history[newIndex]

        if (ctx && snap.canvasData) ctx.putImageData(snap.canvasData, 0, 0)
        setBoxes(snap.boxes || [])
        setHistoryIndex(newIndex)
        exportData(snap.boxes || [])
    }, [historyIndex, history, exportData])

    const clearAll = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setBoxes([])
        saveToHistory([])
        exportData([])
    }, [saveToHistory, exportData])

    let boxStyle: React.CSSProperties = { display: "none" }
    if (tool === "bbox" && isDrawing && boxStart && boxCurrent) {
        const xMin = Math.min(boxStart.x, boxCurrent.x)
        const yMin = Math.min(boxStart.y, boxCurrent.y)
        const w = Math.abs(boxCurrent.x - boxStart.x)
        const h = Math.abs(boxCurrent.y - boxStart.y)
        boxStyle = { left: xMin, top: yMin, width: w, height: h, display: "block" }
    }

    return (
        <div className={cn("space-y-2", className)}>
            {/* Unified Toolbar */}
            <div className="flex items-center gap-2 flex-wrap min-h-9">
                <ToggleGroup type="single" value={tool} onValueChange={(v) => v && setTool(v as "brush" | "eraser" | "bbox")}>
                    <ToggleGroupItem value="bbox" className="h-8 px-3 text-xs gap-1.5 data-[state=on]:bg-[#ff3c50]/20 data-[state=on]:text-[#ff3c50]">
                        <Maximize className="size-3.5" />
                        Khoanh
                    </ToggleGroupItem>
                    <div className="w-px h-4 bg-border mx-1" />
                    <ToggleGroupItem value="brush" className="h-8 px-3 text-xs gap-1.5 data-[state=on]:bg-[#ff3c50]/20 data-[state=on]:text-[#ff3c50]">
                        <Paintbrush className="size-3.5" />
                        Tô
                    </ToggleGroupItem>
                    <ToggleGroupItem value="eraser" className="h-8 px-3 text-xs gap-1.5 data-[state=on]:bg-secondary data-[state=on]:text-foreground">
                        <Eraser className="size-3.5" />
                        Xóa
                    </ToggleGroupItem>
                </ToggleGroup>

                <div className="w-px h-5 bg-border ml-1 mr-1" />

                {/* S M L Toggles */}
                <div className={cn("flex items-center transition-all", tool === "bbox" ? "opacity-30 pointer-events-none" : "opacity-100")}>
                    <ToggleGroup type="single" value={brushSize} onValueChange={(v) => v && setBrushSize(v)}>
                        {BRUSH_SIZES.map((b) => (
                            <ToggleGroupItem key={b.id} value={b.id} className="h-8 w-8 text-xs font-medium">
                                {b.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>

                <div className="flex items-center ml-auto gap-1">
                    <Button size="icon" variant="ghost" className="size-8" onClick={undo} disabled={historyIndex <= 0}>
                        <Undo2 className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8" onClick={redo} disabled={historyIndex >= history.length - 1}>
                        <Redo2 className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8" onClick={clearAll} disabled={boxes.length === 0 && historyIndex <= 0}>
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </div>

            {/* Editor Workspace */}
            <div
                ref={containerRef}
                className="relative rounded-xl overflow-hidden border bg-muted select-none flex items-center justify-center bg-checkered p-0"
                style={{ height: canvasSize.h || "auto", minHeight: 200 }}
            >
                <img
                    src={imageUrl}
                    alt="Source"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    draggable={false}
                />
                
                {/* Unified Opacity Layer ensuring no compounding alpha */}
                <div className="absolute inset-0 opacity-[0.45] pointer-events-none">
                    {/* Render Canvas (pointers accepted) */}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-auto touch-none"
                        style={{ cursor: tool === "bbox" ? "crosshair" : tool === "brush" ? "crosshair" : "cell" }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                    />
                    
                    {/* Render Bounding Boxes */}
                    {boxes.map((b, idx) => (
                        <div
                            key={idx}
                            className="absolute bg-[#ff3c50] pointer-events-none transition-all duration-200"
                            style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                        />
                    ))}

                    {/* Rendering Active Bounding Box */}
                    {tool === "bbox" && isDrawing && boxStart && boxCurrent && (
                        <div className="absolute bg-[#ff3c50] pointer-events-none" style={boxStyle} />
                    )}
                </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
                {tool === "bbox" ? "Kéo thả chuột để khoanh vùng khối vật thể" : tool === "brush" ? "Tô cọ lên những viền chi tiết cần lấy" : "Dùng tẩy xóa đi các nét vẽ hoặc hộp vuông bị lố"}
            </p>
        </div>
    )
}
