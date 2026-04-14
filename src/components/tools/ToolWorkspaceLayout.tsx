import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import type { LucideIcon } from "lucide-react"

interface ToolWorkspaceLayoutProps {
    title: string
    icon?: LucideIcon
    controls: React.ReactNode
    canvas: React.ReactNode
    submitButton?: React.ReactNode
    historyPanel?: React.ReactNode
}

export function ToolWorkspaceLayout(props: ToolWorkspaceLayoutProps) {
    const { title, icon: Icon, controls, canvas, submitButton, historyPanel } = props
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <div className="flex flex-col min-h-[100dvh] bg-background">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0 bg-background/80 backdrop-blur z-10 sticky top-0">
                    <Button variant="ghost" size="icon" className="shrink-0 size-8" asChild>
                        <Link to="/app/tools"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-semibold truncate">{title}</h1>
                    </div>
                </div>

                {/* Canvas Area (Top half on mobile) */}
                <div className="relative min-h-[40vh] bg-muted/30 border-b flex items-center justify-center overflow-hidden">
                    {canvas}
                </div>

                {/* Controls Area (Bottom half) */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        {controls}
                        {submitButton}
                        {historyPanel && (
                            <div className="pt-4 border-t mt-4">
                                {historyPanel}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        )
    }

    // DESKTOP: Fullscreen Workspace with Floating Panels
    return (
        <div className="relative flex h-[100dvh] w-full overflow-hidden bg-dot-[#333333]/[0.1] dark:bg-dot-white/[0.05] bg-zinc-50 dark:bg-zinc-950">
            {/* Absolute positioning for the background dots */}
            <div className="absolute inset-0 pointer-events-none" />

            {/* CANVAS (Center Stage - Full Bleed) */}
            <div className="absolute inset-0 flex items-center justify-center p-4 pl-[80px] lg:pl-0 pr-[340px]">
                <div className="relative w-full h-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/20 bg-background/50 backdrop-blur-sm border flex items-center justify-center p-6">
                     {canvas}
                </div>
            </div>

            {/* HEADER (Floating Top Left) */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-xl border rounded-full p-1.5 shadow-lg shadow-black/5">
                <Button variant="ghost" size="icon" className="shrink-0 size-8 rounded-full hover:bg-muted" asChild>
                    <Link to="/app/tools"><ArrowLeft className="size-4" /></Link>
                </Button>
                <div className="flex items-center gap-2 pr-4 pl-1">
                    {Icon && <Icon className="size-4 text-primary" />}
                    <span className="text-sm font-semibold">{title}</span>
                </div>
            </div>

            {/* HISTORY PANEL (Floating Bottom Left) */}
            {historyPanel && (
                <div className="absolute bottom-4 left-4 z-20 max-w-[300px]">
                    {historyPanel}
                </div>
            )}

            {/* CONTROLS (Floating Right Panel) */}
            <div className="absolute top-4 right-4 bottom-4 w-[320px] z-20 flex flex-col bg-background/80 backdrop-blur-2xl border shadow-2xl shadow-black/10 rounded-3xl overflow-hidden">
                <div className="px-5 py-4 border-b bg-background/50">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        {Icon && <Icon className="size-4" />}
                        Tùy chỉnh
                    </h2>
                </div>
                
                <ScrollArea className="flex-1">
                    <div className="p-5 space-y-5">
                        {controls}
                    </div>
                </ScrollArea>

                {submitButton && (
                    <div className="p-4 bg-background/90 backdrop-blur border-t z-10 shrink-0">
                        {submitButton}
                    </div>
                )}
            </div>
        </div>
    )
}
