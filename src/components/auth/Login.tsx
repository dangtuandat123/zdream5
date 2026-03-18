import { Sparkles, Quote } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background text-foreground">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground group-hover:opacity-90 transition-opacity">
              <Sparkles className="h-4 w-4" />
            </div>
            ZDream
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 text-white">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover pointer-events-none z-0"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10 pointer-events-none"></div>
        
        {/* Top bar on video side */}
        <div className="relative z-20 flex items-center gap-2 font-bold text-lg tracking-tight">
           <Sparkles className="h-5 w-5 text-primary" /> ZDream Studio
        </div>

        {/* Bottom content on video side */}
        <div className="relative z-20 mt-auto flex flex-col gap-6 max-w-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md mb-2">
            <Quote className="h-5 w-5 text-white/90" fill="currentColor" />
          </div>
          <blockquote className="space-y-4">
            <p className="text-3xl font-bold leading-tight text-white/95">
              "Công cụ tuyệt đỉnh giúp tôi biến kịch bản ý tưởng thành các nhân vật và bối cảnh chân thực chỉ trong vài giây."
            </p>
            <footer className="flex items-center gap-4 pt-2">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" 
                alt="Avatar" 
                className="w-12 h-12 rounded-full border-2 border-primary/50 object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-white">Minh Ngọc</span>
                <span className="text-sm text-white/70">Art Director @ CreativeLab</span>
              </div>
            </footer>
          </blockquote>
        </div>
        
      </div>
    </div>
  )
}
