import { Sparkles, Gem, Star, Wand2, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const GOOGLE_REDIRECT = "/api/auth/google/redirect"

// Mảng ảnh showcase để hiển thị trên bên phải (gallery minh hoạ)
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
        <div className="relative min-h-svh w-full bg-background text-foreground overflow-hidden">

            {/* ========== NỀN VIDEO TOÀN TRANG ========== */}
            <video
                autoPlay loop muted playsInline
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
            />
            {/* Overlay tối mịn để chữ dễ đọc */}
            <div className="absolute inset-0 bg-background/80 z-0" />

            {/* ========== NỘI DUNG CHÍNH ========== */}
            <div className="relative z-10 min-h-svh flex flex-col">

                {/* Navbar nhỏ */}
                <nav className="w-full px-6 md:px-10 py-5 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:opacity-90 transition-opacity">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        ZDream
                    </a>
                </nav>

                {/* Vùng trung tâm */}
                <div className="flex-1 flex items-center justify-center px-6 md:px-10 py-10">
                    <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* ============ CỘT TRÁI: Form đăng nhập ============ */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-md mx-auto lg:mx-0">
                            {/* Badge thể hiện thương hiệu */}
                            <Badge variant="secondary" className="mb-6 py-1.5 px-4 text-sm">
                                <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" /> Nền tảng sáng tạo AI
                            </Badge>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-balance leading-tight">
                                Biến ý tưởng thành{" "}
                                <span className="text-primary">tác phẩm</span>
                            </h1>

                            <p className="text-muted-foreground text-base sm:text-lg mb-10 text-balance leading-relaxed max-w-sm">
                                Đăng nhập để khám phá thế giới sáng tạo nghệ thuật AI không giới hạn cùng cộng đồng hơn 50 nghìn người dùng.
                            </p>

                            {/* Nút Google Login — nền trắng nổi bật */}
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto h-14 px-10 text-base font-semibold bg-white text-black border-white/20 hover:bg-slate-50 hover:text-black shadow-lg shadow-white/5 transition-all duration-200"
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

                            <Separator className="my-8 w-full max-w-xs bg-border/50" />

                            {/* Social proof nhỏ bên dưới */}
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2.5">
                                    <Avatar className="h-9 w-9 border-2 border-background">
                                        <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop&crop=face" />
                                        <AvatarFallback>U1</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="h-9 w-9 border-2 border-background">
                                        <AvatarImage src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop&crop=face" />
                                        <AvatarFallback>U2</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="h-9 w-9 border-2 border-background">
                                        <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop&crop=face" />
                                        <AvatarFallback>U3</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex flex-col text-left">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-0.5">50K+ nhà sáng tạo yêu thích</span>
                                </div>
                            </div>
                        </div>

                        {/* ============ CỘT PHẢI: Gallery nghệ thuật ============ */}
                        <div className="hidden lg:block">
                            {/* Lưới ảnh masonry-style */}
                            <div className="grid grid-cols-3 gap-3">
                                {SHOWCASE_IMAGES.map((src, index) => (
                                    <Card
                                        key={index}
                                        className={`overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 ${index % 3 === 1 ? 'translate-y-6' : ''}`}
                                    >
                                        <CardContent className="p-0">
                                            <div className={`relative ${index % 2 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}>
                                                <img
                                                    src={src}
                                                    alt={`AI Art ${index + 1}`}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Card thống kê nổi phía dưới gallery */}
                            <Card className="mt-4 glass-panel">
                                <CardContent className="p-4 flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <Wand2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">1.2M+ ảnh được tạo</p>
                                            <p className="text-xs text-muted-foreground">Bởi cộng đồng ZDream</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <Gem className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">50 Kim Cương</p>
                                            <p className="text-xs text-muted-foreground">Miễn phí khi đăng ký</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <ImageIcon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">12+ kiểu mẫu</p>
                                            <p className="text-xs text-muted-foreground">Phong cách đa dạng</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>

                {/* Footer nhỏ */}
                <footer className="w-full px-6 md:px-10 py-5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>© 2026 ZDream. All rights reserved.</span>
                    <a href="/" className="hover:text-foreground transition-colors">Quay lại trang chủ</a>
                </footer>

            </div>
        </div>
    )
}
