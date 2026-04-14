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
 * - dependencies: Mảng các biến ảnh hưởng đến controls (vd: loading, result, images, v.v.)
 */
export function useToolPanel(config: ToolPanelState, dependencies: React.DependencyList = []) {
    const { setPanel } = useContext(ToolPanelContext)

    useEffect(() => {
        setPanel(config)
        return () => setPanel(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies)
}

/**
 * Hook dành cho AIToolsLayout: đọc panel state từ context.
 */
export function useToolPanelState() {
    return useContext(ToolPanelContext)
}
