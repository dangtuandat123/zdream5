"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { AppLogo } from "@/components/app-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import api from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post('/login', { email, password })
      login(response.data.token, response.data.user)
      toast.success(response.data.message || 'Đăng nhập thành công')
      router.push("/app")
    } catch (error: any) {
      console.error(error)
      const msg = error.response?.data?.message || 'Lỗi đăng nhập, vui lòng kiểm tra lại.'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex bg-background">
      {/* Left Panel - Decorative (Desktop) */}
      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center max-w-md px-8">
          <div className="flex items-center justify-center mx-auto mb-8">
            <AppLogo size={64} />
          </div>
          <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-4">
            Chào mừng trở lại Slox
          </h2>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Tiếp tục thiết kế logo tuyệt đẹp với AI. Các dự án đang chờ bạn.
          </p>
          <div className="flex items-center justify-center gap-3 mt-10">
            {[
              `<svg viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#6366f1"/><path d="M20 40 L40 20 L60 40 L40 60Z" fill="white" opacity="0.9"/></svg>`,
              `<svg viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#10b981"/><circle cx="40" cy="40" r="18" fill="white" opacity="0.9"/></svg>`,
              `<svg viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#f59e0b"/><polygon points="40,18 58,55 22,55" fill="white" opacity="0.9"/></svg>`,
            ].map((svg, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-xl overflow-hidden shadow-lg"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6 sm:mb-8">
            <AppLogo size={32} />
            <span className="font-bold text-lg font-[family-name:var(--font-heading)]">
              Slox
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)] mb-1">
            Đăng nhập
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 text-justify">
            Nhập thông tin để truy cập tài khoản
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ban@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-11 rounded-xl text-justify"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">Mật khẩu</Label>
                <Link
                  href="#"
                  className="text-xs text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl pr-10 text-justify"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle password visibility</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">
                hoặc tiếp tục với
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button variant="outline" className="h-10 sm:h-11 rounded-xl gap-2 text-sm" type="button">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-10 sm:h-11 rounded-xl gap-2 text-sm" type="button">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-5 sm:mt-6 text-justify">
            {"Chưa có tài khoản? "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
