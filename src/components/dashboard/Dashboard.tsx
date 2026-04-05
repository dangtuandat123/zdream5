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
    Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { imageApi, templateApi, walletApi } from "@/lib/api"
import type { GeneratedImageData, TemplateData } from "@/lib/api"

export function Dashboard() {
    const { gems } = useAuth()

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
                    .filter((t: { type: string }) => t.type === "spend")
                    .reduce((sum: number, t: { amount: number }) => sum + Math.abs(t.amount), 0)
                setTotalSpent(spent)
            }
        }).finally(() => setLoading(false))
    }, [])

    return (
        <div className="flex flex-1 flex-col gap-5 sm:gap-6 p-3.5 sm:p-4 lg:p-6 pb-8">

            {/* ===== HERO BANNER ===== */}
            <div
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
                style={{ backgroundImage: "url(/images/gradient-purple.png?v=1)", backgroundSize: "cover", backgroundPosition: "center" }}
            >
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 p-4 sm:p-8 lg:p-10">
                    <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/10 text-white/90 backdrop-blur-md shadow-lg mb-4 sm:mb-5">
                            <Sparkles className="size-3" />
                            Mới
                        </span>
                        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight mb-0.5 sm:mb-1">
                            Nano Banana 2
                        </h1>
                        <p className="text-[11px] text-white/40 font-medium mb-2 sm:mb-3">Gemini 3.1 Flash Image Preview</p>
                        <p className="text-xs sm:text-sm text-white/60 max-w-md leading-relaxed">
                            Mô hình tạo ảnh AI mới nhất từ Google — chất lượng hình ảnh cấp Pro với tốc độ Flash.
                        </p>
                    </div>
                    <Link to="/app/generate" className="shrink-0">
                        <Button className="bg-white text-black hover:bg-white/90 font-semibold rounded-full px-5 h-9 shadow-lg shadow-white/10 gap-2 text-sm">
                            <WandSparkles className="size-4" /> Tạo ảnh ngay
                        </Button>
                    </Link>
                </div>
            </div>

            {/* ===== STATS CARDS ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <Card className="border-border/50 bg-card/80">
                    <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                        <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-violet-500/10">
                            <Gem className="size-4 sm:size-[18px] text-violet-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-muted-foreground">Gems</p>
                            {loading ? <Skeleton className="h-5 w-10" /> : (
                                <p className="text-base sm:text-lg font-bold tabular-nums">{gems.toLocaleString()}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/80">
                    <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                        <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-blue-500/10">
                            <ImageIcon className="size-4 sm:size-[18px] text-blue-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-muted-foreground">Ảnh đã tạo</p>
                            {loading ? <Skeleton className="h-5 w-10" /> : (
                                <p className="text-base sm:text-lg font-bold tabular-nums">{totalImages}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/80">
                    <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                        <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-amber-500/10">
                            <TrendingUp className="size-4 sm:size-[18px] text-amber-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-muted-foreground">Đã dùng</p>
                            {loading ? <Skeleton className="h-5 w-10" /> : (
                                <p className="text-base sm:text-lg font-bold tabular-nums">{totalSpent} <span className="text-xs font-normal text-muted-foreground">gems</span></p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Link to="/app/topup" className="group">
                    <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors h-full">
                        <CardContent className="flex items-center gap-3 p-3 sm:p-4 h-full">
                            <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary/10">
                                <Plus className="size-4 sm:size-[18px] text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-primary">Nạp thêm</p>
                                <p className="text-[11px] text-muted-foreground">Mua gems</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* ===== QUICK ACTIONS ===== */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[
                    { to: "/app/generate", label: "Tạo ảnh", desc: "Bằng AI", icon: WandSparkles, bg: "/images/gradient-pink.png?v=1" },
                    { to: "/app/tools", label: "Công cụ AI", desc: "11 công cụ", icon: Sparkles, bg: "/images/gradient-blue.png?v=1" },
                    { to: "/app/library", label: "Thư viện", desc: "Bộ sưu tập", icon: Library, bg: "/images/gradient-purple.png?v=1" },
                ].map((item) => (
                    <Link key={item.to} to={item.to} className="group">
                        <div
                            className="relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[2/1] sm:aspect-[2.5/1]"
                            style={{ backgroundImage: `url(${item.bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
                        >
                            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/35 transition-colors duration-300" />
                            <div className="relative z-10 flex items-center justify-center h-full gap-2.5 sm:gap-3">
                                <div className="flex items-center justify-center size-9 sm:size-11 rounded-xl bg-white/15 backdrop-blur-sm text-white group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300 shadow-lg">
                                    <item.icon className="size-[18px] sm:size-5" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-semibold text-white drop-shadow-md">{item.label}</p>
                                    <p className="text-[11px] text-white/50">{item.desc}</p>
                                </div>
                                <span className="sm:hidden text-xs font-semibold text-white drop-shadow-md">{item.label}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ===== TÁC PHẨM GẦN ĐÂY ===== */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-semibold tracking-tight flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        Tác phẩm gần đây
                    </h2>
                    <Link to="/app/library" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        Xem tất cả <ArrowRight className="size-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-xl sm:rounded-2xl" />
                        ))}
                    </div>
                ) : recentImages.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-10 sm:py-14 text-center">
                            <div className="flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-muted">
                                <Images className="size-5 sm:size-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">Chưa có tác phẩm nào</p>
                                <p className="text-xs text-muted-foreground">Bắt đầu tạo tác phẩm đầu tiên của bạn!</p>
                            </div>
                            <Link to="/app/generate">
                                <Button size="sm" className="gap-1.5 rounded-full">
                                    <Plus className="size-3.5" /> Tạo ảnh ngay
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
                        {recentImages.map((img) => (
                            <Link key={img.id} to="/app/library" className="group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-muted">
                                <img
                                    src={img.file_url}
                                    alt={img.prompt ?? "AI Generated"}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                    <p className="text-[10px] sm:text-[11px] text-white font-medium line-clamp-2 leading-tight drop-shadow-md">
                                        {img.prompt}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ===== KIỂU MẪU NỔI BẬT ===== */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-semibold tracking-tight flex items-center gap-2">
                        <Zap className="size-4 text-muted-foreground" />
                        Kiểu mẫu nổi bật
                    </h2>
                    <Link to="/app/templates" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        Xem tất cả <ArrowRight className="size-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[3/4] rounded-xl sm:rounded-2xl" />
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                            <Sparkles className="size-6 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Chưa có kiểu mẫu nào</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5">
                        {templates.map((tpl) => (
                            <Link key={tpl.id} to={`/app/templates/${tpl.slug}`} className="group">
                                <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-muted">
                                    {tpl.thumbnail ? (
                                        <img
                                            src={tpl.thumbnail}
                                            alt={tpl.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                            <Sparkles className="size-8 sm:size-10 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                                        <p className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow-md mb-0.5 sm:mb-1">{tpl.name}</p>
                                        <Badge className="bg-white/15 text-white/80 border-0 text-[10px] backdrop-blur-md">{tpl.category}</Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
