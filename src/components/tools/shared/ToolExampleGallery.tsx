import { useState } from "react"
import { ChevronDown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolExample {
    before: string
    after: string
    label: string
}

interface ToolExampleGalleryProps {
    examples: ToolExample[]
    onUseSample?: (imageUrl: string) => void
    className?: string
}

export function ToolExampleGallery({ examples, onUseSample, className }: ToolExampleGalleryProps) {
    const [open, setOpen] = useState(false)
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

    if (examples.length === 0) return null

    return (
        <div className={cn("rounded-xl border bg-muted/20 overflow-hidden", className)}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    Ví dụ kết quả
                </span>
                <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
                <div className="px-3 pb-3 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {examples.map((ex, i) => (
                            <div
                                key={i}
                                className="group relative rounded-lg overflow-hidden border bg-muted aspect-[4/3] cursor-pointer"
                                onMouseEnter={() => setHoveredIdx(i)}
                                onMouseLeave={() => setHoveredIdx(null)}
                                onClick={() => onUseSample?.(ex.before)}
                            >
                                {/* Show before image normally, after on hover */}
                                <img
                                    src={hoveredIdx === i ? ex.after : ex.before}
                                    alt={ex.label}
                                    className="w-full h-full object-cover transition-opacity"
                                />
                                {/* Label */}
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                                    <p className="text-[10px] text-white font-medium truncate">{ex.label}</p>
                                    <p className="text-[9px] text-white/70">
                                        {hoveredIdx === i ? "Sau" : "Trước"} · hover để xem
                                    </p>
                                </div>
                                {/* Use as input button */}
                                {onUseSample && hoveredIdx === i && (
                                    <div className="absolute top-1.5 right-1.5">
                                        <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
                                            Dùng thử
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {onUseSample && (
                        <p className="text-[10px] text-muted-foreground text-center">
                            Click vào ảnh mẫu để dùng thử • Di chuột để xem kết quả
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

// ============ Example data per tool ============
// Using placeholder URLs — these would be actual hosted sample images
export const TOOL_EXAMPLES: Record<string, ToolExample[]> = {
    'remove-bg': [
        { before: "/images/examples/removebg-before-1.jpg", after: "/images/examples/removebg-after-1.png", label: "Chân dung → nền trong suốt" },
        { before: "/images/examples/removebg-before-2.jpg", after: "/images/examples/removebg-after-2.png", label: "Sản phẩm → tách nền" },
        { before: "/images/examples/removebg-before-3.jpg", after: "/images/examples/removebg-after-3.png", label: "Thú cưng → xóa nền" },
    ],
    'upscale': [
        { before: "/images/examples/upscale-before-1.jpg", after: "/images/examples/upscale-after-1.jpg", label: "Ảnh mờ → sắc nét 2x" },
        { before: "/images/examples/upscale-before-2.jpg", after: "/images/examples/upscale-after-2.jpg", label: "Ảnh nhỏ → phóng to 4x" },
    ],
    'style-transfer': [
        { before: "/images/examples/style-before-1.jpg", after: "/images/examples/style-after-anime.jpg", label: "Chân dung → Anime" },
        { before: "/images/examples/style-before-1.jpg", after: "/images/examples/style-after-oil.jpg", label: "Chân dung → Sơn dầu" },
        { before: "/images/examples/style-before-2.jpg", after: "/images/examples/style-after-cyber.jpg", label: "Phong cảnh → Cyberpunk" },
    ],
    'image-edit': [
        { before: "/images/examples/edit-before-1.jpg", after: "/images/examples/edit-after-remove.jpg", label: "Xóa người khỏi ảnh" },
        { before: "/images/examples/edit-before-2.jpg", after: "/images/examples/edit-after-replace.jpg", label: "Thay đổi vật thể" },
    ],
    'extend': [
        { before: "/images/examples/extend-before-1.jpg", after: "/images/examples/extend-after-1.jpg", label: "Mở rộng bầu trời" },
        { before: "/images/examples/extend-before-2.jpg", after: "/images/examples/extend-after-2.jpg", label: "Dọc → ngang" },
    ],
    'image-to-prompt': [
        { before: "/images/examples/prompt-input-1.jpg", after: "/images/examples/prompt-input-1.jpg", label: "Phân tích phong cảnh" },
        { before: "/images/examples/prompt-input-2.jpg", after: "/images/examples/prompt-input-2.jpg", label: "Phân tích nhân vật" },
    ],
}
