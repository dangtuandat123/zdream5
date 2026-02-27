import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Check } from "lucide-react"
import { AppLogo } from "@/components/app-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

const passwordReqs = [
    { label: "Ít nhất 8 ký tự", test: (p: string) => p.length >= 8 },
    { label: "Chứa chữ in hoa", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Chứa chữ số", test: (p: string) => /[0-9]/.test(p) },
]

export function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            login()
            navigate('/app/dashboard')
        }, 1500)
    }

    return (
        <div className="min-h-dvh flex bg-background w-full">
            {/* Left Panel - Decorative (Desktop) */}
            <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
                </div>
                <div className="relative text-center max-w-md px-8">
                    <Link to="/" className="flex items-center justify-center mx-auto mb-8 cursor-pointer">
                        <AppLogo size={64} />
                    </Link>
                    <h2 className="text-3xl font-bold mb-4">
                        Bắt đầu sáng tạo cùng Slox
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Gia nhập cộng đồng hàng ngàn nhà sáng tạo thiết kế thương hiệu bằng AI.
                    </p>
                    <div className="mt-10 space-y-3 text-left max-w-xs mx-auto">
                        {[
                            "Tạo logo trong vài giây",
                            "Chỉnh sửa bằng câu lệnh",
                            "Xuất file SVG sắc nét",
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 shrink-0">
                                    <Check className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <Card className="w-full max-w-sm border-0 shadow-none">
                    <CardHeader className="px-0">
                        {/* Mobile Logo */}
                        <Link to="/" className="lg:hidden flex items-center gap-2 mb-4 cursor-pointer">
                            <AppLogo size={32} />
                            <span className="font-bold text-lg">Slox</span>
                        </Link>
                        <CardTitle className="text-xl sm:text-2xl">Tạo tài khoản</CardTitle>
                        <CardDescription>Khởi đầu hoàn toàn miễn phí</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Họ và Tên</Label>
                                <Input
                                    id="name"
                                    placeholder="Nguyễn Văn A"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ban@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Tạo mật khẩu an toàn"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pr-10"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">Toggle password visibility</span>
                                    </Button>
                                </div>
                                {password.length > 0 && (
                                    <div className="mt-2 space-y-1.5">
                                        {passwordReqs.map((req) => (
                                            <div key={req.label} className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0",
                                                        req.test(password) ? "bg-primary" : "bg-muted"
                                                    )}
                                                >
                                                    {req.test(password) && (
                                                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                                    )}
                                                </div>
                                                <span
                                                    className={cn(
                                                        "text-xs transition-colors",
                                                        req.test(password)
                                                            ? "text-foreground"
                                                            : "text-muted-foreground"
                                                    )}
                                                >
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-background px-3 text-xs text-muted-foreground">
                                    hoặc tiếp tục với
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" type="button">
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </Button>
                            <Button variant="outline" type="button">
                                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col px-0 gap-3">
                        <p className="text-sm text-muted-foreground">
                            Đã có tài khoản?{" "}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Đăng nhập
                            </Link>
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
                            Bằng việc đăng ký, bạn đồng ý với{" "}
                            <span className="underline hover:text-foreground cursor-pointer">Điều Khoản</span>{" "}
                            và{" "}
                            <span className="underline hover:text-foreground cursor-pointer">Chính Sách Bảo Mật</span>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
