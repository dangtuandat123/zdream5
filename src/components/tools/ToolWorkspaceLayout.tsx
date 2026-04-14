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
    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            {/* History panel overlay phía trên */}
            {historyPanel && (
                <div className="px-5 pt-4 pb-0 shrink-0 z-10 relative">
                    {historyPanel}
                </div>
            )}

            {/* FULL-WIDTH CANVAS — center content, cho phép scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-full p-6 lg:p-8">
                    <div className="w-full max-w-5xl">
                        {canvas}
                    </div>
                </div>
            </div>
        </div>
    )
}
