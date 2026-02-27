"use client"

import Link from "next/link"
import { PlusCircle, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const recentLogos = [
  {
    id: "1",
    name: "TechFlow",
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="24" fill="#6366f1"/><path d="M30 60 L60 30 L90 60 L60 90Z" fill="white" opacity="0.9"/><circle cx="60" cy="60" r="12" fill="#6366f1"/></svg>`,
    date: "2 hours ago",
  },
  {
    id: "2",
    name: "GreenLeaf",
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="24" fill="#10b981"/><path d="M60 25 C40 45 35 75 60 95 C85 75 80 45 60 25Z" fill="white" opacity="0.9"/></svg>`,
    date: "Yesterday",
  },
  {
    id: "3",
    name: "Sunrise",
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="24" fill="#f59e0b"/><circle cx="60" cy="65" r="25" fill="white" opacity="0.9"/><rect x="55" y="30" width="10" height="15" rx="5" fill="white" opacity="0.7"/><rect x="30" y="55" width="15" height="10" rx="5" fill="white" opacity="0.7"/><rect x="75" y="55" width="15" height="10" rx="5" fill="white" opacity="0.7"/></svg>`,
    date: "3 days ago",
  },
]

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-scroll overflow-x-hidden">
      <div className="p-3 sm:p-4 md:p-6 max-w-5xl mx-auto">
        {/* Animated Hero CTA */}
        <div className="relative mb-8 sm:mb-12 group animate-in slide-in-from-bottom-4 fade-in duration-700">
          {/* Animated glow spread */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-purple-500/40 to-primary/40 rounded-[1.5rem] blur-xl opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />

          <Card className="relative overflow-hidden border-primary/20 bg-background/60 backdrop-blur-2xl rounded-2xl shadow-2xl">
            <CardContent className="p-0">
              <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-6 sm:p-10">
                {/* Moving background blobs */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-primary/20 rounded-full blur-[64px] animate-[pulse_4s_ease-in-out_infinite]" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[64px] animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />

                <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 shrink-0 shadow-inner">
                  <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary drop-shadow-md" />
                </div>

                <div className="relative flex-1 text-center sm:text-left z-10">
                  <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] tracking-tight">
                    Tạo nên <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">kiệt tác</span> tiếp theo
                  </h1>
                  <p className="text-balance text-muted-foreground mt-2 max-w-lg mx-auto sm:mx-0 leading-relaxed">
                    Mô tả thương hiệu của bạn, AI sẽ thiết kế logo sắc nét, độc đáo chỉ trong vài giây.
                  </p>
                </div>

                <Button asChild size="lg" className="relative z-10 gap-2 rounded-xl h-12 px-8 font-medium shadow-[0_0_20px_-5px_var(--color-primary)] hover:shadow-[0_0_30px_-5px_var(--color-primary)] transition-all duration-300 hover:-translate-y-0.5">
                  <Link href="/app/create">
                    <PlusCircle className="h-5 w-5" />
                    Bắt Đầu Ngay
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Logos */}
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150 fill-mode-both">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)] tracking-tight">
                Kho Lưu Trữ
              </h2>
              <Badge variant="outline" className="ml-1 border-primary/20 bg-primary/5">{recentLogos.length} logo</Badge>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary transition-colors gap-1.5 group">
              <Link href="/app/projects">
                Xem Tất Cả
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {recentLogos.map((logo, index) => (
              <Link key={logo.id} href={`/app/editor/${logo.id}`}>
                <Card
                  className="group cursor-pointer hover:border-primary/50 transition-all duration-300 overflow-hidden py-0 hover:-translate-y-1.5 hover:shadow-[0_10px_40px_-10px_rgba(var(--primary),0.2)] bg-card/50 backdrop-blur-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center p-6 sm:p-10 group-hover:scale-105 transition-transform duration-500 rounded-t-xl overflow-hidden">
                      <div
                        className="w-full h-full drop-shadow-xl group-hover:drop-shadow-2xl transition-all duration-500"
                        dangerouslySetInnerHTML={{ __html: logo.svg }}
                      />
                    </div>
                    <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-md relative z-10">
                      <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{logo.name}</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{logo.date}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile FAB */}
        <div className="sm:hidden fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+0.75rem)] right-4 z-40">
          <Button
            asChild
            size="lg"
            className="rounded-full h-14 w-14 shadow-xl shadow-primary/25 p-0"
          >
            <Link href="/app/create">
              <PlusCircle className="h-6 w-6" />
              <span className="sr-only">Tạo logo mới</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
