import { Card, CardContent } from "@/components/ui/card"
import { showcaseLogos } from "@/lib/constants"
export function Showcase() {
    // The base repeating unit for the marquee (3 copies of logos to ensure it spans ultra-wide screens even once)
    const baseMarquee = [...showcaseLogos, ...showcaseLogos, ...showcaseLogos];

    return (
        <section id="showcase" className="min-h-[100dvh] w-full shrink-0 flex flex-col justify-center py-16 sm:py-24 bg-muted/10 border-t border-border/50 overflow-hidden relative">

            {/* Ambient background glow for showcase */}
            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 mb-12 sm:mb-20">
                <div className="text-center">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-[family-name:var(--font-heading)] text-balance mb-6">
                        Sản phẩm từ cộng đồng
                    </h2>
                    <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
                        Tham gia cùng hàng ngàn nhà sáng tạo đang tạo nên những bộ nhận diện thương hiệu tuyệt đẹp mỗi ngày.
                    </p>
                </div>
            </div>

            {/* Marquee Container */}
            <div className="relative flex flex-col gap-6 w-[110%] -left-[5%] -rotate-2 scale-[1.05]">

                {/* Fade edges to trick the eye into seeing infinite scroll */}
                <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                {/* Seamless Infinite Marquee Line */}
                <div className="flex w-max animate-[marquee_40s_linear_infinite]">
                    {/* First Half */}
                    <div className="flex gap-4 sm:gap-6 pr-4 sm:pr-6">
                        {baseMarquee.map((svg, i) => (
                            <Card key={`l1-a-${i}`} className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 shrink-0 overflow-hidden bg-white/5 backdrop-blur-md border-border/30 shadow-xl">
                                <CardContent className="p-0 h-full flex items-center justify-center">
                                    <div className="w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 shrink-0" dangerouslySetInnerHTML={{ __html: svg }} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {/* Second Half (Exact Duplicate) */}
                    <div className="flex gap-4 sm:gap-6 pr-4 sm:pr-6" aria-hidden="true">
                        {baseMarquee.map((svg, i) => (
                            <Card key={`l1-b-${i}`} className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 shrink-0 overflow-hidden bg-white/5 backdrop-blur-md border-border/30 shadow-xl">
                                <CardContent className="p-0 h-full flex items-center justify-center">
                                    <div className="w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 shrink-0" dangerouslySetInnerHTML={{ __html: svg }} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    )
}
