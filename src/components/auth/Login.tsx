import { motion } from "framer-motion"
import { Sparkles, Gem, Wand2, Image as ImageIcon, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const GOOGLE_REDIRECT = "/api/auth/google/redirect"

const SHOWCASE_IMAGES = [
    "https://images.unsplash.com/photo-1542442828-287217bfb21f?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1498453488252-0974dcabe0cb?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop",
]


export function Login() {
    return (
        <div className="relative h-svh w-full bg-background text-foreground overflow-hidden">

            {/* Video nền */}
            <video
                autoPlay loop muted playsInline
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
                poster="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1920&auto=format&fit=crop"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
            />
            {/* Overlay tối hơn để chữ dễ đọc */}
            <div className="absolute inset-0 bg-background/85 z-0" />

            {/* Ambient violet glow — trái */}
            <div className="absolute top-1/3 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-glow" />
            {/* Ambient fuchsia glow — phải */}
            <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-fuchsia-600/8 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse-glow" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 h-full flex flex-col">

                {/* Navbar compact */}
                <nav className="shrink-0 w-full px-6 md:px-10 py-4 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white group-hover:scale-105 transition-transform shadow-md shadow-violet-500/20">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        ZDream
                    </a>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5" asChild>
                        <a href="/">
                            <ArrowLeft className="h-3.5 w-3.5" /> Trang chủ
                        </a>
                    </Button>
                </nav>

                {/* Nội dung chính */}
                <div className="flex-1 min-h-0 flex items-center justify-center px-6 md:px-10">
                    <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                        {/* ===== CỘT TRÁI: Form đăng nhập ===== */}
                        <motion.div
                            className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-md mx-auto lg:mx-0"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Badge
                                variant="outline"
                                className="mb-5 py-1 px-3 text-xs border-violet-500/30 bg-violet-500/10 text-violet-300"
                            >
                                <Sparkles className="mr-1.5 h-3 w-3" /> Nền tảng sáng tạo AI
                            </Badge>

                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-balance leading-tight">
                                Biến ý tưởng thành{" "}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 animate-gradient-text">
                                    tác phẩm
                                </span>
                            </h1>

                            <p className="text-muted-foreground text-sm sm:text-base mb-8 text-balance leading-relaxed max-w-sm">
                                Đăng nhập để khám phá thế giới sáng tạo nghệ thuật AI không giới hạn cùng hơn 50 nghìn nhà sáng tạo.
                            </p>

                            {/* Nút Google */}
                            <motion.div
                                className="w-full sm:w-auto"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto h-12 px-8 text-sm font-semibold bg-white text-black border-white/20 hover:bg-slate-50 hover:text-black shadow-lg shadow-black/20 transition-all duration-200"
                                    asChild
                                >
                                    <a href={GOOGLE_REDIRECT} className="flex items-center justify-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Bắt đầu bằng Google
                                    </a>
                                </Button>
                            </motion.div>

                        </motion.div>

                        {/* ===== CỘT PHẢI: Gallery ===== */}
                        <motion.div
                            className="hidden lg:flex flex-col gap-3 min-h-0"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Masonry grid */}
                            <div className="grid grid-cols-3 gap-2.5 flex-1 min-h-0">
                                {SHOWCASE_IMAGES.map((src, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ y: index % 3 === 1 ? 16 : 0 }}
                                        animate={{ y: index % 3 === 1 ? 16 : 0 }}
                                    >
                                        <Card className="overflow-hidden border-border/30 bg-background/50 backdrop-blur-sm h-full hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-500">
                                            <CardContent className="p-0 h-full">
                                                <div className="relative h-full">
                                                    <img
                                                        src={src}
                                                        alt={`AI Art ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Card thống kê — glassmorphism */}
                            <Card className="shrink-0 bg-white/[0.04] backdrop-blur-xl border-white/10 shadow-2xl">
                                <CardContent className="px-4 py-3 flex items-center justify-between gap-4">
                                    {[
                                        { icon: Wand2, value: "1.2M+ ảnh", label: "Đã được tạo" },
                                        { icon: Gem, value: "50 Kim Cương", label: "Miễn phí" },
                                        { icon: ImageIcon, value: "12+ kiểu mẫu", label: "Đa phong cách" },
                                    ].map(({ icon: Icon, value, label }) => (
                                        <div key={label} className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-500/10">
                                                <Icon className="h-4 w-4 text-violet-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold leading-tight">{value}</p>
                                                <p className="text-[10px] text-muted-foreground">{label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>

                    </div>
                </div>

                {/* Footer compact */}
                <footer className="shrink-0 w-full px-6 md:px-10 py-3 text-center text-[11px] text-muted-foreground">
                    © 2026 ZDream · Nền tảng sáng tạo nghệ thuật AI
                </footer>

            </div>
        </div>
    )
}
