import { Link, useLocation } from "react-router-dom"
import { ArrowLeft, Eraser, Expand, FileText, PenTool, Wand2, ZoomIn, LayoutTemplate } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

// The main tools supporting seamless image transfer
const WORKSPACE_TOOLS = [
  { id: "remove-bg", name: "Xóa nền", icon: Eraser, path: "/app/tools/remove-bg" },
  { id: "upscale", name: "Upscale", icon: ZoomIn, path: "/app/tools/upscale" },
  { id: "image-edit", name: "Chỉnh sửa", icon: PenTool, path: "/app/tools/image-edit" },
  { id: "extend", name: "Mở rộng", icon: Expand, path: "/app/tools/extend" },
  { id: "style-transfer", name: "Phong cách", icon: Wand2, path: "/app/tools/style-transfer" },
  { id: "image-to-prompt", name: "Ảnh → Prompt", icon: FileText, path: "/app/tools/image-to-prompt" },
  { id: "templates", name: "Templates", icon: LayoutTemplate, path: "/app/tools/templates" },
]

interface ToolWorkspaceLayoutProps {
    title: string
    icon?: LucideIcon
    controls: React.ReactNode
    canvas: React.ReactNode
    submitButton?: React.ReactNode
    historyPanel?: React.ReactNode
    /**
     * Determines whether to show the Right Sidebar.
     * True means an image is loaded and we can show the configuration controls.
     */
    hasInputImage?: boolean
    /**
     * Current Image URL. Passed to the Seamless Switcher so users don't lose context.
     */
    currentInputUrl?: string | null
}

export function ToolWorkspaceLayout(props: ToolWorkspaceLayoutProps) {
    const { 
        title, 
        icon: Icon, 
        controls, 
        canvas, 
        submitButton, 
        historyPanel, 
        hasInputImage = true, // By default show for tools that don't need input first
        currentInputUrl 
    } = props
    
    const isMobile = useIsMobile()
    const location = useLocation()

    // Append ?input= if available
    const getTabLink = (path: string) => {
        if (!currentInputUrl) return path;
        return `${path}?input=${encodeURIComponent(currentInputUrl)}`
    }

    if (isMobile) {
        return (
            <div className="flex flex-col min-h-[100dvh] bg-background">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0 bg-background/80 backdrop-blur z-10 sticky top-0">
                    <Button variant="ghost" size="icon" className="shrink-0 size-8 -ml-2" asChild>
                        <Link to="/app/tools"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-semibold truncate">{title}</h1>
                    </div>
                </div>

                {/* Mobile Tabs Switcher (Horizontal Scroll) */}
                <ScrollArea className="w-full border-b bg-muted/20 whitespace-nowrap">
                    <div className="flex p-2 gap-1 w-max">
                        {WORKSPACE_TOOLS.map((tool) => {
                            const isActive = location.pathname.includes(tool.path)
                            return (
                                <Link
                                    key={tool.id}
                                    to={getTabLink(tool.path)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                        isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <tool.icon className="size-3.5" />
                                    {tool.name}
                                </Link>
                            )
                        })}
                    </div>
                </ScrollArea>

                {/* Canvas Area (Upload / Display) */}
                <div className="relative min-h-[50vh] bg-dot-[#333333]/[0.1] dark:bg-dot-white/[0.05] border-b flex flex-col items-center justify-center p-4">
                    {canvas}
                </div>

                {/* Controls Area (Bottom half) - Only show if hasInputImage */}
                {hasInputImage && (
                    <ScrollArea className="flex-1 bg-card">
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
                )}
            </div>
        )
    }

    // ==========================================
    // DESKTOP: SHADCN Standard Fullscreen Editor Layout
    // ==========================================
    return (
        <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-background">
            {/* 2. MAIN WORKSPACE */}
            <main className="flex-1 flex min-h-0 bg-dot-[#333333]/[0.1] dark:bg-dot-white/[0.05] relative">
                {/* Background dot pattern absolute across whole main */}
                <div className="absolute inset-0 pointer-events-none" />

                {/* CENTER STAGE (THE CANVAS & UPLOAD ZONE) */}
                {/* Seamlessly expands to 100% width if no image is uploaded and right sidebar is hidden */}
                <section className={cn(
                    "flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto relative transition-all duration-300 ease-in-out",
                    hasInputImage ? "max-w-[75%]" : "max-w-full"
                )}>
                    {historyPanel && (
                        <div className="absolute top-4 left-6 z-10 w-full max-w-[calc(100%-3rem)] animate-in fade-in slide-in-from-top-4 duration-500">
                            {historyPanel}
                        </div>
                    )}
                    
                    <div className="flex-1 flex items-center justify-center w-full max-w-5xl mx-auto z-0 mt-8">
                        {canvas}
                    </div>
                </section>

                {/* RIGHT SIDEBAR (THE CONTROLS) */}
                {/* Hidden entirely when no image is loaded -> Keeps focus on Canvas Upload */}
                {hasInputImage && (
                    <aside className="w-[320px] lg:w-[350px] shrink-0 border-l bg-card flex flex-col shadow-2xl shadow-black/5 animate-in slide-in-from-right-8 duration-300">
                        <div className="px-5 py-4 border-b bg-muted/10">
                            <h2 className="text-sm font-bold flex items-center gap-2 tracking-tight">
                                {Icon && <Icon className="size-4 text-primary" />}
                                Tùy chỉnh {title}
                            </h2>
                        </div>
                        
                        <ScrollArea className="flex-1">
                            <div className="p-5 space-y-6">
                                {controls}
                            </div>
                        </ScrollArea>

                        {submitButton && (
                            <div className="p-5 border-t bg-muted/10 shrink-0">
                                {submitButton}
                            </div>
                        )}
                    </aside>
                )}
            </main>
        </div>
    )
}
