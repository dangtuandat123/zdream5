import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
    Images,
    ImageIcon,
    Gem,
    ArrowRight,
    Plus,
    Zap,
    WandSparkles,
    Crown,
    Cpu,
    UserCheck,
    Eraser,
    ZoomIn,
    Wand2,
    ChevronLeft,
    ChevronRight,
    LayoutTemplate,
    Megaphone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { imageApi, modelApi, walletApi } from "@/lib/api"
import type { GeneratedImageData, AiModelData } from "@/lib/api"

function getGreeting(): string {
    const h = new Date().getHours()
    if (h < 12) return "Chào buổi sáng"
    if (h < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
}

/* ── Banner slides ── */
const banners = [
    {
        title: "Nhân vật AI",
        subtitle: "Tạo nhân vật riêng, giữ nhất quán qua mọi bối cảnh",
        badge: "Sắp ra mắt",
        gradient: "from-black/50 via-black/30 to-transparent",
        img: "/images/tools/consistent-character.jpg",
    },
    {
        title: "Ảnh quảng cáo AI",
        subtitle: "Tạo ảnh sản phẩm chuyên nghiệp cho mọi nền tảng",
        badge: "Sắp ra mắt",
        gradient: "from-black/50 via-black/30 to-transparent",
        img: "/images/tools/ad-image.jpg",
    },
]

/* ── Feature nav cards ── */
const featureCards = [
    { name: "Tạo ảnh AI", icon: WandSparkles, path: "/app/generate", color: "text-violet-300", bg: "bg-violet-500/20", available: true },
    { name: "Kiểu mẫu", icon: LayoutTemplate, path: "/app/templates", color: "text-pink-300", bg: "bg-pink-500/20", available: true },
    { name: "Nhân vật AI", icon: UserCheck, path: "/app/tools", color: "text-emerald-300", bg: "bg-emerald-500/20", badge: "Mới", available: false },
    { name: "Xóa nền", icon: Eraser, path: "/app/tools", color: "text-rose-300", bg: "bg-rose-500/20", available: false },
    { name: "Upscale", icon: ZoomIn, path: "/app/tools", color: "text-sky-300", bg: "bg-sky-500/20", available: false },
    { name: "Style Transfer", icon: Wand2, path: "/app/tools", color: "text-orange-300", bg: "bg-orange-500/20", available: false },
    { name: "Ảnh quảng cáo", icon: Megaphone, path: "/app/tools", color: "text-amber-300", bg: "bg-amber-500/20", available: false },
]

export function Dashboard() {
    const { user, gems } = useAuth()

    const [recentImages, setRecentImages] = useState<GeneratedImageData[]>([])
    const [models, setModels] = useState<AiModelData[]>([])
    const [totalImages, setTotalImages] = useState(0)
    const [totalSpent, setTotalSpent] = useState(0)
    const [loading, setLoading] = useState(true)
    const [bannerIdx, setBannerIdx] = useState(0)

    const featureScrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLoading(true)
        Promise.allSettled([
            imageApi.list(1, 12),
            walletApi.show(),
            modelApi.listActive(),
        ]).then(([imgRes, walRes, modelRes]) => {
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
            if (modelRes.status === "fulfilled") {
                setModels(modelRes.value.data)
            }
        }).finally(() => setLoading(false))
    }, [])

    // Auto-rotate banners
    useEffect(() => {
        const timer = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 5000)
        return () => clearInterval(timer)
    }, [])

    const firstName = user?.name?.split(" ").pop() ?? "bạn"

    const scrollFeatures = (dir: "left" | "right") => {
        featureScrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" })
    }

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6 pb-8">

            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                        {getGreeting()}, {firstName}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
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

            {/* ===== BANNER CAROUSEL + MODEL CARDS ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Banner */}
                <div className="lg:col-span-2 relative h-[180px] sm:h-[200px] rounded-xl" style={{ overflow: "clip" }}>
                    {banners.map((b, i) => (
                        <div
                            key={i}
                            className={`absolute inset-0 rounded-xl overflow-hidden transition-opacity duration-700 ${i === bannerIdx ? "opacity-100 visible" : "opacity-0 invisible"}`}
                        >
                            <img src={b.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-gradient-to-t ${b.gradient}`} />
                            <div className="relative z-10 flex flex-col justify-end h-full p-5 sm:p-6">
                                <Badge className="w-fit mb-2 bg-white/20 text-white border-white/30 text-[10px] backdrop-blur-sm">{b.badge}</Badge>
                                <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">{b.title}</h2>
                                <p className="text-sm text-white/80 mt-1 drop-shadow-md">{b.subtitle}</p>
                            </div>
                        </div>
                    ))}
                    {/* Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setBannerIdx(i)}
                                className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Model cards stack */}
                <div className="flex flex-col gap-3">
                    {loading ? (
                        <>
                            <Skeleton className="h-[93px] rounded-xl" />
                            <Skeleton className="h-[93px] rounded-xl" />
                        </>
                    ) : models.length === 0 ? (
                        <Card className="flex-1">
                            <CardContent className="flex items-center justify-center h-full p-5">
                                <p className="text-sm text-muted-foreground">Chưa có model nào</p>
                            </CardContent>
                        </Card>
                    ) : models.slice(0, 2).map((m, i) => (
                        <Link key={m.id} to="/app/generate" className="contents">
                            <Card className="flex-1 cursor-pointer hover:border-violet-500/40 transition-colors group">
                                <CardContent className="p-4 flex items-center gap-3 h-full">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 group-hover:from-violet-500/30 group-hover:to-fuchsia-500/30 transition-colors">
                                        {i === 0 ? <Crown className="size-5 text-amber-400" /> : <Cpu className="size-5 text-violet-400" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold truncate">{m.name}</p>
                                            {i === 0 && <Badge className="text-[9px] px-1.5 py-0 bg-amber-500/15 text-amber-400 border-amber-500/30">Hot</Badge>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{m.gems_cost} gem / ảnh</p>
                                    </div>
                                    <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    {models.length > 2 && (
                        <Link to="/app/generate" className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors">
                            +{models.length - 2} models khác
                        </Link>
                    )}
                </div>
            </div>

            {/* ===== FEATURE NAV (horizontal scroll) ===== */}
            <div className="relative group/nav">
                <button
                    onClick={() => scrollFeatures("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-background/90 border shadow-md flex items-center justify-center opacity-0 group-hover/nav:opacity-100 transition-opacity"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <div
                    ref={featureScrollRef}
                    className="flex gap-2 overflow-x-auto pb-1"
                    style={{ scrollbarWidth: "none" }}
                >
                    {featureCards.map((f) => (
                        <Link key={f.name} to={f.path}>
                            <div className="shrink-0 flex flex-col items-center gap-2 w-[100px] py-3 px-2 rounded-xl border border-border/50 hover:border-border hover:bg-muted/50 transition-colors cursor-pointer relative">
                                {f.badge && (
                                    <Badge className="absolute -top-2 -right-2 text-[9px] px-1.5 py-0 bg-emerald-500 text-white border-0 shadow-sm">{f.badge}</Badge>
                                )}
                                <div className={`flex size-10 items-center justify-center rounded-lg ${f.bg}`}>
                                    <f.icon className={`size-5 ${f.color}`} />
                                </div>
                                <p className="text-[11px] font-medium leading-tight text-center text-foreground/80">{f.name}</p>
                            </div>
                        </Link>
                    ))}
                </div>
                <button
                    onClick={() => scrollFeatures("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-background/90 border shadow-md flex items-center justify-center opacity-0 group-hover/nav:opacity-100 transition-opacity"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>

            {/* ===== STATS ROW ===== */}
            <div className="grid grid-cols-3 gap-3">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
                            <ImageIcon className="size-4 text-violet-300" />
                        </div>
                        <div className="min-w-0">
                            {loading ? <Skeleton className="h-6 w-10" /> : (
                                <p className="text-xl font-bold tabular-nums leading-none">{totalImages.toLocaleString()}</p>
                            )}
                            <p className="text-[11px] text-muted-foreground mt-0.5">Ảnh đã tạo</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                            <Zap className="size-4 text-amber-300" />
                        </div>
                        <div className="min-w-0">
                            {loading ? <Skeleton className="h-6 w-10" /> : (
                                <p className="text-xl font-bold tabular-nums leading-none">{totalSpent.toLocaleString()}</p>
                            )}
                            <p className="text-[11px] text-muted-foreground mt-0.5">Gems đã dùng</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                            <Gem className="size-4 text-emerald-300" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xl font-bold tabular-nums leading-none">{gems.toLocaleString()}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Gems hiện có</p>
                        </div>
                    </CardContent>
                </Card>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                        {Array.from({ length: 5 }).map((_, i) => (
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
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
