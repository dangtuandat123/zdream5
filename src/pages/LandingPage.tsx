import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
// LandingPage - Advanced Interactive shadcn/ui rewrite
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
        answer: "Rất dễ dàng! Chúng tôi cung cấp mục 'Kho Kiểu Mẫu' (Templates). Bạn chỉ cần chọn phong cách bạn thích, nhập vài từ khóa tiếng Việt đơn giản (hoặc tải một ảnh gốc lên), ZDream AI sẽ tự động tối ưu prompt để cho ra kết quả đẹp nhất."
    },
    {
        question: "Có giới hạn số lượng ảnh lưu trong thư viện không?",
        answer: "Không! Tài khoản người dùng sẽ được lưu trữ toàn bộ lịch sử tạo ảnh trên Cloud (sử dụng s3). Tuy nhiên ảnh sẽ bị nén nhẹ đi sau 30 ngày nếu không nằm trong mục 'Yêu Thích'."
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
        <div className="relative w-full min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden transition-colors duration-300">
            
            {/* ======================
                NAVBAR
            ========================= */}
            <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-background/80 backdrop-blur-md border-border/40 shadow-sm' : 'bg-transparent border-transparent'}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg group-hover:bg-primary/90 transition-all group-hover:scale-105 duration-300">
                            <Sparkles className="h-5 w-5" />
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
                                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                    <div>
                        <Link to="/login">
                            <Button size="sm" className="font-semibold rounded-full px-5 shadow-sm">
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
               {/* Ambient Background Gradient (shadcn tailwind styling) */}
               <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none"></div>
                
                <div className="container px-4 md:px-6 text-center max-w-5xl mx-auto flex flex-col items-center relative z-10">
                    <Badge variant="outline" className="mb-6 py-1.5 px-4 text-sm font-semibold border-primary/20 bg-primary/5 text-primary rounded-full shadow-sm">
                        <Zap className="mr-2 h-4 w-4 fill-primary" /> AI-Powered Creative Platform
                    </Badge>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[5.5rem] mb-6 text-balance leading-[1.1]">
                        Biến ý tưởng thành <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-fuchsia-500">
                            nghệ thuật thị giác
                        </span>
                    </h1>

                    <p className="max-w-[42rem] mx-auto text-muted-foreground sm:text-xl sm:leading-8 mb-10 text-balance font-medium">
                        Công cụ AI mạnh mẽ để tạo ảnh từ văn bản, áp dụng hơn 12 kiểu mẫu có sẵn, và quản lý thư viện đám mây cá nhân.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
                        <Link to="/app/generate" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full font-bold h-14 px-8 text-base rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
                                <Play className="mr-2 h-5 w-5 fill-current" /> Bắt Đầu Sáng Tạo
                            </Button>
                        </Link>
                        <Link to="/app/templates" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full font-bold h-14 px-8 text-base rounded-full border-2 hover:bg-muted">
                                <SwatchBook className="mr-2 h-5 w-5" /> Trải Nghiệm Mẫu
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
                                <stat.icon className="h-6 w-6 text-primary/60 mb-2" />
                                <h3 className="text-3xl font-bold tracking-tighter">{stat.value}</h3>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
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
                     <Badge variant="outline" className="mb-4 rounded-full">Tính năng nổi bật</Badge>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Quy trình làm việc không giới hạn</h2>
                    <p className="mt-4 max-w-[42rem] text-muted-foreground text-lg text-balance">Mọi thao tác phức tạp đều được tự động hóa. Bạn chỉ cần tập trung vào ý tưởng.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Feature 1 */}
                    <Card className="flex flex-col h-full border-muted/60 bg-gradient-to-b from-muted/50 to-background shadow-none hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-8 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                    <ZapIcon className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Tạo Ảnh Siêu Tốc</h3>
                                <p className="text-muted-foreground leading-relaxed">Sử dụng các LLM Image Models mới nhất. Đưa ra lệnh văn bản và nhận kết quả sắc nét lên đến 4K chỉ trong vài giây.</p>
                            </div>
                            <Separator className="my-6 block sm:hidden md:block" />
                            <div className="flex gap-2 flex-wrap">
                                <Badge variant="secondary" className="rounded-md">Chất lượng 4K</Badge>
                                <Badge variant="secondary" className="rounded-md">Prompt tối ưu</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feature 2 */}
                    <Card className="flex flex-col h-full border-muted/60 bg-gradient-to-b from-muted/50 to-background shadow-none hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-8 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="h-14 w-14 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center mb-6">
                                    <Palette className="h-7 w-7 text-fuchsia-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Thư Viện Kiểu Mẫu</h3>
                                <p className="text-muted-foreground leading-relaxed">Hơn 12 presets trải dài từ Cyberpunk, Anime, đến Logo và 3D. Tự động áp dụng bộ lọc tham số mà không cần học code.</p>
                            </div>
                            <Separator className="my-6 block sm:hidden md:block" />
                            <div className="flex gap-2 flex-wrap">
                                <Badge variant="secondary" className="rounded-md text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10">12+ Phong cách</Badge>
                                <Badge variant="secondary" className="rounded-md text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10">Dễ tùy biến</Badge>
                            </div>
                        </CardContent>
                    </Card>

                     {/* Feature 3 */}
                     <Card className="flex flex-col h-full border-muted/60 bg-gradient-to-b from-muted/50 to-background shadow-none hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-8 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                                    <ShieldCheck className="h-7 w-7 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Sở Hữu Bản Quyền</h3>
                                <p className="text-muted-foreground leading-relaxed">Mọi hình ảnh bạn tạo ra kết hợp với hệ thống Kim Cương đều được phép sử dụng thương mại 100%.</p>
                            </div>
                            <Separator className="my-6 block sm:hidden md:block" />
                            <div className="flex gap-2 flex-wrap">
                                <Badge variant="secondary" className="rounded-md border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">Cấp phép kinh doanh</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

             {/* ======================
                TEMPLATES CAROUSEL
            ========================= */}
            <section id="templates" className="bg-muted/30 py-24 md:py-32 border-y overflow-hidden">
                <div className="container max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                         <div className="flex-1">
                             <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Trải nghiệm phong cách đẳng cấp</h2>
                             <p className="mt-4 text-muted-foreground text-lg max-w-2xl text-balance">Vuốt để xem các kiểu mẫu template nghệ thuật được sử dụng nhiều nhất trên hệ thống.</p>
                         </div>
                         <div className="hidden md:flex shrink-0">
                             <Link to="/app/templates">
                                 <Button variant="outline" className="font-semibold rounded-full group">
                                     Xem tất cả <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                 </Button>
                             </Link>
                         </div>
                    </div>

                    <div className="relative px-0 md:px-12">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4 md:-ml-6">
                                {TEMPLATES.map((tpl, index) => (
                                    <CarouselItem key={index} className="pl-4 md:pl-6 basis-4/5 sm:basis-1/2 lg:basis-1/3 xlg:basis-1/4">
                                        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border bg-background group select-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                            <img
                                                src={tpl.img}
                                                alt={tpl.name}
                                                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                                loading="lazy"
                                                draggable={false}
                                            />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 select-none pointer-events-none">
                                                <Badge variant="secondary" className="w-fit mb-3 bg-white/20 text-white backdrop-blur-md border-none pointer-events-auto shadow-sm">{tpl.cat}</Badge>
                                                <h3 className="text-white font-bold text-xl drop-shadow-sm leading-tight">{tpl.name}</h3>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden md:flex -left-4 bg-background border-2 w-12 h-12 shadow-sm" />
                            <CarouselNext className="hidden md:flex -right-4 bg-background border-2 w-12 h-12 shadow-sm" />
                        </Carousel>
                    </div>

                    <div className="md:hidden mt-8 text-center flex justify-center">
                         <Link to="/app/templates">
                             <Button variant="outline" className="font-semibold rounded-full w-full">
                                 Xem tất cả kiểu mẫu <ArrowUpRight className="ml-2 h-4 w-4" />
                             </Button>
                         </Link>
                    </div>
                </div>
            </section>

             {/* ======================
                PRICING
            ========================= */}
            <section id="pricing" className="container py-24 md:py-32">
                 <div className="flex flex-col items-center text-center mb-16">
                     <Badge variant="outline" className="mb-4 rounded-full border-cyan-500/30 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5">
                        <Gem className="mr-2 h-3.5 w-3.5 fill-current" /> Hệ thống Tài sản Kim Cương
                    </Badge>
                     <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Gói dịch vụ linh hoạt</h2>
                     <p className="mt-4 max-w-[42rem] text-muted-foreground text-lg text-balance">Mỗi tác phẩm AI sắc nét đều tiêu hao Kim Cương. Hãy chọn cách nạp phù hợp nhất.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                      {PLANS.map((plan) => (
                          <Card key={plan.name} className={`flex flex-col relative overflow-hidden transition-all duration-300 ${plan.popular ? 'border-primary shadow-2xl scale-100 md:scale-105 z-10' : 'hover:border-primary/50'}`}>
                             {plan.popular && (
                                 <div className="absolute top-0 right-0 left-0 bg-primary h-1.5" />
                             )}
                             
                             <CardContent className="p-8 flex-1 flex flex-col pt-10">
                                 {plan.popular && (
                                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground font-bold shadow-sm">Phổ Biến</Badge>
                                 )}
                                 <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                                 <div className="flex items-baseline gap-1 mb-6">
                                     <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                                     <span className="text-muted-foreground font-medium">{plan.period}</span>
                                 </div>

                                 <div className="bg-primary/10 rounded-xl p-3 flex items-center gap-3 mb-8 w-fit text-sm font-bold text-primary">
                                     <Gem className="h-5 w-5 fill-primary/20" />
                                     <span>{plan.gems} Kim Cương/tháng</span>
                                 </div>

                                 <ul className="space-y-4 flex-1 mb-10">
                                      {plan.features.map((f) => (
                                         <li key={f} className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
                                              <CheckCircle2 className={`h-5 w-5 shrink-0 ${plan.popular ? 'text-primary' : 'text-primary/60'}`} />
                                              {f}
                                         </li>
                                      ))}
                                 </ul>

                                 <Link to="/login" className="w-full mt-auto">
                                     <Button className="w-full font-bold h-12 text-base rounded-xl" variant={plan.popular ? "default" : "outline"} size="lg">
                                         {plan.cta}
                                     </Button>
                                 </Link>
                             </CardContent>
                          </Card>
                      ))}
                 </div>
            </section>

             {/* ======================
                FAQ - Accordion Section
            ========================= */}
            <section id="faq" className="bg-muted/30 py-24 md:py-32 border-y">
                <div className="container max-w-3xl mx-auto">
                    <div className="flex flex-col items-center text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Câu hỏi thường gặp</h2>
                        <p className="mt-4 text-muted-foreground text-lg">Mọi thắc mắc của bạn về nền tảng ZDream AI.</p>
                    </div>

                    <Accordion type="single" collapsible className="w-full bg-background rounded-2xl border shadow-sm px-6 py-2">
                        {FAQS.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-b-0 border-t first:border-t-0">
                                <AccordionTrigger className="text-left font-semibold text-base py-6 hover:no-underline hover:text-primary transition-colors">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

             {/* ======================
                CTA WITH AVATARS
            ========================= */}
            <section className="container py-24 md:py-32">
                <div className="bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/15 via-background to-background rounded-[2.5rem] border p-8 md:p-20 flex flex-col items-center text-center max-w-5xl mx-auto overflow-hidden shadow-2xl">
                    <div className="relative z-10 w-full max-w-2xl mx-auto">
                        <div className="flex -space-x-3 justify-center mb-8">
                            <Avatar className="h-14 w-14 border-4 border-background shadow-sm">
                                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop&crop=face" alt="@user" />
                                <AvatarFallback>U1</AvatarFallback>
                            </Avatar>
                            <Avatar className="h-14 w-14 border-4 border-background shadow-sm">
                                <AvatarImage src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop&crop=face" alt="@user" />
                                <AvatarFallback>U2</AvatarFallback>
                            </Avatar>
                             <Avatar className="h-14 w-14 border-4 border-background shadow-sm">
                                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop&crop=face" alt="@user" />
                                <AvatarFallback>U3</AvatarFallback>
                            </Avatar>
                             <Avatar className="h-14 w-14 border-4 border-background shadow-sm bg-muted flex items-center justify-center font-bold text-sm">
                                +50K
                            </Avatar>
                        </div>

                        <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl mb-6">Tham gia cộng đồng sáng tạo đỉnh cao</h2>
                        <p className="text-muted-foreground text-lg mb-10 text-balance font-medium">
                           Tạo tài khoản hoàn toàn miễn phí, nhận 50 Kim Cương và bắt đầu hành trình nghệ thuật của bạn ngay bây giờ không rủi ro.
                        </p>

                        <Link to="/login">
                            <Button size="lg" className="font-bold h-14 px-10 text-base rounded-full shadow-lg group">
                                Tạo Tài Khoản Miễn Phí <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    )
}
