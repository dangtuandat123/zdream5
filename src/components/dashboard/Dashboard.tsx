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

            {/* ===== HERO BANNER — Giới thiệu model/tính năng ===== */}
            <div
                className="relative overflow-hidden rounded-3xl"
                style={{ backgroundImage: "url(/images/gradient-purple.png?v=1)", backgroundSize: "cover", backgroundPosition: "center" }}
            >
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative z-10 p-5 sm:p-8 lg:p-10">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-5 sm:mb-6">
                        <Badge className="bg-white/10 text-white/90 border-0 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase shadow-lg">
                            Mới
                        </Badge>
                        <Link to="/app/topup">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg">
                                <Gem className="size-4 text-violet-200" />
                                <span className="text-sm font-bold text-white tabular-nums">{gems.toLocaleString()}</span>
                            </div>
                        </Link>
                    </div>

                    {/* Model highlight */}
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight mb-1">
                        Nano Banana 2
                    </h1>
                    <p className="text-xs text-white/40 font-medium mb-3">Gemini 3.1 Flash Image Preview</p>
                    <p className="text-xs sm:text-sm text-white/60 mb-5 sm:mb-6 max-w-lg leading-relaxed">
                        Mô hình tạo ảnh AI mới nhất từ Google — chất lượng hình ảnh cấp Pro với tốc độ Flash. Hỗ trợ tạo ảnh từ prompt và chỉnh sửa ảnh nâng cao.
                    </p>

                    {/* CTA */}
                    <Link to="/app/generate">
                        <Button className="bg-white text-black hover:bg-white/90 font-semibold rounded-full px-5 h-9 shadow-lg shadow-white/10 gap-2 text-sm">
                            <Sparkles className="size-4" /> Thử ngay
                        </Button>
                    </Link>
                </div>
            </div>

            {/* ===== USER SUMMARY ROW ===== */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Xin chào, <span className="text-foreground font-medium">{user?.name?.split(" ").pop() ?? "bạn"}</span>
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <ImageIcon className="size-3.5" />
                        {loading ? <Skeleton className="h-4 w-6 inline-block" /> : <span className="font-semibold text-foreground tabular-nums">{totalImages}</span>}
                        <span className="hidden sm:inline">ảnh</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Zap className="size-3.5" />
                        {loading ? <Skeleton className="h-4 w-6 inline-block" /> : <span className="font-semibold text-foreground tabular-nums">{totalSpent}</span>}
                        <span className="hidden sm:inline">gems đã dùng</span>
                    </span>
                </div>
            </div>

            {/* ===== QUICK ACTIONS ===== */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[
                    { to: "/app/generate", label: "Tạo Ảnh", icon: Sparkles, bg: "/images/gradient-pink.png?v=1" },
                    { to: "/app/templates", label: "Kiểu Mẫu", icon: SwatchBook, bg: "/images/gradient-blue.png?v=1" },
                    { to: "/app/library", label: "Thư Viện", icon: Library, bg: "/images/gradient-purple.png?v=1" },
                ].map((item) => (
                    <Link key={item.to} to={item.to} className="group">
                        <div
                            className="relative overflow-hidden rounded-2xl aspect-[2/1] sm:aspect-[2.5/1]"
                            style={{ backgroundImage: `url(${item.bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
                        >
                            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/35 transition-colors duration-300" />
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
                    <div
                        className="relative overflow-hidden rounded-2xl"
                        style={{ backgroundImage: "url(/images/gradient-pink.png?v=1)", backgroundSize: "cover", backgroundPosition: "center" }}
                    >
                        <div className="absolute inset-0 bg-background/85" />
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
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
                    <div
                        className="relative overflow-hidden rounded-2xl"
                        style={{ backgroundImage: "url(/images/gradient-blue.png?v=1)", backgroundSize: "cover", backgroundPosition: "center" }}
                    >
                        <div className="absolute inset-0 bg-background/85" />
                        <div className="relative flex flex-col items-center justify-center gap-2 py-10 text-center">
                            <SwatchBook className="size-6 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Chưa có kiểu mẫu nào</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
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
