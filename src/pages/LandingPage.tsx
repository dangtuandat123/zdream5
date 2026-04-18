import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from "framer-motion"
import Lenis from "lenis"
import CinematicShowcase from "@/components/landing/CinematicShowcase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    ArrowUpRight,
    Sparkles,
    WandSparkles,
    Gem,
    Star,
    CheckCircle2,
    Palette,

    ChevronUp,
    Menu,

    Download,
    ArrowRight,
    ArrowUp,
    ImageIcon,
    Settings2,
    History,
    Square,
    RectangleHorizontal,
    RectangleVertical,
    Monitor,
    X,
    ZoomIn,
} from "lucide-react"

// ============================================================
// DATA
// ============================================================

const MONTHLY_PLANS = [
    {
        name: "Miễn Phí",
        price: "0đ",
        period: "/tháng",
        gems: "50",
        features: ["50 Kim Cương/tháng", "Mô hình cơ bản", "Xuất ảnh HD", "Thư viện cá nhân"],
        cta: "Bắt Đầu Ngay",
        popular: false,
    },
    {
        name: "Pro",
        price: "199K",
        period: "/tháng",
        gems: "500",
        features: ["500 Kim Cương/tháng", "Tất cả mô hình AI", "Xuất ảnh 4K", "Ưu tiên hàng đợi", "Không giới hạn kiểu mẫu"],
        cta: "Nâng Cấp Pro",
        popular: true,
    },
    {
        name: "Unlimited",
        price: "499K",
        period: "/tháng",
        gems: "∞",
        features: ["Không giới hạn Kim Cương", "API Access", "Xuất ảnh 4K+", "Hỗ trợ ưu tiên", "Tất cả tính năng Pro"],
        cta: "Liên Hệ",
        popular: false,
    },
]

const YEARLY_PLANS = [
    {
        name: "Miễn Phí",
        price: "0đ",
        period: "/năm",
        gems: "600",
        features: ["600 Kim Cương/năm", "Mô hình cơ bản", "Xuất ảnh HD", "Thư viện cá nhân"],
        cta: "Bắt Đầu Ngay",
        popular: false,
    },
    {
        name: "Pro",
        price: "1.99M",
        period: "/năm",
        gems: "6000",
        features: ["6000 Kim Cương/năm", "Tất cả mô hình AI", "Xuất ảnh 4K", "Ưu tiên hàng đợi", "Tiết kiệm 20% so với tháng"],
        cta: "Nâng Cấp Pro",
        popular: true,
    },
    {
        name: "Unlimited",
        price: "4.99M",
        period: "/năm",
        gems: "∞",
        features: ["Không giới hạn Kim Cương", "API Access", "Xuất ảnh 4K+", "Hỗ trợ ưu tiên", "Tất cả tính năng Pro"],
        cta: "Liên Hệ",
        popular: false,
    },
]


const HERO_IMAGES = [
    { src: "/assets/wow_1.png", label: "Sinh vật biển Neon" },
    { src: "/assets/real_1.png", label: "Chân dung Cyberpunk" },
    { src: "/assets/wow_2.png", label: "Cây thần thoại" },
    { src: "/assets/real_2.png", label: "Nhiếp ảnh Levitating" },
    { src: "/assets/wow_3.png", label: "Android Geisha" },
    { src: "/assets/real_3.png", label: "Kiến trúc siêu thực" },
    { src: "/assets/wow_4.png", label: "Tiểu vũ trụ" },
    { src: "/assets/real_4.png", label: "Macro thiên nhiên" },
]


const TESTIMONIALS = [
    {
        name: "Minh Ngọc",
        role: "Art Director @ CreativeLab",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop&crop=face",
        quote: "ZDream đã thay đổi hoàn toàn quy trình thiết kế của chúng tôi. Việc tạo ra hàng trăm concept trong vài phút thay vì vài ngày là điều không tưởng."
    },
    {
        name: "Tuấn Anh",
        role: "Freelance Illustrator",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop&crop=face",
        quote: "Hệ thống prompt và template quá mạnh. Tôi có thể tạo ra đúng phong cách mình muốn mà không cần chỉnh sửa nhiều lần."
    },
    {
        name: "Thu Hà",
        role: "Marketing Manager @ BrandVN",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop&crop=face",
        quote: "Chất lượng hình ảnh vượt xa mong đợi. Chúng tôi đã tiết kiệm 80% chi phí thiết kế nhờ ZDream cho các chiến dịch quảng cáo."
    },
    {
        name: "Đức Minh",
        role: "UI Designer @ TechFlow",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop&crop=face",
        quote: "Tôi dùng ZDream để tạo mockup và concept nhanh chóng. Khách hàng luôn ấn tượng với tốc độ delivery của team."
    },
]

const FAQS = [
    {
        question: "Hệ thống Kim Cương hoạt động thế nào?",
        answer: "Mỗi khi bạn tạo một bức ảnh AI, hệ thống sẽ trừ đi một số lượng Kim Cương tương ứng với độ phức tạp của mô hình. Bạn nhận được 50 Kim Cương miễn phí khi đăng ký, và có thể nạp thêm hoặc nâng cấp gói Pro để tiết kiệm hơn."
    },
    {
        question: "Tôi có thể sử dụng ảnh để kinh doanh (thương mại) không?",
        answer: "Có! Tất cả hình ảnh tạo ra từ các gói trả phí (Pro, Unlimited) hoặc bằng Kim Cương nạp thêm đều đi kèm giấy phép sử dụng thương mại 100%. Bạn có thể dùng cho in ấn, quảng cáo, thiết kế UI/UX mà không sợ bản quyền."
    },
    {
        question: "Làm sao để tôi điều khiển được chi tiết của bản vẽ?",
        answer: "Hệ thống cung cấp một bảng điều khiển trực quan minh bạch. Bằng cách kết hợp mô tả văn bản với các tùy chọn loại trừ thông minh, hoặc cung cấp cho nền tảng một hình ảnh phác thảo làm tham chiếu, bạn sẽ có toàn quyền làm chủ bố cục và phong cách cuối cùng."
    },
    {
        question: "Tôi có cần lưu hình ảnh vào máy tính thường xuyên không?",
        answer: "Không cần thiết. Nền tảng tổ chức sẵn 'Không Gian Làm Việc' cho bạn trên đám mây. Bạn có thể phân loại ảnh theo từng tệp (thư mục) chiến dịch riêng biệt, và truy cập lại khối lượng công việc khổng lồ này một cách ngăn nắp mọi lúc, mọi nơi."
    },
    {
        question: "ZDream hỗ trợ những mô hình AI nào?",
        answer: "ZDream tích hợp nhiều mô hình AI tiên tiến thông qua OpenRouter, bao gồm Gemini Flash Image và nhiều engine khác. Bạn có thể chuyển đổi giữa các mô hình tuỳ theo nhu cầu sáng tạo — từ realistic đến anime, abstract, hay concept art."
    },
]




const DEMO_PROMPT = "A cute fox wearing a spacesuit, floating in a colorful nebula, digital painting, ultra detailed, cinematic lighting"
// Prompt lần 2 — prompt KHÁC khi đã có ảnh tham chiếu
const DEMO_PROMPT_V2 = "Biến con cáo thành phong cách cyberpunk, neon city background, giữ nguyên bố cục gốc"
const DEMO_STYLES = ["Digital Art", "Anime", "Chân thực", "3D Render", "Sơn dầu"]
const DEMO_RATIOS = [
    { value: "1:1", icon: Square },
    { value: "3:4", icon: RectangleVertical },
    { value: "4:3", icon: RectangleHorizontal },
    { value: "16:9", icon: RectangleHorizontal },
    { value: "9:16", icon: RectangleVertical },
]
// Ảnh kết quả lần 1 — 16:9 landscape
const DEMO_RESULTS = [
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&h=450&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=800&h=450&auto=format&fit=crop",
]
// Ảnh kết quả lần 2 (sau khi kéo reference + prompt V2)
const DEMO_RESULTS_V2 = [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&h=450&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&h=450&auto=format&fit=crop",
]

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

const fadeLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
}

const fadeRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
}

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const scaleUp = {
    hidden: { opacity: 0, scale: 0.92, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease } },
}

// ============================================================
// HOOKS
// ============================================================



// Phases: idle → typing → selecting → generating → results → dragging → dropped → retyping → regenerating → newResults → lightbox → pause → reset
type DemoPhase = "idle" | "typing" | "selecting" | "generating" | "results" | "dragging" | "dropped" | "retyping" | "regenerating" | "newResults" | "lightbox" | "pause"

export function InteractiveDemo() {
    const containerRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(containerRef, { once: false, margin: "-100px" })
    const [phase, setPhase] = useState<DemoPhase>("idle")
    const [typedLength, setTypedLength] = useState(0)
    const [activeStyle, setActiveStyle] = useState(-1)
    const [activeRatio, setActiveRatio] = useState(-1)
    const [progress, setProgress] = useState(0)
    const [showResults, setShowResults] = useState(false)
    const [showRefThumb, setShowRefThumb] = useState(false)
    const [promptBarHighlight, setPromptBarHighlight] = useState(false)
    const [showV2Results, setShowV2Results] = useState(false)
    const [lightboxImg, setLightboxImg] = useState<string | null>(null)
    const [showMention, setShowMention] = useState(false)
    const [typedV2Length, setTypedV2Length] = useState(0)
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

    // Cleanup all timeouts
    const clearAllTimeouts = useCallback(() => {
        timeoutsRef.current.forEach(t => clearTimeout(t))
        timeoutsRef.current = []
    }, [])
    const addTimeout = useCallback((fn: () => void, ms: number) => {
        const t = setTimeout(fn, ms)
        timeoutsRef.current.push(t)
        return t
    }, [])
    useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts])

    // Start animation when in view
    useEffect(() => {
        if (isInView && phase === "idle") setPhase("typing")
    }, [isInView, phase])

    // Typing effect
    useEffect(() => {
        if (phase !== "typing") return
        if (typedLength >= DEMO_PROMPT.length) {
            addTimeout(() => setPhase("selecting"), 400)
            return
        }
        const interval = setInterval(() => {
            setTypedLength(prev => {
                if (prev >= DEMO_PROMPT.length) { clearInterval(interval); return prev }
                return prev + 1
            })
        }, 30)
        return () => clearInterval(interval)
    }, [phase, typedLength, addTimeout])

    // Selecting phase — auto-select style then ratio
    useEffect(() => {
        if (phase !== "selecting") return
        addTimeout(() => setActiveStyle(0), 300)
        addTimeout(() => setActiveRatio(3), 800) // 16:9
        addTimeout(() => setPhase("generating"), 1400)
    }, [phase, addTimeout])

    // Generating phase — progress bar
    useEffect(() => {
        if (phase !== "generating") return
        setProgress(0)
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { clearInterval(interval); return 100 }
                return prev + 2.5
            })
        }, 40)
        addTimeout(() => { setShowResults(true); setPhase("results") }, 2000)
        return () => clearInterval(interval)
    }, [phase, addTimeout])

    // Results → dragging
    useEffect(() => {
        if (phase !== "results") return
        addTimeout(() => setPhase("dragging"), 2000)
    }, [phase, addTimeout])

    // Dragging — simulate drag-to-reference animation
    useEffect(() => {
        if (phase !== "dragging") return
        // Highlight prompt bar as drop target
        addTimeout(() => setPromptBarHighlight(true), 300)
        // "Drop" — show reference thumbnail
        addTimeout(() => {
            setPromptBarHighlight(false)
            setShowRefThumb(true)
            setPhase("dropped")
        }, 1200)
    }, [phase, addTimeout])

    // Dropped → hiện @Ảnh 1 mention → xóa prompt cũ → retyping prompt V2
    useEffect(() => {
        if (phase !== "dropped") return
        addTimeout(() => setShowMention(true), 800)
        // Xóa prompt cũ, chuẩn bị gõ prompt mới
        addTimeout(() => {
            setTypedLength(0)
            setTypedV2Length(0)
            setPhase("retyping")
        }, 1800)
    }, [phase, addTimeout])

    // Retyping — gõ DEMO_PROMPT_V2 (prompt khác cho lần tạo thứ 2)
    useEffect(() => {
        if (phase !== "retyping") return
        if (typedV2Length >= DEMO_PROMPT_V2.length) {
            addTimeout(() => {
                setPhase("regenerating")
                setProgress(0)
            }, 400)
            return
        }
        const interval = setInterval(() => {
            setTypedV2Length(prev => {
                if (prev >= DEMO_PROMPT_V2.length) { clearInterval(interval); return prev }
                return prev + 1
            })
        }, 30)
        return () => clearInterval(interval)
    }, [phase, typedV2Length, addTimeout])

    // Regenerating — progress bar lần 2
    useEffect(() => {
        if (phase !== "regenerating") return
        setShowResults(false)
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { clearInterval(interval); return 100 }
                return prev + 3
            })
        }, 35)
        addTimeout(() => {
            setShowV2Results(true)
            setShowResults(true)
            setPhase("newResults")
        }, 1800)
        return () => clearInterval(interval)
    }, [phase, addTimeout])

    // New Results → lightbox (click ảnh xem phóng to)
    useEffect(() => {
        if (phase !== "newResults") return
        addTimeout(() => {
            setLightboxImg(DEMO_RESULTS_V2[0])
            setPhase("lightbox")
        }, 1800)
    }, [phase, addTimeout])

    // Lightbox → pause → reset
    useEffect(() => {
        if (phase !== "lightbox") return
        addTimeout(() => setPhase("pause"), 3000)
    }, [phase, addTimeout])

    useEffect(() => {
        if (phase !== "pause") return
        addTimeout(() => {
            setTypedLength(0); setTypedV2Length(0); setActiveStyle(-1); setActiveRatio(-1)
            setProgress(0); setShowResults(false); setShowRefThumb(false)
            setPromptBarHighlight(false); setShowV2Results(false)
            setLightboxImg(null); setShowMention(false); setPhase("typing")
        }, 600)
    }, [phase, addTimeout])

    // Hiển thị prompt V2 khi đang retyping hoặc đã sang lần tạo thứ 2
    const isV2 = phase === "retyping" || phase === "regenerating" || phase === "newResults" || phase === "lightbox" || phase === "pause"
    const promptText = isV2
        ? DEMO_PROMPT_V2.substring(0, phase === "retyping" ? typedV2Length : DEMO_PROMPT_V2.length)
        : DEMO_PROMPT.substring(0, typedLength)
    const isGenerating = phase === "generating" || phase === "regenerating"
    const isDragging = phase === "dragging"
    const currentResults = showV2Results ? DEMO_RESULTS_V2 : DEMO_RESULTS

    return (
        <div ref={containerRef}>
            <Card className="group/card relative border-white/[0.08] bg-black/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.05]">
                {/* Animated gradient accents */}
                <motion.div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-600/8 rounded-full pointer-events-none blur-xl"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="absolute -bottom-20 -left-20 w-56 h-56 bg-fuchsia-600/6 rounded-full pointer-events-none blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
                {/* Glass grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

                {/* Window header — premium glass */}
                <div className="h-[42px] border-b border-white/[0.08] bg-white/[0.02] flex items-center px-4 justify-between relative z-20 backdrop-blur-xl">
                    <div className="flex gap-2.5 items-center">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.4)]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.4)]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.4)]" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 rounded-full px-5 py-1.5 text-[10px] sm:text-[11px] font-medium text-white/50 border border-white/5 ring-1 ring-white/5 shadow-inner">
                        <Monitor className="h-3 w-3 text-violet-400" /> zdream.vn/app/generate
                    </div>
                </div>

                <div className="relative flex flex-col lg:flex-row min-h-[480px] sm:min-h-[420px] lg:min-h-[460px] overflow-hidden">
                    {/* Mobile compact settings bar — visible only on mobile */}
                    <div className="flex lg:hidden items-center gap-2 px-4 py-2.5 border-b border-border/15 bg-background/30 overflow-x-auto">
                        <span className="text-[10px] uppercase text-muted-foreground/50 font-medium shrink-0">Cài đặt:</span>
                        <Badge variant={activeStyle >= 0 ? "default" : "outline"} className={`text-[10px] shrink-0 transition-all duration-500 ${activeStyle >= 0 ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent" : "border-border/30 text-muted-foreground/40"}`}>
                            {activeStyle >= 0 ? DEMO_STYLES[activeStyle] : "Phong cách"}
                        </Badge>
                        <Badge variant={activeRatio >= 0 ? "default" : "outline"} className={`text-[10px] shrink-0 transition-all duration-500 ${activeRatio >= 0 ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent" : "border-border/30 text-muted-foreground/40"}`}>
                            {activeRatio >= 0 ? DEMO_RATIOS[activeRatio].value : "Tỷ lệ"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] shrink-0 border-border/30 text-muted-foreground/40">×2</Badge>
                    </div>

                    {/* LEFT: Settings Panel — hidden on mobile */}
                    <div className="hidden lg:block w-[300px] shrink-0 border-r border-border/15 p-4 space-y-4 bg-background/30 overflow-y-auto">
                        {/* Phong cách */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase text-muted-foreground/70 font-medium tracking-wider flex items-center gap-1.5">
                                <Palette className="h-3 w-3" /> Phong cách
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {DEMO_STYLES.map((style, i) => (
                                    <Badge
                                        key={style}
                                        variant={activeStyle === i ? "default" : "outline"}
                                        className={`cursor-default text-xs transition-all duration-500 ${activeStyle === i
                                            ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-lg shadow-violet-500/30 scale-105 ring-2 ring-violet-400/30"
                                            : "border-border/30 text-muted-foreground/60 hover:border-border/50"
                                        }`}
                                    >
                                        {style}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Tỷ lệ */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase text-muted-foreground/70 font-medium tracking-wider">Tỷ lệ khung hình</p>
                            <div className="grid grid-cols-5 gap-1.5">
                                {DEMO_RATIOS.map((r, i) => (
                                    <div
                                        key={r.value}
                                        className={`flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-all duration-500 ${activeRatio === i
                                            ? "bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-md shadow-violet-500/25 scale-105 ring-2 ring-violet-400/30"
                                            : "bg-muted/20 text-muted-foreground/50"
                                        }`}
                                    >
                                        <r.icon className="h-3.5 w-3.5" />
                                        <span className="text-[9px] font-medium">{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Số lượng */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase text-muted-foreground/70 font-medium tracking-wider">Số lượng</p>
                            <div className="grid grid-cols-4 gap-1.5">
                                {[1, 2, 3, 4].map(n => (
                                    <div
                                        key={n}
                                        className={`text-center py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${n === 2
                                            ? "bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-sm"
                                            : "bg-muted/20 text-muted-foreground/50"
                                        }`}
                                    >
                                        {n}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Negative prompt */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase text-muted-foreground/70 font-medium tracking-wider">Negative Prompt</p>
                            <div className="border border-border/20 bg-muted/5 rounded-lg px-3 py-2 text-[11px] text-muted-foreground/40 min-h-[40px] italic">
                                mờ, nhòe, chữ, watermark...
                            </div>
                        </div>

                        {/* Seed */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase text-muted-foreground/70 font-medium tracking-wider">Seed</p>
                            <div className="flex gap-2">
                                <div className="flex-1 border border-border/20 bg-muted/5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground/50 tabular-nums">
                                    482719036
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-muted/20 flex items-center justify-center text-muted-foreground/40">
                                    <Sparkles className="h-3.5 w-3.5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Canvas + Prompt bar */}
                    <div className="flex-1 flex flex-col min-h-0 relative">
                        {/* Canvas area */}
                        <div className="flex-1 p-4 lg:p-6 flex items-center justify-center relative bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(139,92,246,0.05),transparent)]">
                            {!showResults ? (
                                <div className="w-full max-w-lg">
                                    {isGenerating ? (
                                        /* Cinematic generation — aurora + percentage */
                                        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black border border-white/[0.06] shadow-[0_20px_60px_-15px_rgba(139,92,246,0.3)]">
                                            {/* Aurora blobs */}
                                            <motion.div className="absolute top-[-10%] left-[10%] w-[60%] h-[70%] bg-violet-600/40 rounded-full blur-[60px] mix-blend-screen"
                                                animate={{ x: [0, 50, -30, 0], y: [0, 30, -50, 0], scale: [1, 1.2, 0.9, 1] }}
                                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
                                            <motion.div className="absolute bottom-[-10%] right-[5%] w-[50%] h-[60%] bg-fuchsia-600/40 rounded-full blur-[70px] mix-blend-screen"
                                                animate={{ x: [0, -40, 40, 0], y: [0, -40, 20, 0], scale: [1, 1.3, 0.8, 1] }}
                                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
                                            <motion.div className="absolute top-[20%] right-[30%] w-[40%] h-[50%] bg-blue-500/30 rounded-full blur-[50px] mix-blend-screen"
                                                animate={{ x: [0, 30, -40, 0], y: [0, -20, 50, 0] }}
                                                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
                                            {/* Big percentage */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                                <motion.span className="text-[4rem] sm:text-[6rem] font-extralight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter tabular-nums"
                                                    animate={{ scale: [0.98, 1.02, 0.98] }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                                                    {Math.round(progress)}<span className="text-2xl sm:text-3xl font-light text-white/50">%</span>
                                                </motion.span>
                                                <motion.p className="text-white/60 font-light tracking-[0.15em] text-[10px] sm:text-xs uppercase mt-2"
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ duration: 2, repeat: Infinity }}>
                                                    {progress < 30 ? "Khởi tạo không gian..." : progress < 70 ? "Hội tụ chi tiết..." : "Hoàn thiện tác phẩm..."}
                                                </motion.p>
                                                <Sparkles className="w-4 h-4 text-fuchsia-300 mt-3 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
                                            </div>
                                            {/* Light sweep */}
                                            <motion.div className="absolute top-0 bottom-0 w-[40%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-15deg]"
                                                animate={{ left: ["-50%", "150%"] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }} />
                                            {/* Progress bar bottom */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-20">
                                                <motion.div className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_0_10px_rgba(217,70,239,0.6)]" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    ) : (
                                        /* Empty state */
                                        <div className="flex flex-col items-center justify-center text-center py-10">
                                            <div className="relative w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                                                <ImageIcon className="h-7 w-7 text-violet-400/40" />
                                                <div className="absolute inset-0 rounded-2xl bg-violet-500/5 animate-pulse" />
                                            </div>
                                            <p className="text-sm text-muted-foreground/50">Mô tả ý tưởng để bắt đầu</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Results + Drag animation */
                                <div className="relative w-full max-w-lg">
                                    {/* White flash on first reveal */}
                                    {showResults && !showV2Results && (
                                        <motion.div className="absolute inset-0 bg-white rounded-xl z-20 pointer-events-none"
                                            initial={{ opacity: 0.8 }} animate={{ opacity: 0 }}
                                            transition={{ duration: 0.8, ease: "easeOut" }} />
                                    )}
                                    <motion.div
                                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
                                    >
                                        {currentResults.map((src, i) => (
                                            <motion.div
                                                key={src}
                                                className={`relative rounded-xl overflow-hidden ring-1 ring-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] group ${i === 1 ? "hidden sm:block" : ""}`}
                                                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                                                animate={{ opacity: isDragging && i === 0 ? 0.5 : 1, scale: 1, y: 0 }}
                                                transition={{ delay: i * 0.2, duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
                                            >
                                                <div className="relative aspect-video bg-muted/20">
                                                    <img src={src} alt={`AI Result ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                                                    {/* Hover overlay giống app thật */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    {/* Action badges */}
                                                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                                        <Badge variant="secondary" className="text-[9px] bg-black/40 backdrop-blur-sm text-white border-0">
                                                            AI
                                                        </Badge>
                                                        <div className="flex gap-1">
                                                            <div className="h-6 w-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                                                <Download className="h-3 w-3 text-white" />
                                                            </div>
                                                            <div className="h-6 w-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                                                <ImageIcon className="h-3 w-3 text-white" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>

                                    {/* Sparkle effects on results */}
                                    {showResults && !isDragging && (
                                        <>
                                            <motion.div className="absolute -top-2 -right-2 text-violet-400 pointer-events-none" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }} transition={{ duration: 1.5, delay: 0.2 }}>
                                                <Sparkles className="h-4 w-4" />
                                            </motion.div>
                                            <motion.div className="absolute top-4 -left-3 text-fuchsia-400 pointer-events-none" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }} transition={{ duration: 1.5, delay: 0.5 }}>
                                                <Sparkles className="h-3 w-3" />
                                            </motion.div>
                                        </>
                                    )}

                                    {/* Floating drag ghost — ảnh thu nhỏ di chuyển xuống prompt bar */}
                                    {isDragging && (
                                        <motion.div
                                            className="absolute z-30 w-16 h-16 rounded-xl overflow-hidden shadow-2xl ring-2 ring-violet-500 pointer-events-none"
                                            initial={{ top: "20%", left: "15%", opacity: 1, scale: 1, rotate: 0 }}
                                            animate={{ top: "85%", left: "10%", opacity: 0.9, scale: 0.8, rotate: -3 }}
                                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            <img src={DEMO_RESULTS[0]} alt="Dragging" className="w-full h-full object-cover" />
                                            {/* Glow trail */}
                                            <div className="absolute inset-0 bg-violet-500/20 animate-pulse" />
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Prompt bar */}
                        <div className="p-3 relative">
                            <div className={`relative w-full border rounded-[22px] transition-all duration-700 ${
                                promptBarHighlight
                                    ? "border-violet-500/60 bg-violet-500/[0.08] shadow-[0_0_30px_rgba(139,92,246,0.15)] scale-[1.02]"
                                    : "border-white/[0.08] bg-[#0c0c0e]/80 backdrop-blur-xl"
                            }`}>
                                {/* Subtle glow border when typing */}
                                {(phase === "typing" || phase === "retyping") && (
                                    <div className="absolute -inset-[1px] rounded-[22px] bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 pointer-events-none" />
                                )}
                                {/* Prompt bar highlight glow khi đang kéo */}
                                {promptBarHighlight && (
                                    <div className="absolute inset-0 rounded-[22px] bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 animate-pulse pointer-events-none" />
                                )}

                                {/* Reference thumbnail — hiện sau khi "thả" */}
                                {showRefThumb && (
                                    <motion.div
                                        className="px-4 pt-3 pb-1 flex gap-2"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="relative shrink-0">
                                            <img src={DEMO_RESULTS[0]} alt="Ref" className="h-12 w-12 rounded-lg object-cover ring-1 ring-border/30" />
                                            <div className="absolute top-0.5 left-0.5 bg-black/60 text-[8px] font-bold text-white h-3.5 w-3.5 rounded-full flex items-center justify-center">
                                                1
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Prompt text */}
                                <div className="px-4 py-3">
                                    <p className={`text-[13px] lg:text-[15px] leading-relaxed min-h-[24px] ${promptText ? "text-foreground" : "text-muted-foreground/50"}`}>
                                        {showMention && (
                                            <motion.span
                                                className="inline-flex items-center gap-1 bg-violet-500/20 text-violet-300 rounded-md px-1.5 py-0.5 text-[12px] lg:text-[13px] font-medium mr-1.5 align-middle"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                @Ảnh 1
                                            </motion.span>
                                        )}
                                        {promptText || "Mô tả ý tưởng kiến tạo của bạn..."}
                                        {(phase === "typing" || phase === "retyping") && <span className="inline-block w-[2px] h-[18px] bg-violet-400 ml-0.5 align-middle animate-pulse" />}
                                    </p>
                                </div>

                                {/* Toolbar */}
                                <div className="flex items-center justify-between px-3 pb-2.5">
                                    <div className="flex items-center gap-0.5">
                                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors">
                                            <History className="h-4 w-4" />
                                        </div>
                                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors">
                                            <ImageIcon className="h-4 w-4" />
                                        </div>
                                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors">
                                            <Settings2 className="h-4 w-4" />
                                        </div>
                                        <div className="hidden sm:flex items-center gap-1 ml-1.5">
                                            <Badge variant="secondary" className="text-[9px] h-5 rounded-full px-2 bg-muted/30 text-muted-foreground/60 border-0">
                                                16:9
                                            </Badge>
                                            <Badge variant="secondary" className="text-[9px] h-5 rounded-full px-2 bg-muted/30 text-muted-foreground/60 border-0">
                                                ×2
                                            </Badge>
                                        </div>
                                    </div>
                                    {/* Generate button */}
                                    <motion.div
                                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${promptText
                                            ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] ring-2 ring-violet-400/20"
                                            : "bg-white/5 text-white/30"
                                        }`}
                                        animate={promptText && !isGenerating ? { scale: [1, 1.08, 1], boxShadow: ["0 0 20px rgba(139,92,246,0.5)", "0 0 35px rgba(217,70,239,0.7)", "0 0 20px rgba(139,92,246,0.5)"] } : {}}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        {isGenerating
                                            ? <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <ArrowUp className="h-4 w-4" />
                                        }
                                    </motion.div>
                                </div>
                            </div>

                            {/* Label khi đang kéo */}
                            {promptBarHighlight && (
                                <motion.div
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-violet-500/90 text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-lg backdrop-blur-sm"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <ImageIcon className="h-3 w-3" /> Thả ảnh tham chiếu vào đây
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lightbox overlay — mô phỏng xem ảnh phóng to */}
                <AnimatePresence>
                    {lightboxImg && (
                        <motion.div
                            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xl flex items-center justify-center rounded-2xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Nút đóng */}
                            <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 border border-white/10">
                                <X className="h-4 w-4" />
                            </div>
                            {/* Ảnh phóng to */}
                            <motion.div
                                className="relative max-w-[70%] max-h-[75%] rounded-2xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(139,92,246,0.3)] ring-1 ring-white/10"
                                initial={{ scale: 0.6, opacity: 0, filter: "blur(20px)" }}
                                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                                exit={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <img src={lightboxImg} alt="Preview" className="w-full h-full object-cover" />
                                {/* Info bar dưới ảnh */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                    <p className="text-[11px] text-white/80 line-clamp-1">{DEMO_PROMPT_V2}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Badge variant="secondary" className="text-[9px] h-4 bg-violet-500/30 text-violet-200 border-0">Digital Art</Badge>
                                        <Badge variant="secondary" className="text-[9px] h-4 bg-white/10 text-white/60 border-0">16:9</Badge>
                                        <span className="text-[9px] text-white/40 ml-auto flex items-center gap-1">
                                            <ZoomIn className="h-3 w-3" /> Xem chi tiết
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    )
}



function PricingCard({ plan, periodLabel }: { plan: typeof MONTHLY_PLANS[0]; periodLabel: string }) {
    return (
        <motion.div variants={scaleUp} className={`h-full ${plan.popular ? 'md:-mt-4 md:mb-[-16px]' : ''}`}>
            <div className={`flex flex-col relative overflow-hidden text-left h-full rounded-2xl transition-all duration-500 ${plan.popular
                ? 'glass-card pricing-glow'
                : 'card-gradient-border'}`}
            >
                {plan.popular && (
                    <>
                        <div className="absolute -top-24 -right-24 w-60 h-60 bg-violet-500/8 rounded-full pointer-events-none" />
                        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-fuchsia-500/5 rounded-full pointer-events-none" />
                        {/* Top gradient border accent */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
                    </>
                )}
                <div className="p-6 md:p-8 flex-1 flex flex-col relative">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        {plan.popular && (
                            <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0 badge-glow text-[10px] uppercase tracking-wider">
                                Phổ Biến
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-2">
                        <span className={`text-4xl md:text-5xl font-extrabold tracking-tight ${plan.popular ? 'text-glow' : ''}`}>{plan.price}</span>
                        <span className="text-muted-foreground font-medium text-base">{plan.period}</span>
                    </div>

                    <div className={`rounded-xl p-3 flex items-center gap-2.5 mb-6 w-fit text-sm font-medium mt-3 ${plan.popular ? 'bg-violet-500/15 ring-1 ring-violet-500/20' : 'bg-white/[0.03] ring-1 ring-white/5'}`}>
                        <Gem className={`h-5 w-5 ${plan.popular ? 'text-violet-400' : 'text-muted-foreground/60'}`} />
                        <span>{plan.gems} Kim Cương/{periodLabel}</span>
                    </div>

                    <ul className="space-y-3 flex-1 mb-6">
                        {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-3 text-muted-foreground text-sm">
                                <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.popular ? 'text-violet-400' : 'text-white/20'}`} />
                                {f}
                            </li>
                        ))}
                    </ul>

                    <Link to="/login" className="w-full mt-auto">
                        <Button
                            className={`w-full h-11 text-sm font-semibold transition-all duration-500 ${plan.popular
                                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_-5px_rgba(139,92,246,0.6)] border-0'
                                : 'bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-violet-500/20 text-foreground'}`}
                            size="lg"
                        >
                            {plan.cta}
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}

// Smooth scroll với offset cho fixed navbar
function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (el) {
        const offset = 80
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: "smooth" })
    }
}



// ============================================================
// FIREFLIES COMPONENT (Magical Glowing Particles)
// ============================================================
const Fireflies = ({ count = 40 }) => {
    const fireflies = useMemo(() => {
        return [...Array(count)].map((_, i) => {
            const size = Math.random() * 4 + 2.5; 
            const left = Math.random() * 100; 
            const top = Math.random() * 100 + 10; // Start across the screen
            const animationDuration = Math.random() * 15 + 10; 
            const delay = Math.random() * 5; 
            const yMovement = -(Math.random() * 300 + 200);
            const xMovement1 = Math.random() * 100 - 50;
            const xMovement2 = Math.random() * 100 - 50;
            
            const glowStyles = [
                {
                    background: 'linear-gradient(to right, #8b5cf6, #d946ef)', // from-violet-500 to-fuchsia-500
                    boxShadow: '0 0 4px 1px rgba(139, 92, 246, 0.9), 0 0 8px 1px rgba(217, 70, 239, 0.6)'
                },
                {
                    background: 'linear-gradient(to right, #a855f7, #ec4899)', // from-purple-500 to-pink-500
                    boxShadow: '0 0 4px 1px rgba(168, 85, 247, 0.9), 0 0 8px 1px rgba(236, 72, 153, 0.6)'
                },
                {
                    background: '#fff',
                    boxShadow: '0 0 3px 1px rgba(139, 92, 246, 0.9), 0 0 6px 1px rgba(217, 70, 239, 0.8)'
                },
                {
                    background: '#ffffff',
                    boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.8), 0 0 8px 2px rgba(255, 255, 255, 0.5)'
                }
            ];
            const style = glowStyles[Math.floor(Math.random() * glowStyles.length)];
            
            return { id: i, size, left, top, animationDuration, delay, style, yMovement, xMovement1, xMovement2 };
        });
    }, [count]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[15] mix-blend-screen w-full h-full">
            {fireflies.map((f) => (
                <motion.div
                    key={f.id}
                    className="absolute rounded-full"
                    style={{
                        width: f.size,
                        height: f.size,
                        left: `${f.left}%`,
                        top: `${f.top}%`,
                        background: f.style.background,
                        boxShadow: f.style.boxShadow,
                    }}
                    initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
                    animate={{
                        opacity: [0, 1, 0.4, 1, 0],
                        y: f.yMovement,
                        x: [0, f.xMovement1, f.xMovement2, 0],
                        scale: [0.5, 1.4, 0.8, 1.4, 0.5]
                    }}
                    transition={{
                        duration: f.animationDuration,
                        repeat: Infinity,
                        delay: f.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}

// ============================================================
// LANDING PAGE
// ============================================================
export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const heroRef = useRef<HTMLElement>(null)
    const heroVideoRef = useRef<HTMLVideoElement>(null)
    const [videoFaded, setVideoFaded] = useState(false)
    const [glitchBurst, setGlitchBurst] = useState(false)
    const { scrollY } = useScroll()
    const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
    const heroOpacity = useTransform(heroProgress, [0, 1], [1, 0])


    // Hiệu ứng chuyển cảnh + glitch burst khi video lặp lại
    const handleVideoTimeUpdate = useCallback(() => {
        const video = heroVideoRef.current
        if (!video || !video.duration) return
        const timeLeft = video.duration - video.currentTime
        if (timeLeft <= 1.5 && !videoFaded) {
            setVideoFaded(true)
            setGlitchBurst(true)
        } else if (timeLeft > 1.5 && videoFaded) {
            setVideoFaded(false)
            // Tắt glitch burst sau 1s để animation chạy xong
            setTimeout(() => setGlitchBurst(false), 1000)
        }
    }, [videoFaded])

    useMotionValueEvent(scrollY, "change", (latest) => {
        const isScrolled = latest > 50;
        const isShowTop = latest > 500;
        if (scrolled !== isScrolled) setScrolled(isScrolled);
        if (showScrollTop !== isShowTop) setShowScrollTop(isShowTop);
    });

    // Lenis smooth scroll — hiệu ứng cuộn mượt có quán tính
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.5,
        })
        let rafId: number;
        function raf(time: number) {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }
        rafId = requestAnimationFrame(raf)
        return () => {
            cancelAnimationFrame(rafId)
            lenis.destroy()
        }
    }, [])

    const handleNavClick = useCallback((id: string) => {
        setMobileMenuOpen(false)
        setTimeout(() => scrollToSection(id), 100)
    }, [])

    const NAV_ITEMS = [
        { label: "Trải nghiệm", id: "demo" },
        { label: "Bảng giá", id: "pricing" },
        { label: "Hỏi đáp", id: "faq" },
    ]

    return (
        <div className="relative w-full min-h-screen bg-black text-foreground selection:bg-violet-500 selection:text-white">

            {/* ==================== NAVBAR ==================== */}
            <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 border-b ${scrolled ? 'bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 border-border/50' : 'bg-transparent border-transparent'}`}>
                <div className="container mx-auto px-4 md:px-8 max-w-7xl h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white group-hover:scale-105 transition-transform shadow-lg shadow-violet-500/20">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">ZDream</span>
                    </Link>

                    {/* Desktop nav — pill style */}
                    <div className={`hidden md:flex items-center gap-1 rounded-full px-1.5 py-1 border transition-all duration-500 ${scrolled ? 'bg-transparent border-transparent' : 'bg-white/[0.08] border-white/[0.1]'}`}>
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => scrollToSection(item.id)}
                                className="text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.08] px-4 py-1.5 rounded-full transition-all duration-300"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/login" className="hidden md:block">
                            <Button size="sm" className="bg-white text-black hover:bg-white/90 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all duration-500 rounded-full px-5">
                                Bắt Đầu <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                            </Button>
                        </Link>

                        {/* Mobile menu */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72 bg-background border-border/50">
                                <SheetTitle className="sr-only">Menu</SheetTitle>
                                <nav className="flex flex-col gap-6 mt-8">
                                    {NAV_ITEMS.map((item) => (
                                        <SheetClose asChild key={item.label}>
                                            <button
                                                onClick={() => handleNavClick(item.id)}
                                                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                                            >
                                                {item.label}
                                            </button>
                                        </SheetClose>
                                    ))}
                                    <Separator className="bg-border/30" />
                                    <SheetClose asChild>
                                        <Link to="/login">
                                            <Button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-0">
                                                Bắt Đầu <ArrowUpRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </SheetClose>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </nav>

            {/* ==================== HERO ==================== */}
            <section ref={heroRef} className="relative w-full min-h-[100svh] flex flex-col items-center justify-center overflow-hidden">
                {/* BG: gradient + animated Video + glowing orbs */}
                <div className="absolute inset-0 bg-background z-0" />
                
                {/* Custom Cinematic Video Background */}
                <motion.div 
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: videoFaded ? 0.2 : 0.7 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
                >
                    <video 
                        ref={heroVideoRef}
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).playbackRate = 0.7 }}
                        onTimeUpdate={handleVideoTimeUpdate}
                        className="w-full h-full object-cover" 
                    />
                    
                    {/* === Layer 1: RGB Split — RED channel (Chromatic Aberration) === */}
                    <video 
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4" 
                        autoPlay loop muted playsInline
                        onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).playbackRate = 0.7 }}
                        className="absolute inset-0 z-10 w-full h-full object-cover animate-glitch-rgb-r pointer-events-none" 
                        style={{ filter: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"r\"><feColorMatrix type=\"matrix\" values=\"1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0\"/></filter></svg>#r')" }}
                    />
                    {/* === Layer 2: RGB Split — CYAN channel === */}
                    <video 
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4" 
                        autoPlay loop muted playsInline
                        onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).playbackRate = 0.7 }}
                        className="absolute inset-0 z-10 w-full h-full object-cover animate-glitch-rgb-c pointer-events-none" 
                        style={{ filter: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"c\"><feColorMatrix type=\"matrix\" values=\"0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0\"/></filter></svg>#c')" }}
                    />
                    {/* === Layer 3: Mosaic Block Tear === */}
                    <video 
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4" 
                        autoPlay loop muted playsInline
                        onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).playbackRate = 0.7 }}
                        className="absolute inset-0 z-10 w-full h-full object-cover animate-glitch-mosaic pointer-events-none opacity-90" 
                    />
                    {/* === Layer 4: Micro Block Displacement (Small rects with skew) === */}
                    <video 
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4" 
                        autoPlay loop muted playsInline
                        onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).playbackRate = 0.7 }}
                        className="absolute inset-0 z-10 w-full h-full object-cover animate-glitch-micro-blocks pointer-events-none opacity-90" 
                    />
                    
                    {/* === Layer 5: GLITCH BURST — Intensive overlay at video loop point === */}
                    <video 
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4" 
                        autoPlay loop muted playsInline
                        onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).playbackRate = 0.7 }}
                        className={`absolute inset-0 z-20 w-full h-full object-cover pointer-events-none opacity-0 ${glitchBurst ? 'glitch-burst-active' : ''}`}
                    />
                    
                    {/* Top gradient to ensure Navbar text contrast */}
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b z-20 from-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
                </motion.div>
                <div className="hidden sm:block absolute top-[15%] left-[20%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-violet-600/[0.07] blur-[120px] pointer-events-none animate-float-slow" />
                <div className="hidden sm:block absolute top-[30%] right-[15%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-fuchsia-600/[0.06] blur-[100px] pointer-events-none animate-float-delayed" />
                <div className="hidden sm:block absolute bottom-[20%] left-[40%] w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-pink-600/[0.04] blur-[80px] pointer-events-none animate-float-slow" />

                {/* Flying Fireflies Effect */}
                <Fireflies count={45} />

                {/* Content center */}
                <motion.div
                    className="container relative z-10 mx-auto px-5 sm:px-8 max-w-3xl text-center flex flex-col items-center pt-20 sm:pt-28 pb-6 sm:pb-8"
                    style={{ opacity: heroOpacity }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="group relative overflow-hidden inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white/90 backdrop-blur-md mb-5 sm:mb-8 shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            <motion.div 
                                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                                animate={{ left: ["-100%", "200%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                            />
                            <Sparkles className="mr-2 h-4 w-4 text-pink-400 relative z-10" /> 
                            <span className="relative z-10">Nền tảng tạo ảnh AI #1 Việt Nam</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        className="font-black tracking-tighter mb-3 sm:mb-5 leading-[1.15] sm:leading-[1.05] text-white text-center"
                        style={{ 
                            fontSize: "clamp(2rem, 5.5vw, 4.5rem)",
                            fontFamily: "'Plus Jakarta Sans', sans-serif" 
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Khai phá ý tưởng <br />
                        cùng <span className="relative inline-grid place-items-center mt-1 sm:mt-2 sm:ml-2 drop-shadow-[0_0_8px_rgba(232,121,249,0.6)] sm:drop-shadow-[0_0_12px_rgba(232,121,249,0.8)] drop-shadow-[0_0_20px_rgba(192,38,211,0.4)] sm:drop-shadow-[0_0_35px_rgba(192,38,211,0.6)]">
                            {/* Outline Background Layer */}
                            <span 
                                className="col-start-1 row-start-1 z-0 tracking-normal text-[1em] sm:text-[1.05em] pr-2 sm:pr-3"
                                aria-hidden="true"
                                style={{ 
                                    fontFamily: "'Caveat Brush', cursive",
                                    WebkitTextStroke: "4px rgba(255,255,255,0.95)",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                                ZDream!
                            </span>
                            {/* Gradient Foreground Layer */}
                            <span 
                                className="col-start-1 row-start-1 z-10 text-btn-shine tracking-normal text-[1em] sm:text-[1.05em] pr-2 sm:pr-3"
                                style={{ 
                                    fontFamily: "'Caveat Brush', cursive"
                                }}
                            >
                                ZDream!
                            </span>
                            {/* Hand-drawn underline SVG */}
                            <svg className="absolute -bottom-1 sm:-bottom-3 left-[-3%] w-[106%] h-3 sm:h-5 z-0 drop-shadow-[0_0_20px_rgba(232,121,249,0.9)]" viewBox="0 0 300 20" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#a78bfa" />
                                        <stop offset="50%" stopColor="#e879f9" />
                                        <stop offset="100%" stopColor="#c084fc" />
                                    </linearGradient>
                                </defs>
                                <path d="M5,15 Q150,0 295,12" stroke="url(#line-gradient)" strokeWidth="8" fill="none" strokeLinecap="round" />
                            </svg>
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-xl sm:text-2xl md:text-4xl text-zinc-300 font-normal max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed tracking-wide"
                        style={{ fontFamily: "'Caveat', cursive", textShadow: "0 2px 15px rgba(0,0,0,0.6)" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        Witness your wildest dreams come to life!
                    </motion.p>

                    {/* Dual CTA */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mt-4 sm:mt-8 w-full px-4 sm:px-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Link to="/login" className="w-full sm:w-auto">
                            <Button size="lg" className="relative group overflow-hidden h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-[0_0_40px_-5px_rgba(139,92,246,0.6)] hover:shadow-[0_0_60px_-5px_rgba(139,92,246,0.8)] transition-all duration-500 rounded-xl hover:scale-105 active:scale-95 w-full sm:w-auto">
                                <motion.div 
                                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                                    animate={{ left: ["-100%", "200%"] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                                />
                                <WandSparkles className="mr-2 h-5 w-5 relative z-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" /> <span className="relative z-10">Bắt Đầu Cùng AI</span>
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="group h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold border-white/20 hover:border-violet-400 hover:bg-violet-500/10 rounded-xl transition-all duration-500 hover:scale-105 active:scale-95 bg-background/50 backdrop-blur-sm hover:shadow-[0_0_25px_-3px_rgba(139,92,246,0.5)] w-full sm:w-auto"
                            onClick={() => {
                                const el = document.getElementById("demo");
                                if(el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                            }}
                        >
                            Xem Chế Độ Demo <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </motion.div>

                    {/* Mini stats bar */}
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-10 mt-8 sm:mt-12 text-xs sm:text-sm text-white/60 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <span className="flex items-center gap-1.5"><WandSparkles className="h-4 w-4 text-fuchsia-400" /> <strong className="text-white">1.2M+</strong> ảnh đã tạo</span>
                        <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-fuchsia-400" /> <strong className="text-white">50K+</strong> người dùng</span>
                        <span className="flex items-center gap-1.5"><Gem className="h-4 w-4 text-pink-400" /> <strong className="text-white">50</strong> gems miễn phí</span>
                    </motion.div>
                </motion.div>



            </section>

            {/* ==================== MARQUEE GALLERY — Social Proof ==================== */}
            <section className="w-full py-8 md:py-12 relative overflow-hidden">
                <div className="relative w-full overflow-hidden flex flex-col gap-3">
                    <div className="flex gap-3 animate-marquee" style={{ width: "max-content" }}>
                        {[...HERO_IMAGES, ...HERO_IMAGES, ...HERO_IMAGES].map((img, i) => (
                            <div key={`r1-${i}`} className="w-[180px] md:w-[220px] h-[100px] md:h-[120px] rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0 group relative">
                                <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full">{img.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 animate-marquee-reverse" style={{ width: "max-content" }}>
                        {[...HERO_IMAGES, ...HERO_IMAGES, ...HERO_IMAGES].map((img, i) => (
                            <div key={`r2-${i}`} className="w-[160px] md:w-[200px] h-[90px] md:h-[110px] rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0 group relative">
                                <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Badge variant="secondary" className="text-[9px] bg-black/40 text-white/80 border-0">{img.label}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Soft fade on edges */}
                    <div className="absolute inset-y-0 left-0 w-32 md:w-56 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-y-0 right-0 w-32 md:w-56 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-10" />
                </div>
            </section>

            {/* ==================== INTERACTIVE DEMO ==================== */}
            <section id="demo" className="w-full py-16 md:py-20 relative overflow-hidden">
                {/* ===== BACKGROUND LAYER ===== */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/15 to-transparent" />
                {/* Multi-stop mesh gradient */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 20% 30%, rgba(139,92,246,0.05), transparent), radial-gradient(ellipse 40% 50% at 80% 70%, rgba(217,70,239,0.04), transparent), radial-gradient(ellipse 60% 30% at 50% 50%, rgba(99,102,241,0.03), transparent)" }} />
                {/* Glow orbs */}
                <div className="absolute top-20 left-[10%] w-[350px] h-[350px] bg-violet-600/[0.05] blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-20 right-[10%] w-[300px] h-[300px] bg-fuchsia-600/[0.04] blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-indigo-600/[0.02] blur-[100px] rounded-full pointer-events-none" />
                {/* Light beam effects */}
                <div className="absolute top-0 left-[20%] w-[1px] h-full bg-gradient-to-b from-transparent via-violet-400/[0.06] to-transparent pointer-events-none animate-float-slow" />
                <div className="absolute top-0 right-[30%] w-[1px] h-full bg-gradient-to-b from-transparent via-fuchsia-400/[0.04] to-transparent pointer-events-none animate-float-delayed" />
                {/* SVG dot grid */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.025]" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="demo-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.8" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#demo-dots)"/></svg>
                {/* Sparkle constellation SVG */}
                <svg className="absolute top-16 right-[8%] w-32 h-32 opacity-[0.06] pointer-events-none animate-float-slow hidden lg:block" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="30" r="1.5" fill="#a78bfa" /><circle cx="60" cy="10" r="2" fill="#c084fc" /><circle cx="95" cy="35" r="1" fill="#e879f9" />
                    <circle cx="40" cy="70" r="1.5" fill="#a78bfa" /><circle cx="80" cy="60" r="2" fill="#c084fc" /><circle cx="100" cy="90" r="1" fill="#e879f9" />
                    <circle cx="15" cy="100" r="1.5" fill="#a78bfa" /><circle cx="55" cy="95" r="1" fill="#c084fc" />
                    <line x1="20" y1="30" x2="60" y2="10" stroke="#a78bfa" strokeWidth="0.5" opacity="0.5" />
                    <line x1="60" y1="10" x2="95" y2="35" stroke="#c084fc" strokeWidth="0.5" opacity="0.4" />
                    <line x1="20" y1="30" x2="40" y2="70" stroke="#a78bfa" strokeWidth="0.5" opacity="0.4" />
                    <line x1="40" y1="70" x2="80" y2="60" stroke="#c084fc" strokeWidth="0.5" opacity="0.3" />
                    <line x1="80" y1="60" x2="100" y2="90" stroke="#e879f9" strokeWidth="0.5" opacity="0.3" />
                    <line x1="40" y1="70" x2="15" y2="100" stroke="#a78bfa" strokeWidth="0.5" opacity="0.3" />
                    <line x1="15" y1="100" x2="55" y2="95" stroke="#c084fc" strokeWidth="0.5" opacity="0.3" />
                </svg>
                {/* Geometric circle outlines */}
                <svg className="absolute bottom-10 left-[5%] w-20 h-20 opacity-[0.04] pointer-events-none animate-float-delayed hidden lg:block" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="35" stroke="url(#gc1)" strokeWidth="0.8" /><circle cx="40" cy="40" r="20" stroke="url(#gc1)" strokeWidth="0.5" strokeDasharray="4 4" />
                    <defs><linearGradient id="gc1" x1="0" y1="0" x2="80" y2="80"><stop stopColor="#a78bfa" /><stop offset="1" stopColor="#e879f9" /></linearGradient></defs>
                </svg>

                {/* ===== PREMIUM AMBIENT EFFECTS — InteractiveDemo ===== */}
                <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-violet-600/[0.04] blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[20%] right-[5%] w-[350px] h-[350px] rounded-full bg-fuchsia-600/[0.03] blur-[100px] pointer-events-none" />
                <motion.div className="hidden lg:block absolute top-[20%] right-[15%] w-[1px] h-[300px] bg-gradient-to-b from-transparent via-violet-500/20 to-transparent pointer-events-none"
                    animate={{ opacity: [0.3, 0.7, 0.3], height: ["200px", "400px", "200px"] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />

                {/* ===== PREMIUM AMBIENT EFFECTS ===== */}
                <div className="absolute top-1/4 left-[15%] w-[450px] h-[250px] bg-indigo-600/[0.03] blur-[150px] pointer-events-none transform -rotate-12" />

                <div className="container mx-auto px-4 md:px-8 max-w-6xl relative">
                    {/* ===== InteractiveDemo Header ===== */}
                    <motion.div
                        className="text-center mb-10 md:mb-14"
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={fadeUp}
                    >

                        <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-5xl mb-4 text-white">
                            Từ Văn Bản Thành <br className="sm:hidden" />
                            <span className="relative inline-block whitespace-nowrap mt-1 sm:mt-0">
                                <span className="absolute inset-x-0 bottom-2 h-1/2 bg-gradient-to-r from-violet-500/0 via-fuchsia-500/40 to-pink-500/0 blur-md pointer-events-none" />
                                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 drop-shadow-[0_2px_10px_rgba(217,70,239,0.3)]">
                                    Hình Ảnh
                                </span>
                                <span className="absolute -bottom-1 lg:-bottom-2 left-[5%] right-[5%] h-[1px] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                            </span>
                        </h2>
                        <p className="mt-5 max-w-xl mx-auto text-muted-foreground/80 text-[15px] sm:text-base font-medium leading-relaxed text-balance">
                            Biến câu chữ của bạn thành tác phẩm nghệ thuật chất lượng cao ngay trên trình duyệt chỉ trong vài giây.
                        </p>
                    </motion.div>

                    {/* ===== CinematicShowcase Card with perfectly snapped glow ring ===== */}
                    <motion.div
                        className="relative max-w-5xl mx-auto"
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={fadeUp}
                    >
                        {/* Animated glow ring behind card */}
                        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-violet-500/30 via-fuchsia-500/15 to-violet-500/30 blur-md pointer-events-none" />
                        <div className="relative">
                            <CinematicShowcase />
                        </div>
                        {/* Card reflection */}
                        <div className="hidden lg:block absolute -bottom-16 inset-x-8 h-16 rounded-b-2xl bg-gradient-to-b from-violet-500/[0.03] to-transparent blur-xl pointer-events-none" style={{ transform: "scaleY(-0.3)" }} />
                    </motion.div>



                    {/* The Trải Nghiệm Ngay button was removed here by request */}
                </div>

                {/* Vertical Seamless Connector */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10 hidden md:flex flex-col items-center">
                    <div className="w-px h-16 bg-gradient-to-b from-violet-500/0 via-violet-500/50 to-fuchsia-500/0" />
                    <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500/80 shadow-[0_0_10px_rgba(217,70,239,0.8)] animate-pulse" />
                    <div className="w-px h-16 bg-gradient-to-b from-fuchsia-500/0 via-fuchsia-500/50 to-violet-500/0" />
                </div>
            </section>


            {/* ==================== TESTIMONIALS ==================== */}
            <section className="w-full py-20 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                {/* Decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/[0.03] blur-[100px] rounded-full pointer-events-none" />
                {/* SVG quote decoration */}
                <svg className="absolute top-16 left-[5%] w-20 h-20 opacity-[0.03] pointer-events-none" viewBox="0 0 80 80" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 42c-6.6 0-12-5.4-12-12s5.4-12 12-12c2 0 3.8.5 5.4 1.3C20.4 12.2 14 6 6 6V0c14 0 24 10.7 24 24v24H18V42zm38 0c-6.6 0-12-5.4-12-12s5.4-12 12-12c2 0 3.8.5 5.4 1.3C58.4 12.2 52 6 44 6V0c14 0 24 10.7 24 24v24H56V42z"/>
                </svg>
                <svg className="absolute bottom-16 right-[5%] w-16 h-16 opacity-[0.03] pointer-events-none rotate-180" viewBox="0 0 80 80" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 42c-6.6 0-12-5.4-12-12s5.4-12 12-12c2 0 3.8.5 5.4 1.3C20.4 12.2 14 6 6 6V0c14 0 24 10.7 24 24v24H18V42zm38 0c-6.6 0-12-5.4-12-12s5.4-12 12-12c2 0 3.8.5 5.4 1.3C58.4 12.2 52 6 44 6V0c14 0 24 10.7 24 24v24H56V42z"/>
                </svg>
                <div className="container mx-auto px-4 md:px-8 max-w-7xl relative">
                    <motion.div
                        className="text-center mb-12"
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={fadeUp}
                    >
                        <Badge variant="outline" className="mb-4 border-violet-500/30 bg-violet-500/10 text-violet-300">
                            <Star className="mr-2 h-3.5 w-3.5" /> Nhận xét từ cộng đồng
                        </Badge>
                        <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">Được Tin Dùng Bởi Hàng Nghìn Nhà Sáng Tạo</h2>
                        <p className="mt-3 max-w-2xl mx-auto text-muted-foreground text-sm md:text-base text-balance">Lắng nghe trải nghiệm thực tế từ những nhà sáng tạo đang sử dụng ZDream mỗi ngày.</p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                    >
                        {TESTIMONIALS.map((t, index) => (
                            <motion.div key={index} variants={scaleUp}>
                                <Card className="card-gradient-border h-full hover:bg-white/[0.04] transition-all duration-500 group">
                                    <CardContent className="p-7 flex flex-col h-full relative">
                                        {/* Star rating */}
                                        <div className="flex gap-0.5 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                            ))}
                                        </div>
                                        <p className="text-foreground/90 flex-1 mb-6 leading-relaxed text-[15px]">
                                            &ldquo;{t.quote}&rdquo;
                                        </p>
                                        <Separator className="mb-5 bg-border/20" />
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-violet-500/20 group-hover:border-violet-500/40 transition-colors">
                                                <AvatarImage src={t.avatar} />
                                                <AvatarFallback>{t.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{t.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{t.role}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ==================== PRICING ==================== */}
            <section id="pricing" className="w-full py-16 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_1px_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none opacity-30" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center relative">
                    <motion.div
                        className="flex flex-col items-center text-center mb-10"
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={fadeUp}
                    >
                        <Badge variant="outline" className="mb-4 border-violet-500/30 bg-violet-500/10 text-violet-300">
                            <Gem className="mr-2 h-3.5 w-3.5" /> Hệ thống Kim Cương
                        </Badge>
                        <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">Gói dịch vụ linh hoạt</h2>
                        <p className="mt-3 max-w-2xl mx-auto text-muted-foreground text-sm md:text-base text-balance">
                            Mỗi tác phẩm AI sắc nét đều tiêu hao Kim Cương. Hãy chọn gói phù hợp nhất.
                        </p>
                    </motion.div>

                    <Tabs defaultValue="monthly" className="w-full flex flex-col items-center">
                        <TabsList className="mb-12 bg-white/5 border border-white/10">
                            <TabsTrigger value="monthly" className="px-8 font-medium data-[state=active]:bg-background">Theo Tháng</TabsTrigger>
                            <TabsTrigger value="yearly" className="px-8 font-medium data-[state=active]:bg-background">
                                Theo Năm
                                <Badge className="ml-2 text-[10px] bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">-20%</Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="monthly" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch"
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                                variants={staggerContainer}
                            >
                                {MONTHLY_PLANS.map((plan) => (
                                    <PricingCard key={plan.name} plan={plan} periodLabel="tháng" />
                                ))}
                            </motion.div>
                        </TabsContent>
                        <TabsContent value="yearly" className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch"
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                                variants={staggerContainer}
                            >
                                {YEARLY_PLANS.map((plan) => (
                                    <PricingCard key={plan.name} plan={plan} periodLabel="năm" />
                                ))}
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* ==================== FAQ ==================== */}
            <section id="faq" className="w-full py-16 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                        {/* Cột trái */}
                        <motion.div
                            className="lg:col-span-2 lg:sticky lg:top-24"
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                            variants={fadeLeft}
                        >
                            <Badge variant="outline" className="mb-4 border-violet-500/30 bg-violet-500/10 text-violet-300">Hỏi đáp</Badge>
                            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl mb-3">Câu hỏi thường gặp</h2>
                            <p className="text-muted-foreground text-sm md:text-base mb-6 text-balance">
                                Mọi thắc mắc của bạn về nền tảng ZDream AI.
                            </p>
                            <Card className="bg-background/50 border-border/30">
                                <CardContent className="p-6 flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0">
                                            <Sparkles className="h-6 w-6 text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm mb-1">Vẫn còn thắc mắc?</p>
                                            <p className="text-xs text-muted-foreground">Liên hệ đội ngũ hỗ trợ ZDream để được giải đáp nhanh nhất.</p>
                                        </div>
                                    </div>
                                    <a href="mailto:support@zdream.vn">
                                        <Button variant="outline" size="sm" className="w-full hover:border-violet-500/30">
                                            Gửi Email Hỗ Trợ <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                                        </Button>
                                    </a>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Cột phải — Accordion */}
                        <motion.div
                            className="lg:col-span-3"
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                            variants={fadeRight}
                        >
                            <Card className="bg-background/50 border-border/30 w-full">
                                <CardContent className="p-6 md:p-8">
                                    <Accordion type="single" collapsible className="w-full text-left">
                                        {FAQS.map((faq, index) => (
                                            <AccordionItem key={index} value={`item-${index}`} className="last:border-b-0 border-border/30">
                                                <AccordionTrigger className="text-left font-medium text-base hover:no-underline py-5 hover:text-violet-400 transition-colors">
                                                    {faq.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground leading-relaxed text-[15px] pb-5">
                                                    {faq.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ==================== CTA FINAL ==================== */}
            <section className="w-full py-24 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                {/* Strong gradient glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(139,92,246,0.08),transparent)] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/[0.06] blur-[120px] pointer-events-none" />

                {/* ===== PREMIUM AMBIENT EFFECTS — CTA FINAL ===== */}
                <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.06),transparent_70%)] pointer-events-none" />
                
                {/* Sweeping Light Beam */}
                <motion.div className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-fuchsia-500/15 to-transparent pointer-events-none blur-[1px]"
                    animate={{ left: ["10%", "90%", "10%"] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />

                {/* SVG sparkle decorations */}
                <svg className="absolute top-[20%] left-[18%] w-6 h-6 opacity-[0.15] pointer-events-none animate-pulse-glow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" fill="url(#sparkle1)"/>
                    <defs><linearGradient id="sparkle1" x1="2" y1="2" x2="22" y2="22"><stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#D946EF"/></linearGradient></defs>
                </svg>
                <svg className="absolute bottom-[25%] right-[20%] w-4 h-4 opacity-[0.12] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1s' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" fill="#8B5CF6"/>
                </svg>
                <svg className="absolute top-[40%] right-[30%] w-3 h-3 opacity-[0.1] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" fill="#D946EF"/>
                </svg>

                <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center relative">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={scaleUp}
                        className="w-full max-w-3xl mx-auto text-center"
                    >
                        <div className="flex -space-x-2.5 justify-center mb-8">
                            {TESTIMONIALS.slice(0, 3).map((t, i) => (
                                <Avatar key={i} className="h-10 w-10 border-3 border-background ring-1 ring-white/5">
                                    <AvatarImage src={t.avatar} />
                                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                                </Avatar>
                            ))}
                            <Avatar className="h-10 w-10 border-3 border-background bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-1 ring-violet-500/20">
                                <AvatarFallback className="text-[10px] font-bold text-violet-300">+50K</AvatarFallback>
                            </Avatar>
                        </div>

                        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl mb-4 text-balance text-glow leading-[1.1]">
                            Bắt đầu sáng tạo<br className="hidden sm:block" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 animate-gradient-text">
                                ngay hôm nay
                            </span>
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-base mb-8 text-balance max-w-xl mx-auto leading-relaxed">
                            Tạo tài khoản hoàn toàn miễn phí, nhận ngay 50 Kim Cương và bắt đầu hành trình nghệ thuật không rủi ro.
                        </p>

                        <Link to="/login">
                            <Button size="lg" className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-[0_0_60px_-10px_rgba(139,92,246,0.5)] hover:shadow-[0_0_80px_-10px_rgba(139,92,246,0.7)] transition-all duration-500 rounded-xl">
                                Bắt Đầu Miễn Phí <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>

                        <p className="mt-5 text-xs text-muted-foreground/40 flex items-center justify-center gap-4">
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Không cần thẻ tín dụng</span>
                            <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> 50 gems miễn phí</span>
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ==================== SCROLL TO TOP ==================== */}
            <motion.button
                className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-violet-500/40 transition-shadow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={showScrollTop ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{ pointerEvents: showScrollTop ? "auto" : "none" }}
                aria-label="Lên đầu trang"
            >
                <ChevronUp className="h-5 w-5" />
            </motion.button>

        </div>
    )
}
