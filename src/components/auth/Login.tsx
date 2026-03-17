import { Link } from "react-router-dom"
import { ArrowLeft, Sparkles } from "lucide-react"
import { LoginForm } from "@/components/login-form"

export function Login() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2 bg-background text-foreground">
            {/* ==== Left Panel - Form Container (login-02 standard) ==== */}
            <div className="flex flex-col gap-4 p-6 md:p-10 relative z-10">
                {/* Back to Home & Logo Header */}
                <div className="flex justify-between items-center md:justify-start">
                    <Link to="/" className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300">
                        <div className="size-8 rounded-full bg-secondary border border-border flex items-center justify-center group-hover:bg-secondary/80 transition-colors">
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                        </div>
                        <span className="font-medium text-sm tracking-wide hidden md:inline-block">Trang chủ</span>
                    </Link>

                    {/* Mobile Logo */}
                    <div className="flex md:hidden items-center gap-2 ml-auto">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <Sparkles className="size-4" />
                        </div>
                        <span className="font-bold tracking-tight">ZDream</span>
                    </div>
                </div>

                {/* Form area */}
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm">
                        <LoginForm />
                        <div className="mt-8 text-center text-[13px] text-muted-foreground font-medium font-sans px-4">
                            Bằng việc tiếp tục, bạn đồng ý với{" "}
                            <Link to="/terms" className="hover:text-foreground transition-colors underline underline-offset-4">Điều khoản dịch vụ</Link>
                            {" "}và{" "}
                            <Link to="/privacy" className="hover:text-foreground transition-colors underline underline-offset-4">Chính sách bảo mật</Link>
                            {" "}của chúng tôi.
                        </div>
                    </div>
                </div>
            </div>

            {/* ==== Right Panel - Decorative Hero (login-02 standard) ==== */}
            <div className="relative hidden lg:flex bg-muted flex-col items-center justify-center overflow-hidden">
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
                
                {/* Background Video */}
                <div className="absolute inset-0 z-[0] bg-black">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-[0.5] mix-blend-screen pointer-events-none grayscale-[20%]"
                    >
                        <source
                            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
                            type="video/mp4"
                        />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-black/80"></div>
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

                    <h2 className="text-5xl font-black mb-6 tracking-tight leading-[1.1] text-white" style={{ fontFamily: "'Barlow', sans-serif" }}>
                        Chào mừng đến với <br/><span className="hero-headline-glow">ZDream</span>
                    </h2>
                    
                    <p className="text-lg text-white/70 leading-relaxed font-medium">
                        Nền tảng sáng tạo nghệ thuật được tiếp sức mạnh bởi AI. Bắt đầu hành trình thiết kế không giới hạn chỉ với một cú nhấp chuột.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6 mt-14">
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
        </div>
    )
}

