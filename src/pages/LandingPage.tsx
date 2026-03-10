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
} from "lucide-react"

// ============================================================
// LandingPage - Premium Video Hero Landing
// Phong cách: Minimal, Ultra-Modern, Video-Centric
// Nội dung: Đồng bộ với chức năng thực tế trong /app
// Tuân thủ: zdream-rule.md, Shadcn UI Components
// ============================================================

// Dữ liệu bảng giá - ánh xạ từ hệ thống Kim Cương
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

export default function LandingPage() {
    return (
        <div className="relative w-full">

            {/* =============================================
                🎬 SECTION 1: HERO - Video Background
            ================================================ */}
            <section id="hero" className="relative min-h-[100vh] w-full flex flex-col items-center justify-center overflow-hidden">

                {/* Video nền toàn màn hình */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                >
                    <source
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
                        type="video/mp4"
                    />
                </video>

                {/* Overlay tối nhẹ để text luôn đọc được */}
                <div className="absolute inset-0 bg-black/40 z-[1]"></div>

                {/* ---- Floating Navigation Bar ---- */}
                <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
                    <div className="flex items-center justify-between bg-white/[0.95] backdrop-blur-xl rounded-2xl px-5 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.08)]">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 shrink-0">
                            <div className="size-8 rounded-lg bg-black flex items-center justify-center">
                                <Sparkles className="size-4 text-white" />
                            </div>
                            <span className="text-[17px] font-bold tracking-tight text-[#111]" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                ZDream
                            </span>
                        </Link>

                        {/* Center Menu - ánh xạ đúng chức năng app */}
                        <div className="hidden md:flex items-center gap-7">
                            {[
                                { label: "Tính năng", href: "#features" },
                                { label: "Kiểu mẫu", href: "#templates" },
                                { label: "Bảng giá", href: "#pricing" },
                                { label: "Đánh giá", href: "#reviews" },
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

                        {/* CTA Button */}
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
                <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
                    <Badge variant="outline" className="mb-8 bg-white/10 text-white/90 border-white/20 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-medium tracking-wide">
                        <Zap className="size-3 mr-1.5 text-yellow-400 fill-yellow-400" /> AI-Powered Creative Platform
                    </Badge>

                    {/* Headline - Dùng Barlow để hỗ trợ đầy đủ tiếng Việt */}
                    <h1 className="mb-6">
                        <span
                            className="block text-[clamp(32px,5.5vw,72px)] font-semibold text-white leading-[1.05]"
                            style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-3px" }}
                        >
                            Nền tảng giúp bạn tạo
                        </span>
                        <span
                            className="block text-[clamp(40px,7vw,84px)] text-white leading-[1.1] mt-2 font-bold"
                            style={{ fontFamily: "'Dancing Script', cursive", letterSpacing: "-1px" }}
                        >
                            ảnh AI chất lượng cao
                        </span>
                    </h1>

                    {/* Subtext - mô tả đúng chức năng thực tế */}
                    <p
                        className="text-white/70 text-[clamp(14px,1.2vw,18px)] max-w-lg mb-10 font-medium leading-relaxed"
                        style={{ fontFamily: "'Barlow', sans-serif" }}
                    >
                        Tạo ảnh từ văn bản, áp dụng kiểu mẫu có sẵn, quản lý thư viện cá nhân.
                        Dành cho Nhà Sáng Tạo, Designer và Thương Hiệu.
                    </p>

                    {/* CTA chính */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link to="/app/generate">
                            <Button
                                size="lg"
                                className="bg-white hover:bg-white/90 text-[#111] rounded-full h-14 px-8 text-[15px] font-bold gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:scale-[1.02]"
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

                {/* Gradient chuyển section */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[2] pointer-events-none"></div>
            </section>

            {/* =============================================
                ⭐ SECTION 2: Social Proof - Số liệu thực
            ================================================ */}
            <section className="relative z-10 bg-black py-16 sm:py-20">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.2em] mb-10" style={{ fontFamily: "'Barlow', sans-serif" }}>
                        Được tin dùng bởi cộng đồng sáng tạo
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
                        {[
                            { label: "Ảnh đã tạo", value: "1.2M+", icon: WandSparkles },
                            { label: "Người dùng", value: "50K+", icon: Star },
                            { label: "Kiểu mẫu", value: "12+", icon: SwatchBook },
                            { label: "Đánh giá", value: "4.9★", icon: Gem },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center gap-2">
                                <stat.icon className="size-5 text-white/30 mb-1" />
                                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                    {stat.value}
                                </span>
                                <span className="text-white/50 text-xs font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============================================
                🎨 SECTION 3: Tính Năng Chính - Bento Grid Sáng Tạo
            ================================================ */}
            <section id="features" className="relative z-10 bg-black py-20 sm:py-28">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 bg-white/5 text-white/70 border-white/10 rounded-full px-4 py-1 text-xs">
                            Tính năng nổi bật
                        </Badge>
                        <h2
                            className="text-3xl sm:text-5xl font-bold text-white tracking-tight"
                            style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}
                        >
                            Sáng tạo không giới hạn
                        </h2>
                        <p className="text-white/40 text-sm sm:text-base mt-4 max-w-lg mx-auto" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            Từ ý tưởng đến tác phẩm chỉ trong vài cú nhấp chuột.
                        </p>
                    </div>

                    {/* Bento Grid Layout - 2 hàng, tỷ lệ không đều tạo nhịp cải tiến */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">

                        {/* Card 1: Tạo Ảnh AI - CHIẾM 7 CỘT (lớn nhất, quan trọng nhất) */}
                        <Link to="/app/generate" className="md:col-span-7 block group">
                            <Card className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-950/80 via-[#1a0b2e] to-black border-violet-500/10 h-full min-h-[340px] sm:min-h-[380px] cursor-pointer transition-all duration-500 hover:border-violet-500/30 hover:shadow-[0_0_60px_rgba(139,92,246,0.15)]">
                                {/* Orb glow động */}
                                <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-violet-500/20 rounded-full blur-[100px] group-hover:bg-violet-400/30 group-hover:scale-110 transition-all duration-1000"></div>
                                <div className="absolute bottom-[-15%] left-[-5%] w-[200px] h-[200px] bg-fuchsia-500/10 rounded-full blur-[80px] group-hover:bg-fuchsia-400/15 transition-all duration-1000"></div>

                                {/* Floating mock UI elements - tạo cảm giác "sản phẩm thật" */}
                                <div className="absolute top-6 right-6 flex gap-2 opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                                    <div className="h-8 w-20 rounded-lg bg-white/10 backdrop-blur-sm"></div>
                                    <div className="h-8 w-8 rounded-lg bg-violet-500/20"></div>
                                </div>
                                <div className="absolute bottom-20 right-8 w-[140px] h-[90px] rounded-xl bg-white/[0.04] border border-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-40 translate-y-4 group-hover:translate-y-0 transition-all duration-700"></div>

                                <CardContent className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-10">
                                    <div className="size-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(139,92,246,0.4)] group-hover:scale-110 group-hover:shadow-[0_12px_40px_rgba(139,92,246,0.5)] transition-all duration-500">
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

                        {/* Card 2: Kho Kiểu Mẫu - CHIẾM 5 CỘT */}
                        <Link to="/app/templates" className="md:col-span-5 block group">
                            <Card className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-sky-950/60 to-black border-sky-500/10 h-full min-h-[340px] sm:min-h-[380px] cursor-pointer transition-all duration-500 hover:border-sky-500/25 hover:shadow-[0_0_60px_rgba(14,165,233,0.1)]">
                                <div className="absolute top-[-10%] left-[-10%] w-[250px] h-[250px] bg-sky-500/15 rounded-full blur-[90px] group-hover:bg-sky-400/25 transition-all duration-1000"></div>

                                {/* Mini preview grid giả lập template thumbnails */}
                                <div className="absolute top-6 right-6 grid grid-cols-3 gap-1.5 opacity-20 group-hover:opacity-50 transition-opacity duration-700">
                                    {[1,2,3,4,5,6].map(i => (
                                        <div key={i} className="size-9 rounded-lg bg-white/10"></div>
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

                        {/* Card 3: Thư Viện - CHIẾM 5 CỘT */}
                        <Link to="/app/library" className="md:col-span-5 block group">
                            <Card className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-amber-950/50 to-black border-amber-500/10 h-full min-h-[300px] sm:min-h-[340px] cursor-pointer transition-all duration-500 hover:border-amber-500/25 hover:shadow-[0_0_60px_rgba(245,158,11,0.1)]">
                                <div className="absolute bottom-[-15%] right-[-10%] w-[220px] h-[220px] bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-400/20 transition-all duration-1000"></div>

                                {/* Giả lập gallery thumbnails */}
                                <div className="absolute top-6 right-6 flex gap-1.5 opacity-15 group-hover:opacity-40 transition-opacity duration-700">
                                    <div className="w-16 h-20 rounded-lg bg-white/10"></div>
                                    <div className="w-16 h-16 rounded-lg bg-white/10 mt-4"></div>
                                    <div className="w-16 h-24 rounded-lg bg-white/10 -mt-2"></div>
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

                        {/* Card 4: Hệ thống Kim Cương - CHIẾM 7 CỘT */}
                        <Link to="/register" className="md:col-span-7 block group">
                            <Card className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-cyan-950/50 via-black to-violet-950/30 border-cyan-500/10 h-full min-h-[300px] sm:min-h-[340px] cursor-pointer transition-all duration-500 hover:border-cyan-400/25 hover:shadow-[0_0_60px_rgba(6,182,212,0.1)]">
                                <div className="absolute top-[-10%] right-[10%] w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[90px] group-hover:bg-cyan-400/20 transition-all duration-1000"></div>
                                <div className="absolute bottom-[-10%] left-[20%] w-[200px] h-[200px] bg-violet-500/10 rounded-full blur-[80px]"></div>

                                {/* Floating gems animation hint */}
                                <div className="absolute top-8 right-10 flex items-center gap-2 opacity-20 group-hover:opacity-50 transition-opacity duration-700">
                                    <Gem className="size-5 text-cyan-400" />
                                    <span className="text-cyan-400 text-lg font-bold">926</span>
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
                🎯 SECTION 4: Kiểu Mẫu Preview
            ================================================ */}
            <section id="templates" className="relative z-10 bg-black py-20 sm:py-28 overflow-hidden">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 bg-white/5 text-white/70 border-white/10 rounded-full px-4 py-1 text-xs">
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

                    {/* Template Grid Preview */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { name: "Cyberpunk", cat: "Chân dung", img: "https://images.unsplash.com/photo-1542442828-287217bfb21f?q=80&w=400&auto=format&fit=crop" },
                            { name: "Ghibli", cat: "Anime", img: "https://images.unsplash.com/photo-1498453488252-0974dcabe0cb?q=80&w=400&auto=format&fit=crop" },
                            { name: "Sản phẩm 3D", cat: "3D", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop" },
                            { name: "Logo Minimal", cat: "Logo", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400&auto=format&fit=crop" },
                            { name: "Sơn dầu", cat: "Phong cảnh", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop" },
                            { name: "Anime Waifu", cat: "Anime", img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop" },
                            { name: "Thời trang", cat: "Chân dung", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop" },
                            { name: "Concept Art", cat: "Phong cảnh", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop" },
                        ].map((tpl) => (
                            <div key={tpl.name} className="group relative aspect-[3/4] rounded-[16px] overflow-hidden cursor-pointer ring-1 ring-white/5">
                                <img src={tpl.img} alt={tpl.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <Badge className="bg-white/10 text-white text-[10px] backdrop-blur-md border-none mb-1.5">{tpl.cat}</Badge>
                                    <p className="text-white text-sm font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>{tpl.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link to="/app/templates">
                            <Button variant="outline" className="rounded-full h-12 px-8 text-sm font-bold border-white/10 text-white hover:bg-white/5">
                                Xem tất cả kiểu mẫu <ArrowUpRight className="size-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* =============================================
                💎 SECTION 5: Bảng Giá & Hệ Thống Kim Cương
            ================================================ */}
            <section id="pricing" className="relative z-10 bg-black py-20 sm:py-28">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 bg-white/5 text-white/70 border-white/10 rounded-full px-4 py-1 text-xs">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {PLANS.map((plan) => (
                            <Card
                                key={plan.name}
                                className={`relative overflow-hidden rounded-[20px] border-white/5 bg-white/[0.02] transition-all duration-300 hover:bg-white/[0.05] ${plan.popular ? "ring-2 ring-violet-500/50 shadow-[0_0_40px_rgba(139,92,246,0.15)]" : ""
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-violet-500 text-white border-none text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                            Phổ biến
                                        </Badge>
                                    </div>
                                )}

                                <CardContent className="p-8">
                                    <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                        {plan.name}
                                    </p>

                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-4xl font-black text-white" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                            {plan.price}
                                        </span>
                                        <span className="text-white/30 text-sm font-medium">{plan.period}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 mb-8">
                                        <Gem className="size-4 text-cyan-400" />
                                        <span className="text-cyan-400 text-sm font-bold">{plan.gems} Kim Cương</span>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2.5 text-sm text-white/60 font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                                <CheckCircle2 className="size-4 text-emerald-500/70 shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link to="/register">
                                        <Button
                                            className={`w-full rounded-full h-12 font-bold text-sm transition-all ${plan.popular
                                                    ? "bg-violet-500 hover:bg-violet-400 text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
                                                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
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
            <section className="relative z-10 bg-black py-20 sm:py-28">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2
                        className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-6"
                        style={{ fontFamily: "'Barlow', sans-serif", letterSpacing: "-2px" }}
                    >
                        Sẵn sàng sáng tạo?
                    </h2>
                    <p className="text-white/50 text-base sm:text-lg mb-10 max-w-md mx-auto font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                        Đăng ký miễn phí. Nhận 50 Kim Cương ngay lập tức. Không cần thẻ tín dụng.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register">
                            <Button
                                size="lg"
                                className="bg-white hover:bg-white/90 text-[#111] rounded-full h-14 px-10 text-[15px] font-bold shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02]"
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
                                className="rounded-full h-14 px-10 text-[15px] font-bold border-white/10 text-white hover:bg-white/5 transition-all"
                                style={{ fontFamily: "'Barlow', sans-serif" }}
                            >
                                Đăng Nhập
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
