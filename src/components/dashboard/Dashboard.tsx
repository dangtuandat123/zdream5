import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
    Sparkles,
    Images,
    ImageIcon,
    Gem,
    ArrowRight,
    Plus,
    Zap,
    WandSparkles,

} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { imageApi, walletApi } from "@/lib/api"
import type { GeneratedImageData } from "@/lib/api"

function getGreeting(): string {
    const h = new Date().getHours()
    if (h < 12) return "Chào buổi sáng"
    if (h < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
}

export function Dashboard() {
    const { user, gems } = useAuth()

    const [recentImages, setRecentImages] = useState<GeneratedImageData[]>([])
    const [totalImages, setTotalImages] = useState(0)
    const [totalSpent, setTotalSpent] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        Promise.allSettled([
            imageApi.list(1, 8),
            walletApi.show(),
        ]).then(([imgRes, walRes]) => {
            if (imgRes.status === "fulfilled") {
                setRecentImages(imgRes.value.data)
                setTotalImages(imgRes.value.total)
            }
            if (walRes.status === "fulfilled") {
                const spent = walRes.value.transactions
                    .filter(t => t.type === "spend")
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                setTotalSpent(spent)
            }
        }).finally(() => setLoading(false))
    }, [])

    const firstName = user?.name?.split(" ").pop() ?? "bạn"

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-8">

            {/* ===== HEADER ROW ===== */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {getGreeting()}, {firstName}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Biến ý tưởng thành tác phẩm nghệ thuật với AI
                    </p>
                </div>
                <Link to="/app/topup">
                    <Button variant="outline" className="gap-2 h-10 px-4">
                        <Gem className="size-4 text-violet-400" />
                        <span className="text-base font-semibold tabular-nums">{gems.toLocaleString()}</span>
                        <span className="text-muted-foreground text-sm">gems</span>
                    </Button>
                </Link>
            </div>

            {/* ===== STATS + CTA ROW ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Stat: Images */}
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                            <ImageIcon className="size-5 text-violet-400" />
                        </div>
                        <div className="min-w-0">
                            {loading ? (
                                <Skeleton className="h-7 w-12" />
                            ) : (
                                <p className="text-2xl font-bold tabular-nums leading-none">{totalImages.toLocaleString()}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">Ảnh đã tạo</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Stat: Gems spent */}
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                            <Zap className="size-5 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                            {loading ? (
                                <Skeleton className="h-7 w-12" />
                            ) : (
                                <p className="text-2xl font-bold tabular-nums leading-none">{totalSpent.toLocaleString()}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">Gems đã dùng</p>
                        </div>
                    </CardContent>
                </Card>

                {/* CTA: Generate */}
                <Link to="/app/generate" className="contents">
                    <Card className="cursor-pointer hover:border-violet-500/50 transition-colors group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 group-hover:bg-violet-500/25 transition-colors">
                                <WandSparkles className="size-5 text-violet-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-semibold leading-none">Tạo ảnh</p>
                                <p className="text-xs text-muted-foreground mt-1">Bắt đầu sáng tạo</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* CTA: AI Tools */}
                <Link to="/app/tools" className="contents">
                    <Card className="cursor-pointer hover:border-violet-500/50 transition-colors group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/15 group-hover:bg-fuchsia-500/25 transition-colors">
                                <Sparkles className="size-5 text-fuchsia-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-semibold leading-none">Công cụ AI</p>
                                <p className="text-xs text-muted-foreground mt-1">Khám phá thêm</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* ===== TÁC PHẨM GẦN ĐÂY ===== */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold tracking-tight">Tác phẩm gần đây</h2>
                    <Link to="/app/library" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        Xem tất cả <ArrowRight className="size-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                        ))}
                    </div>
                ) : recentImages.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                                <Images className="size-5 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Chưa có tác phẩm nào</p>
                                <p className="text-xs text-muted-foreground">Bắt đầu tạo tác phẩm đầu tiên của bạn!</p>
                            </div>
                            <Link to="/app/generate">
                                <Button size="sm" className="gap-1.5 mt-1">
                                    <Plus className="size-3.5" /> Tạo ảnh ngay
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {recentImages.map((img) => (
                            <Link key={img.id} to="/app/library" className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                                <img
                                    src={img.file_url}
                                    alt={img.prompt ?? "AI Generated"}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                    <p className="text-[11px] text-white font-medium line-clamp-2 leading-tight">
                                        {img.prompt}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
