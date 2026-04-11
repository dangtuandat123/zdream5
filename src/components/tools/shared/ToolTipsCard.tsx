import { useState } from "react"
import { Lightbulb, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolTipsCardProps {
    tips: string[]
}

export function ToolTipsCard({ tips }: ToolTipsCardProps) {
    const [open, setOpen] = useState(false)

    if (tips.length === 0) return null

    return (
        <div className="rounded-xl border bg-muted/30">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                <span className="flex items-center gap-1.5">
                    <Lightbulb className="size-3.5 text-yellow-500" />
                    Mẹo sử dụng
                </span>
                <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
                <ul className="px-3 pb-3 space-y-1.5">
                    {tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                            <span className="text-yellow-500 shrink-0 mt-0.5">•</span>
                            {tip}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
