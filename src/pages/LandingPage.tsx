import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Play,
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
} from "lucide-react"

// ============================================================
// LandingPage - Premium Video Hero Landing
// Phong cách: Minimal, Ultra-Modern, Video-Centric
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

// Hook: Scroll-reveal với Intersection Observer
function useScrollReveal(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsVisible(true); obs.unobserve(el) } }, { threshold })
        obs.observe(el)
        return () => obs.disconnect()
    }, [threshold])
    return { ref, isVisible }
}

// Hook: Animated counter (số chạy từ 0 lên)
function useAnimatedCounter(end: number, duration = 2000, start = false) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!start) return
        let startTime: number | null = null
        const step = (ts: number) => {
            if (!startTime) startTime = ts
            const progress = Math.min((ts - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [end, duration, start])
    return count
}

export default function LandingPage() {
    // Navbar scroll effect
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Parallax cho video hero
    const [parallaxY, setParallaxY] = useState(0)
    useEffect(() => {
        const onScroll = () => setParallaxY(window.scrollY * 0.3)
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
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes float-orb {
                    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
                    50% { transform: translateY(-20px) scale(1.05); opacity: 0.9; }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.9); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 0.4; }
                    100% { transform: scale(0.9); opacity: 0.8; }
                }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(60px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.85); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes shimmer {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes aurora {
                    0% { transform: rotate(0deg) scale(1); opacity: 0.4; }
                    33% { transform: rotate(120deg) scale(1.2); opacity: 0.6; }
                    66% { transform: rotate(240deg) scale(0.9); opacity: 0.5; }
                    100% { transform: rotate(360deg) scale(1); opacity: 0.4; }
                }
                @keyframes color-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); box-shadow: none; }
                    50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
                }
                @keyframes sparkle-float {
                    0% { opacity: 0; transform: translateY(0) scale(0); }
                    20% { opacity: 1; transform: translateY(-15px) scale(1.3); }
                    80% { opacity: 0.8; transform: translateY(-50px) scale(0.8); }
                    100% { opacity: 0; transform: translateY(-80px) scale(0); }
                }
                @keyframes glow-pulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.15); }
                    50% { box-shadow: 0 0 40px rgba(168,85,247,0.7), 0 0 100px rgba(139,92,246,0.3), 0 0 150px rgba(236,72,153,0.15); }
                }
                @keyframes neon-border {
                    0%, 100% { border-color: rgba(139,92,246,0.4); box-shadow: 0 0 15px rgba(139,92,246,0.2); }
                    33% { border-color: rgba(236,72,153,0.4); box-shadow: 0 0 15px rgba(236,72,153,0.2); }
                    66% { border-color: rgba(96,165,250,0.4); box-shadow: 0 0 15px rgba(96,165,250,0.2); }
                }
                @keyframes float-neon {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(30px, -40px) scale(1.1); }
                    50% { transform: translate(-20px, -60px) scale(0.95); }
                    75% { transform: translate(-30px, -20px) scale(1.05); }
                }
                .marquee-track {
                    display: flex;
                    width: max-content;
                    animation: marquee 30s linear infinite;
                }
                .marquee-track:hover {
                    animation-play-state: paused;
                }
                .orb-float { animation: float-orb 6s ease-in-out infinite; }
                .orb-float-delay { animation: float-orb 8s ease-in-out infinite 2s; }
                .pulse-ring { animation: pulse-ring 3s ease-in-out infinite; }
                .gradient-text {
                    background: linear-gradient(90deg, #a78bfa, #f472b6, #60a5fa, #34d399, #fbbf24, #a78bfa);
                    background-size: 300% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: color-shift 6s ease-in-out infinite;
                }
                .hero-headline-glow {
                    background: linear-gradient(90deg, #fff, #e0c3fc, #8ec5fc, #f9d423, #ff6b6b, #fff);
                    background-size: 300% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: color-shift 8s ease-in-out infinite;
                    filter: drop-shadow(0 0 30px rgba(167,139,250,0.4));
                }
                .card-shine::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%);
                    pointer-events: none;
                }
                .reveal { opacity: 0; transform: translateY(60px) scale(0.95); transition: opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1); }
                .reveal.visible { opacity: 1; transform: translateY(0) scale(1); }
                .reveal-scale { opacity: 0; transform: scale(0.85); transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1); }
                .reveal-scale.visible { opacity: 1; transform: scale(1); }
                .twinkle-star { position: absolute; border-radius: 50%; animation: twinkle ease-in-out infinite; }
                .glow-cta { animation: glow-pulse 2.5s ease-in-out infinite; }
                .aurora-orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: float-neon 12s ease-in-out infinite; pointer-events: none; }
                .neon-badge { animation: neon-border 4s ease-in-out infinite; }
            `}</style>

            {/* =============================================
                🎬 SECTION 1: HERO - Video Background
            ================================================ */}
            <section id="hero" className="relative min-h-[100vh] w-full flex flex-col items-center justify-center overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0 will-change-transform"
                    style={{ transform: `translateY(${parallaxY}px)` }}
                >
                    <source
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
                        type="video/mp4"
                    />
                </video>
                <div className="absolute inset-0 bg-black/30 z-[1]"></div>

                {/* ---- Aurora Orbs / Quầng sáng màu ---- */}
                <div className="aurora-orb z-[2] w-[400px] h-[400px] bg-violet-500/30" style={{ top: '10%', left: '15%', animationDelay: '0s' }} />
                <div className="aurora-orb z-[2] w-[350px] h-[350px] bg-fuchsia-500/25" style={{ top: '30%', right: '10%', animationDelay: '3s', animationDuration: '15s' }} />
                <div className="aurora-orb z-[2] w-[300px] h-[300px] bg-cyan-500/20" style={{ bottom: '15%', left: '40%', animationDelay: '6s', animationDuration: '18s' }} />
                <div className="aurora-orb z-[2] w-[250px] h-[250px] bg-pink-500/20" style={{ top: '50%', left: '5%', animationDelay: '2s', animationDuration: '14s' }} />
                <div className="aurora-orb z-[2] w-[200px] h-[200px] bg-amber-500/15" style={{ top: '20%', right: '25%', animationDelay: '4s', animationDuration: '16s' }} />

                {/* ---- Twinkling Stars / Nhấp nháy màu sắc ---- */}
                {[...Array(40)].map((_, i) => {
                    const size = 3 + Math.random() * 7;
                    const colors = ['#a78bfa', '#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#e879f9', '#22d3ee', '#ffffff'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    return (
                        <div
                            key={`star-${i}`}
                            className="twinkle-star z-[3]"
                            style={{
                                top: `${5 + Math.random() * 90}%`,
                                left: `${Math.random() * 100}%`,
                                width: `${size}px`,
                                height: `${size}px`,
                                background: color,
                                boxShadow: `0 0 ${size * 2}px ${color}`,
                                animationDelay: `${Math.random() * 6}s`,
                                animationDuration: `${1.5 + Math.random() * 2.5}s`,
                            }}
                        />
                    );
                })}

                {/* ---- Floating Navigation Bar ---- */}
                <nav className={`fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl transition-all duration-500 ${scrolled ? 'top-2' : 'top-4'}`}>
                    <div className={`flex items-center justify-between backdrop-blur-xl rounded-2xl px-5 shadow-[0_4px_30px_rgba(0,0,0,0.08)] transition-all duration-500 ${scrolled ? 'bg-white/[0.98] py-2 shadow-[0_8px_40px_rgba(0,0,0,0.12)]' : 'bg-white/[0.85] py-2.5'}`}>
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
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="text-[14px] font-medium text-[#555] hover:text-[#111] transition-colors"
                                    style={{ fontFamily: "'Barlow', sans-serif" }}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                        <Link to="/register">
                            <Button
                                className="bg-[#222] hover:bg-[#111] text-white rounded-full px-5 h-9 text-[13px] font-semibold gap-2 shadow-sm"
                                style={{ fontFamily: "'Barlow', sans-serif" }}
                            >
                                Bắt Đầu Miễn Phí
                                <span className="inline-flex items-center justify-center size-5 rounded-full bg-white/20">
                                    <ArrowUpRight className="size-3" />
                                </span>
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* ---- Hero Content ---- */}
                <div ref={heroContent.ref} className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
                    <Badge variant="outline" className="mb-8 bg-white/10 text-white/90 border-violet-400/30 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-medium tracking-wide neon-badge" style={{ animation: 'fade-up 1s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
                        <Zap className="size-3 mr-1.5 text-yellow-400 fill-yellow-400" /> AI-Powered Creative Platform
                    </Badge>
                    <h1 className="mb-6" style={{ animation: 'fade-up 1.1s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}>
                        <span
                            className="block text-[clamp(32px,5.5vw,72px)] font-semibold text-white leading-[1.05]"
                            style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-3px" }}
                        >
                            Nền tảng giúp bạn tạo
                        </span>
                        <span
                            className="block text-[clamp(40px,7vw,84px)] leading-[1.1] mt-2 font-bold hero-headline-glow"
                            style={{ fontFamily: "'Dancing Script', cursive", letterSpacing: "-1px" }}
                        >
                            ảnh AI chất lượng cao
                        </span>
                    </h1>
                    <p
                        className="text-white/70 text-[clamp(14px,1.2vw,18px)] max-w-lg mb-10 font-medium leading-relaxed"
                        style={{ fontFamily: "'Barlow', sans-serif", animation: 'fade-up 1s cubic-bezier(0.16,1,0.3,1) 0.8s both' }}
                    >
                        Tạo ảnh từ văn bản, áp dụng kiểu mẫu có sẵn, quản lý thư viện cá nhân.
                        Dành cho Nhà Sáng Tạo, Designer và Thương Hiệu.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4" style={{ animation: 'fade-up 1s cubic-bezier(0.16,1,0.3,1) 1.1s both' }}>
                        <Link to="/app/generate">
                            <Button
                                size="lg"
                                className="glow-cta bg-white hover:bg-white/90 text-[#111] rounded-full h-14 px-8 text-[15px] font-bold gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:scale-[1.05]"
                                style={{ fontFamily: "'Barlow', sans-serif" }}
                            >
                                <span className="flex items-center justify-center size-8 rounded-full bg-[#111] text-white">
                                    <Play className="size-3.5 fill-white ml-0.5" />
                                </span>
                                Tạo Ảnh Ngay
                            </Button>
                        </Link>
                        <Link to="/app/templates">
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-full h-14 px-8 text-[15px] font-bold border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-md"
                                style={{ fontFamily: "'Barlow', sans-serif" }}
                            >
                                <SwatchBook className="size-4 mr-2" />
                                Xem Kiểu Mẫu
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[2] pointer-events-none"></div>
            </section>

            {/* =============================================
                ⭐ SECTION 2: Social Proof - Stats
            ================================================ */}
            <section className="relative z-10 bg-black py-16 sm:py-20">
                {/* Top divider line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <div ref={statsSection.ref} className={`max-w-5xl mx-auto px-4 text-center reveal ${statsSection.isVisible ? 'visible' : ''}`}>
                    <p className="text-white/30 text-xs font-semibold uppercase tracking-[0.25em] mb-12" style={{ fontFamily: "'Barlow', sans-serif" }}>
                        Được tin dùng bởi cộng đồng sáng tạo
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-white/[0.06]">
                        {[
                            { label: "Ảnh đã tạo", value: statsSection.isVisible ? `${(count1/1000000).toFixed(1)}M+` : '0', icon: WandSparkles, color: "text-violet-400", bg: "bg-violet-500/10" },
                            { label: "Người dùng", value: statsSection.isVisible ? `${Math.floor(count2/1000)}K+` : '0', icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
                            { label: "Kiểu mẫu", value: statsSection.isVisible ? `${count3}+` : '0', icon: SwatchBook, color: "text-sky-400", bg: "bg-sky-500/10" },
                            { label: "Đánh giá", value: "4.9★", icon: Gem, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        ].map((stat, i) => (
                            <div key={stat.label} className="flex flex-col items-center gap-3 px-4 sm:px-8 py-2" style={{ transitionDelay: `${i * 150}ms` }}>
                                <div className={`size-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`size-5 ${stat.color}`} />
                                </div>
                                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                    {stat.value}
                                </span>
                                <span className="text-white/40 text-xs font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom divider */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </section>

            {/* =============================================
                🎨 SECTION 3: Tính Năng Chính - Bento Grid
            ================================================ */}
            <section id="features" className="relative z-10 bg-black py-20 sm:py-28">
                <div ref={featuresSection.ref} className={`max-w-6xl mx-auto px-4 reveal ${featuresSection.isVisible ? 'visible' : ''}`}>
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 bg-white/5 text-white/60 border-white/10 rounded-full px-4 py-1 text-xs tracking-wide">
                            Tính năng nổi bật
                        </Badge>
                        <h2
                            className="text-3xl sm:text-5xl font-bold tracking-tight"
                            style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}
                        >
                            <span className="text-white">Mọi thứ bạn cần để&nbsp;</span>
                            <span className="gradient-text">sáng tạo</span>
                        </h2>
                        <p className="text-white/40 text-sm sm:text-base mt-4 max-w-lg mx-auto" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            Từ ý tưởng đến tác phẩm chỉ trong vài cú nhấp chuột.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">

                        {/* Card 1: Tạo Ảnh AI - 7 cols */}
                        <Link to="/app/generate" className="md:col-span-7 block group">
                            <Card className="card-shine relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-950/80 via-[#1a0b2e] to-black border border-violet-500/10 h-full min-h-[360px] sm:min-h-[400px] cursor-pointer transition-all duration-500 hover:border-violet-500/30 hover:shadow-[0_0_80px_rgba(139,92,246,0.18)]">
                                {/* Orb glows */}
                                <div className="absolute top-[-20%] right-[-10%] w-[320px] h-[320px] bg-violet-500/20 rounded-full blur-[100px] group-hover:bg-violet-400/30 group-hover:scale-110 transition-all duration-1000"></div>
                                <div className="absolute bottom-[-15%] left-[-5%] w-[200px] h-[200px] bg-fuchsia-500/10 rounded-full blur-[80px] group-hover:bg-fuchsia-400/20 transition-all duration-1000"></div>

                                {/* Fake prompt UI mockup in top-right */}
                                <div className="absolute top-6 right-6 w-[180px] opacity-25 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
                                    <div className="rounded-xl bg-white/[0.06] border border-white/10 p-3 backdrop-blur-sm">
                                        <div className="text-[9px] text-white/40 mb-2 font-mono" style={{ fontFamily: "'Barlow', sans-serif" }}>prompt</div>
                                        <div className="h-1.5 w-[90%] rounded-full bg-white/20 mb-1.5"></div>
                                        <div className="h-1.5 w-[70%] rounded-full bg-white/15 mb-1.5"></div>
                                        <div className="h-1.5 w-[80%] rounded-full bg-white/10 mb-3"></div>
                                        <div className="flex gap-1.5">
                                            <div className="h-6 flex-1 rounded-md bg-violet-500/30 border border-violet-500/20"></div>
                                            <div className="h-6 w-6 rounded-md bg-white/10 border border-white/10 flex items-center justify-center">
                                                <Sparkles className="size-2.5 text-violet-300" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Output image preview */}
                                    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 opacity-80">
                                        <img
                                            src="https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?q=80&w=200&auto=format&fit=crop"
                                            alt=""
                                            className="w-full h-16 object-cover"
                                        />
                                    </div>
                                </div>

                                <CardContent className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-10">
                                    <div className="size-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(139,92,246,0.4)] group-hover:scale-110 group-hover:shadow-[0_12px_40px_rgba(139,92,246,0.55)] transition-all duration-500">
                                        <WandSparkles className="size-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Tạo Ảnh AI
                                    </h3>
                                    <p className="text-white/50 text-sm sm:text-[15px] leading-relaxed font-medium max-w-sm" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Nhập mô tả bằng văn bản, chọn tỷ lệ khung hình (1:1, 9:16, 16:9), số lượng batch và mô hình AI. Ảnh 4K chỉ trong vài giây.
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-5">
                                        <Badge className="bg-violet-500/20 text-violet-200 border-none text-[11px] px-3 py-1 rounded-full">Text-to-Image</Badge>
                                        <Badge className="bg-violet-500/20 text-violet-200 border-none text-[11px] px-3 py-1 rounded-full">Batch</Badge>
                                        <Badge className="bg-violet-500/20 text-violet-200 border-none text-[11px] px-3 py-1 rounded-full">4K Output</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Card 2: Kho Kiểu Mẫu - 5 cols */}
                        <Link to="/app/templates" className="md:col-span-5 block group">
                            <Card className="card-shine relative overflow-hidden rounded-[24px] bg-gradient-to-b from-sky-950/60 to-black border border-sky-500/10 h-full min-h-[360px] sm:min-h-[400px] cursor-pointer transition-all duration-500 hover:border-sky-500/25 hover:shadow-[0_0_80px_rgba(14,165,233,0.12)]">
                                <div className="absolute top-[-10%] left-[-10%] w-[260px] h-[260px] bg-sky-500/15 rounded-full blur-[90px] group-hover:bg-sky-400/25 transition-all duration-1000"></div>

                                {/* Real template thumbnails grid */}
                                <div className="absolute top-6 right-5 grid grid-cols-3 gap-1.5 opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none">
                                    {[
                                        "https://images.unsplash.com/photo-1542442828-287217bfb21f?q=80&w=80&auto=format&fit=crop",
                                        "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=80&auto=format&fit=crop",
                                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=80&auto=format&fit=crop",
                                        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=80&auto=format&fit=crop",
                                        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=80&auto=format&fit=crop",
                                        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=80&auto=format&fit=crop",
                                    ].map((src, i) => (
                                        <img key={i} src={src} alt="" className="size-9 rounded-lg object-cover ring-1 ring-white/10" />
                                    ))}
                                </div>

                                <CardContent className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-10">
                                    <div className="size-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(14,165,233,0.4)] group-hover:scale-110 transition-all duration-500">
                                        <SwatchBook className="size-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Kho Kiểu Mẫu
                                    </h3>
                                    <p className="text-white/50 text-sm leading-relaxed font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        12+ preset: Cyberpunk, Anime, 3D, Logo, Sơn dầu&hellip; Chọn mẫu, tải ảnh lên, nhận kết quả ngay.
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-5">
                                        {["Chân dung", "Anime", "3D", "Logo"].map(t => (
                                            <Badge key={t} className="bg-sky-500/15 text-sky-200 border-none text-[11px] px-3 py-1 rounded-full">{t}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Card 3: Thư Viện - 5 cols */}
                        <Link to="/app/library" className="md:col-span-5 block group">
                            <Card className="card-shine relative overflow-hidden rounded-[24px] bg-gradient-to-b from-amber-950/50 to-black border border-amber-500/10 h-full min-h-[300px] sm:min-h-[340px] cursor-pointer transition-all duration-500 hover:border-amber-500/25 hover:shadow-[0_0_80px_rgba(245,158,11,0.12)]">
                                <div className="absolute bottom-[-15%] right-[-10%] w-[220px] h-[220px] bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-400/20 transition-all duration-1000"></div>

                                {/* Masonry-style gallery thumbnails */}
                                <div className="absolute top-5 right-5 flex gap-1.5 opacity-20 group-hover:opacity-55 transition-opacity duration-700 pointer-events-none">
                                    <img src="https://images.unsplash.com/photo-1542442828-287217bfb21f?q=80&w=80&auto=format&fit=crop" alt="" className="w-12 h-16 rounded-lg object-cover ring-1 ring-white/10" />
                                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=80&auto=format&fit=crop" alt="" className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/10 mt-5" />
                                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=80&auto=format&fit=crop" alt="" className="w-12 h-20 rounded-lg object-cover ring-1 ring-white/10 -mt-2" />
                                </div>

                                <CardContent className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-10">
                                    <div className="size-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-all duration-500">
                                        <Images className="size-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Thư Viện Của Bạn
                                    </h3>
                                    <p className="text-white/50 text-sm leading-relaxed font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Quản lý ảnh AI, kết quả kiểu mẫu và tài nguyên gốc. Tìm kiếm, lọc, tải xuống trong tích tắc.
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-5">
                                        {["Kết quả AI", "Mẫu", "Upload"].map(t => (
                                            <Badge key={t} className="bg-amber-500/15 text-amber-200 border-none text-[11px] px-3 py-1 rounded-full">{t}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Card 4: Hệ thống Kim Cương - 7 cols */}
                        <Link to="/register" className="md:col-span-7 block group">
                            <Card className="card-shine relative overflow-hidden rounded-[24px] bg-gradient-to-br from-cyan-950/50 via-black to-violet-950/30 border border-cyan-500/10 h-full min-h-[300px] sm:min-h-[340px] cursor-pointer transition-all duration-500 hover:border-cyan-400/25 hover:shadow-[0_0_80px_rgba(6,182,212,0.12)]">
                                <div className="absolute top-[-10%] right-[10%] w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[90px] group-hover:bg-cyan-400/20 transition-all duration-1000"></div>
                                <div className="absolute bottom-[-10%] left-[20%] w-[200px] h-[200px] bg-violet-500/10 rounded-full blur-[80px]"></div>

                                {/* Floating gem counter */}
                                <div className="absolute top-6 right-8 opacity-20 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
                                        <Gem className="size-4 text-cyan-400" />
                                        <span className="text-cyan-300 text-sm font-bold tabular-nums">926</span>
                                    </div>
                                </div>

                                <CardContent className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-10">
                                    <div className="size-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-all duration-500">
                                        <Gem className="size-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Hệ Thống Kim Cương
                                    </h3>
                                    <p className="text-white/50 text-sm sm:text-[15px] leading-relaxed font-medium max-w-sm" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        Mỗi lượt tạo ảnh tiêu hao Kim Cương. Đăng ký miễn phí nhận 50 💎 ngay. Nạp thêm bất cứ lúc nào để sáng tạo không gián đoạn.
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-5">
                                        <Badge className="bg-cyan-500/15 text-cyan-200 border-none text-[11px] px-3 py-1 rounded-full">50 💎 Miễn phí</Badge>
                                        <Badge className="bg-cyan-500/15 text-cyan-200 border-none text-[11px] px-3 py-1 rounded-full">Nạp Xu</Badge>
                                        <Badge className="bg-cyan-500/15 text-cyan-200 border-none text-[11px] px-3 py-1 rounded-full">Pro Plan</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                    </div>
                </div>
            </section>

            {/* =============================================
                🔄 SECTION 3.5: How It Works - 3 Steps
            ================================================ */}
            <section className="relative z-10 bg-black py-20 sm:py-24 overflow-hidden">
                {/* Subtle gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black pointer-events-none"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <div ref={howItWorks.ref} className={`max-w-5xl mx-auto px-4 reveal ${howItWorks.isVisible ? 'visible' : ''}`}>
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 bg-white/5 text-white/60 border-white/10 rounded-full px-4 py-1 text-xs tracking-wide">
                            Cách hoạt động
                        </Badge>
                        <h2
                            className="text-3xl sm:text-5xl font-bold text-white tracking-tight"
                            style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}
                        >
                            Chỉ 3 bước đơn giản
                        </h2>
                        <p className="text-white/40 text-sm sm:text-base mt-4 max-w-md mx-auto" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            Từ ý tưởng đến tác phẩm hoàn chỉnh trong vài giây.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
                        {/* Connecting dashes on desktop */}
                        <div className="hidden md:block absolute top-[52px] left-[calc(33%-20px)] right-[calc(33%-20px)] h-px border-t border-dashed border-white/10 pointer-events-none"></div>

                        {[
                            {
                                step: "01",
                                icon: WandSparkles,
                                title: "Nhập mô tả",
                                desc: "Viết prompt bằng tiếng Anh hoặc tiếng Việt. Chọn tỷ lệ khung, batch size và mô hình AI phù hợp.",
                                color: "from-violet-500 to-fuchsia-500",
                                glow: "rgba(139,92,246,0.3)",
                                bg: "bg-violet-500/10",
                            },
                            {
                                step: "02",
                                icon: Layers,
                                title: "Chọn cài đặt",
                                desc: "Tùy chỉnh kiểu mẫu, phong cách nghệ thuật, tỷ lệ ảnh. Hoặc chọn template có sẵn để bắt đầu nhanh.",
                                color: "from-sky-500 to-cyan-400",
                                glow: "rgba(14,165,233,0.3)",
                                bg: "bg-sky-500/10",
                            },
                            {
                                step: "03",
                                icon: Download,
                                title: "Tải xuống",
                                desc: "Nhận ảnh 4K chất lượng cao trong vài giây. Lưu vào thư viện hoặc tải xuống ngay lập tức.",
                                color: "from-emerald-500 to-teal-400",
                                glow: "rgba(16,185,129,0.3)",
                                bg: "bg-emerald-500/10",
                            },
                        ].map((s) => (
                            <div key={s.step} className="flex flex-col items-center text-center group">
                                {/* Icon with number badge */}
                                <div className="relative mb-6">
                                    <div
                                        className={`size-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center transition-all duration-500 group-hover:scale-110`}
                                        style={{ boxShadow: `0 8px 30px ${s.glow}` }}
                                    >
                                        <s.icon className="size-7 text-white" />
                                    </div>
                                    {/* Step number badge */}
                                    <div className="absolute -top-2 -right-2 size-6 rounded-full bg-black border border-white/15 flex items-center justify-center">
                                        <span className="text-[10px] font-black text-white/60" style={{ fontFamily: "'Barlow', sans-serif" }}>{s.step}</span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-black text-white mb-3" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                    {s.title}
                                </h3>
                                <p className="text-white/40 text-sm leading-relaxed max-w-[240px]" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                    {s.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </section>

            {/* =============================================
                🎯 SECTION 4: Kiểu Mẫu Preview
            ================================================ */}
            <section id="templates" className="relative z-10 bg-black py-20 sm:py-28 overflow-hidden">
                <div ref={templatesSection.ref} className={`max-w-6xl mx-auto px-4 reveal ${templatesSection.isVisible ? 'visible' : ''}`}>
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 bg-white/5 text-white/60 border-white/10 rounded-full px-4 py-1 text-xs tracking-wide">
                            Kiểu mẫu có sẵn
                        </Badge>
                        <h2
                            className="text-3xl sm:text-5xl font-bold text-white tracking-tight"
                            style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}
                        >
                            Chọn phong cách yêu thích
                        </h2>
                        <p className="text-white/40 text-sm sm:text-base mt-4 max-w-lg mx-auto" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            Chọn mẫu → Tải ảnh lên → Nhận ảnh mới theo phong cách mẫu. Đơn giản chỉ vậy thôi.
                        </p>
                    </div>

                    {/* Static grid for first 8 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        {TEMPLATES.map((tpl) => (
                            <div key={tpl.name} className="group relative aspect-[3/4] rounded-[16px] overflow-hidden cursor-pointer ring-1 ring-white/5 hover:ring-white/20 transition-all duration-300">
                                <img
                                    src={tpl.img}
                                    alt={tpl.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                {/* Always-visible gradient + label */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                                {/* Colored overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-t ${tpl.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>

                                {/* Label always visible at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <Badge className="bg-white/10 text-white/70 text-[10px] backdrop-blur-md border-none mb-1 px-2 py-0.5">{tpl.cat}</Badge>
                                    <p className="text-white text-sm font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>{tpl.name}</p>
                                </div>

                                {/* Hover glow border */}
                                <div className="absolute inset-0 rounded-[16px] ring-1 ring-inset ring-white/0 group-hover:ring-white/15 transition-all duration-300 pointer-events-none"></div>
                            </div>
                        ))}
                    </div>

                    {/* Infinite marquee strip */}
                    <div className="overflow-hidden rounded-2xl mb-10">
                        <div className="marquee-track">
                            {[...TEMPLATES, ...TEMPLATES].map((tpl, i) => (
                                <div key={`${tpl.name}-${i}`} className="shrink-0 w-36 h-14 mr-3 rounded-xl overflow-hidden relative ring-1 ring-white/5">
                                    <img src={tpl.img} alt={tpl.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-white text-[10px] font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>{tpl.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center">
                        <Link to="/app/templates">
                            <Button variant="outline" className="rounded-full h-12 px-8 text-sm font-bold border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all">
                                Xem tất cả kiểu mẫu <ArrowUpRight className="size-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* =============================================
                💎 SECTION 5: Bảng Giá
            ================================================ */}
            <section id="pricing" className="relative z-10 bg-black py-20 sm:py-28">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <div ref={pricingSection.ref} className={`max-w-5xl mx-auto px-4 reveal ${pricingSection.isVisible ? 'visible' : ''}`}>
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 bg-white/5 text-white/60 border-white/10 rounded-full px-4 py-1 text-xs tracking-wide">
                            <Gem className="size-3 mr-1.5 text-cyan-400" /> Hệ thống Kim Cương
                        </Badge>
                        <h2
                            className="text-3xl sm:text-5xl font-bold text-white tracking-tight"
                            style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}
                        >
                            Chọn gói phù hợp
                        </h2>
                        <p className="text-white/40 text-sm sm:text-base mt-4 max-w-md mx-auto" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            Mỗi lần tạo ảnh tiêu hao Kim Cương. Nạp thêm hoặc chọn gói Pro để sáng tạo không giới hạn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-center">
                        {PLANS.map((plan) => (
                            <Card
                                key={plan.name}
                                className={`relative overflow-hidden rounded-[20px] border transition-all duration-300 ${plan.popular
                                    ? "border-violet-500/40 bg-gradient-to-b from-violet-950/40 to-black shadow-[0_0_60px_rgba(139,92,246,0.2)] scale-[1.03]"
                                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                                    }`}
                            >
                                {/* Animated gradient border top for popular */}
                                {plan.popular && (
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500"></div>
                                )}

                                {plan.popular && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-none text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-[0_2px_10px_rgba(139,92,246,0.4)]">
                                            Phổ biến
                                        </Badge>
                                    </div>
                                )}

                                <CardContent className={`p-7 sm:p-8 ${plan.popular ? "pt-8" : ""}`}>
                                    <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        {plan.name}
                                    </p>

                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-4xl font-black text-white" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                            {plan.price}
                                        </span>
                                        <span className="text-white/30 text-sm font-medium">{plan.period}</span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-8 py-2 px-3 rounded-full bg-white/5 border border-white/5 w-fit">
                                        <Gem className="size-3.5 text-cyan-400" />
                                        <span className="text-cyan-400 text-xs font-bold">{plan.gems} Kim Cương/tháng</span>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2.5 text-sm text-white/55 font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                                <CheckCircle2 className={`size-4 shrink-0 ${plan.popular ? "text-violet-400" : "text-emerald-500/70"}`} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link to="/register">
                                        <Button
                                            className={`w-full rounded-full h-11 font-bold text-sm transition-all ${plan.popular
                                                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white shadow-[0_4px_20px_rgba(139,92,246,0.35)] hover:shadow-[0_6px_30px_rgba(139,92,246,0.5)]"
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

            {/* =============================================
                🚀 SECTION 6: Final CTA
            ================================================ */}
            <section className="relative z-10 bg-black py-24 sm:py-32 overflow-hidden">
                {/* Animated orbs background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-[120px] orb-float"></div>
                    <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-fuchsia-900/15 rounded-full blur-[100px] orb-float-delay"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-sky-900/15 rounded-full blur-[100px] orb-float"></div>
                </div>

                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <div ref={ctaSection.ref} className={`max-w-3xl mx-auto px-4 text-center relative reveal ${ctaSection.isVisible ? 'visible' : ''}`}>
                    {/* Social proof avatars + rating */}
                    <div className="flex flex-col items-center gap-3 mb-10">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="size-4 text-amber-400 fill-amber-400" />
                            ))}
                            <span className="text-white/60 text-sm font-medium ml-2" style={{ fontFamily: "'Barlow', sans-serif" }}>4.9 / 5.0</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Avatar stack */}
                            <div className="flex -space-x-2">
                                {[
                                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=64&auto=format&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=64&auto=format&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=64&auto=format&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=64&auto=format&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=64&auto=format&fit=crop&crop=face",
                                ].map((src, i) => (
                                    <img
                                        key={i}
                                        src={src}
                                        alt=""
                                        className="size-8 rounded-full border-2 border-black object-cover ring-1 ring-white/10"
                                    />
                                ))}
                            </div>
                            <span className="text-white/40 text-xs font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                50,000+ nhà sáng tạo tin dùng
                            </span>
                        </div>
                    </div>

                    <h2
                        className="text-4xl sm:text-6xl font-bold text-white tracking-tight mb-6"
                        style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}
                    >
                        Sẵn sàng{" "}
                        <span className="gradient-text">sáng tạo?</span>
                    </h2>
                    <p className="text-white/50 text-base sm:text-lg mb-10 max-w-md mx-auto font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                        Đăng ký miễn phí. Nhận 50 Kim Cương ngay lập tức. Không cần thẻ tín dụng.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register">
                            <Button
                                size="lg"
                                className="bg-white hover:bg-white/90 text-[#111] rounded-full h-14 px-10 text-[15px] font-bold shadow-[0_8px_40px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] hover:shadow-[0_12px_50px_rgba(255,255,255,0.2)]"
                                style={{ fontFamily: "'Barlow', sans-serif" }}
                            >
                                Đăng Ký Miễn Phí
                                <ArrowUpRight className="size-4 ml-2" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-full h-14 px-10 text-[15px] font-bold border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all"
                                style={{ fontFamily: "'Barlow', sans-serif" }}
                            >
                                Đăng Nhập
                            </Button>
                        </Link>
                    </div>

                    {/* Free badge */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <Gem className="size-4 text-cyan-400" />
                        <span className="text-white/30 text-xs font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            50 Kim Cương miễn phí khi đăng ký — không giới hạn thời gian
                        </span>
                    </div>
                </div>
            </section>
        </div>
    )
}
