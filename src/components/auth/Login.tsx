import { Link } from "react-router-dom"
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react"

const GOOGLE_REDIRECT = "/api/auth/google/redirect"

export function Login() {
    return (
        <div className="min-h-dvh flex flex-col relative items-center justify-center bg-black w-full overflow-hidden font-['Barlow']">
            <style>{`
                @keyframes float-neon {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(30px, -40px) scale(1.1); }
                    50% { transform: translate(-20px, -60px) scale(0.95); }
                    75% { transform: translate(-30px, -20px) scale(1.05); }
                }
                .aurora-orb { 
                    position: absolute; 
                    border-radius: 50%; 
                    filter: blur(90px); 
                    animation: float-neon 15s ease-in-out infinite; 
                    pointer-events: none; 
                }
                .gradient-text {
                    background: linear-gradient(90deg, #a78bfa, #f472b6, #60a5fa, #34d399, #fbbf24, #a78bfa);
                    background-size: 300% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: color-shift 6s ease-in-out infinite;
                }
                @keyframes color-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
            `}</style>
            
            {/* ---- Background Video & Overlay ---- */}
            <div className="absolute inset-0 z-[0] bg-black">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.4] mix-blend-lighten pointer-events-none"
                >
                    <source
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
                        type="video/mp4"
                    />
                </video>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none"></div>
            </div>

            {/* ---- Aurora Orbs ---- */}
            <div className="aurora-orb z-[1] w-[500px] h-[500px] bg-violet-600/20" style={{ top: '-10%', left: '-10%', animationDelay: '0s' }} />
            <div className="aurora-orb z-[1] w-[400px] h-[400px] bg-fuchsia-600/20" style={{ bottom: '-10%', right: '-10%', animationDelay: '3s', animationDuration: '18s' }} />
            <div className="aurora-orb z-[1] w-[600px] h-[600px] bg-cyan-600/10" style={{ top: '40%', left: '50%', transform: 'translate(-50%, -50%)', animationDelay: '5s', animationDuration: '20s' }} />

            {/* ---- Top Navigation Bar (UX fixed) ---- */}
            <div className="absolute top-0 left-0 w-full p-6 sm:p-10 z-20 flex justify-between items-center" style={{ animation: 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both' }}>
                <Link to="/" className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors duration-300">
                    <div className="size-10 sm:size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-white/10 group-hover:border-white/20 transition-all shadow-lg">
                        <ArrowLeft className="size-4 sm:size-5 transition-transform group-hover:-translate-x-1" />
                    </div>
                    <span className="font-semibold text-sm sm:text-base tracking-wide uppercase">Trang chủ</span>
                </Link>
                
                <div className="flex items-center gap-2">
                    <Sparkles className="size-5 sm:size-6 text-fuchsia-400" />
                    <span className="font-black text-xl sm:text-2xl tracking-tight text-white drop-shadow-md">ZDream</span>
                </div>
            </div>

            {/* ---- Immersive Central Content (No Card) ---- */}
            <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4" style={{ animation: 'fade-up 1s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>
                <div className="text-center max-w-3xl mx-auto mix-blend-lighten">
                    <h1 className="text-[clamp(48px,8vw,96px)] font-black text-white leading-[1.05] tracking-tighter mb-6 drop-shadow-2xl">
                        Khai phá <span className="gradient-text">tưởng tượng</span>
                    </h1>
                    
                    <p className="text-white/60 text-[clamp(16px,2vw,22px)] font-medium leading-relaxed mb-12 max-w-xl mx-auto drop-shadow-md">
                        Đăng nhập ngay để giải phóng sức mạnh AI. Không cần mật khẩu. Nhận liền <strong className="text-white">50 Kim Cương</strong> cho tác phẩm đầu tiên của bạn.
                    </p>
                    
                    <div className="flex flex-col items-center gap-8">
                        <a href={GOOGLE_REDIRECT} className="group relative block w-full sm:w-auto">
                            {/* Glowing aura under button */}
                            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 opacity-50 blur-xl group-hover:opacity-100 transition-opacity duration-700" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}></div>
                            
                            {/* Button itself */}
                            <div className="relative flex items-center justify-center gap-4 bg-black/40 backdrop-blur-2xl border border-white/20 px-8 sm:px-12 py-5 sm:py-6 rounded-full hover:bg-black/60 hover:border-white/40 transition-all duration-300 transform group-hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:rotate-[360deg] duration-1000 ease-in-out" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-white font-black text-lg sm:text-xl tracking-wide">Tiếp tục bằng Google</span>
                                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>
                        </a>

                        <div className="flex flex-col items-center gap-2">
                            <p className="text-white/30 text-xs sm:text-sm font-medium tracking-wide">
                                An toàn • Nhanh chóng • Không cần mật khẩu
                            </p>
                            <p className="text-white/20 text-[11px] font-medium max-w-xs text-center">
                                Bằng cách tiếp tục, bạn đồng ý với <Link to="/terms" className="hover:text-white transition-colors underline">Điều khoản</Link> và <Link to="/privacy" className="hover:text-white transition-colors underline">Bảo mật</Link> của chúng tôi
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* ---- Bottom fade for aesthetic depth ---- */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[5] pointer-events-none"></div>
        </div>
    )
}

