import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
    Sparkles,
    SwatchBook,
    Images,
    ImageIcon,
    Gem,
    ArrowRight,
    Plus,
    Library,
    Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
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
        <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 pb-8">

            {/* ===== HERO BANNER ===== */}
            <div className="relative overflow-hidden rounded-3xl" style={{ backgroundImage: "url(/images/gradient-purple.png)", backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-black/30" />

                <div className="relative z-10 p-5 sm:p-8 lg:p-10">
                    {/* Top row: badge + gems */}
                    <div className="flex items-start justify-between mb-6 sm:mb-8">
                        <Badge variant="outline" className="bg-white/10 text-white/90 border-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-medium shadow-lg">
                            <Sparkles className="size-3.5 mr-1.5" /> ZDream Studio
                        </Badge>
                        <Link to="/app/topup">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg">
                                <Gem className="size-4 text-violet-200" />
                                <span className="text-sm font-bold text-white tabular-nums">{gems.toLocaleString()}</span>
                                <span className="text-[10px] text-white/50 hidden sm:inline">gems</span>
                            </div>
                        </Link>
                    </div>

                    {/* Greeting */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight mb-2">
                        {getGreeting()},{" "}
                        <span className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                            {user?.name?.split(" ").pop() ?? "bạn"}
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-white/60 mb-6 sm:mb-8 max-w-md">
                        Biến ý tưởng thành tác phẩm nghệ thuật với AI
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-3">
                        <Link to="/app/generate">
                            <Button className="bg-white text-black hover:bg-white/90 font-semibold rounded-full px-5 h-10 shadow-lg shadow-white/10 gap-2">
                                <Sparkles className="size-4" /> Tạo ảnh ngay
                            </Button>
                        </Link>
                        <Link to="/app/templates">
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-5 h-10 backdrop-blur-sm gap-2">
                                <SwatchBook className="size-4" /> Kiểu mẫu
                            </Button>
                        </Link>
                    </div>

                    {/* Mini stats inside hero */}
                    <div className="flex items-center gap-4 sm:gap-6 mt-6 sm:mt-8 pt-5 border-t border-white/10">
                        {[
                            { label: "Ảnh đã tạo", value: totalImages, icon: ImageIcon },
                            { label: "Gems đã dùng", value: totalSpent, icon: Zap },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2">
                                <s.icon className="size-4 text-white/40" />
                                {loading ? (
                                    <Skeleton className="h-5 w-10 bg-white/10" />
                                ) : (
                                    <span className="text-sm font-bold text-white tabular-nums">{s.value.toLocaleString()}</span>
                                )}
                                <span className="text-[11px] text-white/40 hidden sm:inline">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== QUICK ACTIONS ===== */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[
                    { to: "/app/generate", label: "Tạo Ảnh", icon: Sparkles, bg: "/images/gradient-pink.png" },
                    { to: "/app/templates", label: "Kiểu Mẫu", icon: SwatchBook, bg: "/images/gradient-blue.png" },
                    { to: "/app/library", label: "Thư Viện", icon: Library, bg: "/images/gradient-purple.png" },
                ].map((item) => (
                    <Link key={item.to} to={item.to} className="group">
                        <div className="relative overflow-hidden rounded-2xl aspect-[2/1] sm:aspect-[2.5/1]" style={{ backgroundImage: `url(${item.bg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1.5">
                                <div className="flex items-center justify-center size-10 sm:size-11 rounded-xl bg-white/15 backdrop-blur-sm text-white group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300 shadow-lg">
                                    <item.icon className="size-5" />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-md">{item.label}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <Separator className="opacity-50" />

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
                            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                        ))}
                    </div>
                ) : recentImages.length === 0 ? (
                    <div className="relative overflow-hidden rounded-2xl" style={{ backgroundImage: "url(/images/gradient-pink.png)", backgroundSize: "cover", backgroundPosition: "center" }}>
                        <div className="absolute inset-0 bg-background/80" />
                        <div className="relative flex flex-col items-center justify-center gap-4 py-14 text-center px-4">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/80 ring-1 ring-border/50">
                                <Images className="size-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Chưa có tác phẩm nào</p>
                                <p className="text-xs text-muted-foreground max-w-[220px]">Bắt đầu tạo tác phẩm đầu tiên của bạn!</p>
                            </div>
                            <Link to="/app/generate">
                                <Button size="sm" className="gap-1.5 rounded-full">
                                    <Plus className="size-3.5" /> Tạo ảnh ngay
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {recentImages.map((img) => (
                            <Link key={img.id} to="/app/library" className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                                <img
                                    src={img.file_url}
                                    alt={img.prompt ?? "AI Generated"}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

            {/* ===== KIỂU MẪU NỔI BẬT ===== */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold tracking-tight">Kiểu mẫu nổi bật</h2>
                    <Link to="/app/templates" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        Xem tất cả <ArrowRight className="size-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="relative overflow-hidden rounded-2xl" style={{ backgroundImage: "url(/images/gradient-blue.png)", backgroundSize: "cover", backgroundPosition: "center" }}>
                        <div className="absolute inset-0 bg-background/80" />
                        <div className="relative flex flex-col items-center justify-center gap-2 py-10 text-center">
                            <SwatchBook className="size-6 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Chưa có kiểu mẫu nào</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                        {templates.map((tpl) => (
                            <Link key={tpl.id} to={`/app/templates/${tpl.slug}`} className="group">
                                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                                    {tpl.thumbnail ? (
                                        <img
                                            src={tpl.thumbnail}
                                            alt={tpl.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <SwatchBook className="size-10 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                    {/* Bottom info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="text-sm font-semibold text-white truncate drop-shadow-md mb-1">{tpl.name}</p>
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
