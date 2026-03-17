import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
    ShieldCheck
} from "lucide-react"

// ============================================================
// LandingPage - Full-screen layout & alignment rewrite
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
        question: "Tạo ảnh AI có khó không, tôi chưa có kinh nghiệm viết prompt?",
        answer: "Hoàn toàn không! Tính năng 'Kho Kiểu Mẫu' (Templates) được thiết kế đặc biệt cho người mới. Bạn chỉ việc chọn phong cách, tải lên ảnh gốc hoặc nhập ý tưởng cơ bản. ZDream AI sẽ tự động nạp các bộ lọc (Effect Groups) và từ khóa chuyên sâu đã được tinh chỉnh sẵn để cho ra tác phẩm hoàn hảo."
    },
    {
        question: "Có giới hạn số lượng ảnh lưu trong thư viện không?",
        answer: "Không! Tài khoản người dùng sẽ được lưu trữ toàn bộ lịch sử tạo ảnh trên Cloud. Tuy nhiên ảnh sẽ bị nén nhẹ đi sau 30 ngày nếu không nằm trong mục 'Yêu Thích'."
    }
]

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className="relative w-full min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            
            {/* ======================
                NAVBAR
            ========================= */}
            <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-background border-transparent'}`}>
                {/* Standardized Header Container */}
                <div className="container mx-auto px-4 md:px-8 max-w-7xl h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground group-hover:opacity-90 transition-opacity">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">
                            ZDream
                        </span>
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
                    <div>
                        <Link to="/login">
                            <Button size="sm">
                                Đăng Nhập <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ======================
                HERO SECTION
            ========================= */}
            <section className="relative w-full min-h-screen pt-16 flex flex-col items-center justify-center bg-background overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
                />
                <div className="absolute inset-0 bg-background/60 z-0"></div>

                <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl text-center flex flex-col items-center">
                    <Badge variant="secondary" className="mb-8 py-1.5 px-4 text-sm">
                        <Zap className="mr-2 h-4 w-4 text-primary" /> Tiêu chuẩn hóa với shadcn UI
                    </Badge>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-8 text-balance">
                        Biến ý tưởng thành <br className="hidden sm:block" />
                        <span className="text-primary">
                            nghệ thuật thị giác
                        </span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-muted-foreground sm:text-lg sm:leading-8 mb-10 text-balance">
                        Tạo tác phẩm nghệ thuật chỉ bằng vài từ khóa. Hỗ trợ 10 tỷ lệ khung hình, ảnh sắc nét 4K, Image-to-Image và hệ thống Kiểu mẫu (Templates) thông minh giúp bạn dễ dàng có ngay ảnh đẹp mà không cần rành viết Prompt.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link to="/app/generate" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full h-12 px-8">
                                <Play className="mr-2 h-4 w-4" /> Bắt Đầu Sáng Tạo
                            </Button>
                        </Link>
                        <Link to="/app/templates" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full h-12 px-8">
                                <SwatchBook className="mr-2 h-4 w-4" /> Trải Nghiệm Mẫu
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

             {/* ======================
                STATS SECTION (This one doesn't strictly need min-h-screen, but we keep it full width consistent)
            ========================= */}
            <section className="w-full border-y bg-muted/50 flex flex-col items-center justify-center py-16">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-border">
                         {[
                            { label: "Ảnh đã tạo", value: "1.2M+", icon: WandSparkles },
                            { label: "Người dùng", value: "50K+", icon: Star },
                            { label: "Kiểu mẫu", value: "12+", icon: SwatchBook },
                            { label: "Đánh giá", value: "4.9/5", icon: Gem },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center justify-center space-y-3">
                                <stat.icon className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-3xl font-bold tracking-tighter">{stat.value}</h3>
                                <p className="text-sm font-medium text-muted-foreground uppercase">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======================
                FEATURES GRID
            ========================= */}
            <section id="features" className="w-full min-h-screen py-24 flex flex-col items-center justify-center">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center text-center">
                    <div className="mb-16">
                         <Badge variant="outline" className="mb-6">Sáng tạo không rào cản</Badge>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Quy trình mượt mà, kết quả đỉnh cao</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg text-balance">Chạm tay đến khả năng biến ý tưởng hình ảnh đồ họa thành hiện thực với đầy đủ công cụ kiểm soát chuyên sâu cho dân chuyên, và Template tiện xài cho người mới.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full text-left">
                        {/* Feature 1 */}
                        <Card className="h-full bg-background hover:bg-muted/50 transition-colors">
                            <CardContent className="p-8 flex flex-col h-full">
                                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-6">
                                    <ZapIcon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">Tùy Biến Chuyên Sâu</h3>
                                <p className="text-muted-foreground flex-1 mb-8">Kiểm soát hoàn toàn bức ảnh với 10 tỷ lệ khung hình, xuất độ phân giải lên đến 4K. Tích hợp Image-to-Image (Tạo ảnh từ ảnh), Seed, và Loại trừ (Negative Prompt).</p>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">10 Tỷ lệ khung hình</Badge>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">I2I & T2I</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="h-full bg-background hover:bg-muted/50 transition-colors">
                            <CardContent className="p-8 flex flex-col h-full">
                                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-6">
                                    <Palette className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">Hệ Thống Kiểu Mẫu</h3>
                                <p className="text-muted-foreground flex-1 mb-8">Không biết viết lệnh rườm rà? Hãy sử dụng kho Templates. Chọn mẫu, tinh chỉnh bằng menu Effect (bộ lọc màu, phong cách), thêm ảnh gốc và tạo tác phẩm hoàn chỉnh tức thì.</p>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Thiết kế cho Newbie</Badge>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Auto-Prompting</Badge>
                                </div>
                            </CardContent>
                        </Card>

                         {/* Feature 3 */}
                         <Card className="h-full bg-background hover:bg-muted/50 transition-colors">
                            <CardContent className="p-8 flex flex-col h-full">
                                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-6">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">Bản Quyền 100%</h3>
                                <p className="text-muted-foreground flex-1 mb-8">Mọi hình ảnh bạn tạo ra kết hợp với hệ thống Kim Cương đều được phép sử dụng thương mại 100% không giới hạn.</p>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="secondary">Dùng thương mại</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

             {/* ======================
                TEMPLATES CAROUSEL
            ========================= */}
            <section id="templates" className="w-full min-h-screen bg-muted/30 border-y py-24 flex flex-col items-center justify-center overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center w-full">
                    <div className="flex flex-col md:flex-row md:items-end justify-between w-full mb-12 gap-8 text-center md:text-left">
                         <div className="flex-1">
                             <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Kho Kiểu Mẫu (Templates) Đa Dạng</h2>
                             <p className="mt-4 md:mt-2 text-muted-foreground text-lg max-w-2xl text-balance">Mỗi Template là một công thức đã được tinh chỉnh thông số kỹ thuật (System Prompt, Effect). Cực kỳ tiện lợi cho người dùng muốn tạo ảnh đẹp mà bỏ qua rào cản kỹ thuật.</p>
                         </div>
                         <div className="hidden md:flex shrink-0">
                             <Link to="/app/templates">
                                 <Button variant="outline">
                                     Xem tất cả <ArrowUpRight className="ml-2 h-4 w-4" />
                                 </Button>
                             </Link>
                         </div>
                    </div>

                    <div className="w-full px-12 md:px-16 mx-auto relative cursor-grab active:cursor-grabbing">
                        <Carousel
                            plugins={[
                                Autoplay({
                                    delay: 3000,
                                })
                            ]}
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4 md:-ml-8">
                                {TEMPLATES.map((tpl, index) => (
                                    <CarouselItem key={index} className="pl-4 md:pl-8 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                        <Card className="overflow-hidden border-border bg-background h-full">
                                            <CardContent className="p-0 relative aspect-[3/4] h-full">
                                                <img
                                                    src={tpl.img}
                                                    alt={tpl.name}
                                                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                                                    loading="lazy"
                                                    draggable={false}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 select-none pointer-events-none text-left">
                                                    <Badge variant="secondary" className="w-fit mb-3">{tpl.cat}</Badge>
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

             {/* ======================
                PRICING
            ========================= */}
            <section id="pricing" className="w-full min-h-screen py-24 flex flex-col items-center justify-center">
                 <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center">
                     <div className="flex flex-col items-center text-center mb-16">
                         <Badge variant="outline" className="mb-6">
                            Hệ thống Kim Cương
                        </Badge>
                         <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Gói dịch vụ linh hoạt</h2>
                         <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg text-balance">Mỗi tác phẩm AI sắc nét đều tiêu hao Kim Cương. Hãy chọn gói phù hợp nhất.</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-center">
                          {PLANS.map((plan) => (
                              <Card key={plan.name} className={`flex flex-col relative overflow-hidden bg-background text-left ${plan.popular ? 'border-primary shadow-lg sm:scale-105 z-10' : ''}`}>
                                 <CardContent className="p-8 flex-1 flex flex-col">
                                     <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                                        {plan.popular && (
                                            <Badge variant="default">Phổ Biến</Badge>
                                        )}
                                     </div>
                                     <div className="flex items-baseline gap-1 mb-8">
                                         <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                                         <span className="text-muted-foreground font-medium">{plan.period}</span>
                                     </div>

                                     <div className="bg-secondary rounded-md p-3 flex items-center gap-3 mb-10 w-fit text-sm font-medium">
                                         <Gem className="h-5 w-5 text-primary" />
                                         <span>{plan.gems} Kim Cương/tháng</span>
                                     </div>

                                     <ul className="space-y-4 flex-1 mb-10">
                                          {plan.features.map((f) => (
                                             <li key={f} className="flex items-center gap-3 text-muted-foreground text-base">
                                                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
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
                          ))}
                     </div>
                 </div>
            </section>

             {/* ======================
                FAQ - Accordion Section
            ========================= */}
            <section id="faq" className="w-full min-h-screen bg-muted/30 border-y py-24 flex flex-col items-center justify-center">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center">
                    <div className="flex flex-col items-center text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Câu hỏi thường gặp</h2>
                        <p className="mt-4 text-muted-foreground text-lg text-balance">Mọi thắc mắc của bạn về nền tảng ZDream AI.</p>
                    </div>

                    <div className="w-full max-w-3xl mx-auto">
                        <Card className="bg-background w-full">
                            <CardContent className="p-6 md:p-8">
                                <Accordion type="single" collapsible className="w-full text-left">
                                    {FAQS.map((faq, index) => (
                                        <AccordionItem key={index} value={`item-${index}`} className="last:border-b-0">
                                            <AccordionTrigger className="text-left font-medium text-base hover:no-underline py-4">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

             {/* ======================
                CTA WITH AVATARS
            ========================= */}
            <section className="w-full min-h-[90vh] py-24 flex flex-col items-center justify-center">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center">
                    <div className="bg-muted/50 rounded-xl border p-8 md:p-24 flex flex-col items-center text-center w-full max-w-5xl mx-auto">
                        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                            <div className="flex -space-x-4 justify-center mb-8">
                                <Avatar className="h-16 w-16 border-4 border-background">
                                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop&crop=face" alt="@user" />
                                    <AvatarFallback>U1</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-16 w-16 border-4 border-background">
                                    <AvatarImage src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop&crop=face" alt="@user" />
                                    <AvatarFallback>U2</AvatarFallback>
                                </Avatar>
                                 <Avatar className="h-16 w-16 border-4 border-background">
                                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop&crop=face" alt="@user" />
                                    <AvatarFallback>U3</AvatarFallback>
                                </Avatar>
                                 <Avatar className="h-16 w-16 border-4 border-background bg-secondary flex items-center justify-center font-bold text-sm">
                                    <AvatarFallback>+50K</AvatarFallback>
                                </Avatar>
                            </div>

                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6 text-balance">Tham gia cộng đồng sáng tạo đỉnh cao</h2>
                            <p className="text-muted-foreground text-lg md:text-xl mb-10 text-balance">
                               Tạo tài khoản hoàn toàn miễn phí, nhận ngay 50 Kim Cương và bắt đầu hành trình nghệ thuật của bạn ngay bây giờ không rủi ro.
                            </p>

                            <Link to="/login">
                                <Button size="lg" className="h-14 px-10 text-lg">
                                    Tạo Tài Khoản Miễn Phí <ArrowUpRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}
