import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
    Sparkles,
    SwatchBook,
    Images,
    ImageIcon,
    Gem,
    Wallet,
    ArrowRight,
    Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { imageApi, templateApi, walletApi } from "@/lib/api"
import type { GeneratedImageData, TemplateData } from "@/lib/api"

// Lời chào theo thời gian trong ngày
function getGreeting(): string {
    const h = new Date().getHours()
    if (h < 12) return "Chào buổi sáng"
    if (h < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
}

export function Dashboard() {
    const { user, gems } = useAuth()

    const [recentImages, setRecentImages] = useState<GeneratedImageData[]>([])
    const [templates, setTemplates] = useState<TemplateData[]>([])
    const [totalImages, setTotalImages] = useState(0)
    const [totalSpent, setTotalSpent] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        Promise.allSettled([
            imageApi.list(1, 8),
            templateApi.list(),
            walletApi.show(),
        ]).then(([imgRes, tplRes, walRes]) => {
            if (imgRes.status === "fulfilled") {
                setRecentImages(imgRes.value.data)
                setTotalImages(imgRes.value.total)
            }
            if (tplRes.status === "fulfilled") {
                setTemplates(tplRes.value.data.slice(0, 6))
            }
            if (walRes.status === "fulfilled") {
                const spent = walRes.value.transactions
                    .filter(t => t.type === "spend")
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                setTotalSpent(spent)
            }
        }).finally(() => setLoading(false))
    }, [])

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-8">

            {/* === 1. Welcome Header === */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {getGreeting()}, {user?.name?.split(" ").pop() ?? "bạn"}!
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Hôm nay bạn muốn sáng tạo gì?
                    </p>
                </div>
                <Link to="/app/topup">
                    <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors cursor-pointer">
                        <Gem className="size-3.5 text-violet-400" />
                        <span className="tabular-nums font-semibold">{gems.toLocaleString()}</span>
                        <span className="text-muted-foreground">gems</span>
                    </Badge>
                </Link>
            </div>

            {/* === 2. Quick Actions === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/app/generate" className="group">
                    <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-violet-950/80 to-violet-900/30 hover:from-violet-900/90 hover:to-violet-800/40 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-[60px] rounded-full" />
                        <CardContent className="relative flex items-center gap-4 p-5">
                            <div className="flex items-center justify-center size-12 rounded-xl bg-violet-500/20 text-violet-400 group-hover:scale-110 transition-transform">
                                <Sparkles className="size-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white">Tạo Ảnh AI</p>
                                <p className="text-xs text-white/50 mt-0.5">Mô tả ý tưởng, AI sẽ tạo cho bạn</p>
                            </div>
                            <ArrowRight className="size-5 text-white/30 group-hover:text-white/60 transition-colors" />
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/app/templates" className="group">
                    <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-sky-950/80 to-sky-900/30 hover:from-sky-900/90 hover:to-sky-800/40 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[60px] rounded-full" />
                        <CardContent className="relative flex items-center gap-4 p-5">
                            <div className="flex items-center justify-center size-12 rounded-xl bg-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
                                <SwatchBook className="size-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white">Dùng Kiểu Mẫu</p>
                                <p className="text-xs text-white/50 mt-0.5">Chọn template có sẵn để tạo ảnh nhanh</p>
                            </div>
                            <ArrowRight className="size-5 text-white/30 group-hover:text-white/60 transition-colors" />
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* === 3. Stats Row === */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Ảnh đã tạo", value: totalImages, icon: ImageIcon, color: "text-emerald-400", bg: "bg-emerald-500/15" },
                    { label: "Gems đã dùng", value: totalSpent, icon: Gem, color: "text-amber-400", bg: "bg-amber-500/15" },
                    { label: "Gems hiện tại", value: gems, icon: Wallet, color: "text-violet-400", bg: "bg-violet-500/15" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-border/50 bg-card/50">
                        <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                            <div className={`flex items-center justify-center size-9 sm:size-10 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`size-4 sm:size-5 ${stat.color}`} />
                            </div>
                            <div className="min-w-0">
                                {loading ? (
                                    <Skeleton className="h-6 w-14" />
                                ) : (
                                    <p className="text-lg sm:text-xl font-bold tabular-nums truncate">{stat.value.toLocaleString()}</p>
                                )}
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* === 4. Tác phẩm gần đây === */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold tracking-tight">Tác phẩm gần đây</h2>
                    <Link to="/app/library" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        Xem tất cả <ArrowRight className="size-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                        ))}
                    </div>
                ) : recentImages.length === 0 ? (
                    <Card className="border-dashed border-border/50">
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                                <Images className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">Chưa có ảnh nào</p>
                            <p className="text-xs text-muted-foreground">Bắt đầu tạo tác phẩm đầu tiên của bạn!</p>
                            <Link to="/app/generate">
                                <Button size="sm" className="mt-1 gap-1.5">
                                    <Plus className="size-3.5" /> Tạo ảnh ngay
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {recentImages.map((img) => (
                            <Link key={img.id} to="/app/library" className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                                <img
                                    src={img.file_url}
                                    alt={img.prompt ?? "AI Generated"}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                    <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-tight drop-shadow-md">
                                        {img.prompt}
                                    </p>
                                    {img.model && (
                                        <Badge variant="secondary" className="mt-1.5 bg-white/10 text-white/70 border-white/10 text-[9px] backdrop-blur-sm">
                                            {img.model.split("/").pop()}
                                        </Badge>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* === 5. Kiểu mẫu nổi bật === */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold tracking-tight">Kiểu mẫu nổi bật</h2>
                    <Link to="/app/templates" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        Xem tất cả <ArrowRight className="size-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="aspect-video rounded-xl" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <Card className="border-dashed border-border/50">
                        <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                            <SwatchBook className="size-6 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Chưa có kiểu mẫu nào</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {templates.map((tpl) => (
                            <Link key={tpl.id} to={`/app/templates/${tpl.slug}`} className="group space-y-2">
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                                    {tpl.thumbnail ? (
                                        <img
                                            src={tpl.thumbnail}
                                            alt={tpl.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <SwatchBook className="size-8 text-muted-foreground/50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate flex-1">{tpl.name}</p>
                                    <Badge variant="secondary" className="text-[10px] shrink-0">{tpl.category}</Badge>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
