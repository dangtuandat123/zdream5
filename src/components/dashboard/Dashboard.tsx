import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import Autoplay from "embla-carousel-autoplay"
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
    Eraser,
    ArrowUpFromLine,
    Palette,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel"
import { useAuth } from "@/contexts/AuthContext"
import { imageApi, templateApi, walletApi } from "@/lib/api"
import type { GeneratedImageData, TemplateData } from "@/lib/api"

function getGreeting(): string {
    const h = new Date().getHours()
    if (h < 12) return "Chào buổi sáng"
    if (h < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
}

const bannerSlides = [
    {
        title: "Tạo ảnh AI chất lượng cao",
        subtitle: "Biến ý tưởng thành tác phẩm nghệ thuật chỉ trong vài giây",
        badge: "Mới",
        gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
        cta: { label: "Tạo ảnh ngay", to: "/app/generate" },
    },
    {
        title: "Khám phá Kiểu mẫu",
        subtitle: "Hàng trăm template sẵn có cho mọi phong cách sáng tạo",
        badge: "Nổi bật",
        gradient: "from-blue-600 via-cyan-600 to-teal-600",
        cta: { label: "Xem kiểu mẫu", to: "/app/templates" },
    },
    {
        title: "Nạp Gems - Sáng tạo không giới hạn",
        subtitle: "Nhiều gói ưu đãi hấp dẫn, bonus lên đến 25%",
        badge: "Ưu đãi",
        gradient: "from-amber-600 via-orange-600 to-red-600",
        cta: { label: "Nạp ngay", to: "/app/topup" },
    },
]

const featureNav = [
    { to: "/app/generate", label: "Tạo ảnh AI", icon: Sparkles, highlight: true },
    { to: "/app/templates", label: "Kiểu mẫu", icon: SwatchBook },
    { to: "/app/library", label: "Thư viện", icon: Library },
    { to: "/app/tools", label: "Xóa nền", icon: Eraser, badge: "Sắp ra mắt" },
    { to: "/app/tools", label: "Upscale", icon: ArrowUpFromLine, badge: "Sắp ra mắt" },
    { to: "/app/tools", label: "Style Transfer", icon: Palette, badge: "Sắp ra mắt" },
]

export function Dashboard() {
    const { user, gems } = useAuth()

    const [recentImages, setRecentImages] = useState<GeneratedImageData[]>([])
    const [templates, setTemplates] = useState<TemplateData[]>([])
    const [totalImages, setTotalImages] = useState(0)
    const [totalSpent, setTotalSpent] = useState(0)
    const [loading, setLoading] = useState(true)
    const [carouselApi, setCarouselApi] = useState<CarouselApi>()
    const [currentSlide, setCurrentSlide] = useState(0)

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

    const onSelect = useCallback(() => {
        if (!carouselApi) return
        setCurrentSlide(carouselApi.selectedScrollSnap())
    }, [carouselApi])

    useEffect(() => {
        if (!carouselApi) return
        onSelect()
        carouselApi.on("select", onSelect)
        return () => { carouselApi.off("select", onSelect) }
    }, [carouselApi, onSelect])

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 pb-8">

            {/* ===== TOP BAR: Greeting + Gems ===== */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                        {getGreeting()},{" "}
                        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            {user?.name?.split(" ").pop() ?? "bạn"}
                        </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Biến ý tưởng thành tác phẩm nghệ thuật với AI
                    </p>
                </div>
                <Link to="/app/topup">
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-all duration-300 hover:scale-105">
                        <Gem className="size-4 text-violet-400" />
                        <span className="text-sm font-bold tabular-nums">{gems.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">gems</span>
                    </div>
                </Link>
            </div>

            {/* ===== BANNER CAROUSEL ===== */}
            <Carousel
                opts={{ loop: true, align: "start" }}
                plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                setApi={setCarouselApi}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {bannerSlides.map((slide, i) => (
                        <CarouselItem key={i} className="pl-4 basis-[85%] sm:basis-[55%]">
                            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${slide.gradient} h-[160px] sm:h-[180px]`}>
                                {/* Decorative elements */}
                                <div className="absolute -top-16 -right-16 size-48 rounded-full bg-white/10 blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-black/10 blur-2xl" />

                                <div className="relative z-10 flex flex-col justify-between h-full p-5 sm:p-6">
                                    <Badge className="w-fit bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm">
                                        {slide.badge}
                                    </Badge>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-white mb-1 leading-tight">{slide.title}</h2>
                                        <p className="text-xs sm:text-sm text-white/70 mb-3 max-w-sm">{slide.subtitle}</p>
                                        <Link to={slide.cta.to}>
                                            <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-full px-4 h-8 text-xs font-semibold gap-1.5 transition-all hover:scale-105">
                                                {slide.cta.label} <ArrowRight className="size-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {/* Dots indicator */}
                <div className="flex justify-center gap-1.5 mt-3">
                    {bannerSlides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => carouselApi?.scrollTo(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 bg-violet-400" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                        />
                    ))}
                </div>
            </Carousel>

            {/* ===== FEATURE NAV ROW ===== */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                {featureNav.map((item) => (
                    <Link key={item.label} to={item.to} className="shrink-0">
                        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                            item.highlight
                                ? "bg-violet-500/15 border-violet-500/30 hover:bg-violet-500/25"
                                : "bg-card/50 border-border/50 hover:bg-accent hover:border-border"
                        }`}>
                            <item.icon className={`size-4 shrink-0 ${item.highlight ? "text-violet-400" : "text-muted-foreground"}`} />
                            <span className={`text-sm font-medium whitespace-nowrap ${item.highlight ? "text-violet-300" : ""}`}>{item.label}</span>
                            {item.badge ? (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-amber-500/50 text-amber-400 font-medium ml-0.5">
                                    {item.badge}
                                </Badge>
                            ) : (
                                <ArrowRight className="size-3.5 text-muted-foreground/50" />
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* ===== STATS ROW ===== */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[
                    { label: "Ảnh đã tạo", value: totalImages, icon: ImageIcon, color: "text-violet-400", bg: "bg-violet-500/10" },
                    { label: "Gems đã dùng", value: totalSpent, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
                    { label: "Gems hiện có", value: gems, icon: Gem, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/30 p-3 sm:p-3.5">
                        <div className={`flex items-center justify-center size-9 rounded-lg ${s.bg}`}>
                            <s.icon className={`size-4 ${s.color}`} />
                        </div>
                        <div className="min-w-0">
                            {loading ? (
                                <Skeleton className="h-5 w-10 mb-0.5" />
                            ) : (
                                <p className="text-base sm:text-lg font-bold tabular-nums leading-none">{s.value.toLocaleString()}</p>
                            )}
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== CONTENT TABS ===== */}
            <Tabs defaultValue="recent" className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <TabsList className="bg-muted/50 h-9">
                        <TabsTrigger value="recent" className="text-xs sm:text-sm px-3">Gần đây</TabsTrigger>
                        <TabsTrigger value="templates" className="text-xs sm:text-sm px-3">Kiểu mẫu</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <Link to="/app/library" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                            Xem tất cả <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* --- Tab: Recent Images --- */}
                <TabsContent value="recent" className="mt-0">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                            ))}
                        </div>
                    ) : recentImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center rounded-xl border border-dashed border-border/50">
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
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                            {recentImages.map((img) => (
                                <Link key={img.id} to="/app/library" className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted ring-1 ring-white/5 hover:ring-white/15 transition-all duration-300">
                                    <img
                                        src={img.file_url}
                                        alt={img.prompt ?? "AI Generated"}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    {img.gems_cost != null && img.gems_cost > 0 && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Gem className="size-2.5" />{img.gems_cost}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                                        <p className="text-[11px] text-white font-medium line-clamp-2 leading-tight drop-shadow-md">
                                            {img.prompt}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* --- Tab: Templates --- */}
                <TabsContent value="templates" className="mt-0">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                            ))}
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center rounded-xl border border-dashed border-border/50">
                            <SwatchBook className="size-6 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Chưa có kiểu mẫu nào</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                            {templates.map((tpl) => (
                                <Link key={tpl.id} to={`/app/templates/${tpl.slug}`} className="group">
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted ring-1 ring-white/5 hover:ring-white/15 transition-all duration-300">
                                        {tpl.thumbnail ? (
                                            <img
                                                src={tpl.thumbnail}
                                                alt={tpl.name}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                                <SwatchBook className="size-10 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <p className="text-sm font-semibold text-white truncate drop-shadow-md mb-1.5">{tpl.name}</p>
                                            <Badge className="bg-white/15 text-white/90 border-0 text-[10px] backdrop-blur-md font-medium">{tpl.category}</Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
