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
    Library,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { imageApi, templateApi, walletApi } from "@/lib/api"
import type { GeneratedImageData, TemplateData } from "@/lib/api"

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
        <div className="relative flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-8 overflow-hidden">

            {/* ===== HERO BANNER với gradient background ===== */}
            <div className="relative overflow-hidden rounded-2xl min-h-[200px] sm:min-h-[240px]">
                {/* Gradient orbs — lấy cảm hứng từ gradient references */}
                <div className="absolute inset-0 bg-[#0d0118]">
                    <div className="absolute -top-[30%] -left-[20%] w-[70%] h-[140%] rounded-full bg-gradient-to-br from-violet-600/60 via-purple-500/40 to-transparent blur-[80px] animate-pulse" style={{ animationDuration: "6s" }} />
                    <div className="absolute -bottom-[40%] -right-[10%] w-[60%] h-[120%] rounded-full bg-gradient-to-tl from-fuchsia-500/40 via-pink-500/30 to-transparent blur-[90px] animate-pulse" style={{ animationDuration: "8s" }} />
                    <div className="absolute top-[20%] right-[20%] w-[40%] h-[60%] rounded-full bg-gradient-to-b from-blue-500/20 to-cyan-400/10 blur-[70px] animate-pulse" style={{ animationDuration: "10s" }} />
                </div>

                {/* Content overlay */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 p-6 sm:p-8 h-full">
                    <div className="space-y-2">
                        <Badge variant="outline" className="bg-white/5 text-white/80 border-white/10 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium">
                            <Sparkles className="size-3 mr-1.5 text-violet-300" /> ZDream Studio
                        </Badge>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                            {getGreeting()},<br />
                            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                                {user?.name?.split(" ").pop() ?? "bạn"}
                            </span>!
                        </h1>
                        <p className="text-sm text-white/50 max-w-[300px]">
                            Hôm nay bạn muốn sáng tạo gì?
                        </p>
                    </div>

                    <Link to="/app/topup" className="shrink-0">
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30">
                                <Gem className="size-4 text-violet-300" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white tabular-nums leading-none">{gems.toLocaleString()}</p>
                                <p className="text-[10px] text-white/40 mt-0.5">gems khả dụng</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* ===== QUICK ACTIONS — 3 cards nổi bật ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Tạo Ảnh AI */}
                <Link to="/app/generate" className="group">
                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-fuchsia-600/5 hover:from-violet-600/30 hover:via-purple-600/20 hover:to-fuchsia-600/10 transition-all duration-500 ring-1 ring-inset ring-white/[0.06]">
                        <div className="absolute -top-8 -right-8 size-24 rounded-full bg-violet-500/15 blur-2xl group-hover:bg-violet-500/25 transition-colors duration-500" />
                        <CardContent className="relative flex items-center gap-3.5 p-4 sm:p-5">
                            <div className="flex items-center justify-center size-11 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-violet-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300">
                                <Sparkles className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm">Tạo Ảnh AI</p>
                                <p className="text-[11px] text-white/40 mt-0.5 hidden sm:block">Mô tả ý tưởng, AI tạo cho bạn</p>
                            </div>
                            <ArrowRight className="size-4 text-white/20 group-hover:text-violet-300 group-hover:translate-x-0.5 transition-all" />
                        </CardContent>
                    </Card>
                </Link>

                {/* Dùng Kiểu Mẫu */}
                <Link to="/app/templates" className="group">
                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-sky-600/20 via-cyan-600/10 to-blue-600/5 hover:from-sky-600/30 hover:via-cyan-600/20 hover:to-blue-600/10 transition-all duration-500 ring-1 ring-inset ring-white/[0.06]">
                        <div className="absolute -top-8 -right-8 size-24 rounded-full bg-sky-500/15 blur-2xl group-hover:bg-sky-500/25 transition-colors duration-500" />
                        <CardContent className="relative flex items-center gap-3.5 p-4 sm:p-5">
                            <div className="flex items-center justify-center size-11 rounded-xl bg-gradient-to-br from-sky-500/30 to-cyan-500/20 text-sky-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-300">
                                <SwatchBook className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm">Dùng Kiểu Mẫu</p>
                                <p className="text-[11px] text-white/40 mt-0.5 hidden sm:block">Template có sẵn, tạo ảnh nhanh</p>
                            </div>
                            <ArrowRight className="size-4 text-white/20 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all" />
                        </CardContent>
                    </Card>
                </Link>

                {/* Thư Viện */}
                <Link to="/app/library" className="group">
                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-600/20 via-orange-600/10 to-yellow-600/5 hover:from-amber-600/30 hover:via-orange-600/20 hover:to-yellow-600/10 transition-all duration-500 ring-1 ring-inset ring-white/[0.06]">
                        <div className="absolute -top-8 -right-8 size-24 rounded-full bg-amber-500/15 blur-2xl group-hover:bg-amber-500/25 transition-colors duration-500" />
                        <CardContent className="relative flex items-center gap-3.5 p-4 sm:p-5">
                            <div className="flex items-center justify-center size-11 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 text-amber-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300">
                                <Library className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm">Thư Viện Ảnh</p>
                                <p className="text-[11px] text-white/40 mt-0.5 hidden sm:block">Xem lại tác phẩm của bạn</p>
                            </div>
                            <ArrowRight className="size-4 text-white/20 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* ===== STATS ROW ===== */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Ảnh đã tạo", value: totalImages, icon: ImageIcon, gradient: "from-emerald-500/20 to-teal-500/10", iconColor: "text-emerald-400" },
                    { label: "Gems đã dùng", value: totalSpent, icon: Gem, gradient: "from-rose-500/20 to-pink-500/10", iconColor: "text-rose-400" },
                    { label: "Gems hiện tại", value: gems, icon: Wallet, gradient: "from-violet-500/20 to-purple-500/10", iconColor: "text-violet-400" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-0 ring-1 ring-inset ring-white/[0.06] bg-white/[0.02]">
                        <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                            <div className={`flex items-center justify-center size-9 sm:size-10 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                                <stat.icon className={`size-4 sm:size-5 ${stat.iconColor}`} />
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

            {/* ===== TÁC PHẨM GẦN ĐÂY ===== */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold tracking-tight">Tác phẩm gần đây</h2>
                    <Link to="/app/library" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        Xem tất cả <ArrowRight className="size-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                        ))}
                    </div>
                ) : recentImages.length === 0 ? (
                    <div className="relative overflow-hidden rounded-2xl">
                        {/* Gradient background cho empty state */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-fuchsia-950/30 to-transparent" />
                        <div className="absolute top-0 right-0 w-48 h-48 bg-fuchsia-500/10 blur-[80px] rounded-full" />
                        <div className="relative flex flex-col items-center justify-center gap-4 py-16 text-center px-4">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-1 ring-white/10">
                                <Images className="size-7 text-violet-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white">Chưa có tác phẩm nào</p>
                                <p className="text-xs text-white/40 max-w-[240px]">Bắt đầu hành trình sáng tạo với AI — tạo tác phẩm đầu tiên ngay!</p>
                            </div>
                            <Link to="/app/generate">
                                <Button size="sm" className="mt-1 gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border-0 shadow-lg shadow-violet-500/20">
                                    <Plus className="size-3.5" /> Tạo ảnh ngay
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {recentImages.map((img) => (
                            <Link key={img.id} to="/app/library" className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted ring-1 ring-inset ring-white/[0.06]">
                                <img
                                    src={img.file_url}
                                    alt={img.prompt ?? "AI Generated"}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                    <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-tight drop-shadow-md">
                                        {img.prompt}
                                    </p>
                                    {img.model && (
                                        <Badge variant="secondary" className="mt-1.5 bg-white/10 text-white/70 border-0 text-[9px] backdrop-blur-sm">
                                            {img.model.split("/").pop()}
                                        </Badge>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ===== KIỂU MẪU NỔI BẬT ===== */}
            <section className="space-y-4">
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
                                <Skeleton className="aspect-[3/4] rounded-2xl" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="relative overflow-hidden rounded-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-950/50 via-blue-950/30 to-transparent" />
                        <div className="relative flex flex-col items-center justify-center gap-2 py-12 text-center">
                            <SwatchBook className="size-6 text-sky-400/50" />
                            <p className="text-sm text-white/40">Chưa có kiểu mẫu nào</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {templates.map((tpl) => (
                            <Link key={tpl.id} to={`/app/templates/${tpl.slug}`} className="group space-y-2.5">
                                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted ring-1 ring-inset ring-white/[0.06]">
                                    {tpl.thumbnail ? (
                                        <img
                                            src={tpl.thumbnail}
                                            alt={tpl.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/[0.03] to-transparent">
                                            <SwatchBook className="size-10 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Bottom info overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <Badge className="bg-white/10 text-white/80 border-0 text-[10px] backdrop-blur-md font-medium">{tpl.category}</Badge>
                                    </div>
                                </div>
                                <p className="text-sm font-medium truncate px-0.5">{tpl.name}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
