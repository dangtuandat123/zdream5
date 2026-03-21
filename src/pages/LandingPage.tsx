import { useEffect, useState, useRef, useCallback } from "react"
import { Link } from "react-router-dom"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"
import Autoplay from "embla-carousel-autoplay"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    ArrowUpRight,
    Sparkles,
    WandSparkles,
    SwatchBook,
    Gem,
    Star,
    CheckCircle2,
    Play,
    Palette,
    ZapIcon,
    ShieldCheck,
    Quote,
    Layers,
    ChevronDown,
    ChevronUp,
    Menu,
    Trophy,
    PenLine,
    Cpu,
    Download,
    ArrowRight,
} from "lucide-react"

// ============================================================
// DATA
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
    { name: "Neon Art", cat: "Trừu tượng", img: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=400&auto=format&fit=crop" },
    { name: "Abstract", cat: "Nghệ thuật", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop" },
    { name: "Sci-fi", cat: "Vũ trụ", img: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=400&auto=format&fit=crop" },
    { name: "Fantasy", cat: "Phong cảnh", img: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=400&auto=format&fit=crop" },
]

const HERO_IMAGES = [
    { src: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=600&auto=format&fit=crop", label: "Chân dung Cyberpunk" },
    { src: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop", label: "Digital Art 3D" },
    { src: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop", label: "Abstract Fluid" },
    { src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop", label: "Sơn dầu cổ điển" },
]

const FEATURE_IMAGES = [
    { src: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=400&auto=format&fit=crop", label: "Fantasy" },
    { src: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=400&auto=format&fit=crop", label: "Sci-fi" },
    { src: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=400&auto=format&fit=crop", label: "Neon" },
    { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop", label: "Abstract" },
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
    {
        name: "Đức Minh",
        role: "UI Designer @ TechFlow",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop&crop=face",
        quote: "Tôi dùng ZDream để tạo mockup và concept nhanh chóng. Khách hàng luôn ấn tượng với tốc độ delivery của team."
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
    },
    {
        question: "ZDream hỗ trợ những mô hình AI nào?",
        answer: "ZDream tích hợp nhiều mô hình AI tiên tiến thông qua OpenRouter, bao gồm Gemini Flash Image và nhiều engine khác. Bạn có thể chuyển đổi giữa các mô hình tuỳ theo nhu cầu sáng tạo — từ realistic đến anime, abstract, hay concept art."
    },
]

const HOW_IT_WORKS = [
    {
        step: 1,
        icon: PenLine,
        title: "Mô Tả Ý Tưởng",
        desc: "Viết mô tả bằng ngôn ngữ tự nhiên, chọn phong cách và tỷ lệ khung hình.",
        color: "from-violet-500 to-purple-600",
    },
    {
        step: 2,
        icon: Cpu,
        title: "AI Sáng Tạo",
        desc: "Engine AI xử lý trong ~10 giây, tạo ra tác phẩm chất lượng studio.",
        color: "from-purple-500 to-fuchsia-600",
    },
    {
        step: 3,
        icon: Download,
        title: "Nhận Tác Phẩm",
        desc: "Tải về 4K, lưu vào thư viện đám mây, hoặc chia sẻ ngay lập tức.",
        color: "from-fuchsia-500 to-pink-600",
    },
]

const STATS = [
    { label: "Ảnh đã tạo", value: 1200000, suffix: "+", display: "1.2M+", icon: WandSparkles },
    { label: "Người dùng", value: 50000, suffix: "+", display: "50K+", icon: Star },
    { label: "Kiểu mẫu", value: 12, suffix: "+", display: "12+", icon: SwatchBook },
    { label: "Đánh giá", value: 4.9, suffix: "/5", display: "4.9/5", icon: Gem },
]

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
}

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
}

const scaleUp = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

// ============================================================
// HOOKS
// ============================================================

function useAnimatedCounter(end: number, duration = 2000, startOnView = true) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true, margin: "-50px" })
    const hasRun = useRef(false)

    useEffect(() => {
        if (!startOnView || !inView || hasRun.current) return
        hasRun.current = true

        const startTime = Date.now()
        const tick = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(eased * end)
            if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
    }, [inView, end, duration, startOnView])

    return { count, ref }
}

function formatStatNumber(value: number, target: number): string {
    if (target >= 1000000) return (value / 1000000).toFixed(1) + "M"
    if (target >= 1000) return (value / 1000).toFixed(0) + "K"
    if (target < 10) return value.toFixed(1)
    return Math.floor(value).toString()
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

function AnimatedStat({ stat }: { stat: typeof STATS[0] }) {
    const { count, ref } = useAnimatedCounter(stat.value, 2000)
    return (
        <motion.div variants={scaleUp}>
            <Card className="border-border/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/20 transition-all duration-500 group">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-fuchsia-500/30 transition-colors">
                        <stat.icon className="h-5 w-5 text-violet-400" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tighter">
                        <span ref={ref}>{formatStatNumber(count, stat.value)}</span>
                        <span className="text-violet-400">{stat.suffix}</span>
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </CardContent>
            </Card>
        </motion.div>
    )
}

function PricingCard({ plan, periodLabel }: { plan: typeof MONTHLY_PLANS[0]; periodLabel: string }) {
    return (
        <motion.div variants={scaleUp} className="h-full">
            <Card className={`flex flex-col relative overflow-hidden text-left transition-all duration-500 h-full ${plan.popular
                ? 'border-violet-500/40 shadow-lg shadow-violet-500/5 bg-background ring-1 ring-violet-500/20'
                : 'bg-background/50 hover:bg-background hover:border-border/80 border-border/30'}`}
            >
                {plan.popular && (
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
                )}
                <CardContent className="p-8 flex-1 flex flex-col relative">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        {plan.popular && (
                            <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0 shadow-sm">
                                Phổ Biến
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                        <span className="text-muted-foreground font-medium">{plan.period}</span>
                    </div>

                    <div className="bg-violet-500/10 rounded-lg p-3 flex items-center gap-3 mb-8 w-fit text-sm font-medium">
                        <Gem className="h-5 w-5 text-violet-400" />
                        <span>{plan.gems} Kim Cương/{periodLabel}</span>
                    </div>

                    <ul className="space-y-3.5 flex-1 mb-8">
                        {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-3 text-muted-foreground text-sm">
                                <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
                                {f}
                            </li>
                        ))}
                    </ul>

                    <Link to="/login" className="w-full mt-auto">
                        <Button
                            className={`w-full h-12 text-base transition-all ${plan.popular
                                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 border-0'
                                : ''}`}
                            variant={plan.popular ? "default" : "outline"}
                            size="lg"
                        >
                            {plan.cta}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Smooth scroll với offset cho fixed navbar
function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (el) {
        const offset = 80
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: "smooth" })
    }
}

// ============================================================
// LANDING PAGE
// ============================================================
export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const heroRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 50)
            setShowScrollTop(window.scrollY > 500)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleNavClick = useCallback((id: string) => {
        setMobileMenuOpen(false)
        setTimeout(() => scrollToSection(id), 100)
    }, [])

    const NAV_ITEMS = [
        { label: "Tính năng", id: "features" },
        { label: "Kiểu mẫu", id: "templates" },
        { label: "Bảng giá", id: "pricing" },
        { label: "Hỏi đáp", id: "faq" },
    ]

    return (
        <div className="relative w-full min-h-screen bg-background text-foreground selection:bg-violet-500 selection:text-white">

            {/* ==================== NAVBAR ==================== */}
            <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 border-b ${scrolled ? 'bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 border-border/50' : 'bg-transparent border-transparent'}`}>
                <div className="container mx-auto px-4 md:px-8 max-w-7xl h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white group-hover:scale-105 transition-transform shadow-lg shadow-violet-500/20">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">ZDream</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => scrollToSection(item.id)}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/login" className="hidden md:block">
                            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all">
                                Bắt Đầu <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>

                        {/* Mobile menu */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72 bg-background border-border/50">
                                <SheetTitle className="sr-only">Menu</SheetTitle>
                                <nav className="flex flex-col gap-6 mt-8">
                                    {NAV_ITEMS.map((item) => (
                                        <SheetClose asChild key={item.label}>
                                            <button
                                                onClick={() => handleNavClick(item.id)}
                                                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                                            >
                                                {item.label}
                                            </button>
                                        </SheetClose>
                                    ))}
                                    <Separator className="bg-border/30" />
                                    <SheetClose asChild>
                                        <Link to="/login">
                                            <Button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-0">
                                                Bắt Đầu <ArrowUpRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </SheetClose>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </nav>

            {/* ==================== HERO ==================== */}
            <section ref={heroRef} className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
                {/* Video nền với parallax */}
                <motion.div className="absolute inset-0 z-0" style={{ scale: heroScale }}>
                    <video
                        autoPlay loop muted playsInline
                        className="w-full h-full object-cover pointer-events-none"
                        poster="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1920&auto=format&fit=crop"
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
                    />
                </motion.div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background z-0" />

                {/* Ambient violet glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse-glow" />

                <motion.div
                    className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl text-center flex flex-col items-center py-24"
                    style={{ opacity: heroOpacity }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Badge variant="outline" className="mb-6 border-violet-500/30 bg-violet-500/10 text-violet-300 backdrop-blur-sm">
                            <Sparkles className="mr-2 h-3 w-3" /> Nền tảng tạo ảnh AI hàng đầu Việt Nam
                        </Badge>
                    </motion.div>

                    <motion.h1
                        className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-5 leading-[1.1]"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Biến ý tưởng thành <br className="hidden sm:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 animate-gradient-text">
                            nghệ thuật thị giác
                        </span>
                    </motion.h1>

                    <motion.p
                        className="max-w-2xl mx-auto text-muted-foreground sm:text-lg sm:leading-8 mb-8 text-balance"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Chỉ cần mô tả, AI sẽ vẽ. Từ concept art đến logo thương hiệu — tất cả chỉ trong vài giây với chất lượng studio chuyên nghiệp.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <Link to="/login" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full h-12 px-8 text-base bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 transition-all">
                                <Play className="mr-2 h-4 w-4" /> Bắt Đầu Sáng Tạo
                            </Button>
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full h-12 px-8 text-base backdrop-blur-sm bg-background/30 border-border/50 hover:bg-background/50 hover:border-violet-500/30 transition-all">
                                <SwatchBook className="mr-2 h-4 w-4" /> Trải Nghiệm Mẫu
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Social Proof */}
                    <motion.div
                        className="flex items-center gap-4 mt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                    >
                        <div className="flex -space-x-2">
                            {TESTIMONIALS.slice(0, 3).map((t, i) => (
                                <Avatar key={i} className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src={t.avatar} />
                                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                    </motion.div>

                    {/* Gallery AI Art — responsive: 2 trên mobile, 4 trên desktop */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 w-full max-w-3xl"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {HERO_IMAGES.map((img, i) => (
                            <motion.div
                                key={i}
                                className={i % 2 === 1 ? 'translate-y-3' : ''}
                                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                            >
                                <Card className="overflow-hidden border-border/20 bg-background/30 backdrop-blur-sm group hover:border-violet-500/30 transition-all duration-500">
                                    <CardContent className="p-0 relative aspect-[3/4]">
                                        <img
                                            src={img.src}
                                            alt={img.label}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                            <span className="text-white text-xs font-medium">{img.label}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown className="h-6 w-6 text-muted-foreground" />
                </motion.div>
            </section>

            {/* ==================== STATS ==================== */}
            <section className="w-full py-20 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <motion.div
                        className="text-center mb-12"
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={fadeUp}
                    >
                        <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-300">
                            <Trophy className="mr-2 h-3.5 w-3.5" /> Thành tựu cộng đồng
                        </Badge>
                    </motion.div>
                    <motion.div
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                    >
                        {STATS.map((stat) => (
                            <AnimatedStat key={stat.label} stat={stat} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ==================== HOW IT WORKS ==================== */}
            <section className="w-full py-24 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl relative">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <Badge variant="outline" className="mb-6 border-violet-500/30 bg-violet-500/10 text-violet-300">
                            <ZapIcon className="mr-2 h-3.5 w-3.5" /> Đơn giản & Nhanh chóng
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Quy Trình 3 Bước</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg text-balance">
                            Từ ý tưởng đến tác phẩm chỉ trong vài giây — không cần kỹ năng thiết kế.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        {/* Connecting line (desktop only) */}
                        <div className="hidden md:block absolute top-[72px] left-[16.67%] right-[16.67%] h-px">
                            <div className="w-full h-full bg-gradient-to-r from-violet-500/40 via-fuchsia-500/40 to-pink-500/40" />
                        </div>

                        {HOW_IT_WORKS.map((item) => (
                            <motion.div key={item.step} variants={fadeUp} className="relative">
                                <div className="flex flex-col items-center text-center">
                                    {/* Numbered circle */}
                                    <div className={`relative h-[88px] w-[88px] rounded-2xl bg-gradient-to-br ${item.color} p-[2px] mb-6 shadow-lg`}>
                                        <div className="h-full w-full rounded-[14px] bg-background flex items-center justify-center">
                                            <item.icon className="h-8 w-8 text-violet-400" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                            {item.step}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA mini */}
                    <motion.div
                        className="text-center mt-14"
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <Link to="/login">
                            <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/20">
                                Thử Ngay Miễn Phí <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ==================== FEATURES — Bento Grid ==================== */}
            <section id="features" className="w-full py-24 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-600/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center relative">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <Badge variant="outline" className="mb-6 border-violet-500/30 bg-violet-500/10 text-violet-300">
                            <Layers className="mr-2 h-3.5 w-3.5" /> Công cụ cho nhà sáng tạo
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Quy Trình Sáng Tác Đỉnh Cao</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg text-balance">
                            Tối ưu hóa mọi bước từ phác thảo bố cục, tinh chỉnh chi tiết đến xuất bản thành phẩm chất lượng nhất.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full"
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        {/* Feature 1 — Card nổi bật */}
                        <motion.div variants={fadeUp} className="lg:row-span-2">
                            <Card className="h-full bg-background/50 border-border/30 hover:border-violet-500/30 transition-all duration-500 group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-500/10 transition-colors" />
                                <CardContent className="p-8 flex flex-col h-full relative">
                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <ZapIcon className="h-7 w-7 text-violet-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Làm Chủ Mọi Khung Hình</h3>
                                    <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                                        Lựa chọn 10 định dạng tỷ lệ khác nhau phục vụ từ thiết kế web, in ấn đến video dọc.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 mb-6 flex-1">
                                        {FEATURE_IMAGES.map((img, i) => (
                                            <div key={i} className="rounded-lg overflow-hidden border border-border/20 aspect-square group/img">
                                                <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" loading="lazy" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">Chất lượng 4K</Badge>
                                        <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">10 tỷ lệ khung</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div variants={fadeUp}>
                            <Card className="h-full bg-background/50 border-border/30 hover:border-violet-500/30 transition-all duration-500 group">
                                <CardContent className="p-8 flex flex-col h-full">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Palette className="h-6 w-6 text-violet-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Hệ Thống Phong Cách Mở Rộng</h3>
                                    <p className="text-muted-foreground flex-1 mb-6 text-sm leading-relaxed">
                                        Bộ sưu tập kiểu mẫu đa biên độ giúp bạn áp dụng các phong cách nghệ thuật phức tạp chỉ trong một cú nhấp chuột.
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">Hoàn toàn tự động</Badge>
                                        <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">Chuẩn hóa thẩm mỹ</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div variants={fadeUp}>
                            <Card className="h-full bg-background/50 border-border/30 hover:border-violet-500/30 transition-all duration-500 group">
                                <CardContent className="p-8 flex flex-col h-full">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="h-6 w-6 text-violet-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Không Gian Làm Việc Riêng Tư</h3>
                                    <p className="text-muted-foreground flex-1 mb-6 text-sm leading-relaxed">
                                        Mọi thành phẩm được sắp xếp khoa học thành từng dự án riêng biệt. Cam kết bảo vệ dữ liệu và trao toàn quyền thương mại.
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">Lưu trữ đám mây</Badge>
                                        <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">Quyền thương mại</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Feature 4 — wide card */}
                        <motion.div variants={fadeUp} className="lg:col-span-2">
                            <Card className="bg-background/50 border-border/30 hover:border-violet-500/30 transition-all duration-500 group">
                                <CardContent className="p-8 flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <WandSparkles className="h-6 w-6 text-violet-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-3">Từ Prompt Đến Tác Phẩm Trong 10 Giây</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                            Chỉ cần mô tả ý tưởng bằng ngôn ngữ tự nhiên, chọn phong cách yêu thích, và để AI biến giấc mơ thành hiện thực. Hệ thống xử lý tốc độ cực nhanh với hàng đợi ưu tiên thông minh.
                                        </p>
                                        <div className="flex gap-6 text-sm flex-wrap">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <div className="h-2 w-2 rounded-full bg-violet-400" />
                                                Tốc độ ~10s/ảnh
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <div className="h-2 w-2 rounded-full bg-fuchsia-400" />
                                                Hàng đợi thông minh
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <div className="h-2 w-2 rounded-full bg-pink-400" />
                                                Nhiều engine AI
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ==================== TEMPLATES CAROUSEL ==================== */}
            <section id="templates" className="w-full py-24 overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center w-full">
                    <motion.div
                        className="flex flex-col md:flex-row md:items-end justify-between w-full mb-12 gap-8 text-center md:text-left"
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <div className="flex-1">
                            <Badge variant="outline" className="mb-6 border-violet-500/30 bg-violet-500/10 text-violet-300">
                                <SwatchBook className="mr-2 h-3.5 w-3.5" /> Thư viện phong cách
                            </Badge>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Kiểu Mẫu Sẵn Sàng Sử Dụng</h2>
                            <p className="mt-3 text-muted-foreground text-lg max-w-2xl text-balance">
                                Chọn một phong cách, nhập mô tả, và nhận tác phẩm ngay lập tức — không cần tinh chỉnh phức tạp.
                            </p>
                        </div>
                        <div className="hidden md:flex shrink-0">
                            <Link to="/login">
                                <Button variant="outline" className="backdrop-blur-sm hover:border-violet-500/30">
                                    Xem tất cả <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        className="w-full px-12 md:px-16 mx-auto relative cursor-grab active:cursor-grabbing"
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeIn}
                    >
                        <Carousel
                            plugins={[Autoplay({ delay: 3000 })]}
                            opts={{ align: "start", loop: true }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4 md:-ml-6">
                                {TEMPLATES.map((tpl, index) => (
                                    <CarouselItem key={index} className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                        <Card className="overflow-hidden border-border/30 bg-background/50 h-full group hover:border-violet-500/30 transition-all duration-500">
                                            <CardContent className="p-0 relative aspect-[3/4] h-full">
                                                <img
                                                    src={tpl.img}
                                                    alt={tpl.name}
                                                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-700"
                                                    loading="lazy"
                                                    draggable={false}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-6 select-none pointer-events-none text-left">
                                                    <Badge variant="secondary" className="w-fit mb-3 bg-white/10 backdrop-blur-md border-white/20 text-white">{tpl.cat}</Badge>
                                                    <h3 className="text-white font-bold text-xl">{tpl.name}</h3>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="absolute -left-6 md:-left-12 h-12 w-12 border-border/30 hover:border-violet-500/30 hover:bg-violet-500/10" />
                            <CarouselNext className="absolute -right-6 md:-right-12 h-12 w-12 border-border/30 hover:border-violet-500/30 hover:bg-violet-500/10" />
                        </Carousel>
                    </motion.div>

                    <div className="md:hidden mt-12 text-center flex justify-center w-full">
                        <Link to="/login" className="w-full">
                            <Button variant="outline" className="w-full hover:border-violet-500/30">
                                Xem tất cả kiểu mẫu <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ==================== TESTIMONIALS ==================== */}
            <section className="w-full py-24 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <Badge variant="outline" className="mb-6 border-violet-500/30 bg-violet-500/10 text-violet-300">
                            <Star className="mr-2 h-3.5 w-3.5" /> Nhận xét từ cộng đồng
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Được Tin Dùng Bởi Hàng Nghìn Nhà Sáng Tạo</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg text-balance">Lắng nghe trải nghiệm thực tế từ những nhà sáng tạo đang sử dụng ZDream mỗi ngày.</p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        {TESTIMONIALS.map((t, index) => (
                            <motion.div key={index} variants={fadeUp}>
                                <Card className="bg-background/50 border-border/30 hover:border-violet-500/20 transition-all duration-300 h-full">
                                    <CardContent className="p-7 flex flex-col h-full">
                                        <Quote className="h-7 w-7 text-violet-500/30 mb-4" fill="currentColor" />
                                        <p className="text-foreground/90 flex-1 mb-6 leading-relaxed text-[15px]">
                                            &ldquo;{t.quote}&rdquo;
                                        </p>
                                        <Separator className="mb-5 bg-border/30" />
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-violet-500/20">
                                                <AvatarImage src={t.avatar} />
                                                <AvatarFallback>{t.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{t.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{t.role}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ==================== PRICING ==================== */}
            <section id="pricing" className="w-full py-24 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center relative">
                    <motion.div
                        className="flex flex-col items-center text-center mb-16"
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <Badge variant="outline" className="mb-6 border-violet-500/30 bg-violet-500/10 text-violet-300">
                            <Gem className="mr-2 h-3.5 w-3.5" /> Hệ thống Kim Cương
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Gói dịch vụ linh hoạt</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg text-balance">
                            Mỗi tác phẩm AI sắc nét đều tiêu hao Kim Cương. Hãy chọn gói phù hợp nhất.
                        </p>
                    </motion.div>

                    <Tabs defaultValue="monthly" className="w-full flex flex-col items-center">
                        <TabsList className="mb-12 bg-white/5 backdrop-blur-md border border-white/10">
                            <TabsTrigger value="monthly" className="px-8 font-medium data-[state=active]:bg-background">Theo Tháng</TabsTrigger>
                            <TabsTrigger value="yearly" className="px-8 font-medium data-[state=active]:bg-background">
                                Theo Năm
                                <Badge className="ml-2 text-[10px] bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">-20%</Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="monthly" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch"
                                initial="hidden" whileInView="visible" viewport={{ once: true }}
                                variants={staggerContainer}
                            >
                                {MONTHLY_PLANS.map((plan) => (
                                    <PricingCard key={plan.name} plan={plan} periodLabel="tháng" />
                                ))}
                            </motion.div>
                        </TabsContent>
                        <TabsContent value="yearly" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch"
                                initial="hidden" whileInView="visible" viewport={{ once: true }}
                                variants={staggerContainer}
                            >
                                {YEARLY_PLANS.map((plan) => (
                                    <PricingCard key={plan.name} plan={plan} periodLabel="năm" />
                                ))}
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* ==================== FAQ ==================== */}
            <section id="faq" className="w-full py-24 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                        {/* Cột trái */}
                        <motion.div
                            className="lg:col-span-2 lg:sticky lg:top-24"
                            initial="hidden" whileInView="visible" viewport={{ once: true }}
                            variants={fadeUp}
                        >
                            <Badge variant="outline" className="mb-6 border-violet-500/30 bg-violet-500/10 text-violet-300">Hỏi đáp</Badge>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Câu hỏi thường gặp</h2>
                            <p className="text-muted-foreground text-lg mb-8 text-balance">
                                Mọi thắc mắc của bạn về nền tảng ZDream AI.
                            </p>
                            <Card className="bg-background/50 border-border/30">
                                <CardContent className="p-6 flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0">
                                            <Sparkles className="h-6 w-6 text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm mb-1">Vẫn còn thắc mắc?</p>
                                            <p className="text-xs text-muted-foreground">Liên hệ đội ngũ hỗ trợ ZDream để được giải đáp nhanh nhất.</p>
                                        </div>
                                    </div>
                                    <a href="mailto:support@zdream.vn">
                                        <Button variant="outline" size="sm" className="w-full hover:border-violet-500/30">
                                            Gửi Email Hỗ Trợ <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                                        </Button>
                                    </a>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Cột phải — Accordion */}
                        <motion.div
                            className="lg:col-span-3"
                            initial="hidden" whileInView="visible" viewport={{ once: true }}
                            variants={fadeUp}
                        >
                            <Card className="bg-background/50 border-border/30 w-full">
                                <CardContent className="p-6 md:p-8">
                                    <Accordion type="single" collapsible className="w-full text-left">
                                        {FAQS.map((faq, index) => (
                                            <AccordionItem key={index} value={`item-${index}`} className="last:border-b-0 border-border/30">
                                                <AccordionTrigger className="text-left font-medium text-base hover:no-underline py-5 hover:text-violet-400 transition-colors">
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
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ==================== CTA FINAL ==================== */}
            <section className="w-full py-24 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={scaleUp}
                        className="w-full max-w-5xl mx-auto"
                    >
                        <Card className="overflow-hidden relative border-border/30">
                            {/* Ambient glows */}
                            <div className="absolute -top-20 -left-20 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
                            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

                            <CardContent className="p-10 md:p-20 flex flex-col items-center text-center relative">
                                <div className="flex -space-x-3 justify-center mb-8">
                                    {TESTIMONIALS.slice(0, 3).map((t, i) => (
                                        <Avatar key={i} className="h-14 w-14 border-4 border-background">
                                            <AvatarImage src={t.avatar} />
                                            <AvatarFallback>{t.name[0]}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    <Avatar className="h-14 w-14 border-4 border-background bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                                        <AvatarFallback className="text-xs font-bold text-violet-300">+50K</AvatarFallback>
                                    </Avatar>
                                </div>

                                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6 text-balance">
                                    Bắt đầu sáng tạo ngay hôm nay
                                </h2>
                                <p className="text-muted-foreground text-lg md:text-xl mb-10 text-balance max-w-2xl">
                                    Tạo tài khoản hoàn toàn miễn phí, nhận ngay 50 Kim Cương và bắt đầu hành trình nghệ thuật không rủi ro.
                                </p>

                                <Link to="/login">
                                    <Button size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 transition-all">
                                        Bắt Đầu Miễn Phí <ArrowUpRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* ==================== SCROLL TO TOP ==================== */}
            <motion.button
                className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-violet-500/40 transition-shadow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={showScrollTop ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{ pointerEvents: showScrollTop ? "auto" : "none" }}
                aria-label="Lên đầu trang"
            >
                <ChevronUp className="h-5 w-5" />
            </motion.button>

        </div>
    )
}
