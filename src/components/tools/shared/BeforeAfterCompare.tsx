interface BeforeAfterCompareProps {
    beforeUrl: string
    afterUrl: string
}

export function BeforeAfterCompare({ beforeUrl, afterUrl }: BeforeAfterCompareProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Trước</span>
                <div className="rounded-xl overflow-hidden border bg-muted">
                    <img src={beforeUrl} alt="Before" className="w-full max-h-[300px] object-contain" />
                </div>
            </div>
            <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Sau</span>
                <div className="rounded-xl overflow-hidden border bg-muted">
                    <img src={afterUrl} alt="After" className="w-full max-h-[300px] object-contain" />
                </div>
            </div>
        </div>
    )
}
