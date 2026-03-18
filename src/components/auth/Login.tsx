import { Sparkles, Wand2, Cpu } from "lucide-react"

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
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 text-white bg-zinc-950">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover pointer-events-none z-0 mix-blend-luminosity opacity-30 hover:opacity-70 transition-opacity duration-1000"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
        />
        {/* Decorative ambient glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10 pointer-events-none"></div>
        
        {/* Top bar on video side */}
        <div className="relative z-20 flex items-center gap-2 font-bold text-lg tracking-tight">
           <Sparkles className="h-5 w-5 text-primary" /> ZDream Studio
        </div>

        {/* Bottom content on video side */}
        <div className="relative z-20 mt-auto flex flex-col gap-6 max-w-lg mb-4">
          <div className="flex flex-wrap gap-3 mb-2">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-medium text-sm text-white backdrop-blur-md">
               <Wand2 className="mr-2 h-4 w-4 text-primary" />
               Mô hình AI Thế hệ 2.0
            </div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-medium text-sm text-white backdrop-blur-md">
               <Cpu className="mr-2 h-4 w-4 text-emerald-400" />
               Hỗ trợ Render 4K
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-[1.15] tracking-tight text-balance">
            Kiến tạo vũ trụ thị giác <br/> <span className="text-primary italic font-serif" style={{ fontWeight: 400 }}>đầy mê hoặc.</span>
          </h2>
          
          <p className="text-zinc-400 text-lg leading-relaxed">
            Vượt qua mọi giới hạn của trí tưởng tượng. Nhào nặn các tác phẩm nghệ thuật, concept đồ họa siêu thực chỉ với vài dòng mô tả ngắn.
          </p>
          
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 mt-2">
             <div>
                <h4 className="text-3xl font-bold text-white mb-1 tracking-tight">10<span className="text-primary">+</span></h4>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Phong Cách</p>
             </div>
             <div>
                <h4 className="text-3xl font-bold text-white mb-1 tracking-tight">1.2<span className="text-primary">M</span></h4>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Tác Phẩm</p>
             </div>
             <div>
                <h4 className="text-3xl font-bold text-white mb-1 tracking-tight">∞</h4>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Tiềm Năng</p>
             </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
