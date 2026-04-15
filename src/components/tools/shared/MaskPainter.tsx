import { useRef, useState, useEffect, useCallback } from "react"
import { Paintbrush, Eraser, Undo2, Redo2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

interface MaskPainterProps {
    imageUrl: string
    onMaskChange: (maskBase64: string) => void
    className?: string
}

const BRUSH_SIZES = [
    { id: "s", label: "S", size: 10 },
    { id: "m", label: "M", size: 25 },
    { id: "l", label: "L", size: 50 },
] as const

const PAINT_COLOR = "rgba(255, 60, 80, 0.45)"

export function MaskPainter({ imageUrl, onMaskChange, className }: MaskPainterProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [tool, setTool] = useState<"brush" | "eraser">("brush")
    const [brushSize, setBrushSize] = useState("m")
    const [isDrawing, setIsDrawing] = useState(false)
    const [history, setHistory] = useState<ImageData[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })
    const lastPointRef = useRef<{ x: number; y: number } | null>(null)

    const currentBrushSize = BRUSH_SIZES.find(b => b.id === brushSize)?.size ?? 25

    const imgRef = useRef<HTMLImageElement | null>(null)

    const setupCanvas = useCallback((naturalWidth: number, naturalHeight: number) => {
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
                    // Redraw old mask scaled to new size
                    const tmpCanvas = document.createElement("canvas")
                    tmpCanvas.width = oldData.width
                    tmpCanvas.height = oldData.height
                    tmpCanvas.getContext("2d")!.putImageData(oldData, 0, 0)
                    ctx.drawImage(tmpCanvas, 0, 0, w, h)
                }
                const initialData = ctx.getImageData(0, 0, w, h)
                setHistory([initialData])
                setHistoryIndex(0)
            }
        }
    }, [])

    // Load image and setup canvas dimensions
    useEffect(() => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            imgRef.current = img
            setupCanvas(img.naturalWidth, img.naturalHeight)
        }
        img.src = imageUrl
    }, [imageUrl, setupCanvas])

    // Handle container resize
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

    const exportMask = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Create offscreen canvas for mask
        const offscreen = document.createElement("canvas")
        offscreen.width = canvas.width
        offscreen.height = canvas.height
        const offCtx = offscreen.getContext("2d")
        if (!offCtx) return

        // Read painting canvas pixels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const maskData = offCtx.createImageData(canvas.width, canvas.height)

        for (let i = 0; i < imageData.data.length; i += 4) {
            const alpha = imageData.data[i + 3]
            const val = alpha > 10 ? 255 : 0  // any painted pixel → white
            maskData.data[i] = val
            maskData.data[i + 1] = val
            maskData.data[i + 2] = val
            maskData.data[i + 3] = 255
        }

        offCtx.putImageData(maskData, 0, 0)
        onMaskChange(offscreen.toDataURL("image/png"))
    }, [onMaskChange])

    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1)
            newHistory.push(data)
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

        const point = getCanvasPoint(e)
        lastPointRef.current = point

        // Draw a dot for single click
        ctx.beginPath()
        ctx.arc(point.x, point.y, currentBrushSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = tool === "brush" ? PAINT_COLOR : "rgba(0,0,0,1)"
        const prevOp = ctx.globalCompositeOperation
        ctx.fill()
        ctx.globalCompositeOperation = prevOp
    }, [tool, currentBrushSize, getCanvasPoint])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const point = getCanvasPoint(e)
        if (lastPointRef.current) {
            drawLine(ctx, lastPointRef.current, point)
        }
        lastPointRef.current = point
    }, [isDrawing, getCanvasPoint, drawLine])

    const handlePointerUp = useCallback(() => {
        if (!isDrawing) return
        setIsDrawing(false)
        lastPointRef.current = null
        saveToHistory()
        exportMask()
    }, [isDrawing, saveToHistory, exportMask])

    const undo = useCallback(() => {
        if (historyIndex <= 0) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const newIndex = historyIndex - 1
        ctx.putImageData(history[newIndex], 0, 0)
        setHistoryIndex(newIndex)
        exportMask()
    }, [historyIndex, history, exportMask])

    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const newIndex = historyIndex + 1
        ctx.putImageData(history[newIndex], 0, 0)
        setHistoryIndex(newIndex)
        exportMask()
    }, [historyIndex, history, exportMask])

    const clearAll = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        saveToHistory()
        onMaskChange("")
    }, [saveToHistory, onMaskChange])

    return (
        <div className={cn("w-full h-full relative", className)}>
            {/* Canvas */}
            <div
                ref={containerRef}
                className="relative rounded-3xl overflow-hidden border bg-background/50 select-none shadow-sm group min-h-[400px]"
                style={{ height: canvasSize.h || "auto" }}
            >
                {/* Floating Tooltip Instruction */}
                {historyIndex <= 0 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border shadow text-[11px] font-medium text-foreground flex items-center gap-2 z-20 pointer-events-none opacity-100 transition-opacity duration-300">
                        <div className="size-2 rounded-full bg-primary animate-pulse" />
                        {tool === "brush" ? "Kéo vẽ để chọn vùng ảnh" : "Xóa vùng vừa tô"}
                    </div>
                )}

                {/* Floating Action Toolbar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-full bg-background/80 backdrop-blur-md border shadow-lg z-20 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    <ToggleGroup type="single" value={tool} onValueChange={(v) => v && setTool(v as "brush" | "eraser")}>
                        <ToggleGroupItem value="brush" className="rounded-full h-9 px-4 text-xs gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-300 shadow-sm">
                            <Paintbrush className="size-3.5" />
                            Tô
                        </ToggleGroupItem>
                        <ToggleGroupItem value="eraser" className="rounded-full h-9 px-4 text-xs gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-300 shadow-sm">
                            <Eraser className="size-3.5" />
                            Xóa
                        </ToggleGroupItem>
                    </ToggleGroup>

                    <div className="w-px h-6 bg-border mx-1" />

                    <ToggleGroup type="single" value={brushSize} onValueChange={(v) => v && setBrushSize(v)}>
                        {BRUSH_SIZES.map((b) => (
                            <ToggleGroupItem key={b.id} value={b.id} className="rounded-full h-8 w-8 text-xs font-bold data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground transition-all duration-300">
                                {b.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>

                    <div className="w-px h-6 bg-border mx-1" />

                    <Button size="icon" variant="ghost" className="rounded-full size-8 hover:bg-secondary transition-colors" onClick={undo} disabled={historyIndex <= 0}>
                        <Undo2 className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full size-8 hover:bg-secondary transition-colors" onClick={redo} disabled={historyIndex >= history.length - 1}>
                        <Redo2 className="size-3.5" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button size="icon" variant="ghost" className="rounded-full size-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={clearAll}>
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>

                <img
                    src={imageUrl}
                    alt="Source"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    draggable={false}
                />
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full z-10"
                    style={{ touchAction: "none", cursor: tool === "brush" ? "crosshair" : "cell" }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                />
            </div>
        </div>
    )
}
