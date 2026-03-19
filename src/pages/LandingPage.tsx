import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Autoplay from "embla-carousel-autoplay"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    ArrowUpRight,
    Sparkles,
    WandSparkles,
    SwatchBook,
    Gem,
    Zap,
    Star,
    CheckCircle2,
    Play,
    Palette,
    ZapIcon,
    ShieldCheck,
    Quote,
    Layers,
    ChevronDown,
    Menu,
    Trophy
} from "lucide-react"

// ============================================================
// DATA — Pricing, Templates, Testimonials, FAQ
// ============================================================

const MONTHLY_PLANS = [
    {
        name: "Miễn Phí",
        price: "0đ",
        period: "/tháng",
        gems: "50",
        features: ["50 Kim Cương/tháng", "Mô hình cơ bản", "Xuất ảnh HD", "Thư viện cá nhân"],
        cta: "Bắt Đầu Ngay",
        popular: false,
    },
    {
        name: "Pro",
        price: "199K",
        period: "/tháng",
        gems: "500",
        features: ["500 Kim Cương/tháng", "Tất cả mô hình AI", "Xuất ảnh 4K", "Ưu tiên hàng đợi", "Không giới hạn kiểu mẫu"],
        cta: "Nâng Cấp Pro",
        popular: true,
    },
    {
        name: "Unlimited",
        price: "499K",
        period: "/tháng",
        gems: "∞",
        features: ["Không giới hạn Kim Cương", "API Access", "Xuất ảnh 4K+", "Hỗ trợ ưu tiên", "Tất cả tính năng Pro"],
        cta: "Liên Hệ",
        popular: false,
    },
]

const YEARLY_PLANS = [
    {
        name: "Miễn Phí",
        price: "0đ",
        period: "/năm",
        gems: "600",
        features: ["600 Kim Cương/năm", "Mô hình cơ bản", "Xuất ảnh HD", "Thư viện cá nhân"],
        cta: "Bắt Đầu Ngay",
        popular: false,
    },
    {
        name: "Pro",
        price: "1.99M",
        period: "/năm",
        gems: "6000",
        features: ["6000 Kim Cương/năm", "Tất cả mô hình AI", "Xuất ảnh 4K", "Ưu tiên hàng đợi", "Tiết kiệm 20% so với tháng"],
        cta: "Nâng Cấp Pro",
        popular: true,
    },
    {
        name: "Unlimited",
        price: "4.99M",
        period: "/năm",
        gems: "∞",
        features: ["Không giới hạn Kim Cương", "API Access", "Xuất ảnh 4K+", "Hỗ trợ ưu tiên", "Tất cả tính năng Pro"],
        cta: "Liên Hệ",
        popular: false,
    },
]

const TEMPLATES = [
    { name: "Cyberpunk", cat: "Chân dung", img: "https://images.unsplash.com/photo-1542442828-287217bfb21f?q=80&w=400&auto=format&fit=crop" },
    { name: "Ghibli", cat: "Anime", img: "https://images.unsplash.com/photo-1498453488252-0974dcabe0cb?q=80&w=400&auto=format&fit=crop" },
    { name: "Sản phẩm 3D", cat: "3D", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop" },
    { name: "Logo Minimal", cat: "Logo", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400&auto=format&fit=crop" },
    { name: "Sơn dầu", cat: "Phong cảnh", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop" },
    { name: "Anime Waifu", cat: "Anime", img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop" },
    { name: "Thời trang", cat: "Chân dung", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop" },
    { name: "Concept Art", cat: "Phong cảnh", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop" },
]

const TESTIMONIALS = [
    {
        name: "Minh Ngọc",
        role: "Art Director @ CreativeLab",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop&crop=face",
        quote: "ZDream đã thay đổi hoàn toàn quy trình thiết kế của chúng tôi. Việc tạo ra hàng trăm concept trong vài phút thay vì vài ngày là điều không tưởng."
    },
    {
        name: "Tuấn Anh",
        role: "Freelance Illustrator",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop&crop=face",
        quote: "Hệ thống prompt và template quá mạnh. Tôi có thể tạo ra đúng phong cách mình muốn mà không cần chỉnh sửa nhiều lần."
    },
    {
        name: "Thu Hà",
        role: "Marketing Manager @ BrandVN",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop&crop=face",
        quote: "Chất lượng hình ảnh vượt xa mong đợi. Chúng tôi đã tiết kiệm 80% chi phí thiết kế nhờ ZDream cho các chiến dịch quảng cáo."
    },
]

const FAQS = [
    {
        question: "Hệ thống Kim Cương hoạt động thế nào?",
        answer: "Mỗi khi bạn tạo một bức ảnh AI, hệ thống sẽ trừ đi một số lượng Kim Cương tương ứng với độ phức tạp của mô hình. Bạn nhận được 50 Kim Cương miễn phí khi đăng ký, và có thể nạp thêm hoặc nâng cấp gói Pro để tiết kiệm hơn."
    },
    {
        question: "Tôi có thể sử dụng ảnh để kinh doanh (thương mại) không?",
        answer: "Có! Tất cả hình ảnh tạo ra từ các gói trả phí (Pro, Unlimited) hoặc bằng Kim Cương nạp thêm đều đi kèm giấy phép sử dụng thương mại 100%. Bạn có thể dùng cho in ấn, quảng cáo, thiết kế UI/UX mà không sợ bản quyền."
    },
    {
        question: "Làm sao để tôi điều khiển được chi tiết của bản vẽ?",
        answer: "Hệ thống cung cấp một bảng điều khiển trực quan minh bạch. Bằng cách kết hợp mô tả văn bản với các tùy chọn loại trừ thông minh, hoặc cung cấp cho nền tảng một hình ảnh phác thảo làm tham chiếu, bạn sẽ có toàn quyền làm chủ bố cục và phong cách cuối cùng."
    },
    {
        question: "Tôi có cần lưu hình ảnh vào máy tính thường xuyên không?",
        answer: "Không cần thiết. Nền tảng tổ chức sẵn 'Không Gian Làm Việc' cho bạn trên đám mây. Bạn có thể phân loại ảnh theo từng tệp (thư mục) chiến dịch riêng biệt, và truy cập lại khối lượng công việc khổng lồ này một cách ngăn nắp mọi lúc, mọi nơi."
    }
]

// Component tái sử dụng hiển thị 1 thẻ Pricing
function PricingCard({ plan, periodLabel }: { plan: typeof MONTHLY_PLANS[0]; periodLabel: string }) {
    return (
        <Card className={`flex flex-col relative overflow-hidden text-left transition-all duration-300 ${plan.popular
            ? 'border-primary/50 shadow-lg shadow-primary/5 md:scale-105 z-10 bg-background'
            : 'bg-background/50 hover:bg-background hover:border-border/80'}`}
        >
            {/* Glow cho gói phổ biến */}
            {plan.popular && (
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            )}
            <CardContent className="p-8 flex-1 flex flex-col relative">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    {plan.popular && (
                        <Badge variant="default" className="shadow-sm">Phổ Biến</Badge>
                    )}
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground font-medium">{plan.period}</span>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3 flex items-center gap-3 mb-8 w-fit text-sm font-medium">
                    <Gem className="h-5 w-5 text-primary" />
                    <span>{plan.gems} Kim Cương/{periodLabel}</span>
                </div>

                <ul className="space-y-3.5 flex-1 mb-8">
                    {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-muted-foreground text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            {f}
                        </li>
                    ))}
                </ul>

                <Link to="/login" className="w-full mt-auto">
                    <Button className="w-full h-12 text-base" variant={plan.popular ? "default" : "outline"} size="lg">
                        {plan.cta}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}

// ============================================================
// LANDING PAGE COMPONENT
// ============================================================
export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className="relative w-full min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">

            {/* ==========================================================================
                NAVBAR — Glassmorphism sticky
            ============================================================================ */}
            <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 border-b ${scrolled ? 'bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 border-border/50' : 'bg-transparent border-transparent'}`}>
                <div className="container mx-auto px-4 md:px-8 max-w-7xl h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:scale-105 transition-transform">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">ZDream</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { label: "Tính năng", href: "#features" },
                            { label: "Kiểu mẫu", href: "#templates" },
                            { label: "Bảng giá", href: "#pricing" },
                            { label: "Hỏi đáp", href: "#faq" },
                        ].map((item) => (
                            <a key={item.label} href={item.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="hidden sm:block">
                            <Button size="sm" className="shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-shadow">
                                Bắt Đầu <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        {/* Mobile hamburger menu */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72 bg-background border-border/50">
                                <nav className="flex flex-col gap-6 mt-8">
                                    {[
                                        { label: "Tính năng", href: "#features" },
                                        { label: "Kiểu mẫu", href: "#templates" },
                                        { label: "Bảng giá", href: "#pricing" },
                                        { label: "Hỏi đáp", href: "#faq" },
                                    ].map((item) => (
                                        <a key={item.label} href={item.href}
                                            className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {item.label}
                                        </a>
                                    ))}
                                    <Separator className="bg-border/30" />
                                    <Link to="/login">
                                        <Button className="w-full">
                                            Bắt Đầu <ArrowUpRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </nav>

            {/* ==========================================================================
                HERO — Video Background + Centered Content
            ============================================================================ */}
            <section className="relative w-full min-h-screen pt-16 flex flex-col items-center justify-center overflow-hidden">
                {/* Video nền */}
                <video
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
                />
                {/* Overlay gradient kép — tối phía dưới nhiều hơn để chữ sáng rõ */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background z-0" />

                <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl text-center flex flex-col items-center">
                    <Badge variant="secondary" className="mb-8 py-1.5 px-5 text-sm glass">
                        <Zap className="mr-2 h-4 w-4 text-primary" /> Nền tảng sáng tạo nghệ thuật thế hệ mới
                    </Badge>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-balance leading-[1.1]">
                        Biến ý tưởng thành <br className="hidden sm:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary">
                            nghệ thuật thị giác
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-muted-foreground sm:text-lg sm:leading-8 mb-10 text-balance">
                        Chỉ cần mô tả, AI sẽ vẽ. Từ concept art đến logo thương hiệu — tất cả chỉ trong vài giây với chất lượng studio chuyên nghiệp.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link to="/app/generate" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full h-14 px-10 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                                <Play className="mr-2 h-4 w-4" /> Bắt Đầu Sáng Tạo
                            </Button>
                        </Link>
                        <Link to="/app/templates" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full h-14 px-10 text-base backdrop-blur-sm bg-background/30 border-border/50 hover:bg-background/50 transition-all">
                                <SwatchBook className="mr-2 h-4 w-4" /> Trải Nghiệm Mẫu
                            </Button>
                        </Link>
                    </div>

                    {/* Social Proof nhỏ ngay dưới CTA */}
                    <div className="flex items-center gap-4 mt-10">
                        <div className="flex -space-x-2">
                            {TESTIMONIALS.map((t, i) => (
                                <Avatar key={i} className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src={t.avatar} />
                                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <div className="flex flex-col text-left">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground">Được 50K+ nhà sáng tạo tin dùng</span>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator — căn giữa ngang tuyệt đối */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
                    <ChevronDown className="h-6 w-6 text-muted-foreground" />
                </div>
            </section>

            {/* ==========================================================================
                STATS — Floating glassmorphism cards
            ============================================================================ */}
            <section className="w-full py-20 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="text-center mb-12">
                        <Badge variant="outline" className="border-border/50">
                            <Trophy className="mr-2 h-3.5 w-3.5 text-primary" /> Thành tựu cộng đồng
                        </Badge>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { label: "Ảnh đã tạo", value: "1.2M+", icon: WandSparkles },
                            { label: "Người dùng", value: "50K+", icon: Star },
                            { label: "Kiểu mẫu", value: "12+", icon: SwatchBook },
                            { label: "Đánh giá", value: "4.9/5", icon: Gem },
                        ].map((stat) => (
                            <Card key={stat.label} className="glass border-border/30 hover:border-border/60 transition-all duration-300 group">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <stat.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-3xl font-bold tracking-tighter">{stat.value}</h3>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==========================================================================
                FEATURES — Bento grid layout
            ============================================================================ */}
            <section id="features" className="w-full py-24 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                {/* Subtle ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center relative">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-6 border-border/50">
                            <Layers className="mr-2 h-3.5 w-3.5 text-primary" /> Công cụ cho nhà sáng tạo
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Quy Trình Sáng Tác Đỉnh Cao</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg text-balance">
                            Tối ưu hóa mọi bước từ phác thảo bố cục, tinh chỉnh chi tiết đến xuất bản thành phẩm chất lượng nhất.
                        </p>
                    </div>

                    {/* Bento grid — 2 hàng: 1 card lớn + 2 card vừa, rồi 3 card nhỏ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                        {/* Feature 1 — Card nổi bật */}
                        <Card className="lg:row-span-2 h-full bg-background/50 border-border/30 hover:border-primary/30 transition-all duration-500 group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                            <CardContent className="p-8 flex flex-col h-full relative">
                                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <ZapIcon className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Làm Chủ Mọi Khung Hình</h3>
                                <p className="text-muted-foreground flex-1 mb-8 leading-relaxed">
                                    Lựa chọn 10 định dạng tỷ lệ khác nhau phục vụ từ thiết kế web, in ấn đến làm video dọc. Duy trì sự nhất quán của phong cách nhân vật và kiểm soát từng chi tiết xuất hiện trong ảnh.
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Tuyệt đối chính xác</Badge>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Chất lượng 4K</Badge>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">10 tỷ lệ khung</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="h-full bg-background/50 border-border/30 hover:border-primary/30 transition-all duration-500 group">
                            <CardContent className="p-8 flex flex-col h-full">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Palette className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Hệ Thống Phong Cách Mở Rộng</h3>
                                <p className="text-muted-foreground flex-1 mb-6 text-sm leading-relaxed">
                                    Bộ sưu tập kiểu mẫu đa biên độ giúp bạn áp dụng các phong cách nghệ thuật phức tạp chỉ trong một cú nhấp chuột.
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Hoàn toàn tự động</Badge>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Chuẩn hóa thẩm mỹ</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="h-full bg-background/50 border-border/30 hover:border-primary/30 transition-all duration-500 group">
                            <CardContent className="p-8 flex flex-col h-full">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Không Gian Làm Việc Riêng Tư</h3>
                                <p className="text-muted-foreground flex-1 mb-6 text-sm leading-relaxed">
                                    Mọi thành phẩm được sắp xếp khoa học thành từng dự án riêng biệt. Cam kết bảo vệ dữ liệu và trao toàn quyền thương mại.
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Lưu trữ đám mây</Badge>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Quyền thương mại</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature 4 — Thêm card "Quy trình nhanh" */}
                        <Card className="lg:col-span-2 bg-background/50 border-border/30 hover:border-primary/30 transition-all duration-500 group">
                            <CardContent className="p-8 flex flex-col sm:flex-row gap-6 items-start">
                                <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <WandSparkles className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-3">Từ Prompt Đến Tác Phẩm Trong 10 Giây</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                        Chỉ cần mô tả ý tưởng bằng ngôn ngữ tự nhiên, chọn phong cách yêu thích, và để AI biến giấc mơ thành hiện thực. Hệ thống xử lý tốc độ cực nhanh với hàng đợi ưu tiên thông minh.
                                    </p>
                                    <div className="flex gap-6 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <div className="h-2 w-2 rounded-full bg-green-400" />
                                            Tốc độ ~10s/ảnh
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <div className="h-2 w-2 rounded-full bg-blue-400" />
                                            Hàng đợi thông minh
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <div className="h-2 w-2 rounded-full bg-purple-400" />
                                            Nhiều engine AI
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* ==========================================================================
                TEMPLATES CAROUSEL
            ============================================================================ */}
            <section id="templates" className="w-full py-24 overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center w-full">
                    <div className="flex flex-col md:flex-row md:items-end justify-between w-full mb-12 gap-8 text-center md:text-left">
                        <div className="flex-1">
                            <Badge variant="outline" className="mb-6 border-border/50">
                                <SwatchBook className="mr-2 h-3.5 w-3.5 text-primary" /> Thư viện phong cách
                            </Badge>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Trải Nghiệm Đẳng Cấp Đồ Họa Mới</h2>
                            <p className="mt-3 text-muted-foreground text-lg max-w-2xl text-balance">
                                Tham khảo những phong cách hình ảnh đang dẫn đầu xu hướng và ứng dụng ngay vào thiết kế của bạn.
                            </p>
                        </div>
                        <div className="hidden md:flex shrink-0">
                            <Link to="/app/templates">
                                <Button variant="outline" className="backdrop-blur-sm">
                                    Xem tất cả <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="w-full px-12 md:px-16 mx-auto relative cursor-grab active:cursor-grabbing">
                        <Carousel
                            plugins={[Autoplay({ delay: 3000 })]}
                            opts={{ align: "start", loop: true }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4 md:-ml-6">
                                {TEMPLATES.map((tpl, index) => (
                                    <CarouselItem key={index} className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                        <Card className="overflow-hidden border-border/30 bg-background/50 h-full group hover:border-primary/30 transition-all duration-500">
                                            <CardContent className="p-0 relative aspect-[3/4] h-full">
                                                <img
                                                    src={tpl.img}
                                                    alt={tpl.name}
                                                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-700"
                                                    loading="lazy"
                                                    draggable={false}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-6 select-none pointer-events-none text-left">
                                                    <Badge variant="secondary" className="w-fit mb-3 glass">{tpl.cat}</Badge>
                                                    <h3 className="text-white font-bold text-xl">{tpl.name}</h3>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="absolute -left-6 md:-left-12 h-12 w-12" />
                            <CarouselNext className="absolute -right-6 md:-right-12 h-12 w-12" />
                        </Carousel>
                    </div>

                    <div className="md:hidden mt-12 text-center flex justify-center w-full">
                        <Link to="/app/templates" className="w-full">
                            <Button variant="outline" className="w-full">
                                Xem tất cả kiểu mẫu <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ==========================================================================
                TESTIMONIALS — Social proof section
            ============================================================================ */}
            <section className="w-full py-24 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-6 border-border/50">
                            <Star className="mr-2 h-3.5 w-3.5 text-primary" /> Nhận xét từ cộng đồng
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Được Tin Dùng Bởi Hàng Nghìn Nhà Sáng Tạo</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg text-balance">Lắng nghe trải nghiệm thực tế từ những nhà sáng tạo đang sử dụng ZDream mỗi ngày.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {TESTIMONIALS.map((t, index) => (
                            <Card key={index} className="bg-background/50 border-border/30 hover:border-border/60 transition-all duration-300">
                                <CardContent className="p-8 flex flex-col h-full">
                                    <Quote className="h-8 w-8 text-primary/20 mb-4" fill="currentColor" />
                                    <p className="text-foreground/90 flex-1 mb-8 leading-relaxed text-[15px]">
                                        "{t.quote}"
                                    </p>
                                    <Separator className="mb-6 bg-border/30" />
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-11 w-11 border-2 border-primary/20">
                                            <AvatarImage src={t.avatar} />
                                            <AvatarFallback>{t.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm">{t.name}</p>
                                            <p className="text-xs text-muted-foreground">{t.role}</p>
                                        </div>
                                        <div className="ml-auto flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==========================================================================
                PRICING — Tabs + Animated cards
            ============================================================================ */}
            <section id="pricing" className="w-full py-24 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center relative">
                    <div className="flex flex-col items-center text-center mb-16">
                        <Badge variant="outline" className="mb-6 border-border/50">
                            <Gem className="mr-2 h-3.5 w-3.5 text-primary" /> Hệ thống Kim Cương
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Gói dịch vụ linh hoạt</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg text-balance">
                            Mỗi tác phẩm AI sắc nét đều tiêu hao Kim Cương. Hãy chọn gói phù hợp nhất.
                        </p>
                    </div>

                    <Tabs defaultValue="monthly" className="w-full flex flex-col items-center">
                        <TabsList className="mb-12 glass border-border/30">
                            <TabsTrigger value="monthly" className="px-8 font-medium data-[state=active]:bg-background">Theo Tháng</TabsTrigger>
                            <TabsTrigger value="yearly" className="px-8 font-medium data-[state=active]:bg-background">
                                Theo Năm <Badge variant="secondary" className="ml-2 text-[10px] bg-primary/20 text-primary border-0">Tiết kiệm 20%</Badge>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="monthly" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-center">
                                {MONTHLY_PLANS.map((plan) => (
                                    <PricingCard key={plan.name} plan={plan} periodLabel="tháng" />
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="yearly" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-center">
                                {YEARLY_PLANS.map((plan) => (
                                    <PricingCard key={plan.name} plan={plan} periodLabel="năm" />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* ==========================================================================
                FAQ — Two-column layout with illustration card
            ============================================================================ */}
            <section id="faq" className="w-full py-24 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                        {/* Cột trái — Tiêu đề + card thông tin */}
                        <div className="lg:col-span-2 lg:sticky lg:top-24">
                            <Badge variant="outline" className="mb-6 border-border/50">Hỏi đáp</Badge>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Câu hỏi thường gặp</h2>
                            <p className="text-muted-foreground text-lg mb-8 text-balance">
                                Mọi thắc mắc của bạn về nền tảng ZDream AI.
                            </p>
                            <Card className="glass-panel">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm mb-1">Vẫn còn thắc mắc?</p>
                                        <p className="text-xs text-muted-foreground">Liên hệ đội ngũ hỗ trợ ZDream để được giải đáp nhanh nhất.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Cột phải — Accordion */}
                        <div className="lg:col-span-3">
                            <Card className="bg-background/50 border-border/30 w-full">
                                <CardContent className="p-6 md:p-8">
                                    <Accordion type="single" collapsible className="w-full text-left">
                                        {FAQS.map((faq, index) => (
                                            <AccordionItem key={index} value={`item-${index}`} className="last:border-b-0 border-border/30">
                                                <AccordionTrigger className="text-left font-medium text-base hover:no-underline py-5 hover:text-primary transition-colors">
                                                    {faq.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground leading-relaxed text-[15px] pb-5">
                                                    {faq.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==========================================================================
                CTA FINAL — Full-width gradient card
            ============================================================================ */}
            <section className="w-full py-24 relative">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center">
                    <Card className="w-full max-w-5xl mx-auto overflow-hidden relative border-border/30">
                        {/* Ambient glows */}
                        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                        <CardContent className="p-10 md:p-20 flex flex-col items-center text-center relative">
                            <div className="flex -space-x-3 justify-center mb-8">
                                {TESTIMONIALS.map((t, i) => (
                                    <Avatar key={i} className="h-14 w-14 border-4 border-background">
                                        <AvatarImage src={t.avatar} />
                                        <AvatarFallback>{t.name[0]}</AvatarFallback>
                                    </Avatar>
                                ))}
                                <Avatar className="h-14 w-14 border-4 border-background bg-secondary">
                                    <AvatarFallback className="text-xs font-bold">+50K</AvatarFallback>
                                </Avatar>
                            </div>

                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6 text-balance">
                                Bắt đầu sáng tạo ngay hôm nay
                            </h2>
                            <p className="text-muted-foreground text-lg md:text-xl mb-10 text-balance max-w-2xl">
                                Tạo tài khoản hoàn toàn miễn phí, nhận ngay 50 Kim Cương và bắt đầu hành trình nghệ thuật không rủi ro.
                            </p>

                            <Link to="/login">
                                <Button size="lg" className="h-14 px-10 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                                    Bắt Đầu Miễn Phí <ArrowUpRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>

        </div>
    )
}
