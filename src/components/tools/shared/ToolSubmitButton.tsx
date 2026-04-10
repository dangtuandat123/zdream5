import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToolSubmitButtonProps {
    onClick: () => void
    loading?: boolean
    disabled?: boolean
    gemsCost?: number
    label?: string
}

export function ToolSubmitButton({
    onClick,
    loading = false,
    disabled = false,
    gemsCost = 2,
    label = "Tạo ảnh",
}: ToolSubmitButtonProps) {
    return (
        <Button
            onClick={onClick}
            disabled={loading || disabled}
            className="w-full h-11 gap-2 text-sm font-semibold"
            size="lg"
        >
            {loading ? (
                <Loader2 className="size-4 animate-spin" />
            ) : (
                <Sparkles className="size-4" />
            )}
            {loading ? "Đang xử lý..." : `${label} (${gemsCost} 💎)`}
        </Button>
    )
}
