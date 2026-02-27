import { Skeleton } from "@/components/ui/skeleton"

export default function AppLoading() {
    return (
        <div className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-28 hidden sm:block" />
                </div>

                {/* Stats skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-[72px] rounded-xl" />
                    ))}
                </div>

                {/* Content skeleton */}
                <Skeleton className="h-24 rounded-xl mb-6 sm:mb-8" />

                {/* Grid skeleton */}
                <div className="space-y-3 sm:space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
