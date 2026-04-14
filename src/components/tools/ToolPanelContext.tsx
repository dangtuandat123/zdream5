import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

interface ToolPanelState {
    title: string
    icon?: LucideIcon
    controls: ReactNode
    submitButton?: ReactNode
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
 * Khi component unmount, tự động xoá panel.
 */
export function useToolPanel(config: ToolPanelState) {
    const { setPanel } = useContext(ToolPanelContext)

    useEffect(() => {
        setPanel(config)
        // Không cleanup ở đây vì config thay đổi liên tục (re-render)
        // Cleanup chỉ khi unmount
    }) // intentionally no deps — update on every render to keep controls in sync

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
