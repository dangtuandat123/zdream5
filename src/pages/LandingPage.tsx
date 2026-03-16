import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    ArrowUpRight,
    Sparkles,
    WandSparkles,
    SwatchBook,
    Images,
    Gem,
    Zap,
    Star,
    CheckCircle2,
    Layers,
    Download,
    Play,
} from "lucide-react"

// ============================================================
// LandingPage - Minimalist shadcn/ui rewrite
// ============================================================

const PLANS = [
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

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className="relative w-full min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
            
            {/* ======================
                NAVBAR
            ========================= */}
            <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-background/80 backdrop-blur-md border-border/40 shadow-sm' : 'bg-transparent border-transparent'}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">
                            ZDream
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        {[
                            { label: "Tính năng", href: "#features" },
                            { label: "Cách hoạt động", href: "#how-it-works" },
                            { label: "Kiểu mẫu", href: "#templates" },
                            { label: "Bảng giá", href: "#pricing" },
                        ].map((item) => (
                            <a key={item.label} href={item.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                    <div>
                        <Link to="/login">
                            <Button size="sm" className="font-medium">
                                Đăng Nhập <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ======================
                HERO SECTION
            ========================= */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
               {/* Background Elements */}
               <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
                
                <div className="container px-4 md:px-6 text-center max-w-4xl mx-auto flex flex-col items-center relative z-10">
                    <Badge variant="secondary" className="mb-6 py-1.5 px-4 text-sm font-medium">
                        <Zap className="mr-2 h-4 w-4 text-primary" /> AI-Powered Creative Platform
                    </Badge>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-balance">
                        Nền tảng giúp bạn tạo <br className="hidden sm:block" />
                        <span className="text-primary">ảnh AI chất lượng cao</span>
                    </h1>

                    <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-lg sm:leading-8 mb-10 text-balance">
                        Tạo ảnh từ văn bản, áp dụng kiểu mẫu có sẵn, quản lý thư viện cá nhân.
                        Dành cho Nhà Sáng Tạo, Designer và Thương Hiệu.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link to="/app/generate" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full font-semibold">
                                <Play className="mr-2 h-4 w-4" /> Tạo Ảnh Ngay
                            </Button>
                        </Link>
                        <Link to="/app/templates" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full font-semibold">
                                <SwatchBook className="mr-2 h-4 w-4" /> Xem Kiểu Mẫu
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

             {/* ======================
                STATS SECTION
            ========================= */}
            <section className="border-y bg-muted/30">
                <div className="container py-12 md:py-16">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-border">
                         {[
                            { label: "Ảnh đã tạo", value: "1.2M+", icon: WandSparkles },
                            { label: "Người dùng", value: "50K+", icon: Star },
                            { label: "Kiểu mẫu", value: "12+", icon: SwatchBook },
                            { label: "Đánh giá", value: "4.9/5", icon: Gem },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center justify-center space-y-2">
                                <stat.icon className="h-6 w-6 text-muted-foreground mb-2" />
                                <h3 className="text-3xl font-bold tracking-tighter">{stat.value}</h3>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======================
                FEATURES GRID
            ========================= */}
            <section id="features" className="container py-24 md:py-32">
                <div className="flex flex-col items-center text-center mb-16">
                     <Badge variant="outline" className="mb-4">
                        Tính năng nổi bật
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Mọi thứ bạn cần để sáng tạo</h2>
                    <p className="mt-4 max-w-[42rem] text-muted-foreground text-lg text-balance">Từ ý tưởng đến tác phẩm chỉ trong vài cú nhấp chuột.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                                    <WandSparkles className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Tạo Ảnh AI</h3>
                                <p className="text-muted-foreground leading-relaxed">Nhập mô tả, chọn tỷ lệ khung hình và mô hình AI. Ảnh 4K chỉ trong vài giây.</p>
                            </div>
                            <div className="flex gap-2 mt-6 flex-wrap">
                                <Badge variant="secondary">Text-to-Image</Badge>
                                <Badge variant="secondary">4K Output</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                                    <SwatchBook className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Kho Kiểu Mẫu</h3>
                                <p className="text-muted-foreground leading-relaxed">12+ preset: Cyberpunk, Anime, 3D, Logo... Chọn mẫu, tải ảnh lên, nhận kết quả ngay.</p>
                            </div>
                            <div className="flex gap-2 mt-6 flex-wrap">
                                <Badge variant="secondary">Mẫu đa dạng</Badge>
                                <Badge variant="secondary">Dễ sử dụng</Badge>
                            </div>
                        </CardContent>
                    </Card>

                     <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                                    <Images className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Thư Viện Của Bạn</h3>
                                <p className="text-muted-foreground leading-relaxed">Quản lý ảnh AI, kết quả kiểu mẫu và tài nguyên gốc. Tìm kiếm, tải xuống trong tích tắc.</p>
                            </div>
                            <div className="flex gap-2 mt-6 flex-wrap">
                                <Badge variant="secondary">Quản lý hiệu quả</Badge>
                                <Badge variant="secondary">Lưu trữ đám mây</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

             {/* ======================
                HOW IT WORKS
            ========================= */}
            <section id="how-it-works" className="bg-muted/50 py-24 md:py-32 border-y">
                <div className="container">
                     <div className="flex flex-col items-center text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Chỉ 3 bước đơn giản</h2>
                        <p className="mt-4 max-w-[42rem] text-muted-foreground text-lg text-balance">Từ ý tưởng đến tác phẩm hoàn chỉnh trong vài giây.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
                        {/* Connecting Line (Desktop Only) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-border z-0"></div>

                        {[
                            { step: "1", icon: WandSparkles, title: "Nhập mô tả", desc: "Viết nội dung bạn muốn vẽ ra." },
                            { step: "2", icon: Layers, title: "Chọn cài đặt", desc: "Tinh chỉnh mẫu hoặc phong cách." },
                            { step: "3", icon: Download, title: "Tải xuống", desc: "Nhận ảnh chất lượng cao và chia sẻ." },
                        ].map((s) => (
                             <div key={s.step} className="flex flex-col items-center text-center relative z-10">
                                <div className="h-24 w-24 rounded-full bg-background border-4 border-muted/50 flex items-center justify-center mb-6 shadow-sm">
                                    <s.icon className="h-10 w-10 text-primary" />
                                </div>
                                <Badge variant="outline" className="mb-4">Bước {s.step}</Badge>
                                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                                <p className="text-muted-foreground">{s.desc}</p>
                             </div>
                        ))}
                    </div>
                </div>
            </section>

             {/* ======================
                TEMPLATES
            ========================= */}
            <section id="templates" className="container py-24 md:py-32">
                <div className="flex flex-col items-center text-center mb-12">
                     <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Chọn phong cách yêu thích</h2>
                     <p className="mt-4 max-w-[42rem] text-muted-foreground text-lg text-balance">Khám phá và áp dụng các kiểu mẫu chuyên nghiệp ngay lập tức.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                     {TEMPLATES.map((tpl) => (
                        <Card key={tpl.name} className="overflow-hidden group cursor-pointer border-transparent bg-muted/30 hover:bg-muted/60 transition-colors">
                            <CardContent className="p-0 relative aspect-[3/4]">
                                 <img
                                    src={tpl.img}
                                    alt={tpl.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                                     <Badge variant="secondary" className="w-fit mb-2 bg-white/20 hover:bg-white/20 text-white backdrop-blur-sm border-none">{tpl.cat}</Badge>
                                     <h3 className="text-white font-semibold">{tpl.name}</h3>
                                </div>
                            </CardContent>
                        </Card>
                     ))}
                </div>

                <div className="flex justify-center">
                    <Link to="/app/templates">
                        <Button variant="outline" size="lg" className="font-medium">
                            Xem tất cả kiểu mẫu <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

             {/* ======================
                PRICING
            ========================= */}
            <section id="pricing" className="bg-muted/30 py-24 md:py-32 border-y">
                <div className="container max-w-6xl">
                    <div className="flex flex-col items-center text-center mb-16">
                        <Badge variant="outline" className="mb-4">Hệ thống Kim Cương</Badge>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Chọn gói phù hợp</h2>
                        <p className="mt-4 max-w-[42rem] text-muted-foreground text-lg text-balance">Mỗi lần tạo ảnh tiêu hao Kim Cương. Nạp thêm hoặc chọn gói Pro.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {PLANS.map((plan) => (
                             <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-100 md:scale-105 z-10 relative' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 left-0 flex justify-center -mt-3">
                                        <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">Phổ Biến</Badge>
                                    </div>
                                )}
                                <CardContent className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                                        <span className="text-muted-foreground font-medium">{plan.period}</span>
                                    </div>

                                    <div className="bg-secondary/50 rounded-lg p-3 flex items-center gap-2 mb-8 w-fit text-sm font-medium">
                                        <Gem className="h-4 w-4 text-primary" />
                                        <span>{plan.gems} Kim Cương/tháng</span>
                                    </div>

                                    <ul className="space-y-3 flex-1 mb-8">
                                         {plan.features.map((f) => (
                                            <li key={f} className="flex items-start gap-3 text-muted-foreground text-sm font-medium">
                                                 <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                                 {f}
                                            </li>
                                         ))}
                                    </ul>

                                    <Link to="/login" className="w-full mt-auto">
                                        <Button className="w-full font-semibold" variant={plan.popular ? "default" : "outline"} size="lg">
                                            {plan.cta}
                                        </Button>
                                    </Link>
                                </CardContent>
                             </Card>
                         ))}
                    </div>
                </div>
            </section>

             {/* ======================
                CTA
            ========================= */}
            <section className="container py-24 md:py-32">
                <div className="bg-primary/5 rounded-3xl border p-8 md:p-16 flex flex-col items-center text-center max-w-4xl mx-auto overflow-hidden relative">
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex -space-x-3 justify-center mb-8">
                                 {[
                                     "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=64&auto=format&fit=crop&crop=face",
                                     "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=64&auto=format&fit=crop&crop=face",
                                     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=64&auto=format&fit=crop&crop=face",
                                     "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=64&auto=format&fit=crop&crop=face",
                                 ].map((src, i) => (
                                     <img key={i} src={src} alt="User Avatar" className="w-12 h-12 rounded-full border-4 border-background object-cover" loading="lazy" />
                                 ))}
                                  <div className="w-12 h-12 rounded-full border-4 border-background bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground z-10">
                                     +50k
                                  </div>
                        </div>

                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">Sẵn sàng sáng tạo?</h2>
                        <p className="max-w-[42rem] text-muted-foreground text-lg mb-8 text-balance mx-auto">
                           Đăng ký miễn phí. Nhận ngay 50 Kim Cương. Bắt đầu tác phẩm nghệ thuật tiếp theo của bạn trong 2 phút.
                        </p>

                        <Link to="/login">
                            <Button size="lg" className="font-semibold h-14 px-8 text-base">
                                Tham Gia Cộng Đồng <ArrowUpRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    )
}
