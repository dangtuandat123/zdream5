import { Link } from "react-router-dom"
import { ArrowLeft, Sparkles } from "lucide-react"

const GOOGLE_REDIRECT = "/api/auth/google/redirect"

export function Login() {
    return (
        <div className="min-h-dvh flex flex-col relative items-center justify-center bg-black w-full overflow-hidden text-white/90">
            <style>{`
                @keyframes float-subtle {
                    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
                    50% { transform: translateY(-10px) scale(1.05); opacity: 0.6; }
                }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
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

            {/* ---- Background Video & Ambient Light ---- */}
            <div className="absolute inset-0 z-[0] bg-black">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.35] mix-blend-screen pointer-events-none grayscale-[20%]"
                >
                    <source
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
                        type="video/mp4"
                    />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)] pointer-events-none"></div>
            </div>

            {/* ---- Subtle Ambient Orbs ---- */}
            <div className="ambient-orb z-[1] w-[400px] h-[400px] bg-violet-600/20" style={{ top: '10%', left: '20%' }} />
            <div className="ambient-orb z-[1] w-[350px] h-[350px] bg-indigo-600/15" style={{ bottom: '20%', right: '15%', animationDuration: '14s' }} />

            {/* ---- Top Navigation Bar (Matches LandingPage scale) ---- */}
            <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl transition-all duration-500`}>
                <div className={`flex items-center justify-between backdrop-blur-xl rounded-2xl px-5 py-2.5 bg-black/40 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]`}>
                    <Link to="/" className="flex items-center gap-2 group cursor-pointer">
                        <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <ArrowLeft className="size-4 text-white group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="text-[15px] font-medium tracking-wide text-white/80 group-hover:text-white transition-colors uppercase">
                            Trang chủ
                        </span>
                    </Link>
                    
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="size-8 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center">
                            <Sparkles className="size-4 text-fuchsia-300" />
                        </div>
                        <span className="text-[17px] font-bold tracking-tight text-white" style={{ fontFamily: "'Barlow', sans-serif" }}>
                            ZDream
                        </span>
                    </div>
                </div>
            </nav>

            {/* ---- Main Content ---- */}
            <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-6" style={{ animation: 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both 0.1s' }}>
                <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-xl">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-violet-200">Khai mở sáng tạo</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-6 drop-shadow-2xl" style={{ fontFamily: "'Barlow', sans-serif" }}>
                        Bắt đầu <span className="hero-headline-glow">tưởng tượng</span>
                    </h1>
                    
                    <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed mb-10 max-w-lg mx-auto">
                        Truy cập ZDream không cần mật khẩu. Nhận ngay <strong className="text-white">50 Kim Cương</strong> để khởi tạo tác phẩm đầu tiên của bạn.
                    </p>
                    
                    <div className="flex flex-col items-center w-full max-w-sm gap-6">
                        <a 
                            href={GOOGLE_REDIRECT} 
                            className="group relative flex items-center justify-center gap-3 w-full bg-white text-black px-6 py-4 rounded-[16px] text-base font-bold transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Tiếp tục với Google
                        </a>

                        <p className="text-white/30 text-xs font-medium max-w-xs text-center leading-relaxed">
                            Bằng cách tiếp tục, bạn đồng ý với{" "}
                            <Link to="/terms" className="text-white/50 hover:text-white transition-colors underline underline-offset-4">Điều khoản</Link>
                            {" "}và{" "}
                            <Link to="/privacy" className="text-white/50 hover:text-white transition-colors underline underline-offset-4">Bảo mật</Link>
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-[5] pointer-events-none"></div>
        </div>
    )
}

