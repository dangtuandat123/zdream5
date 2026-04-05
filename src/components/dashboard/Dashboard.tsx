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
    Crown,
    Cpu,
    UserCheck,
    Eraser,
    ZoomIn,
    Wand2,
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

const featuredTools = [
    {
        name: "Nhân vật AI",
        description: "Giữ nhất quán nhân vật qua mọi bối cảnh",
        icon: UserCheck,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        badge: "Sắp ra mắt",
    },
    {
        name: "Xóa nền ảnh",
        description: "Tách nền tự động chỉ trong vài giây",
        icon: Eraser,
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        badge: "Sắp ra mắt",
    },
    {
        name: "Upscale ảnh",
        description: "Phóng to 2x–4x vẫn giữ chi tiết sắc nét",
        icon: ZoomIn,
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        badge: "Sắp ra mắt",
    },
    {
        name: "Style Transfer",
        description: "Chuyển phong cách nghệ thuật cho ảnh bất kỳ",
        icon: Wand2,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        badge: "Sắp ra mắt",
    },
]

export function Dashboard() {
    const { user, gems } = useAuth()

    const [recentImages, setRecentImages] = useState<GeneratedImageData[]>([])
    const [models, setModels] = useState<AiModelData[]>([])
    const [totalImages, setTotalImages] = useState(0)
    const [totalSpent, setTotalSpent] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        Promise.allSettled([
            imageApi.list(1, 8),
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

    const firstName = user?.name?.split(" ").pop() ?? "bạn"

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 pb-8">

            {/* ===== HEADER ROW ===== */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {getGreeting()}, {firstName}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
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

            {/* ===== STATS + CTA ROW ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                            <ImageIcon className="size-5 text-violet-400" />
                        </div>
                        <div className="min-w-0">
                            {loading ? <Skeleton className="h-7 w-12" /> : (
                                <p className="text-2xl font-bold tabular-nums leading-none">{totalImages.toLocaleString()}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">Ảnh đã tạo</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                            <Zap className="size-5 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                            {loading ? <Skeleton className="h-7 w-12" /> : (
                                <p className="text-2xl font-bold tabular-nums leading-none">{totalSpent.toLocaleString()}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">Gems đã dùng</p>
                        </div>
                    </CardContent>
                </Card>

                <Link to="/app/generate" className="contents">
                    <Card className="cursor-pointer hover:border-violet-500/50 transition-colors group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 group-hover:bg-violet-500/25 transition-colors">
                                <WandSparkles className="size-5 text-violet-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-semibold leading-none">Tạo ảnh</p>
                                <p className="text-xs text-muted-foreground mt-1">Bắt đầu sáng tạo</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/app/tools" className="contents">
                    <Card className="cursor-pointer hover:border-violet-500/50 transition-colors group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/15 group-hover:bg-fuchsia-500/25 transition-colors">
                                <Sparkles className="size-5 text-fuchsia-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-semibold leading-none">Công cụ AI</p>
                                <p className="text-xs text-muted-foreground mt-1">Khám phá thêm</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* ===== AI MODELS ===== */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold tracking-tight">Model AI khả dụng</h2>
                        <Badge variant="secondary" className="text-[10px]">
                            <Cpu className="size-3 mr-1" />
                            {models.length} models
                        </Badge>
                    </div>
                    <Link to="/app/generate" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        Dùng ngay <ArrowRight className="size-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 rounded-xl" />
                        ))}
                    </div>
                ) : models.length === 0 ? (
                    <Card>
                        <CardContent className="flex items-center justify-center gap-2 py-8">
                            <Cpu className="size-5 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Chưa có model nào</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {models.map((m, i) => (
                            <Link key={m.id} to="/app/generate" className="contents">
                                <Card className="cursor-pointer hover:border-violet-500/40 transition-colors group">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 group-hover:from-violet-500/30 group-hover:to-fuchsia-500/30 transition-colors">
                                            {i === 0 ? <Crown className="size-4 text-amber-400" /> : <Cpu className="size-4 text-violet-400" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium truncate">{m.name}</p>
                                                {i === 0 && <Badge className="text-[9px] px-1.5 py-0 bg-amber-500/15 text-amber-400 border-amber-500/30">Hot</Badge>}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {m.gems_cost} gem / ảnh
                                            </p>
                                        </div>
                                        <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ===== FEATURED TOOLS ===== */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold tracking-tight">Công cụ nổi bật</h2>
                    <Link to="/app/tools" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        Xem tất cả <ArrowRight className="size-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {featuredTools.map((tool) => (
                        <Link key={tool.name} to="/app/tools" className="contents">
                            <Card className="cursor-pointer hover:border-border/80 transition-colors group">
                                <CardContent className="p-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className={`flex size-10 items-center justify-center rounded-lg ${tool.bg}`}>
                                            <tool.icon className={`size-5 ${tool.color}`} />
                                        </div>
                                        <Badge variant="outline" className="text-[10px] text-muted-foreground">{tool.badge}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{tool.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

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
