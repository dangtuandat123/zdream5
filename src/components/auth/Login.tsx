import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

const GOOGLE_REDIRECT = "/api/auth/google/redirect"

export function Login() {
    return (
        <div className="min-h-dvh flex relative items-center justify-center bg-black w-full overflow-hidden">
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
                    filter: blur(80px); 
                    animation: float-neon 12s ease-in-out infinite; 
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
            `}</style>
            
            {/* ---- Background Video ---- */}
            <div className="absolute inset-0 z-[0] bg-black">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.35] mix-blend-screen pointer-events-none"
                >
                    <source
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
                        type="video/mp4"
                    />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            </div>

            {/* ---- Aurora Orbs / Quầng sáng màu ---- */}
            <div className="aurora-orb z-[1] w-[400px] h-[400px] bg-violet-600/30" style={{ top: '10%', left: '15%', animationDelay: '0s' }} />
            <div className="aurora-orb z-[1] w-[350px] h-[350px] bg-fuchsia-600/25" style={{ top: '30%', right: '10%', animationDelay: '3s', animationDuration: '15s' }} />
            <div className="aurora-orb z-[1] w-[300px] h-[300px] bg-cyan-600/20" style={{ bottom: '15%', left: '40%', animationDelay: '6s', animationDuration: '18s' }} />

            <div className="relative z-10 w-full max-w-[420px] px-4" style={{ animation: 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center gap-3 cursor-pointer group">
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.3)] group-hover:scale-105 group-hover:bg-white/10 transition-all duration-500">
                            <Sparkles className="size-6 text-white group-hover:text-fuchsia-300 transition-colors duration-500" />
                        </div>
                        <span className="font-bold text-3xl tracking-tight text-white drop-shadow-lg" style={{ fontFamily: "'Barlow', sans-serif" }}>ZDream</span>
                    </Link>
                </div>

                <div className="relative rounded-[24px] p-[1px] overflow-hidden group shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/60 via-fuchsia-500/30 to-cyan-500/60 opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <Card className="relative border-0 bg-black/60 backdrop-blur-3xl overflow-hidden rounded-[23px] h-full w-full">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none"></div>
                        <CardHeader className="px-8 pt-10 pb-6 text-center relative z-10">
                            <CardTitle className="text-3xl font-extrabold tracking-tight mb-3 text-white" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                Bắt đầu <span className="gradient-text">sáng tạo</span>
                            </CardTitle>
                            <CardDescription className="text-white/60 text-[15px] font-medium leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                Đăng nhập để khởi tạo phép màu và nhận <strong className="text-white">50 💎</strong> phần thưởng chào mừng.
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="px-8 pb-10 relative z-10">
                            <a 
                                href={GOOGLE_REDIRECT} 
                                className="group/btn relative flex items-center justify-center gap-3 w-full bg-white text-black h-14 rounded-full text-[15px] font-bold transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_35px_rgba(255,255,255,0.3)] hover:scale-[1.03] active:scale-[0.98]"
                                style={{ fontFamily: "'Barlow', sans-serif" }}
                            >
                                <svg className="h-5 w-5 transition-transform group-hover/btn:scale-110 duration-500" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Tiếp tục với Google
                            </a>

                            <div className="text-center mt-8 text-[13px] text-white/40 font-medium" style={{ fontFamily: "'Barlow', sans-serif" }}>
                                Bằng việc đăng nhập, bạn xác nhận đồng ý với{" "}
                                <Link to="/terms" className="text-white/60 hover:text-white transition-colors underline underline-offset-4">Điều khoản</Link>
                                {" "}và{" "}
                                <Link to="/privacy" className="text-white/60 hover:text-white transition-colors underline underline-offset-4">Bảo mật</Link>
                                {" "}của ZDream.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

