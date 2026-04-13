import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"

interface ToolPageShellProps {
    title: string
    backTo?: string
    backLabel?: string
    badge?: string
    controls: React.ReactNode
    submitButton: React.ReactNode
    canvas: React.ReactNode
    sidebarWidth?: string
}

export function ToolPageShell({
    title,
    backTo = "/app/tools",
    backLabel = "Công cụ AI",
    badge,
    controls,
    submitButton,
    canvas,
    sidebarWidth = "w-[380px]",
}: ToolPageShellProps) {
    const isMobile = useIsMobile()

    const Header = (
        <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
                <Link to={backTo}><ArrowLeft className="size-4" /></Link>
            </Button>
            <div className="min-w-0 flex-1">
                {!isMobile && (
                    <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                        <Link to="/app/tools" className="hover:text-foreground transition-colors">{backLabel}</Link>
                        <ChevronRight className="size-3" />
                        <span className="text-foreground font-medium truncate">{title}</span>
                    </nav>
                )}
                <h1 className={`font-semibold truncate ${isMobile ? "text-sm" : "text-base"}`}>{title}</h1>
            </div>
            {badge && <Badge variant="secondary" className="shrink-0 text-xs">{badge}</Badge>}
        </div>
    )

    if (isMobile) {
        return (
            <div className="flex flex-col min-h-0 h-full">
                {Header}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        {controls}
                        {submitButton}
                        <Separator />
                        {canvas}
                    </div>
                </ScrollArea>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[100dvh] overflow-hidden">
            {Header}
            <div className="flex flex-1 min-h-0">
                {/* LEFT: Controls */}
                <div className={`${sidebarWidth} shrink-0 border-r flex flex-col overflow-hidden`}>
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {controls}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t shrink-0">
                        {submitButton}
                    </div>
                </div>
                {/* RIGHT: Canvas */}
                <div className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1">
                        <div className="p-4">
                            {canvas}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}
