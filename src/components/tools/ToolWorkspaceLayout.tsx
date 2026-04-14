/**
 * ToolWorkspaceLayout (v2 — OpenArt-style)
 * 
 * Đơn giản hóa: chỉ render full-width canvas.
 * Tất cả controls, history, submitButton đã được tool pages đẩy lên Dynamic Panel
 * thông qua useToolPanel() context.
 */
interface ToolWorkspaceLayoutProps {
    canvas: React.ReactNode
}

export function ToolWorkspaceLayout({ canvas }: ToolWorkspaceLayoutProps) {
    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
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
