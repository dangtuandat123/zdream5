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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
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

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 pb-8 max-w-5xl">

            {/* ===== GREETING + GEMS ===== */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                        {getGreeting()}, {firstName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Biến ý tưởng thành tác phẩm nghệ thuật với AI
                    </p>
                </div>
                <Link to="/app/topup">
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                        <Gem className="size-3.5 text-violet-500" />
                        <span className="font-semibold tabular-nums">{gems.toLocaleString()}</span>
                        <span className="text-muted-foreground text-xs hidden sm:inline">gems</span>
                    </Button>
                </Link>
            </div>

            {/* ===== STATS ROW ===== */}
            <div className="grid grid-cols-2 gap-3">
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                            <ImageIcon className="size-4 text-primary" />
                        </div>
                        <div>
                            {loading ? (
                                <Skeleton className="h-5 w-12 mb-1" />
                            ) : (
                                <p className="text-lg font-semibold tabular-nums leading-none">{totalImages.toLocaleString()}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">Ảnh đã tạo</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-orange-500/10">
                            <Zap className="size-4 text-orange-500" />
                        </div>
                        <div>
                            {loading ? (
                                <Skeleton className="h-5 w-12 mb-1" />
                            ) : (
                                <p className="text-lg font-semibold tabular-nums leading-none">{totalSpent.toLocaleString()}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">Gems đã dùng</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ===== QUICK ACTIONS ===== */}
            <div className="grid grid-cols-3 gap-3">
                <Link to="/app/generate">
                    <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                        <CardContent className="flex flex-col items-center gap-2 p-4">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                                <WandSparkles className="size-5 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Tạo ảnh</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/app/tools">
                    <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                        <CardContent className="flex flex-col items-center gap-2 p-4">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10">
                                <Sparkles className="size-5 text-violet-500" />
                            </div>
                            <span className="text-xs font-medium">Công cụ AI</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/app/library">
                    <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                        <CardContent className="flex flex-col items-center gap-2 p-4">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                <Library className="size-5 text-emerald-500" />
                            </div>
                            <span className="text-xs font-medium">Thư viện</span>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <Separator />

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
                                <p className="text-xs text-muted-foreground">Bắt đầu tạo tác phẩm đầu tiên!</p>
                            </div>
                            <Link to="/app/generate">
                                <Button size="sm" className="gap-1.5 rounded-full">
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
