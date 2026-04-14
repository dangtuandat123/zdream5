import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

interface ToolPanelState {
    title: string
    icon?: LucideIcon
    controls: ReactNode
    submitButton?: ReactNode
    historyPanel?: ReactNode
}

interface ToolPanelContextValue {
    panel: ToolPanelState | null
    setPanel: (panel: ToolPanelState | null) => void
}

const ToolPanelContext = createContext<ToolPanelContextValue>({
    panel: null,
    setPanel: () => {},
})

export function ToolPanelProvider({ children }: { children: ReactNode }) {
    const [panel, setPanel] = useState<ToolPanelState | null>(null)
    return (
        <ToolPanelContext.Provider value={{ panel, setPanel }}>
            {children}
        </ToolPanelContext.Provider>
    )
}

/**
 * Hook dành cho tool pages: đăng ký controls lên Dynamic Panel (Col 2).
 * Đã sửa lỗi re-render bằng cách sử dụng ref để track active id hoặc để user tự control.
 * Vì Node không thể check equality dễ dàng con đường tốt nhất là để components mount mới call.
 */
export function useToolPanel(config: ToolPanelState) {
    const { setPanel } = useContext(ToolPanelContext)

    useEffect(() => {
        setPanel(config)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        config.title, 
        config.controls, 
        config.submitButton
    ])

    // Cleanup khi tool page unmount (quay về catalog)
    useEffect(() => {
        return () => setPanel(null)
    }, [setPanel])
}

/**
 * Hook dành cho AIToolsLayout: đọc panel state từ context.
 */
export function useToolPanelState() {
    return useContext(ToolPanelContext)
}
