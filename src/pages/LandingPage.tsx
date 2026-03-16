import { useEffect, useRef, useState } from "react"
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
// LandingPage - Premium Video Hero Landing
// Tối ưu: GPU-friendly animations, minimal repaints, mobile-first
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
    { name: "Cyberpunk", cat: "Chân dung", img: "https://images.unsplash.com/photo-1542442828-287217bfb21f?q=80&w=400&auto=format&fit=crop", color: "from-violet-500/60 to-fuchsia-500/60" },
    { name: "Ghibli", cat: "Anime", img: "https://images.unsplash.com/photo-1498453488252-0974dcabe0cb?q=80&w=400&auto=format&fit=crop", color: "from-sky-500/60 to-cyan-500/60" },
    { name: "Sản phẩm 3D", cat: "3D", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop", color: "from-amber-500/60 to-orange-500/60" },
    { name: "Logo Minimal", cat: "Logo", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400&auto=format&fit=crop", color: "from-emerald-500/60 to-teal-500/60" },
    { name: "Sơn dầu", cat: "Phong cảnh", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop", color: "from-rose-500/60 to-pink-500/60" },
    { name: "Anime Waifu", cat: "Anime", img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop", color: "from-indigo-500/60 to-violet-500/60" },
    { name: "Thời trang", cat: "Chân dung", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop", color: "from-pink-500/60 to-rose-500/60" },
    { name: "Concept Art", cat: "Phong cảnh", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop", color: "from-cyan-500/60 to-sky-500/60" },
]

// Scroll-reveal với Intersection Observer (chỉ trigger 1 lần)
function useScrollReveal(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setIsVisible(true); obs.unobserve(el) } },
            { threshold }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [threshold])
    return { ref, isVisible }
}

// Animated counter (easeOutCubic)
function useAnimatedCounter(end: number, duration = 2000, start = false) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!start) return
        let startTime: number | null = null
        const step = (ts: number) => {
            if (!startTime) startTime = ts
            const progress = Math.min((ts - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [end, duration, start])
    return count
}

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Scroll reveal refs
    const heroContent = useScrollReveal(0.1)
    const statsSection = useScrollReveal(0.2)
    const featuresSection = useScrollReveal(0.1)
    const howItWorks = useScrollReveal(0.15)
    const templatesSection = useScrollReveal(0.1)
    const pricingSection = useScrollReveal(0.1)
    const ctaSection = useScrollReveal(0.15)

    // Animated counters
    const count1 = useAnimatedCounter(1200000, 2000, statsSection.isVisible)
    const count2 = useAnimatedCounter(50000, 1800, statsSection.isVisible)
    const count3 = useAnimatedCounter(12, 1000, statsSection.isVisible)

    return (
        <div className="relative w-full">
            {/* CSS tối ưu — chỉ dùng transform/opacity animations (GPU-friendly) */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes gentle-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes subtle-pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
                .marquee-track {
                    display: flex;
                    width: max-content;
                    animation: marquee 30s linear infinite;
                }
                .marquee-track:hover { animation-play-state: paused; }
                .gradient-text {
                    background: linear-gradient(135deg, #a78bfa, #f472b6, #60a5fa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .hero-glow-text {
                    background: linear-gradient(135deg, #fff 0%, #e0c3fc 30%, #8ec5fc 60%, #fff 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .card-shine::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%);
                    pointer-events: none;
                }
                .reveal {
                    opacity: 0; transform: translateY(40px);
                    transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
                }
                .reveal.visible { opacity: 1; transform: translateY(0); }
            `}</style>

            {/* ======================
                HERO — Video Background
            ========================= */}
            <section id="hero" className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden">
                {/* Video BG — không parallax trên mobile để tránh jank */}
                <video
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    poster="/images/gradient-purple.png?v=1"
                >
                    <source
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
                        type="video/mp4"
                    />
                </video>

                {/* Overlay tối — gradient mượt từ trên xuống */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black z-[1]" />

                {/* 2 ambient glow nhẹ — chỉ dùng opacity animation, blur cố định */}
                <div
                    className="absolute z-[2] rounded-full pointer-events-none will-change-[opacity]"
                    style={{
                        width: 300, height: 300,
                        top: '15%', left: '10%',
                        background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
                        animation: 'subtle-pulse 6s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute z-[2] rounded-full pointer-events-none will-change-[opacity] hidden sm:block"
                    style={{
                        width: 250, height: 250,
                        bottom: '20%', right: '10%',
                        background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
                        animation: 'subtle-pulse 8s ease-in-out infinite 3s',
                    }}
                />

                {/* Navbar tích hợp */}
                <nav className={`fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-5xl transition-all duration-500 ${scrolled ? 'top-2' : 'top-3 sm:top-4'}`}>
                    <div className={`flex items-center justify-between backdrop-blur-xl rounded-2xl px-4 sm:px-5 shadow-[0_4px_30px_rgba(0,0,0,0.08)] transition-all duration-500 ${scrolled ? 'bg-white/[0.98] py-2 shadow-[0_8px_40px_rgba(0,0,0,0.12)]' : 'bg-white/[0.85] py-2.5'}`}>
                        <Link to="/" className="flex items-center gap-2 shrink-0">
                            <div className="size-8 rounded-lg bg-black flex items-center justify-center">
                                <Sparkles className="size-4 text-white" />
                            </div>
                            <span className="text-[17px] font-bold tracking-tight text-[#111]" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                ZDream
                            </span>
                        </Link>
                        <div className="hidden md:flex items-center gap-7">
                            {[
                                { label: "Tính năng", href: "#features" },
                                { label: "Kiểu mẫu", href: "#templates" },
                                { label: "Bảng giá", href: "#pricing" },
                            ].map((item) => (
                                <a key={item.label} href={item.href}
                                    className="text-[14px] font-medium text-[#555] hover:text-[#111] transition-colors"
                                    style={{ fontFamily: "'Barlow', sans-serif" }}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                        <Link to="/login">
                            <Button
                                className="bg-[#222] hover:bg-[#111] text-white rounded-full px-4 sm:px-5 h-9 text-[13px] font-semibold gap-2 shadow-sm"
                                style={{ fontFamily: "'Barlow', sans-serif" }}
                            >
                                <span className="hidden sm:inline">Bắt Đầu Miễn Phí</span>
                                <span className="sm:hidden">Bắt Đầu</span>
                                <span className="inline-flex items-center justify-center size-5 rounded-full bg-white/20">
                                    <ArrowUpRight className="size-3" />
                                </span>
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Hero Content */}
                <div ref={heroContent.ref} className="relative z-10 flex flex-col items-center text-center px-5 max-w-4xl mx-auto">
                    <Badge variant="outline" className="mb-6 sm:mb-8 bg-white/10 text-white/90 border-violet-400/30 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-medium tracking-wide" style={{ animation: 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
                        <Zap className="size-3 mr-1.5 text-yellow-400 fill-yellow-400" /> AI-Powered Creative Platform
                    </Badge>

                    <h1 className="mb-5 sm:mb-6" style={{ animation: 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}>
                        <span
                            className="block text-[clamp(28px,5.5vw,72px)] font-semibold text-white leading-[1.1]"
                            style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}
                        >
                            Nền tảng giúp bạn tạo
                        </span>
                        <span
                            className="block text-[clamp(36px,7vw,84px)] leading-[1.15] mt-1.5 font-bold hero-glow-text"
                            style={{ fontFamily: "'Dancing Script', cursive", letterSpacing: "-1px" }}
                        >
                            ảnh AI chất lượng cao
                        </span>
                    </h1>

                    <p
                        className="text-white/65 text-[clamp(13px,1.2vw,18px)] max-w-md sm:max-w-lg mb-8 sm:mb-10 font-medium leading-relaxed"
                        style={{ fontFamily: "'Barlow', sans-serif", animation: 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s both' }}
                    >
                        Tạo ảnh từ văn bản, áp dụng kiểu mẫu có sẵn, quản lý thư viện cá nhân.
                        Dành cho Nhà Sáng Tạo, Designer và Thương Hiệu.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4" style={{ animation: 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.9s both' }}>
                        <Link to="/app/generate">
                            <Button
                                size="lg"
                                className="bg-white hover:bg-white/90 text-[#111] rounded-full h-12 sm:h-14 px-7 sm:px-8 text-sm sm:text-[15px] font-bold gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:scale-[1.03]"
                                style={{ fontFamily: "'Barlow', sans-serif" }}
                            >
                                <span className="flex items-center justify-center size-7 sm:size-8 rounded-full bg-[#111] text-white">
                                    <Play className="size-3 sm:size-3.5 fill-white ml-0.5" />
                                </span>
                                Tạo Ảnh Ngay
                            </Button>
                        </Link>
                        <Link to="/app/templates">
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-full h-12 sm:h-14 px-7 sm:px-8 text-sm sm:text-[15px] font-bold border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-md"
                                style={{ fontFamily: "'Barlow', sans-serif" }}
                            >
                                <SwatchBook className="size-4 mr-2" />
                                Xem Kiểu Mẫu
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Gradient fade to black */}
                <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-black to-transparent z-[2] pointer-events-none" />
            </section>

            {/* ======================
                STATS — Social Proof
            ========================= */}
            <section className="relative z-10 bg-black py-14 sm:py-20">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div ref={statsSection.ref} className={`max-w-5xl mx-auto px-4 text-center reveal ${statsSection.isVisible ? 'visible' : ''}`}>
                    <p className="text-white/30 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] mb-10 sm:mb-12" style={{ fontFamily: "'Barlow', sans-serif" }}>
                        Được tin dùng bởi cộng đồng sáng tạo
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-white/[0.06]">
                        {[
                            { label: "Ảnh đã tạo", value: statsSection.isVisible ? `${(count1/1000000).toFixed(1)}M+` : '0', icon: WandSparkles, color: "text-violet-400", bg: "bg-violet-500/10" },
                            { label: "Người dùng", value: statsSection.isVisible ? `${Math.floor(count2/1000)}K+` : '0', icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
                            { label: "Kiểu mẫu", value: statsSection.isVisible ? `${count3}+` : '0', icon: SwatchBook, color: "text-sky-400", bg: "bg-sky-500/10" },
                            { label: "Đánh giá", value: "4.9★", icon: Gem, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        ].map((stat, i) => (
                            <div key={stat.label} className="flex flex-col items-center gap-2.5 sm:gap-3 px-4 sm:px-8 py-2" style={{ transitionDelay: `${i * 150}ms` }}>
                                <div className={`size-9 sm:size-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`size-4 sm:size-5 ${stat.color}`} />
                                </div>
                                <span className="text-2xl sm:text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                    {stat.value}
                                </span>
                                <span className="text-white/40 text-[11px] sm:text-xs font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </section>

            {/* ======================
                FEATURES — Bento Grid
            ========================= */}
            <section id="features" className="relative z-10 bg-black py-16 sm:py-28">
                <div ref={featuresSection.ref} className={`max-w-6xl mx-auto px-4 reveal ${featuresSection.isVisible ? 'visible' : ''}`}>
                    <div className="text-center mb-12 sm:mb-16">
                        <Badge variant="outline" className="mb-4 bg-white/5 text-white/60 border-white/10 rounded-full px-4 py-1 text-xs tracking-wide">
                            Tính năng nổi bật
                        </Badge>
                        <h2 className="text-2xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}>
                            <span className="text-white">Mọi thứ bạn cần để&nbsp;</span>
                            <span className="gradient-text">sáng tạo</span>
                        </h2>
                        <p className="text-white/40 text-sm sm:text-base mt-3 sm:mt-4 max-w-lg mx-auto" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            Từ ý tưởng đến tác phẩm chỉ trong vài cú nhấp chuột.
                        </p>
                    </div>

                    {/* Bento Grid — 2 cột mobile, 12 cột desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5">

                        {/* Card 1: Tạo Ảnh AI */}
                        <Link to="/app/generate" className="md:col-span-7 block group">
                            <Card className="card-shine relative overflow-hidden rounded-2xl sm:rounded-[24px] bg-gradient-to-br from-violet-950/80 via-[#1a0b2e] to-black border border-violet-500/10 h-full min-h-[280px] sm:min-h-[400px] cursor-pointer transition-all duration-500 hover:border-violet-500/30 hover:shadow-[0_0_60px_rgba(139,92,246,0.15)]">
                                <div className="absolute top-[-20%] right-[-10%] w-[250px] sm:w-[320px] h-[250px] sm:h-[320px] bg-violet-500/15 rounded-full blur-[80px] pointer-events-none" />
                                <CardContent className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10">
                                    <div className="size-12 sm:size-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4 sm:mb-6 shadow-[0_8px_30px_rgba(139,92,246,0.4)] group-hover:scale-110 transition-transform duration-500">
                                        <WandSparkles className="size-5 sm:size-6 text-white" />
                                    </div>
                                    <h3 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Tạo Ảnh AI
                                    </h3>
                                    <p className="text-white/50 text-xs sm:text-[15px] leading-relaxed font-medium max-w-sm" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Nhập mô tả, chọn tỷ lệ khung hình và mô hình AI. Ảnh 4K chỉ trong vài giây.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4 sm:mt-5">
                                        <Badge className="bg-violet-500/20 text-violet-200 border-none text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">Text-to-Image</Badge>
                                        <Badge className="bg-violet-500/20 text-violet-200 border-none text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">Batch</Badge>
                                        <Badge className="bg-violet-500/20 text-violet-200 border-none text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">4K Output</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Card 2: Kho Kiểu Mẫu */}
                        <Link to="/app/templates" className="md:col-span-5 block group">
                            <Card className="card-shine relative overflow-hidden rounded-2xl sm:rounded-[24px] bg-gradient-to-b from-sky-950/60 to-black border border-sky-500/10 h-full min-h-[280px] sm:min-h-[400px] cursor-pointer transition-all duration-500 hover:border-sky-500/25 hover:shadow-[0_0_60px_rgba(14,165,233,0.1)]">
                                <div className="absolute top-[-10%] left-[-10%] w-[200px] sm:w-[260px] h-[200px] sm:h-[260px] bg-sky-500/12 rounded-full blur-[80px] pointer-events-none" />
                                <CardContent className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10">
                                    <div className="size-12 sm:size-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center mb-4 sm:mb-6 shadow-[0_8px_30px_rgba(14,165,233,0.4)] group-hover:scale-110 transition-transform duration-500">
                                        <SwatchBook className="size-5 sm:size-6 text-white" />
                                    </div>
                                    <h3 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Kho Kiểu Mẫu
                                    </h3>
                                    <p className="text-white/50 text-xs sm:text-sm leading-relaxed font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        12+ preset: Cyberpunk, Anime, 3D, Logo, Sơn dầu&hellip; Chọn mẫu, tải ảnh lên, nhận kết quả ngay.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4 sm:mt-5">
                                        {["Chân dung", "Anime", "3D", "Logo"].map(t => (
                                            <Badge key={t} className="bg-sky-500/15 text-sky-200 border-none text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">{t}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Card 3: Thư Viện */}
                        <Link to="/app/library" className="md:col-span-5 block group">
                            <Card className="card-shine relative overflow-hidden rounded-2xl sm:rounded-[24px] bg-gradient-to-b from-amber-950/50 to-black border border-amber-500/10 h-full min-h-[240px] sm:min-h-[340px] cursor-pointer transition-all duration-500 hover:border-amber-500/25 hover:shadow-[0_0_60px_rgba(245,158,11,0.1)]">
                                <div className="absolute bottom-[-15%] right-[-10%] w-[180px] sm:w-[220px] h-[180px] sm:h-[220px] bg-amber-500/10 rounded-full blur-[70px] pointer-events-none" />
                                <CardContent className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10">
                                    <div className="size-12 sm:size-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center mb-4 sm:mb-6 shadow-[0_8px_30px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform duration-500">
                                        <Images className="size-5 sm:size-6 text-white" />
                                    </div>
                                    <h3 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Thư Viện Của Bạn
                                    </h3>
                                    <p className="text-white/50 text-xs sm:text-sm leading-relaxed font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Quản lý ảnh AI, kết quả kiểu mẫu và tài nguyên gốc. Tìm kiếm, lọc, tải xuống trong tích tắc.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4 sm:mt-5">
                                        {["Kết quả AI", "Mẫu", "Upload"].map(t => (
                                            <Badge key={t} className="bg-amber-500/15 text-amber-200 border-none text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">{t}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Card 4: Hệ thống Kim Cương */}
                        <Link to="/login" className="md:col-span-7 block group">
                            <Card className="card-shine relative overflow-hidden rounded-2xl sm:rounded-[24px] bg-gradient-to-br from-cyan-950/50 via-black to-violet-950/30 border border-cyan-500/10 h-full min-h-[240px] sm:min-h-[340px] cursor-pointer transition-all duration-500 hover:border-cyan-400/25 hover:shadow-[0_0_60px_rgba(6,182,212,0.1)]">
                                <div className="absolute top-[-10%] right-[10%] w-[160px] sm:w-[200px] h-[160px] sm:h-[200px] bg-cyan-500/10 rounded-full blur-[70px] pointer-events-none" />
                                <CardContent className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10">
                                    <div className="size-12 sm:size-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center mb-4 sm:mb-6 shadow-[0_8px_30px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform duration-500">
                                        <Gem className="size-5 sm:size-6 text-white" />
                                    </div>
                                    <h3 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Hệ Thống Kim Cương
                                    </h3>
                                    <p className="text-white/50 text-xs sm:text-[15px] leading-relaxed font-medium max-w-sm" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Đăng nhập miễn phí nhận 50 Kim Cương ngay. Nạp thêm bất cứ lúc nào để sáng tạo không gián đoạn.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4 sm:mt-5">
                                        <Badge className="bg-cyan-500/15 text-cyan-200 border-none text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">50 Kim Cương free</Badge>
                                        <Badge className="bg-cyan-500/15 text-cyan-200 border-none text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">Nạp Xu</Badge>
                                        <Badge className="bg-cyan-500/15 text-cyan-200 border-none text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">Pro Plan</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ======================
                HOW IT WORKS — 3 Steps
            ========================= */}
            <section className="relative z-10 bg-black py-16 sm:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/5 to-black pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div ref={howItWorks.ref} className={`max-w-5xl mx-auto px-4 reveal ${howItWorks.isVisible ? 'visible' : ''}`}>
                    <div className="text-center mb-12 sm:mb-16">
                        <Badge variant="outline" className="mb-4 bg-white/5 text-white/60 border-white/10 rounded-full px-4 py-1 text-xs tracking-wide">
                            Cách hoạt động
                        </Badge>
                        <h2 className="text-2xl sm:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}>
                            Chỉ 3 bước đơn giản
                        </h2>
                        <p className="text-white/40 text-sm sm:text-base mt-3 sm:mt-4 max-w-md mx-auto" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            Từ ý tưởng đến tác phẩm hoàn chỉnh trong vài giây.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 sm:gap-8 relative">
                        {/* Dashed line connector desktop */}
                        <div className="hidden md:block absolute top-[52px] left-[calc(33%-20px)] right-[calc(33%-20px)] h-px border-t border-dashed border-white/10 pointer-events-none" />

                        {[
                            { step: "01", icon: WandSparkles, title: "Nhập mô tả", desc: "Viết prompt, chọn khung hình và mô hình AI.", color: "from-violet-500 to-fuchsia-500", glow: "rgba(139,92,246,0.3)" },
                            { step: "02", icon: Layers, title: "Chọn cài đặt", desc: "Tùy chỉnh style hoặc chọn template có sẵn.", color: "from-sky-500 to-cyan-400", glow: "rgba(14,165,233,0.3)" },
                            { step: "03", icon: Download, title: "Tải xuống", desc: "Nhận ảnh 4K trong vài giây, lưu hoặc tải ngay.", color: "from-emerald-500 to-teal-400", glow: "rgba(16,185,129,0.3)" },
                        ].map((s) => (
                            <div key={s.step} className="flex flex-col items-center text-center group">
                                <div className="relative mb-4 sm:mb-6">
                                    <div
                                        className={`size-12 sm:size-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}
                                        style={{ boxShadow: `0 8px 30px ${s.glow}` }}
                                    >
                                        <s.icon className="size-5 sm:size-7 text-white" />
                                    </div>
                                    <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 size-5 sm:size-6 rounded-full bg-black border border-white/15 flex items-center justify-center">
                                        <span className="text-[8px] sm:text-[10px] font-black text-white/60" style={{ fontFamily: "'Barlow', sans-serif" }}>{s.step}</span>
                                    </div>
                                </div>
                                <h3 className="text-sm sm:text-lg font-black text-white mb-1.5 sm:mb-3" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                    {s.title}
                                </h3>
                                <p className="text-white/40 text-[11px] sm:text-sm leading-relaxed max-w-[200px] sm:max-w-[240px]" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                    {s.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </section>

            {/* ======================
                TEMPLATES — Preview
            ========================= */}
            <section id="templates" className="relative z-10 bg-black py-16 sm:py-28 overflow-hidden">
                <div ref={templatesSection.ref} className={`max-w-6xl mx-auto px-4 reveal ${templatesSection.isVisible ? 'visible' : ''}`}>
                    <div className="text-center mb-10 sm:mb-16">
                        <Badge variant="outline" className="mb-4 bg-white/5 text-white/60 border-white/10 rounded-full px-4 py-1 text-xs tracking-wide">
                            Kiểu mẫu có sẵn
                        </Badge>
                        <h2 className="text-2xl sm:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}>
                            Chọn phong cách yêu thích
                        </h2>
                        <p className="text-white/40 text-sm sm:text-base mt-3 sm:mt-4 max-w-lg mx-auto" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            Chọn mẫu, tải ảnh lên, nhận ảnh mới theo phong cách mẫu.
                        </p>
                    </div>

                    {/* Grid 2x4 mobile, 4x2 desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
                        {TEMPLATES.map((tpl) => (
                            <div key={tpl.name} className="group relative aspect-[3/4] rounded-xl sm:rounded-[16px] overflow-hidden cursor-pointer ring-1 ring-white/5 hover:ring-white/20 transition-all duration-300">
                                <img
                                    src={tpl.img}
                                    alt={tpl.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                <div className={`absolute inset-0 bg-gradient-to-t ${tpl.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                                    <Badge className="bg-white/10 text-white/70 text-[9px] sm:text-[10px] backdrop-blur-md border-none mb-1 px-2 py-0.5">{tpl.cat}</Badge>
                                    <p className="text-white text-xs sm:text-sm font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>{tpl.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Marquee strip */}
                    <div className="overflow-hidden rounded-xl sm:rounded-2xl mb-8 sm:mb-10">
                        <div className="marquee-track">
                            {[...TEMPLATES, ...TEMPLATES].map((tpl, i) => (
                                <div key={`${tpl.name}-${i}`} className="shrink-0 w-32 sm:w-36 h-12 sm:h-14 mr-2.5 sm:mr-3 rounded-lg sm:rounded-xl overflow-hidden relative ring-1 ring-white/5">
                                    <img src={tpl.img} alt={tpl.name} className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-white text-[9px] sm:text-[10px] font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>{tpl.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center">
                        <Link to="/app/templates">
                            <Button variant="outline" className="rounded-full h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-bold border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all">
                                Xem tất cả kiểu mẫu <ArrowUpRight className="size-3.5 sm:size-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ======================
                PRICING
            ========================= */}
            <section id="pricing" className="relative z-10 bg-black py-16 sm:py-28">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div ref={pricingSection.ref} className={`max-w-5xl mx-auto px-4 reveal ${pricingSection.isVisible ? 'visible' : ''}`}>
                    <div className="text-center mb-10 sm:mb-16">
                        <Badge variant="outline" className="mb-4 bg-white/5 text-white/60 border-white/10 rounded-full px-4 py-1 text-xs tracking-wide">
                            <Gem className="size-3 mr-1.5 text-cyan-400" /> Hệ thống Kim Cương
                        </Badge>
                        <h2 className="text-2xl sm:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}>
                            Chọn gói phù hợp
                        </h2>
                        <p className="text-white/40 text-sm sm:text-base mt-3 sm:mt-4 max-w-md mx-auto" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            Mỗi lần tạo ảnh tiêu hao Kim Cương. Nạp thêm hoặc chọn gói Pro.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5 items-center">
                        {PLANS.map((plan) => (
                            <Card
                                key={plan.name}
                                className={`relative overflow-hidden rounded-2xl sm:rounded-[20px] border transition-all duration-300 ${plan.popular
                                    ? "border-violet-500/40 bg-gradient-to-b from-violet-950/40 to-black shadow-[0_0_40px_rgba(139,92,246,0.15)] md:scale-[1.03]"
                                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500" />
                                )}
                                {plan.popular && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-none text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                            Phổ biến
                                        </Badge>
                                    </div>
                                )}

                                <CardContent className={`p-6 sm:p-8 ${plan.popular ? "pt-7 sm:pt-8" : ""}`}>
                                    <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        {plan.name}
                                    </p>
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-3xl sm:text-4xl font-black text-white" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                            {plan.price}
                                        </span>
                                        <span className="text-white/30 text-sm font-medium">{plan.period}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-6 sm:mb-8 py-1.5 sm:py-2 px-3 rounded-full bg-white/5 border border-white/5 w-fit">
                                        <Gem className="size-3.5 text-cyan-400" />
                                        <span className="text-cyan-400 text-xs font-bold">{plan.gems} Kim Cương/tháng</span>
                                    </div>
                                    <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2.5 text-xs sm:text-sm text-white/55 font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                                <CheckCircle2 className={`size-4 shrink-0 ${plan.popular ? "text-violet-400" : "text-emerald-500/70"}`} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to="/login">
                                        <Button
                                            className={`w-full rounded-full h-10 sm:h-11 font-bold text-sm transition-all ${plan.popular
                                                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
                                                : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                                            }`}
                                            style={{ fontFamily: "'Barlow', sans-serif" }}
                                        >
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
                FINAL CTA
            ========================= */}
            <section className="relative z-10 bg-black py-20 sm:py-32 overflow-hidden">
                {/* Ambient glow nhẹ — chỉ 1 orb, dùng radial-gradient thay vì blur */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full will-change-[opacity]"
                        style={{
                            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
                            animation: 'subtle-pulse 6s ease-in-out infinite',
                        }}
                    />
                </div>

                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div ref={ctaSection.ref} className={`max-w-3xl mx-auto px-5 text-center relative reveal ${ctaSection.isVisible ? 'visible' : ''}`}>
                    {/* Social proof */}
                    <div className="flex flex-col items-center gap-3 mb-8 sm:mb-10">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="size-3.5 sm:size-4 text-amber-400 fill-amber-400" />
                            ))}
                            <span className="text-white/60 text-xs sm:text-sm font-medium ml-2" style={{ fontFamily: "'Barlow', sans-serif" }}>4.9 / 5.0</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[
                                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=64&auto=format&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=64&auto=format&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=64&auto=format&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=64&auto=format&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=64&auto=format&fit=crop&crop=face",
                                ].map((src, i) => (
                                    <img key={i} src={src} alt="" className="size-7 sm:size-8 rounded-full border-2 border-black object-cover ring-1 ring-white/10" loading="lazy" />
                                ))}
                            </div>
                            <span className="text-white/40 text-[11px] sm:text-xs font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                50,000+ nhà sáng tạo
                            </span>
                        </div>
                    </div>

                    <h2 className="text-3xl sm:text-6xl font-bold text-white tracking-tight mb-4 sm:mb-6" style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}>
                        Sẵn sàng{" "}
                        <span className="gradient-text">sáng tạo?</span>
                    </h2>
                    <p className="text-white/50 text-sm sm:text-lg mb-8 sm:mb-10 max-w-md mx-auto font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                        Đăng ký miễn phí. Nhận 50 Kim Cương ngay lập tức. Không cần thẻ tín dụng.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        <Link to="/login">
                            <Button
                                size="lg"
                                className="bg-white hover:bg-white/90 text-[#111] rounded-full h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-[15px] font-bold shadow-[0_8px_40px_rgba(255,255,255,0.12)] transition-all hover:scale-[1.02]"
                                style={{ fontFamily: "'Barlow', sans-serif" }}
                            >
                                Đăng Nhập / Đăng Ký
                                <ArrowUpRight className="size-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                        <Gem className="size-3.5 sm:size-4 text-cyan-400" />
                        <span className="text-white/30 text-[11px] sm:text-xs font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            50 Kim Cương miễn phí khi đăng ký — không giới hạn thời gian
                        </span>
                    </div>
                </div>
            </section>
        </div>
    )
}
