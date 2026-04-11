import { useState, useEffect, useCallback } from "react"
import { imageApi, type GeneratedImageData } from "@/lib/api"

export function useToolHistory(toolName: string) {
    const [history, setHistory] = useState<GeneratedImageData[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        try {
            const res = await imageApi.list(1, 10, null, null, null, false, toolName)
            setHistory(res.data)
        } catch {
            // silent
        } finally {
            setLoading(false)
        }
    }, [toolName])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { history, loading, refresh }
}
