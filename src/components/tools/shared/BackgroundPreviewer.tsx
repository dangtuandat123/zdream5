import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackgroundPreviewerProps {
    imageUrl: string
    className?: string
}

const PRESETS = [
    { id: "checker", label: "Trong suốt", bg: "bg-[length:16px_16px] bg-[conic-gradient(#80808040_25%,transparent_25%,transparent_50%,#80808040_50%,#80808040_75%,transparent_75%)]" },
    { id: "white", label: "Trắng", bg: "bg-white" },
    { id: "black", label: "Đen", bg: "bg-black" },
    { id: "blue", label: "Xanh", bg: "bg-blue-500" },
    { id: "green", label: "Xanh lá", bg: "bg-green-500" },
    { id: "red", label: "Đỏ", bg: "bg-red-500" },
] as const

export function BackgroundPreviewer({ imageUrl, className }: BackgroundPreviewerProps) {
    const [selected, setSelected] = useState("checker")
    const [customColor, setCustomColor] = useState("#6366f1")
    const [bgImageUrl, setBgImageUrl] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

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
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                Xem trước nền
            </div>

            {/* Preview */}
            <div
                className={cn("relative rounded-xl overflow-hidden border min-h-[200px] flex items-center justify-center", bgClass)}
                style={bgStyle}
            >
                <img src={imageUrl} alt="Result" className="max-h-[300px] object-contain" />
            </div>

            {/* Preset buttons */}
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

                {/* Custom color */}
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

                {/* Upload background */}
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
