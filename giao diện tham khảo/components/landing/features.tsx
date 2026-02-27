import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, MessageSquare, Palette, Zap, Download, Shield } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

const features = [
    {
        icon: Sparkles,
        title: "Thiết Kế Tự Động",
        description: "Mô tả thương hiệu của bạn và để AI tạo ra các logo chuyên nghiệp chỉ trong tích tắc.",
        hoverText: null,
    },
    {
        icon: MessageSquare,
        title: "Chỉnh Sửa Bằng Lời Nói",
        description: "Tinh chỉnh logo đơn giản bằng cách mô tả những thay đổi bạn muốn thực hiện.",
        hoverText: null,
    },
    {
        icon: Palette,
        title: "Phong Cách Không Giới Hạn",
        description: "Từ tối giản đến phá cách, hình học đến trừu tượng. Mọi phong cách đều nằm trong tầm tay bạn.",
        hoverText: null,
    },
    {
        icon: Zap,
        title: "Khởi Tạo Tức Thì",
        description: "Nhận logo của bạn trong vòng chưa đầy 10 giây. Không cần chờ đợi, không có độ trễ.",
        hoverText: null,
    },
    {
        icon: Download,
        title: "Xuất File SVG",
        description: "Tải xuống các tệp vector sắc nét, có thể mở rộng kích thước, sẵn sàng cho mọi mục đích sử dụng.",
        hoverText: null,
    },
    {
        icon: Shield,
        title: "Quyền Sở Hữu Hoàn Toàn",
        description: "Mọi logo bạn tạo ra đều thuộc về bạn. Không đi kèm bất kỳ hạn chế cấp phép nào.",
        hoverText: "Bạn nắm giữ toàn bộ bản quyền đối với các biểu trưng bạn tạo ra, bao gồm cả quyền sử dụng thương mại đối với gói Pro.",
    },
]

export function Features() {
    return (
        <section id="features" className="min-h-[100dvh] w-full shrink-0 flex flex-col justify-center py-16 sm:py-24 border-t border-border/50 relative overflow-hidden bg-background">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="text-center mb-10 sm:mb-12">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-muted border border-border text-sm font-medium">
                        Tính Năng Mạnh Mẽ
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-balance text-foreground">
                        Công cụ mạnh mẽ, thao tác cực dễ
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-pretty text-base sm:text-lg">
                        Mọi thứ bạn cần để tạo logo chuyên nghiệp.
                    </p>
                </div>

                <Separator className="mb-10 sm:mb-16 max-w-sm mx-auto opacity-50" />

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[50vh] md:min-h-[400px]">
                    {/* Large Feature 1 (Spans 2 cols, 2 rows) */}
                    <Card className="col-span-1 md:col-span-2 md:row-span-2 relative overflow-hidden group bg-card/40 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-all duration-500 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-6 sm:p-10 h-full flex flex-col relative z-10 justify-center">
                            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 mb-6 sm:mb-8 border border-primary/20 shadow-[0_0_15px_-3px_var(--color-primary)]">
                                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                            </div>
                            <h3 className="font-bold text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 text-foreground group-hover:text-primary transition-colors">Mô Tả Sinh Logo</h3>
                            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                                Chỉ cần nhập tên thương hiệu và ý tưởng. AI sẽ tự động tùy biến kiểu chữ, màu sắc và bố cục để xuất xưởng logo chuẩn xác.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Medium Feature 1 (Spans 2 cols, 1 row) */}
                    <Card className="col-span-1 md:col-span-2 md:row-span-1 relative overflow-hidden group bg-card/40 backdrop-blur-xl border-border/50 hover:border-blue-500/50 transition-all duration-500 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-6 h-full flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-10 justify-center">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 shrink-0">
                                <MessageSquare className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg sm:text-xl mb-1 sm:mb-2 text-foreground group-hover:text-blue-500 transition-colors">Nhắn Để Sửa</h3>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                    Không cần kỹ năng đồ họa. Chat với AI để đổi màu, đổi font hay thay icon.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Small Feature 1 */}
                    <Card className="col-span-1 md:col-span-1 md:row-span-1 relative overflow-hidden group bg-card/40 backdrop-blur-xl border-border/50 hover:border-emerald-500/50 transition-all duration-500 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-6 h-full flex flex-col justify-center relative z-10">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                                <Palette className="h-5 w-5 text-emerald-500" />
                            </div>
                            <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-foreground">Đa Dạng Phong Cách</h3>
                            <p className="text-sm text-muted-foreground">Từ tối giản, thanh lịch đến hiện đại, phá cách.</p>
                        </CardContent>
                    </Card>

                    {/* Small Feature 2 */}
                    <Card className="col-span-1 md:col-span-1 md:row-span-1 relative overflow-hidden group bg-card/40 backdrop-blur-xl border-border/50 hover:border-orange-500/50 transition-all duration-500 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-6 h-full flex flex-col justify-center relative z-10">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-4">
                                <Download className="h-5 w-5 text-orange-500" />
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-foreground">Xuất File Vector</h3>
                            <p className="text-sm text-muted-foreground">Tải xuống chất lượng cao, định dạng thay đổi kích thước dễ dàng.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
