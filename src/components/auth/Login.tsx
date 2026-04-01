import { motion } from "framer-motion"
import { Sparkles, Gem, Wand2, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const GOOGLE_REDIRECT = "/api/auth/google/redirect"

// Ảnh AI cute — dùng cho floating cards trang trí Login
const FLOATING_ART = [
    { src: "/assets/nana_1.png", label: "Ghibli Critter" },
    { src: "/assets/nana_2.png", label: "Cyber Shiba" },
    { src: "/assets/nana_3.png", label: "Boba Island" },
    { src: "/assets/nana_4.png", label: "Space Cat" },
    { src: "/assets/nana_7.png", label: "Anime Girl" },
    { src: "/assets/nana_8.png", label: "Pop Sneaker" },
]


export function Login() {
    return (
        <div className="relative h-svh w-full bg-[#08080c] text-white overflow-hidden">

            {/* ============= AMBIENT BACKGROUND FX ============= */}
            <div className="absolute inset-0 z-0">
                {/* Radial gradient nền */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_30%,transparent_100%)]" />

                {/* Glow trái — mạnh hơn */}
                <motion.div
                    className="absolute top-[20%] -left-20 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[180px]"
                    animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Glow phải */}
                <motion.div
                    className="absolute bottom-[20%] -right-20 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[160px]"
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
                {/* Glow trung tâm nhẹ */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[120px]"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
            </div>

            {/* ============= FLOATING ART CARDS (Trang trí nền — Visible mọi màn hình) ============= */}
            {/* Đặt ở z-[1] để nằm dưới nội dung chính nhưng trên nền */}
            <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
                {/* Card trái trên */}
                <motion.div
                    className="absolute top-[8%] left-[3%] w-24 h-32 sm:w-32 sm:h-44 md:w-40 md:h-56 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-violet-500/20 opacity-60"
                    animate={{ y: [0, -15, 0], rotate: [-3, 2, -3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <img src={FLOATING_ART[0].src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080c]/80 to-transparent" />
                </motion.div>

                {/* Card trái giữa */}
                <motion.div
                    className="absolute top-[45%] left-[2%] w-20 h-28 sm:w-28 sm:h-36 md:w-36 md:h-48 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-fuchsia-500/20 opacity-50"
                    animate={{ y: [0, 20, 0], rotate: [2, -2, 2] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                    <img src={FLOATING_ART[1].src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080c]/80 to-transparent" />
                </motion.div>

                {/* Card trái dưới */}
                <motion.div
                    className="absolute bottom-[8%] left-[5%] w-20 h-24 sm:w-24 sm:h-32 md:w-32 md:h-40 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl opacity-40"
                    animate={{ y: [0, -12, 0], rotate: [-2, 3, -2] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                >
                    <img src={FLOATING_ART[2].src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080c]/80 to-transparent" />
                </motion.div>

                {/* Card phải trên */}
                <motion.div
                    className="absolute top-[10%] right-[3%] w-24 h-32 sm:w-32 sm:h-44 md:w-40 md:h-56 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-violet-500/20 opacity-60"
                    animate={{ y: [0, 18, 0], rotate: [3, -2, 3] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <img src={FLOATING_ART[3].src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080c]/80 to-transparent" />
                </motion.div>

                {/* Card phải giữa */}
                <motion.div
                    className="absolute top-[48%] right-[2%] w-20 h-28 sm:w-28 sm:h-36 md:w-36 md:h-48 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-fuchsia-500/20 opacity-50"
                    animate={{ y: [0, -20, 0], rotate: [-2, 3, -2] }}
                    transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <img src={FLOATING_ART[4].src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080c]/80 to-transparent" />
                </motion.div>

                {/* Card phải dưới */}
                <motion.div
                    className="absolute bottom-[10%] right-[5%] w-20 h-24 sm:w-24 sm:h-32 md:w-32 md:h-40 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl opacity-40"
                    animate={{ y: [0, 15, 0], rotate: [2, -3, 2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                >
                    <img src={FLOATING_ART[5].src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080c]/80 to-transparent" />
                </motion.div>

                {/* Floating sparkle particles */}
                {[...Array(12)].map((_, i) => {
                    const r1 = (Math.sin(i * 7.89) + 1) / 2
                    const r2 = (Math.cos(i * 23.45) + 1) / 2
                    return (
                        <motion.div
                            key={`sparkle-${i}`}
                            className="absolute w-1 h-1 rounded-full bg-violet-400/60"
                            style={{ left: `${r1 * 100}%`, top: `${r2 * 100}%` }}
                            animate={{
                                opacity: [0, 0.8, 0],
                                scale: [0.5, 1.5, 0.5],
                                y: [0, -40, 0],
                            }}
                            transition={{
                                duration: r1 * 4 + 3,
                                repeat: Infinity,
                                delay: r2 * 3,
                                ease: "easeInOut",
                            }}
                        />
                    )
                })}
            </div>

            {/* ============= MAIN CONTENT ============= */}
            <div className="relative z-10 h-full flex flex-col">

                {/* Navbar */}
                <nav className="shrink-0 w-full px-6 md:px-10 py-4 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/30">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        ZDream
                    </a>
                    <Button variant="ghost" size="sm" className="text-white/50 hover:text-white gap-1.5 hover:bg-white/5" asChild>
                        <a href="/">
                            <ArrowLeft className="h-3.5 w-3.5" /> Trang chủ
                        </a>
                    </Button>
                </nav>

                {/* Center content */}
                <div className="flex-1 min-h-0 flex items-center justify-center px-6 md:px-10">
                    <motion.div
                        className="w-full max-w-md flex flex-col items-center text-center"
                        initial={{ opacity: 0, y: 40, filter: "blur(15px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Badge
                            variant="outline"
                            className="mb-6 py-1.5 px-4 text-xs border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-lg shadow-violet-500/10"
                        >
                            <Sparkles className="mr-1.5 h-3 w-3" /> Nền tảng sáng tạo AI #1
                        </Badge>

                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                                Biến ý tưởng{" "}
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
                                thành tác phẩm
                            </span>
                        </h1>

                        <p className="text-white/40 text-sm sm:text-base mb-10 text-balance leading-relaxed max-w-sm">
                            Đăng nhập để bắt đầu sáng tạo nghệ thuật AI không giới hạn cùng hơn 50K+ nhà sáng tạo.
                        </p>

                        {/* Google CTA — Premium glow border + shimmer */}
                        <motion.div
                            className="w-full sm:w-auto relative group"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {/* Pulsing glow viền — nhẹ nhàng, không xoay */}
                            <motion.div
                                className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 opacity-50 blur-md group-hover:opacity-80 group-hover:blur-lg transition-all duration-500"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <a
                                href={GOOGLE_REDIRECT}
                                className="relative flex items-center justify-center gap-3 w-full sm:w-auto h-14 px-10 text-sm font-semibold rounded-2xl bg-white text-slate-900 shadow-[0_8px_40px_-8px_rgba(139,92,246,0.5)] hover:shadow-[0_8px_60px_-8px_rgba(139,92,246,0.7)] transition-all duration-500 overflow-hidden z-10"
                            >
                                {/* Shimmer sweep */}
                                <motion.div
                                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-violet-200/40 to-transparent skew-x-12"
                                    animate={{ left: ["-100%", "200%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 relative z-10">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="relative z-10">Bắt đầu bằng Google</span>
                            </a>
                        </motion.div>

                        {/* Trust line */}
                        <p className="mt-5 text-[11px] text-white/25">
                            Miễn phí · Không cần thẻ tín dụng · Bắt đầu trong 10 giây
                        </p>

                        {/* Trust strip — inline, nhẹ nhàng, không phèn */}
                        <motion.div
                            className="mt-10 flex items-center gap-3 text-[11px] text-white/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                        >
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
                                <strong className="text-white/60 font-semibold">1.2M+</strong> ảnh đã tạo
                            </span>
                            <span className="text-white/10">·</span>
                            <span className="flex items-center gap-1.5">
                                <Gem className="w-3 h-3 text-violet-400/60" />
                                <strong className="text-white/60 font-semibold">50</strong> gems miễn phí
                            </span>
                            <span className="text-white/10">·</span>
                            <span className="flex items-center gap-1.5">
                                <Wand2 className="w-3 h-3 text-fuchsia-400/60" />
                                <strong className="text-white/60 font-semibold">12+</strong> phong cách
                            </span>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Footer */}
                <footer className="shrink-0 w-full px-6 md:px-10 py-4 text-center text-[11px] text-white/20">
                    © 2026 ZDream · Nền tảng sáng tạo nghệ thuật AI
                </footer>

            </div>
        </div>
    )
}
