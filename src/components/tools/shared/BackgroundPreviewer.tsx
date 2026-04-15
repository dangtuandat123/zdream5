import { useState, useRef, useImperativeHandle, forwardRef, useCallback } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BackgroundPreviewerHandle {
    getCompositeDataUrl: () => string | null
}

interface BackgroundPreviewerProps {
    imageUrl: string
    className?: string
}

const PRESETS = [
    { id: "checker", label: "Trong suốt", bg: "bg-[length:16px_16px] bg-[conic-gradient(#80808040_25%,transparent_25%,transparent_50%,#80808040_50%,#80808040_75%,transparent_75%)]", color: null },
    { id: "white", label: "Trắng", bg: "bg-white", color: "#ffffff" },
    { id: "black", label: "Đen", bg: "bg-black", color: "#000000" },
    { id: "blue", label: "Xanh", bg: "bg-blue-500", color: "#3b82f6" },
    { id: "green", label: "Xanh lá", bg: "bg-green-500", color: "#22c55e" },
    { id: "red", label: "Đỏ", bg: "bg-red-500", color: "#ef4444" },
] as const

export const BackgroundPreviewer = forwardRef<BackgroundPreviewerHandle, BackgroundPreviewerProps>(
    function BackgroundPreviewer({ imageUrl, className }, ref) {
        const [selected, setSelected] = useState("checker")
        const [customColor, setCustomColor] = useState("#6366f1")
        const [bgImageUrl, setBgImageUrl] = useState<string | null>(null)
        const fileRef = useRef<HTMLInputElement>(null)
        const imgRef = useRef<HTMLImageElement>(null)

        const getCompositeDataUrl = useCallback((): string | null => {
            const img = imgRef.current
            if (!img || selected === "checker") return null

            const canvas = document.createElement("canvas")
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext("2d")
            if (!ctx) return null

            if (selected === "custom") {
                ctx.fillStyle = customColor
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            } else if (selected === "image" && bgImageUrl) {
                return null // image bg composite not supported in download
            } else {
                const preset = PRESETS.find(p => p.id === selected)
                if (preset?.color) {
                    ctx.fillStyle = preset.color
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                }
            }

            ctx.drawImage(img, 0, 0)
            return canvas.toDataURL("image/png")
        }, [selected, customColor, bgImageUrl])

        useImperativeHandle(ref, () => ({ getCompositeDataUrl }), [getCompositeDataUrl])

        const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file || !file.type.startsWith("image/")) return
            const reader = new FileReader()
            reader.onload = (ev) => {
                setBgImageUrl(ev.target?.result as string)
                setSelected("image")
            }
            reader.readAsDataURL(file)
        }

        let bgStyle: React.CSSProperties = {}
        let bgClass = ""

        if (selected === "custom") {
            bgStyle = { backgroundColor: customColor }
        } else if (selected === "image" && bgImageUrl) {
            bgStyle = { backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
        } else {
            const preset = PRESETS.find(p => p.id === selected)
            if (preset) bgClass = preset.bg
        }

        return (
            <div className={cn("space-y-4 w-full flex flex-col h-full", className)}>
                <div className="flex items-center justify-between text-sm font-medium text-muted-foreground px-1">
                    <span>Trình ghép nền ảnh trực tiếp</span>
                    <span className="text-[10px] bg-muted/60 px-2 py-0.5 rounded flex items-center gap-1.5"><Upload className="size-3" />Bạn có thể dùng ảnh của riêng mình làm nền</span>
                </div>

                <div
                    className={cn("relative rounded-xl overflow-hidden border min-h-[350px] flex-1 flex items-center justify-center shadow-inner", bgClass)}
                    style={bgStyle}
                >
                    <img ref={imgRef} src={imageUrl} alt="Result" className="w-full max-h-[500px] object-contain drop-shadow-2xl" crossOrigin="anonymous" />
                </div>

                <div className="flex gap-1.5 flex-wrap">
                    {PRESETS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelected(p.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium transition-all",
                                selected === p.id ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/30"
                            )}
                        >
                            <span className={cn("size-3 rounded-sm border border-border/50 shrink-0", p.bg, p.id === "checker" && "bg-[length:6px_6px]")} />
                            {p.label}
                        </button>
                    ))}

                    <label
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium cursor-pointer transition-all",
                            selected === "custom" ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/30"
                        )}
                    >
                        <input
                            type="color"
                            value={customColor}
                            onChange={(e) => { setCustomColor(e.target.value); setSelected("custom") }}
                            className="size-3 rounded-sm border-0 p-0 cursor-pointer"
                        />
                        Tùy chọn
                    </label>

                    <button
                        onClick={() => fileRef.current?.click()}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium transition-all",
                            selected === "image" ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/30"
                        )}
                    >
                        <Upload className="size-3" />
                        Ảnh nền
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
                </div>
            </div>
        )
    }
)
