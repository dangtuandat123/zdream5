import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface ToolPageLayoutBaseProps {
    title: string
    description?: string
    icon?: LucideIcon
    gradient?: string
}

interface ToolPageLayoutSidebarProps extends ToolPageLayoutBaseProps {
    controls: React.ReactNode
    canvas: React.ReactNode
    submitButton?: React.ReactNode
    children?: never
    headerRight?: never
}

interface ToolPageLayoutLegacyProps extends ToolPageLayoutBaseProps {
    children: React.ReactNode
    headerRight?: React.ReactNode
    controls?: never
    canvas?: never
    submitButton?: never
}

type ToolPageLayoutProps = ToolPageLayoutSidebarProps | ToolPageLayoutLegacyProps

export function ToolPageLayout(props: ToolPageLayoutProps) {
    const {
        title,
        description,
        icon: Icon,
        gradient,
    } = props
    const isMobile = useIsMobile()

    // Legacy mode — simple scrollable page with gradient header
    if ('children' in props && props.children) {
        return (
            <div className="flex flex-1 flex-col gap-0 p-3 sm:p-4 lg:p-6">
                <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    <Button variant="ghost" size="icon" className="size-7 -ml-1 mr-0.5 shrink-0" asChild>
                        <Link to="/app/tools"><ArrowLeft className="size-3.5" /></Link>
                    </Button>
                    <Link to="/app/tools" className="hover:text-foreground transition-colors hidden sm:inline">Công cụ AI</Link>
                    <ChevronRight className="size-3 hidden sm:block" />
                    <span className="text-foreground font-medium truncate">{title}</span>
                </nav>
                <div className={cn(
                    "relative rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 px-4 py-3 sm:p-5",
                    gradient || "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
                )}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_70%)]" />
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3.5">
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
                        {props.headerRight}
                    </div>
                </div>
                {props.children}
            </div>
        )
    }

    const { controls, canvas, submitButton } = props as ToolPageLayoutSidebarProps

    // ============================
    // MOBILE LAYOUT — single column scroll
    // ============================
    if (isMobile) {
        return (
            <div className="flex flex-col min-h-0 h-full">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
                    <Button variant="ghost" size="icon" className="shrink-0" asChild>
                        <Link to="/app/tools"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <nav className="flex items-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                            <Link to="/app/tools" className="hover:text-foreground transition-colors">Công cụ AI</Link>
                        </nav>
                        <h1 className="text-sm font-semibold truncate">{title}</h1>
                    </div>
                    {Icon && (
                        <div className={cn(
                            "flex items-center justify-center size-8 rounded-lg shrink-0",
                            gradient || "bg-primary/10"
                        )}>
                            <Icon className="size-4 text-primary" />
                        </div>
                    )}
                </div>

                {/* Scrollable content */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        {controls}
                        {submitButton}
                        <div className="border-t pt-4">
                            {canvas}
                        </div>
                    </div>
                </ScrollArea>
            </div>
        )
    }

    // ============================
    // DESKTOP LAYOUT — sidebar + canvas (like TemplateDetailPage)
    // ============================
    return (
        <div className="flex flex-col h-[100dvh] overflow-hidden">
            {/* Header — compact */}
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
                <Button variant="ghost" size="icon" className="shrink-0" asChild>
                    <Link to="/app/tools"><ArrowLeft className="size-4" /></Link>
                </Button>
                <div className="min-w-0 flex-1">
                    <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                        <Link to="/app/tools" className="hover:text-foreground transition-colors">Công cụ AI</Link>
                        <ChevronRight className="size-3" />
                        <span className="text-foreground font-medium truncate">{title}</span>
                    </nav>
                    <h1 className="text-base font-semibold truncate">{title}</h1>
                </div>
                {description && (
                    <span className="text-xs text-muted-foreground shrink-0 hidden lg:block max-w-xs truncate">{description}</span>
                )}
            </div>

            {/* 2-column layout: sidebar 40% | canvas 60% */}
            <div className="flex flex-1 min-h-0">
                {/* LEFT: Controls sidebar */}
                <div className="w-[40%] shrink-0 border-r flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {controls}
                        </div>
                    </ScrollArea>
                    {submitButton && (
                        <div className="p-4 border-t shrink-0">
                            {submitButton}
                        </div>
                    )}
                </div>

                {/* RIGHT: Canvas — 60% */}
                <div className="w-[60%] flex flex-col min-h-0">
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {canvas}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}
