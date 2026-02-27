import { TrendingUpIcon, ImageIcon, LayoutGridIcon, DiamondIcon, ClockIcon, WandIcon, ArrowRightIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function Dashboard() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Stats Cards */}
                <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
                    <Card className="@container/card">
                        <CardHeader className="relative">
                            <CardDescription>Ảnh đã tạo</CardDescription>
                            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                1,204
                            </CardTitle>
                            <div className="absolute right-4 top-4">
                                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                                    <TrendingUpIcon className="size-3" />
                                    +12.5%
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Tăng trưởng tốt <TrendingUpIcon className="size-4" />
                            </div>
                            <div className="text-muted-foreground">So với tháng trước</div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader className="relative">
                            <CardDescription>Mẫu đã dùng</CardDescription>
                            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                48
                            </CardTitle>
                            <div className="absolute right-4 top-4">
                                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                                    <LayoutGridIcon className="size-3" />
                                    Mẫu
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                12 mẫu yêu thích
                            </div>
                            <div className="text-muted-foreground">Trong tổng số 200+ mẫu</div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader className="relative">
                            <CardDescription>Thời gian API</CardDescription>
                            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                42.5h
                            </CardTitle>
                            <div className="absolute right-4 top-4">
                                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                                    <ClockIcon className="size-3" />
                                    Còn lại
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                7.5h còn lại trong gói
                            </div>
                            <div className="text-muted-foreground">Tổng 50h / tháng</div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader className="relative">
                            <CardDescription>Diamonds</CardDescription>
                            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                5,820
                            </CardTitle>
                            <div className="absolute right-4 top-4">
                                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                                    <DiamondIcon className="size-3" />
                                    💎
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Tích lũy từ 3 tháng qua
                            </div>
                            <div className="text-muted-foreground">Dùng để mua mẫu VIP</div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <WandIcon className="size-5" />
                                Tạo ảnh bằng Prompt
                            </CardTitle>
                            <CardDescription>
                                Mô tả ý tưởng của bạn bằng văn bản, AI sẽ biến nó thành hình ảnh.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild>
                                <Link to="/app/generate">
                                    Bắt đầu tạo <ArrowRightIcon className="ml-2 size-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutGridIcon className="size-5" />
                                Tạo ảnh theo Mẫu
                            </CardTitle>
                            <CardDescription>
                                Chọn mẫu có sẵn, tải ảnh gốc lên và AI sẽ tạo ảnh theo phong cách mẫu.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button variant="outline" asChild>
                                <Link to="/app/templates">
                                    Khám phá mẫu <ArrowRightIcon className="ml-2 size-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <Separator className="mx-4 lg:mx-6" />

                {/* Recent Generations */}
                <div className="px-4 lg:px-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Ảnh gần đây</h2>
                        <Button variant="ghost" size="sm">Xem tất cả</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {[
                            { title: "Cyberpunk City", badge: "txt2img" },
                            { title: "Anime Portrait", badge: "Mẫu" },
                            { title: "Fantasy Dragon", badge: "txt2img" },
                            { title: "Watercolor Dog", badge: "Mẫu" },
                            { title: "Space Station", badge: "txt2img" },
                            { title: "Oil Painting", badge: "Mẫu" },
                        ].map((item, i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex aspect-square items-center justify-center bg-muted">
                                        <ImageIcon className="size-8 text-muted-foreground" />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex-col items-start gap-1 p-3">
                                    <p className="text-xs font-medium truncate w-full">{item.title}</p>
                                    <Badge variant="secondary" className="text-[10px]">{item.badge}</Badge>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
