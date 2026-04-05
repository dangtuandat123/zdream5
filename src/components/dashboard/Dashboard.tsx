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
    Clock,
    ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { imageApi, walletApi } from "@/lib/api"
import type { GeneratedImageData } from "@/lib/api"

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
        <div className="flex flex-1 flex-col gap-5 sm:gap-6 p-3.5 sm:p-4 lg:p-6 pb-8">

            {/* ===== HERO — CTA chính ===== */}
            <div
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
                style={{ backgroundImage: "url(/images/gradient-purple.png?v=1)", backgroundSize: "cover", backgroundPosition: "center" }}
            >
                <div className="absolute inset-0 bg-black/45" />
                <div className="relative z-10 p-5 sm:p-8 lg:p-10">
                    <p className="text-xs sm:text-sm text-white/60 mb-1">
                        Xin chào, <span className="text-white font-medium">{firstName}</span>
                    </p>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight mb-3 sm:mb-4">
                        Hôm nay bạn muốn<br className="sm:hidden" /> sáng tạo gì?
                    </h1>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link to="/app/generate">
                            <Button className="bg-white text-black hover:bg-white/90 font-semibold rounded-full px-5 h-9 shadow-lg gap-2 text-sm">
                                <WandSparkles className="size-4" /> Tạo ảnh mới
                            </Button>
                        </Link>
                        <Link to="/app/tools">
                            <Button variant="outline" className="rounded-full px-5 h-9 border-white/20 text-white hover:bg-white/10 hover:text-white font-medium gap-2 text-sm backdrop-blur-sm">
                                <Sparkles className="size-4" /> Công cụ AI
                            </Button>
                        </Link>
                    </div>

                    {/* Inline stats */}
                    <div className="flex items-center gap-4 sm:gap-6 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                                <Gem className="size-3.5 text-violet-300" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 leading-none">Gems</p>
                                {loading ? <Skeleton className="h-4 w-8 mt-0.5 bg-white/10" /> : (
                                    <p className="text-sm font-bold text-white tabular-nums leading-tight">{gems.toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                                <ImageIcon className="size-3.5 text-blue-300" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 leading-none">Đã tạo</p>
                                {loading ? <Skeleton className="h-4 w-8 mt-0.5 bg-white/10" /> : (
                                    <p className="text-sm font-bold text-white tabular-nums leading-tight">{totalImages} ảnh</p>
                                )}
                            </div>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                                <Zap className="size-3.5 text-amber-300" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 leading-none">Đã dùng</p>
                                {loading ? <Skeleton className="h-4 w-8 mt-0.5 bg-white/10" /> : (
                                    <p className="text-sm font-bold text-white tabular-nums leading-tight">{totalSpent} gems</p>
                                )}
                            </div>
                        </div>
                        <Link to="/app/topup" className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
                            <Plus className="size-3.5" /> Nạp gems
                        </Link>
                    </div>
                </div>
            </div>

            {/* ===== QUICK NAVIGATION — 2 cols trái/phải ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {[
                    { to: "/app/generate", label: "Tạo ảnh", desc: "Tạo ảnh bằng AI", icon: WandSparkles, gradient: "from-pink-500/20 to-rose-500/5", iconColor: "text-pink-500", iconBg: "bg-pink-500/15" },
                    { to: "/app/tools", label: "Công cụ AI", desc: "11 công cụ sáng tạo", icon: Sparkles, gradient: "from-blue-500/20 to-cyan-500/5", iconColor: "text-blue-500", iconBg: "bg-blue-500/15" },
                    { to: "/app/library", label: "Thư viện", desc: "Bộ sưu tập ảnh", icon: Library, gradient: "from-violet-500/20 to-purple-500/5", iconColor: "text-violet-500", iconBg: "bg-violet-500/15" },
                    { to: "/app/topup", label: "Nạp gems", desc: "Mua thêm gems", icon: Gem, gradient: "from-amber-500/20 to-yellow-500/5", iconColor: "text-amber-500", iconBg: "bg-amber-500/15" },
                ].map((item) => (
                    <Link key={item.to} to={item.to} className="group">
                        <Card className="border-border/50 hover:border-border transition-all overflow-hidden h-full">
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <CardContent className="relative flex items-center gap-3 p-3.5 sm:p-4">
                                <div className={`flex size-10 sm:size-11 items-center justify-center rounded-xl ${item.iconBg} shrink-0 group-hover:scale-105 transition-transform`}>
                                    <item.icon className={`size-5 ${item.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold leading-tight">{item.label}</p>
                                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">{item.desc}</p>
                                </div>
                                <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* ===== MODEL HIGHLIGHT ===== */}
            <Card className="border-border/50 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: "url(/images/gradient-blue.png?v=1)", backgroundSize: "cover", backgroundPosition: "center" }}
                />
                <CardContent className="relative flex items-center gap-4 p-4 sm:p-5">
                    <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                        <Sparkles className="size-5 sm:size-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-semibold">Nano Banana 2</h3>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500">Mới</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Gemini 3.1 Flash — chất lượng Pro, tốc độ Flash</p>
                    </div>
                    <Link to="/app/generate" className="shrink-0">
                        <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-xs h-8 px-3.5">
                            Thử ngay <ArrowRight className="size-3" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Separator className="opacity-40" />

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
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                                <Images className="size-6 text-muted-foreground" />
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

            {/* ===== KHÁM PHÁ CÔNG CỤ AI ===== */}
            <Link to="/app/tools" className="group">
                <Card className="border-border/50 hover:border-primary/30 transition-all overflow-hidden">
                    <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 shrink-0 group-hover:scale-110 transition-transform">
                            <Sparkles className="size-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold mb-0.5">Khám phá Công cụ AI</h3>
                            <p className="text-xs text-muted-foreground">Upscale, xóa nền, chuyển phong cách, nhân vật AI và nhiều hơn nữa</p>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </CardContent>
                </Card>
            </Link>
        </div>
    )
}
