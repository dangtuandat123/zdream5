import { Link } from "react-router-dom"
import { ArrowLeft, Sparkles } from "lucide-react"

const GOOGLE_REDIRECT = "/api/auth/google/redirect"

export function Login() {
    return (
        <div className="min-h-dvh flex bg-black w-full overflow-hidden text-white/90">
            <style>{`
                @keyframes float-subtle {
                    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
                    50% { transform: translateY(-10px) scale(1.05); opacity: 0.6; }
                }
                .hero-headline-glow {
                    background: linear-gradient(90deg, #fff, #e0c3fc, #8ec5fc, #fff);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 6s linear infinite;
                    filter: drop-shadow(0 0 20px rgba(167,139,250,0.3));
                }
                @keyframes shimmer {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                .ambient-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    animation: float-subtle 10s ease-in-out infinite;
                    pointer-events: none;
                }
            `}</style>

            {/* ==== Left Panel - Decorative Hero (Desktop) ==== */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden border-r border-white/5">
                {/* Background Video */}
                <div className="absolute inset-0 z-[0] bg-black">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-[0.4] mix-blend-screen pointer-events-none grayscale-[20%]"
                    >
                        <source
                            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
                            type="video/mp4"
                        />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black"></div>
                </div>

                {/* Subtle Ambient Orbs */}
                <div className="ambient-orb z-[1] w-[400px] h-[400px] bg-violet-600/30" style={{ top: '10%', left: '10%' }} />
                <div className="ambient-orb z-[1] w-[300px] h-[300px] bg-cyan-600/20" style={{ bottom: '20%', right: '10%', animationDuration: '14s' }} />

                <div className="relative z-10 text-center max-w-lg px-8 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-xl">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-fuchsia-200">AI Generation Platform</span>
                    </div>

                    <h2 className="text-5xl font-black mb-6 tracking-tight leading-[1.1]" style={{ fontFamily: "'Barlow', sans-serif" }}>
                        Chào mừng đến với <br/><span className="hero-headline-glow">ZDream</span>
                    </h2>
                    
                    <p className="text-lg text-white/70 leading-relaxed font-medium">
                        Nền tảng sáng tạo nghệ thuật được tiếp sức mạnh bởi AI. Bắt đầu hành trình thiết kế không giới hạn chỉ với một cú nhấp chuột.
                    </p>

                    <div className="flex items-center justify-center gap-6 mt-14">
                        {[
                            { color: "#8b5cf6", path: "M20 40 L40 20 L60 40 L40 60Z" },
                            { color: "#ec4899", circle: true },
                            { color: "#06b6d4", polygon: "40,15 65,55 15,55" },
                        ].map((shape, i) => (
                            <div
                                key={i}
                                className="w-14 h-14 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white/10 hover:-translate-y-2 transition-transform duration-500"
                            >
                                <svg viewBox="0 0 80 80" className="w-full h-full opacity-90">
                                    <rect width="80" height="80" rx="16" fill={shape.color} />
                                    {shape.circle ? (
                                        <circle cx="40" cy="40" r="16" fill="white" opacity="0.95" />
                                    ) : shape.polygon ? (
                                        <polygon points={shape.polygon} fill="white" opacity="0.95" />
                                    ) : (
                                        <path d={shape.path} fill="white" opacity="0.95" />
                                    )}
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ==== Right Panel - Login Container ==== */}
            <div className="flex-1 flex flex-col bg-[#0a0a0a] relative">
                
                {/* Top Nav (Mobile & Desktop) */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                    <Link to="/" className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300">
                        <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                        </div>
                        <span className="font-medium text-sm tracking-wide">Trang chủ</span>
                    </Link>

                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-2">
                        <Sparkles className="size-4 text-fuchsia-400" />
                        <span className="font-bold text-lg tracking-tight text-white" style={{ fontFamily: "'Barlow', sans-serif" }}>ZDream</span>
                    </div>
                </div>

                {/* Login Form Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10">
                    <div className="w-full max-w-md">
                        <div className="text-center sm:text-left mb-10">
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 text-white" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                Bắt đầu ngay
                            </h1>
                            <p className="text-base sm:text-lg text-white/60 font-medium font-sans">
                                Đăng nhập để lưu dự án và nhận <strong className="text-white">50 Kim Cương</strong> miễn phí.
                            </p>
                        </div>
                        
                        <div>
                            <a 
                                href={GOOGLE_REDIRECT} 
                                className="group relative flex items-center justify-center gap-3 w-full bg-white text-black h-14 rounded-[14px] text-[15px] font-bold transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:bg-neutral-50 hover:-translate-y-0.5 active:translate-y-0 font-sans"
                            >
                                <svg className="h-5 w-5 transition-transform group-hover:scale-110 duration-500" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Tiếp tục với Google
                            </a>

                            <div className="text-center mt-10 text-[13px] text-white/40 font-medium font-sans">
                                Bằng việc tiếp tục, bạn đồng ý với{" "}
                                <Link to="/terms" className="text-white/60 hover:text-white transition-colors underline underline-offset-4">Điều khoản dịch vụ</Link>
                                {" "}và{" "}
                                <Link to="/privacy" className="text-white/60 hover:text-white transition-colors underline underline-offset-4">Chính sách bảo mật</Link>
                                {" "}của chúng tôi.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

