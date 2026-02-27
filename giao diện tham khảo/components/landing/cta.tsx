"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export function Cta() {
    return (
        <div className="flex-1 w-full flex flex-col justify-center py-20 sm:py-32 bg-background relative overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 animate-gradient bg-300%" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center relative z-10">
                <Badge className="mb-6 font-semibold py-1.5 px-4 bg-primary/10 text-primary border-primary/20 backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5 mr-2 inline" />
                    Bắt Đầu Sáng Tạo Ngay
                </Badge>

                <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold font-[family-name:var(--font-heading)] text-balance mb-6 text-foreground tracking-tight">
                    Thiết kế logo <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">dễ dàng.</span>
                </h2>
                <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto tracking-normal">
                    Hàng ngàn nhà sáng lập đã tạo ra logo tuyệt đẹp chỉ trong vài giây. Tới lượt bạn.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
                    <Button size="lg" className="w-full h-14 text-lg font-bold shadow-[0_0_30px_-5px_var(--color-primary)] hover:shadow-[0_0_40px_-5px_var(--color-primary)] hover:-translate-y-1 transition-all">
                        Bắt Đầu Miễn Phí
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-6 font-medium">
                    Không cần thẻ. Tặng 5 logo chất lượng cao khi đăng ký.
                </p>
            </div>
        </div>
    )
}
