import { useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"

/**
 * Hook to receive an image URL from cross-tool navigation (?input=<url>).
 * Calls onInput once when the URL param is present, then clears it.
 */
export function useInputFromUrl(onInput: (url: string) => void) {
    const [searchParams, setSearchParams] = useSearchParams()
    const called = useRef(false)

    useEffect(() => {
        const input = searchParams.get("input")
        if (input && !called.current) {
            called.current = true
            onInput(input)
            // Clear the param from URL without navigation
            searchParams.delete("input")
            setSearchParams(searchParams, { replace: true })
        }
    }, [searchParams, setSearchParams, onInput])
}
