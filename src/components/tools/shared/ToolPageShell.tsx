import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface ToolPageShellProps {
    title: string
    description?: string
    icon?: LucideIcon
    gradient?: string
    controls: React.ReactNode
    submitButton: React.ReactNode
    canvas: React.ReactNode
    /** Whether canvas has actual content (result/loading/history) */
    hasCanvasContent?: boolean
}

export function ToolPageShell({
    title,
    description,
    icon: Icon,
    gradient,
    controls,
    submitButton,
    canvas,
    hasCanvasContent = false,
}: ToolPageShellProps) {
    return (
        <div className="flex flex-1 flex-col gap-0 p-3 sm:p-4 lg:p-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                <Button variant="ghost" size="icon" className="size-7 -ml-1 mr-0.5 shrink-0" asChild>
                    <Link to="/app/tools"><ArrowLeft className="size-3.5" /></Link>
                </Button>
                <Link to="/app/tools" className="hover:text-foreground transition-colors hidden sm:inline">Công cụ AI</Link>
                <ChevronRight className="size-3 hidden sm:block" />
                <span className="text-foreground font-medium truncate">{title}</span>
            </nav>

            {/* Gradient header */}
            <div className={cn(
                "relative rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 px-4 py-3 sm:p-5",
                gradient || "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
            )}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_70%)]" />
                <div className="relative flex items-center gap-2.5 sm:gap-3.5">
                    {Icon && (
                        <div className="flex items-center justify-center size-9 sm:size-11 rounded-lg sm:rounded-xl bg-background/80 backdrop-blur border shadow-sm shrink-0">
                            <Icon className="size-4 sm:size-5 text-primary" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight truncate">{title}</h1>
                        {description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-lg hidden sm:block">{description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content: adaptive grid */}
            {hasCanvasContent ? (
                /* 2-column when there's result/history to show */
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,480px)_1fr] gap-4 sm:gap-6">
                    {/* Controls column */}
                    <div className="space-y-4">
                        {controls}
                        {submitButton}
                    </div>
                    {/* Canvas column — on mobile, show first when has content */}
                    <div className="order-first lg:order-none">
                        {canvas}
                    </div>
                </div>
            ) : (
                /* Single centered column when no result yet — controls take prominent space */
                <div className="max-w-xl mx-auto w-full space-y-4">
                    {controls}
                    {submitButton}
                </div>
            )}
        </div>
    )
}
