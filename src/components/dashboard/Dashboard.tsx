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
    Library,
    TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
                    .filter((t: { type: string }) => t.type === "spend")
                    .reduce((sum: number, t: { amount: number }) => sum + Math.abs(t.amount), 0)
                setTotalSpent(spent)
            }
        }).finally(() => setLoading(false))
    }, [])

    const firstName = user?.name?.split(" ").pop() ?? "bạn"
    const initials = user?.name ? user.name.split(" ").map(w => w[0]).join("").slice(-2).toUpperCase() : "U"

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 pb-8">

            {/* ===== HEADER: Avatar + Greeting + Gems ===== */}
            <div className="flex items-center gap-3">
                <Avatar className="size-11 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-sm font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">
                        {getGreeting()}, {firstName} 👋
                    </h1>
                    <p className="text-xs text-muted-foreground">Sẵn sàng sáng tạo hôm nay?</p>
                </div>
                <Link to="/app/topup">
                    <Card className="hover:bg-accent/50 transition-colors">
                        <CardContent className="flex items-center gap-2 px-3 py-2">
                            <Gem className="size-4 text-violet-400" />
                            <span className="text-sm font-bold tabular-nums">{gems.toLocaleString()}</span>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* ===== CTA BANNER ===== */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-violet-500/5 to-fuchsia-500/5">
                <CardContent className="flex items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="space-y-1.5">
                        <h2 className="text-sm sm:text-base font-semibold">Tạo tác phẩm mới</h2>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            Biến ý tưởng thành nghệ thuật chỉ với vài dòng mô tả
                        </p>
                    </div>
                    <Link to="/app/generate">
                        <Button size="sm" className="gap-1.5 rounded-full shrink-0">
                            <WandSparkles className="size-3.5" /> Tạo ảnh
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* ===== STATS + QUICK NAV ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Stat: Images */}
                <Card>
                    <CardContent className="p-3.5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                                <ImageIcon className="size-3.5 text-blue-500" />
                            </div>
                            <TrendingUp className="size-3 text-emerald-500" />
                        </div>
                        {loading ? (
                            <Skeleton className="h-6 w-10 mb-0.5" />
                        ) : (
                            <p className="text-xl font-bold tabular-nums leading-none">{totalImages.toLocaleString()}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">Ảnh đã tạo</p>
                    </CardContent>
                </Card>

                {/* Stat: Gems spent */}
                <Card>
                    <CardContent className="p-3.5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
                                <Zap className="size-3.5 text-amber-500" />
                            </div>
                        </div>
                        {loading ? (
                            <Skeleton className="h-6 w-10 mb-0.5" />
                        ) : (
                            <p className="text-xl font-bold tabular-nums leading-none">{totalSpent.toLocaleString()}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">Gems đã dùng</p>
                    </CardContent>
                </Card>

                {/* Quick Nav: AI Tools */}
                <Link to="/app/tools" className="group">
                    <Card className="h-full hover:border-violet-500/30 transition-colors">
                        <CardContent className="flex flex-col justify-center items-center gap-2 p-3.5 h-full">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                                <Sparkles className="size-4 text-violet-500" />
                            </div>
                            <span className="text-xs font-medium">Công cụ AI</span>
                        </CardContent>
                    </Card>
                </Link>

                {/* Quick Nav: Library */}
                <Link to="/app/library" className="group">
                    <Card className="h-full hover:border-emerald-500/30 transition-colors">
                        <CardContent className="flex flex-col justify-center items-center gap-2 p-3.5 h-full">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                                <Library className="size-4 text-emerald-500" />
                            </div>
                            <span className="text-xs font-medium">Thư viện</span>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* ===== TÁC PHẨM GẦN ĐÂY ===== */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-tight">Tác phẩm gần đây</h2>
                    <Link to="/app/library" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        Xem tất cả <ArrowRight className="size-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                        ))}
                    </div>
                ) : recentImages.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                                <Images className="size-5 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Chưa có tác phẩm nào</p>
                                <p className="text-xs text-muted-foreground max-w-[200px]">Bắt đầu tạo tác phẩm nghệ thuật đầu tiên của bạn!</p>
                            </div>
                            <Link to="/app/generate">
                                <Button size="sm" className="gap-1.5 rounded-full mt-1">
                                    <Plus className="size-3.5" /> Tạo ảnh ngay
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {recentImages.map((img) => (
                            <Link key={img.id} to="/app/library" className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted ring-1 ring-border/50">
                                <img
                                    src={img.file_url}
                                    alt={img.prompt ?? "AI Generated"}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                    <p className="text-[11px] text-white font-medium line-clamp-2 leading-tight drop-shadow-md">
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
