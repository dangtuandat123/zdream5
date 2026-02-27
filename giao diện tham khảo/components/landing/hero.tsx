import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { showcaseLogos } from "@/lib/constants"

export function Hero() {
    return (
        <section className="min-h-[100dvh] w-full shrink-0 flex flex-col justify-center relative overflow-hidden bg-background">
            {/* Massive Ambient Glow Base */}
            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-[pulse_8s_ease-in-out_infinite]" />
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite]" style={{ animationDelay: '3s' }} />

            {/* Decorative Floating SVGs with Advanced 3D Animations */}
            <div className="absolute top-[12%] left-[5%] md:top-[15%] md:left-[10%] w-16 h-16 md:w-28 md:h-28 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-[0_20px_40px_-15px_rgba(255,123,0,0.3)] animate-float-3d opacity-90 flex items-center justify-center transform-gpu">
                <div className="w-full h-full drop-shadow-2xl" dangerouslySetInnerHTML={{ __html: showcaseLogos[0] }} />
            </div>

            <div className="absolute top-[18%] right-[2%] md:top-[15%] md:right-[5%] xl:top-[20%] xl:right-[12%] w-20 h-20 md:w-36 md:h-36 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-[2rem] p-4 md:p-5 shadow-[0_20px_40px_-15px_rgba(0,242,254,0.3)] animate-float-3d-reverse opacity-95 flex items-center justify-center z-20 transform-gpu" style={{ animationDelay: '1.5s' }}>
                <div className="w-full h-full drop-shadow-2xl" dangerouslySetInnerHTML={{ __html: showcaseLogos[1] }} />
            </div>

            <div className="absolute bottom-[22%] left-[8%] md:bottom-[20%] md:left-[15%] w-16 h-16 md:w-32 md:h-32 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full p-3 md:p-6 shadow-[0_20px_40px_-15px_rgba(161,140,209,0.3)] animate-float-3d opacity-85 flex items-center justify-center transform-gpu" style={{ animationDelay: '2s' }}>
                <div className="w-full h-full drop-shadow-2xl" dangerouslySetInnerHTML={{ __html: showcaseLogos[2] }} />
            </div>

            <div className="absolute bottom-[28%] right-[5%] md:bottom-[25%] md:right-[10%] w-14 h-14 md:w-24 md:h-24 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl md:rounded-2xl p-2 md:p-4 shadow-[0_20px_40px_-15px_rgba(246,211,101,0.3)] animate-float-3d-reverse opacity-90 flex items-center justify-center transform-gpu" style={{ animationDelay: '0.8s' }}>
                <div className="w-full h-full drop-shadow-2xl" dangerouslySetInnerHTML={{ __html: showcaseLogos[3] }} />
            </div>

            <div className="absolute top-[35%] left-[2%] md:top-[40%] md:left-[4%] w-12 h-12 md:w-20 md:h-20 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl md:rounded-2xl p-2 md:p-3 shadow-[0_20px_40px_-15px_rgba(79,172,254,0.3)] animate-float-3d opacity-75 hidden sm:flex items-center justify-center transform-gpu" style={{ animationDelay: '2.5s' }}>
                <div className="w-full h-full drop-shadow-2xl" dangerouslySetInnerHTML={{ __html: showcaseLogos[5] }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10 w-full flex flex-col items-center">

                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter font-[family-name:var(--font-heading)] text-balance max-w-6xl mx-auto leading-[0.95] text-foreground animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both">
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-500 to-pink-500 animate-gradient bg-300%">Logo</span> hoàn hảo <br className="hidden md:block" /> trong 10 giây.
                </h1>

                <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mt-8 max-w-3xl mx-auto text-pretty leading-snug animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400 fill-mode-both font-medium">
                    Sắc nét. Chuyên nghiệp. Tối ưu chi phí.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600 fill-mode-both">
                    <Button size="lg" asChild className="group h-16 px-10 rounded-2xl text-lg font-bold w-full sm:w-auto shadow-[0_0_40px_-10px_var(--color-primary)] hover:shadow-[0_0_60px_-10px_var(--color-primary)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        <Link href="/register">
                            <span className="relative z-10 flex items-center gap-3">
                                Bắt Đầu Miễn Phí
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="h-16 px-10 rounded-2xl text-lg font-bold w-full sm:w-auto bg-card/40 backdrop-blur-md border-border/60 hover:bg-muted/60 transition-all duration-300 hover:-translate-y-1 shadow-xl">
                        <Link href="#features">Tìm Hiểu Thêm</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
