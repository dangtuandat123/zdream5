import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToolSubmitButtonProps {
    onClick: () => void
    loading?: boolean
    disabled?: boolean
    gemsCost?: number
    label?: string
    gemsBalance?: number
}

export function ToolSubmitButton({
    onClick,
    loading = false,
    disabled = false,
    gemsCost = 2,
    label = "Tạo ảnh",
    gemsBalance,
}: ToolSubmitButtonProps) {
    const insufficientGems = gemsBalance !== undefined && gemsBalance < gemsCost

    return (
        <div className="space-y-1.5">
            <Button
                onClick={onClick}
                disabled={loading || disabled || insufficientGems}
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
            {gemsBalance !== undefined && gemsBalance < 10 && (
                <p className={`text-xs text-center ${insufficientGems ? "text-destructive" : "text-muted-foreground"}`}>
                    {insufficientGems
                        ? `Không đủ gems. Bạn còn ${gemsBalance} 💎, cần ${gemsCost} 💎.`
                        : `Bạn còn ${gemsBalance} 💎`
                    }
                </p>
            )}
        </div>
    )
}
