import { useIsMobile } from "@/hooks/use-mobile"

/**
 * ToolWorkspaceLayout (v2 — OpenArt-style)
 * 
 * Đơn giản hóa: chỉ render full-width canvas + historyPanel.
 * Tất cả controls/submitButton đã được tool pages đẩy lên Dynamic Panel
 * thông qua useToolPanel() context.
 */
interface ToolWorkspaceLayoutProps {
    canvas: React.ReactNode
    historyPanel?: React.ReactNode
}

export function ToolWorkspaceLayout({ canvas, historyPanel }: ToolWorkspaceLayoutProps) {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <div className="flex flex-col min-h-[100dvh] bg-background">
                {/* Canvas area chiếm toàn bộ */}
                <div className="relative flex-1 bg-dot-[#333333]/[0.1] dark:bg-dot-white/[0.05] flex flex-col items-center justify-center p-4">
                    {canvas}
                </div>
            </div>
        )
    }

    // DESKTOP: Full-width output canvas
    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-background">
            <main className="flex-1 flex flex-col min-h-0 bg-dot-[#333333]/[0.1] dark:bg-dot-white/[0.05] relative">
                {/* Dot pattern background */}
                <div className="absolute inset-0 pointer-events-none" />

                {/* History panel phía trên (nếu có) */}
                {historyPanel && (
                    <div className="absolute top-4 left-6 z-10 w-full max-w-[calc(100%-3rem)] animate-in fade-in slide-in-from-top-4 duration-500">
                        {historyPanel}
                    </div>
                )}

                {/* FULL-WIDTH CANVAS */}
                <section className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto relative z-0 mt-8">
                    <div className="w-full max-w-6xl mx-auto flex items-center justify-center">
                        {canvas}
                    </div>
                </section>
            </main>
        </div>
    )
}
