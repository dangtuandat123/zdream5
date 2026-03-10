import { Link } from "react-router-dom"
import {
    WandIcon,
    LayoutGridIcon,
    ArrowRightIcon,
    ImageIcon,
    Sparkles,
    DiamondIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Dữ liệu mẫu cho "Ảnh gần đây"
const RECENT_ITEMS = [
    { title: "Cyberpunk City", type: "txt2img" },
    { title: "Anime Portrait", type: "template" },
    { title: "Fantasy Dragon", type: "txt2img" },
    { title: "Watercolor Dog", type: "template" },
    { title: "Space Station", type: "txt2img" },
    { title: "Oil Painting", type: "template" },
]

export function Dashboard() {
    return (
        <div className="flex flex-1 flex-col gap-8 p-4 lg:p-6">
            {/* Greeting */}
            {/* Removed greeting block as requested */}

            {/* Quick Actions — Luồng chính: 2 cách tạo ảnh */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="group relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background transition-all hover:border-primary/40 hover:shadow-md">
                    <CardContent className="flex flex-col gap-4 p-6">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                            <WandIcon className="size-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">Tạo ảnh từ mô tả</h3>
                            <p className="text-sm text-muted-foreground">
                                Nhập prompt, chọn model — AI sẽ tạo ảnh cho bạn.
                            </p>
                        </div>
                        <Button asChild className="w-fit">
                            <Link to="/app/generate">
                                Bắt đầu <ArrowRightIcon className="ml-2 size-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
                    <CardContent className="flex flex-col gap-4 p-6">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10">
                            <LayoutGridIcon className="size-6 text-purple-500" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">Dùng mẫu thiết kế</h3>
                            <p className="text-sm text-muted-foreground">
                                Chọn mẫu có sẵn, tải ảnh lên — AI biến đổi theo phong cách mẫu.
                            </p>
                        </div>
                        <Button variant="outline" asChild className="w-fit">
                            <Link to="/app/templates">
                                Khám phá mẫu <ArrowRightIcon className="ml-2 size-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Row — gọn gàng, chỉ 2 con số quan trọng */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                            <ImageIcon className="size-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold tabular-nums">1,204</p>
                            <p className="text-xs text-muted-foreground">Ảnh đã tạo</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                            <LayoutGridIcon className="size-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold tabular-nums">48</p>
                            <p className="text-xs text-muted-foreground">Mẫu đã dùng</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                            <DiamondIcon className="size-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold tabular-nums">5,820</p>
                            <p className="text-xs text-muted-foreground">Diamonds 💎</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                            <Sparkles className="size-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold tabular-nums">42.5h</p>
                            <p className="text-xs text-muted-foreground">API còn lại</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Generations */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Ảnh gần đây</h2>
                    <Button variant="ghost" size="sm" className="text-xs">
                        Xem tất cả
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {RECENT_ITEMS.map((item, i) => (
                        <Card
                            key={i}
                            className="group cursor-pointer overflow-hidden transition-all hover:shadow-md"
                        >
                            <CardContent className="p-0">
                                <div className="flex aspect-square items-center justify-center bg-muted transition-colors group-hover:bg-muted/70">
                                    <ImageIcon className="size-8 text-muted-foreground/50" />
                                </div>
                                <div className="flex items-center justify-between p-2.5">
                                    <p className="text-xs font-medium truncate">{item.title}</p>
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] shrink-0 ml-1"
                                    >
                                        {item.type === "txt2img" ? "AI" : "Mẫu"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
