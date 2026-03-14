import { Link } from "react-router-dom"
import { AppLogo } from "@/components/app-logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const GOOGLE_REDIRECT = "/api/auth/google/redirect"

export function Login() {
    return (
        <div className="min-h-dvh flex bg-background w-full">
            {/* Left Panel - Decorative (Desktop) */}
            <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
                    <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                </div>
                <div className="relative text-center max-w-md px-8 z-10">
                    <Link to="/" className="flex items-center justify-center mx-auto mb-8 cursor-pointer transform hover:scale-105 transition-transform duration-300">
                        <AppLogo size={80} />
                    </Link>
                    <h2 className="text-4xl font-bold mb-6 tracking-tight">
                        Chào mừng đến với Slox
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Nền tảng thiết kế Logo được tiếp sức mạnh bởi AI. Bắt đầu sáng tạo không giới hạn chỉ với một cú nhấp chuột.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-12">
                        {[
                            { color: "#6366f1", path: "M20 40 L40 20 L60 40 L40 60Z" },
                            { color: "#10b981", circle: true },
                            { color: "#f59e0b", polygon: "40,18 58,55 22,55" },
                        ].map((shape, i) => (
                            <div
                                key={i}
                                className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-transform duration-300"
                            >
                                <svg viewBox="0 0 80 80" className="w-full h-full">
                                    <rect width="80" height="80" rx="16" fill={shape.color} />
                                    {shape.circle ? (
                                        <circle cx="40" cy="40" r="18" fill="white" opacity="0.9" />
                                    ) : shape.polygon ? (
                                        <polygon points={shape.polygon} fill="white" opacity="0.9" />
                                    ) : (
                                        <path d={shape.path} fill="white" opacity="0.9" />
                                    )}
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Login */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
                {/* Mobile Header */}
                <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2 cursor-pointer">
                        <AppLogo size={32} />
                        <span className="font-bold text-xl tracking-tight">Slox</span>
                    </Link>
                </div>

                <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0 pb-8 text-center sm:text-left">
                        <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                            Bắt đầu ngay
                        </CardTitle>
                        <CardDescription className="text-base sm:text-lg">
                            Đăng nhập để lưu dự án và nhận 50 Kim Cương miễn phí.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-0">
                        <a 
                            href={GOOGLE_REDIRECT} 
                            className="group relative flex items-center justify-center gap-3 w-full bg-white text-black border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 h-14 rounded-xl text-lg font-medium transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <svg className="h-6 w-6 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Tiếp tục với Google
                            
                            <div className="absolute inset-0 rounded-xl ring-2 ring-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </a>

                        <div className="text-center mt-8 text-sm text-muted-foreground">
                            Bằng việc tiếp tục, bạn đồng ý với{" "}
                            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">Điều khoản dịch vụ</a>
                            {" "}và{" "}
                            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">Chính sách bảo mật</a>
                            {" "}của chúng tôi.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
