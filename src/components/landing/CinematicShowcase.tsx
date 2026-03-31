import { useEffect, useState, useRef, useCallback } from "react"
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
    Sparkles,
    WandSparkles,
    Palette,
    ZapIcon,
    ArrowUp,
    ImageIcon,
    RectangleHorizontal,
    MonitorPlay
} from "lucide-react"

// ============================================================
// DATA & CONSTANTS
// ============================================================

const PROMPT_TEXT = "Một bé cáo nhỏ mặc bộ đồ phi hành gia lơ lửng trong dải ngân hà kỳ ảo"
const STYLES = ["Digital Art", "Anime", "Chân thực", "3D Render", "Sơn dầu", "Cyberpunk"]
const RATIOS = ["1:1", "3:4", "4:3", "16:9", "9:16"]
const RESULT_IMAGE = "/assets/space_fox_nana.png"

type Scene = "idle" | "prompt" | "style" | "generate" | "result" | "pause"

function CursorSVG({ className }: { className?: string }) {
    return (
        <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CinematicShowcase() {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneContainerRef = useRef<HTMLDivElement>(null)
    const promptInputRef = useRef<HTMLDivElement>(null)
    const generateBtnRef = useRef<HTMLDivElement>(null)
    const firstStyleRef = useRef<HTMLDivElement>(null)
    const targetRatioRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(containerRef, { once: false, margin: "-100px" })
    
    // Status state
    const [scene, setScene] = useState<Scene>("idle")
    const [typedLength, setTypedLength] = useState(0)
    const [activeStyle, setActiveStyle] = useState(-1)
    const [activeRatio, setActiveRatio] = useState(-1)
    const [progress, setProgress] = useState(0)
    
    // Fake cursor state
    const [showCursor, setShowCursor] = useState(false)
    const [cursorClick, setCursorClick] = useState(0)
    const [cursorTarget, setCursorTarget] = useState(0)
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
    
    // Spot light state for Mac Window
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const { currentTarget, clientX, clientY } = e
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    // 3D Parallax Tilt state for Result Card
    const cardX = useMotionValue(0)
    const cardY = useMotionValue(0)
    const springX = useSpring(cardX, { stiffness: 150, damping: 20 })
    const springY = useSpring(cardY, { stiffness: 150, damping: 20 })
    const rotateX = useMotionTemplate`${springY}deg`
    const rotateY = useMotionTemplate`${springX}deg`

    function handleCardMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (scene !== "result") return
        const rect = e.currentTarget.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const xPct = (mouseX / width) - 0.5
        const yPct = (mouseY / height) - 0.5
        cardX.set(xPct * 15) // Max 15 degree tilt
        cardY.set(yPct * -15)
    }

    function handleCardMouseLeave() {
        cardX.set(0)
        cardY.set(0)
    }

    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
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

    // Calculate Fake Cursor exact coordinates cleanly
    useEffect(() => {
        const container = sceneContainerRef.current
        if (!container || !showCursor) return
        
        const getRelPos = (el: HTMLElement | null): { x: number; y: number } => {
            if (!el) return { x: 0, y: 0 }
            const cRect = container.getBoundingClientRect()
            const eRect = el.getBoundingClientRect()
            return {
                x: eRect.left - cRect.left + eRect.width * 0.7,
                y: eRect.top - cRect.top + eRect.height * 0.5
            }
        }
        
        let targetEl: HTMLElement | null = null
        if (scene === 'prompt') {
            targetEl = cursorTarget === 1 ? generateBtnRef.current : promptInputRef.current
        } else if (scene === 'style') {
            targetEl = cursorTarget >= 3 ? targetRatioRef.current : firstStyleRef.current
        }
        
        const pos = getRelPos(targetEl)
        setCursorPos(pos)
    }, [showCursor, cursorTarget, scene])

    // Start Demo Cycle when in view
    useEffect(() => {
        if (isInView && scene === "idle") setScene("prompt")
    }, [isInView, scene])

    // ============================================
    // SCENE TIMELINES
    // ============================================

    // 1. PROMPT
    useEffect(() => {
        if (scene !== "prompt") return
        setTypedLength(0)
        setShowCursor(false)
        setCursorClick(0)
        setCursorTarget(0)
        
        addTimeout(() => setShowCursor(true), 800)
        addTimeout(() => setCursorClick(c => c + 1), 1600)
        
        const typingDuration = PROMPT_TEXT.length * 60
        let typingInterval: ReturnType<typeof setInterval>
        addTimeout(() => {
            typingInterval = setInterval(() => {
                setTypedLength(prev => {
                    if (prev >= PROMPT_TEXT.length) {
                        clearInterval(typingInterval)
                        return prev
                    }
                    return prev + 1
                })
            }, 60)
        }, 1800)
        
        const postTypingDelay = 1800 + typingDuration
        addTimeout(() => setCursorTarget(1), postTypingDelay + 500)
        addTimeout(() => setCursorClick(c => c + 1), postTypingDelay + 1300)
        addTimeout(() => { setShowCursor(false); setScene("style") }, postTypingDelay + 1700)
        
        return () => { if (typingInterval) clearInterval(typingInterval) }
    }, [scene, addTimeout])

    // 2. STYLE
    useEffect(() => {
        if (scene !== "style") return
        setActiveStyle(-1)
        setActiveRatio(-1)
        setCursorTarget(0)
        setShowCursor(false)
        setCursorClick(0)
        
        addTimeout(() => { setShowCursor(true); setCursorTarget(1) }, 800)
        addTimeout(() => setCursorClick(c => c + 1), 1800)
        addTimeout(() => setActiveStyle(0), 1950)
        addTimeout(() => setCursorTarget(3), 2800)
        addTimeout(() => setCursorClick(c => c + 1), 3600)
        addTimeout(() => setActiveRatio(3), 3750)
        addTimeout(() => { setShowCursor(false); setScene("generate") }, 4600)
    }, [scene, addTimeout])

    // 3. GENERATE
    useEffect(() => {
        if (scene !== "generate") return
        setProgress(0)
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { clearInterval(interval); return 100 }
                return prev + 1.2
            })
        }, 40)
        addTimeout(() => setScene("result"), 3800)
        return () => clearInterval(interval)
    }, [scene, addTimeout])

    // 4. RESULT
    useEffect(() => {
        if (scene !== "result") return
        addTimeout(() => setScene("pause"), 6000)
    }, [scene, addTimeout])

    // 5. PAUSE
    useEffect(() => {
        if (scene !== "pause") return
        addTimeout(() => {
            setTypedLength(0)
            setActiveStyle(-1)
            setActiveRatio(-1)
            setProgress(0)
            setScene("prompt")
        }, 1200)
    }, [scene, addTimeout])


    return (
        <div ref={containerRef} className="relative w-full max-w-5xl mx-auto z-10">
            {/* === UPPER MAGICAL FLORA / BACKGROUND EFFECTS FOR FULL CONTAINER === */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(139,92,246,0.08),transparent)] pointer-events-none" />

            {/* === MAIN SHOWCASE CONTAINER (Fake Browser Window) === */}
            <div 
                onMouseMove={handleMouseMove}
                className="group/window relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_30px_80px_-20px_rgba(0,0,0,1)] bg-black/60 backdrop-blur-3xl"
            >
                {/* Dynamic Spotlight following cursor */}
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover/window:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                600px circle at ${mouseX}px ${mouseY}px,
                                rgba(139, 92, 246, 0.15),
                                transparent 80%
                            )
                        `,
                    }}
                />

                {/* === DECORATIONS (Floating background shapes inside window) === */}
                <motion.div className="absolute z-0 top-[18%] right-[8%] pointer-events-none opacity-40 text-violet-400"
                    animate={{ y: [0, -15, 0], rotate: [0, 15, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                    <WandSparkles className="w-10 h-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
                </motion.div>
                <motion.div className="absolute z-0 top-[45%] left-[8%] pointer-events-none opacity-40 text-fuchsia-400 hidden lg:block"
                    animate={{ y: [0, 20, 0], rotate: [0, -15, 8, 0], scale: [1, 1.2, 1] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                    <Sparkles className="w-12 h-12 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
                </motion.div>

                {/* Animated Glass Grid Background */}
                <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

                {/* Window Header */}
                <div className="h-[42px] border-b border-white/[0.08] bg-white/[0.02] flex items-center px-4 justify-between relative z-20 backdrop-blur-xl">
                    <div className="flex gap-2.5 items-center">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.4)]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.4)]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.4)]" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 rounded-full px-5 py-1.5 text-[10px] sm:text-[11px] font-medium text-white/50 border border-white/5 ring-1 ring-white/5 shadow-inner">
                        <MonitorPlay className="h-3 w-3 text-violet-400" />
                        zdream.vn/app/generate
                    </div>
                </div>

                {/* === SCENE CONTENT (Global Wrapper) === */}
                <div ref={sceneContainerRef} className="relative flex items-center justify-center h-[460px] sm:h-[480px] lg:h-[500px] p-3 sm:p-6 z-10 w-full">
                    
                    {/* Fake Cursor (Global) */}
                    <AnimatePresence>
                        {showCursor && (scene === 'prompt' || scene === 'style') && (
                            <motion.div
                                className="absolute text-white pointer-events-none z-[100] hidden md:block"
                                style={{ left: 0, top: 0 }}
                                initial={{ x: cursorPos.x + 30, y: cursorPos.y + 40, opacity: 0 }}
                                animate={{ x: cursorPos.x, y: cursorPos.y, opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                            >
                                <CursorSVG className="w-6 h-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
                                {cursorClick > 0 && (
                                    <motion.div
                                        key={`global-click-${cursorClick}`}
                                        className="absolute top-0 left-0 w-6 h-6 rounded-full border-2 border-fuchsia-400/80"
                                        initial={{ scale: 0.2, opacity: 1 }}
                                        animate={{ scale: [0.2, 3], opacity: [1, 0] }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        
                        {/* ─── SCENE 1: PROMPT ─── */}
                        {scene === "prompt" && (
                            <motion.div
                                key="scene-prompt"
                                className="w-full max-w-2xl mx-auto flex flex-col items-center"
                                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)", y: 20 }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", y: -20 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* Glowing Headings */}
                                <motion.div className="mb-8 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter">
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-fuchsia-200 to-pink-300">
                                            Bạn muốn vẽ gì
                                        </span>{" "}
                                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                                            hôm nay?
                                        </span>
                                    </h3>
                                    <motion.div
                                        className="mx-auto mt-3 h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent rounded-full"
                                        initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 1, delay: 0.4 }}
                                    />
                                </motion.div>

                                {/* Prompt Glass Input Box */}
                                <div className="w-full relative group/input">
                                    <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-xl opacity-20 group-hover/input:opacity-50 transition duration-1000 group-hover/input:duration-200" />
                                    <div className="relative w-full border border-white/10 rounded-[2rem] bg-[#0c0c0e]/80 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
                                        
                                        <div ref={promptInputRef} className="px-6 py-6 sm:py-7">
                                            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 font-medium leading-relaxed min-h-[40px] font-sans">
                                                {PROMPT_TEXT.substring(0, typedLength)}
                                                <motion.span
                                                    className="inline-block w-[3px] h-[1.1em] rounded-sm bg-fuchsia-400 ml-1 align-middle shadow-[0_0_10px_rgba(232,121,249,0.8)]"
                                                    animate={{ opacity: [1, 0, 1] }}
                                                    transition={{ duration: 0.8, repeat: Infinity }}
                                                />
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between px-5 pb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 drop-shadow-md">
                                                    <ImageIcon className="h-4 w-4" />
                                                </div>
                                                <Badge variant="secondary" className="h-6 rounded-full px-3 bg-white/5 text-white/50 border border-white/10">16:9</Badge>
                                                <Badge variant="secondary" className="h-6 rounded-full px-3 bg-white/5 text-white/50 border border-white/10">×2</Badge>
                                            </div>
                                            <motion.div
                                                ref={generateBtnRef}
                                                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] cursor-pointer ring-2 ring-violet-400/30"
                                                animate={typedLength > 10 ? { scale: [1, 1.05, 1], boxShadow: ["0 0 20px rgba(139,92,246,0.6)", "0 0 40px rgba(217,70,239,0.8)", "0 0 20px rgba(139,92,246,0.6)"] } : {}}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ─── SCENE 2: STYLE ─── */}
                        {scene === "style" && (
                            <motion.div
                                key="scene-style"
                                className="w-full max-w-xl mx-auto flex flex-col items-center gap-6 sm:gap-10"
                                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)", y: 20 }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", y: -20 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <motion.div className="text-center">
                                    <h3 className="text-2xl sm:text-4xl font-black tracking-tighter">
                                        <span className="text-white/80">Tùy chỉnh </span>
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-violet-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                                            phong cách
                                        </span>
                                    </h3>
                                </motion.div>

                                <div className="w-full space-y-4">
                                    <div className="flex items-center gap-2 mb-2 justify-center">
                                        <Palette className="h-5 w-5 text-fuchsia-400" />
                                        <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/50 font-bold">Menu Phong Cách</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 justify-center w-full max-w-[500px] mx-auto px-4">
                                        {STYLES.map((style, i) => (
                                            <motion.div
                                                key={style}
                                                ref={i === 0 ? firstStyleRef : undefined}
                                                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ delay: i * 0.08, duration: 0.5, type: "spring" }}
                                            >
                                                <Badge
                                                    variant={activeStyle === i ? "default" : "outline"}
                                                    className={`w-full flex justify-center cursor-default text-[11px] sm:text-[14px] py-2 sm:py-2.5 transition-all duration-500 rounded-xl font-medium ${activeStyle === i
                                                        ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white border-transparent shadow-[0_0_20px_rgba(217,70,239,0.6)] scale-110 ring-2 ring-white/20"
                                                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                                        }`}
                                                >
                                                    {style}
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="mt-2 mb-4 sm:my-8 h-px w-3/4 mx-auto bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                <div className="w-full space-y-3 sm:space-y-4">
                                    <div className="flex items-center gap-2 justify-center">
                                        <RectangleHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400" />
                                        <span className="text-[10px] sm:text-sm uppercase tracking-[0.2em] text-white/50 font-bold">Tỷ lệ khung hình</span>
                                    </div>
                                    <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
                                        {RATIOS.map((ratio, i) => (
                                            <motion.div
                                                key={ratio}
                                                ref={i === 3 ? targetRatioRef : undefined}
                                                className={`px-3 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-base font-bold transition-all duration-500 flex items-center justify-center min-w-[48px] sm:min-w-[64px] ${activeRatio === i
                                                    ? "bg-gradient-to-b from-fuchsia-500 to-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] scale-110 ring-2 ring-white/20"
                                                    : "bg-white/[0.03] text-white/40 border border-white/10"
                                                    }`}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + i * 0.08, duration: 0.5, type: "spring" }}
                                            >
                                                {ratio}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ─── SCENE 3: GENERATE (Ultra-Premium Fluid Aurora Glassmorphism) ─── */}
                        {scene === "generate" && (
                            <motion.div
                                key="scene-generate"
                                className="w-full max-w-2xl mx-auto flex items-center justify-center p-2 sm:p-4"
                                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {/* Aurora Render Canvas */}
                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0a0a0c] border border-white/[0.08] shadow-[0_40px_100px_-20px_rgba(232,121,249,0.3)] ring-1 ring-white/5">
                                    
                                {/* 1. Base Image heavily blurred and progressively sharpening */}
                                    <div className="absolute inset-0 z-0 bg-black">
                                        <motion.img 
                                            src={RESULT_IMAGE}
                                            alt="rendering..."
                                            className="w-full h-full object-cover"
                                            style={{
                                                filter: `blur(${Math.max(100 - progress, 0)}px) contrast(${0.5 + progress * 0.005}) brightness(${0.4 + progress * 0.006})`,
                                                scale: 1.2 - (progress * 0.001)
                                            }}
                                        />
                                    </div>

                                    {/* 2. Abstract Shifting Gradient Layer multiplying over it to simulate "AI processing colors" */}
                                    <motion.div 
                                        className="absolute inset-0 mix-blend-color z-10"
                                        style={{ opacity: (100 - progress) / 100 }}
                                        animate={{ backgroundPosition: ["0% 0%", "200% 200%", "0% 0%"] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                    >
                                        <div className="w-full h-full bg-gradient-to-tr from-fuchsia-600/60 via-violet-600/60 to-blue-500/60" style={{ backgroundSize: "200% 200%" }} />
                                    </motion.div>

                                    {/* 3. Magic Generative Dust (Deterministic pseudo-random) */}
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                                    {[...Array(20)].map((_, i) => {
                                        const r1 = (Math.sin(i * 12.34) + 1) / 2
                                        const r2 = (Math.cos(i * 43.21) + 1) / 2
                                        const r3 = (Math.sin(i * 76.54) + 1) / 2
                                        return (
                                            <motion.div
                                                key={`dust-${i}`}
                                                className="absolute w-1 h-1 bg-white rounded-full z-10"
                                                style={{
                                                    left: `${r1 * 100}%`,
                                                    top: `${r2 * 100}%`,
                                                    opacity: r3 * 0.5 + 0.1,
                                                    transform: `scale(${r1 * 0.5 + 0.5})`
                                                }}
                                                animate={{
                                                    y: [0, r2 * -50 - 20],
                                                    x: [0, r3 * 30 - 15],
                                                    opacity: [0, (r1 * 0.8 + 0.2), 0]
                                                }}
                                                transition={{
                                                    duration: r2 * 3 + 2,
                                                    repeat: Infinity,
                                                    delay: r3 * 2,
                                                    ease: "linear"
                                                }}
                                            />
                                        )
                                    })}

                                    {/* 4. Scanning Render Line */}
                                    <motion.div 
                                        className="absolute top-0 bottom-0 w-1 bg-white/[0.15] shadow-[0_0_20px_2px_rgba(255,255,255,0.8)] z-20 mix-blend-screen"
                                        style={{ left: `${progress}%` }}
                                        animate={{ opacity: [0.8, 1, 0.8] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                    />
                                    {/* Progress Highlight block behind scanner */}
                                    <div 
                                        className="absolute top-0 bottom-0 left-0 bg-white/[0.03] backdrop-blur-md z-10"
                                        style={{ width: `${progress}%` }}
                                    />

                                    {/* 5. Central Sleek Progress Indicator */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 scale-75 sm:scale-100">
                                        <motion.div 
                                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-white/20 bg-black/40 backdrop-blur-2xl flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
                                            animate={{ boxShadow: ["0 0 20px rgba(139,92,246,0.3)", "0 0 50px rgba(217,70,239,0.5)", "0 0 20px rgba(139,92,246,0.3)"] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tighter mix-blend-screen drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                                                {Math.round(progress)}<span className="text-xl sm:text-2xl text-white/40">%</span>
                                            </span>
                                            {/* Rotating dashed ring inside */}
                                            <motion.svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)]" viewBox="0 0 100 100"
                                                animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>
                                                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 8" />
                                            </motion.svg>
                                        </motion.div>

                                        <div className="mt-4 sm:mt-6 flex flex-col items-center">
                                            <Badge className="bg-white/10 text-white/90 border-white/20 px-3 py-1 sm:px-4 sm:py-1.5 mb-1.5 sm:mb-2 font-semibold tracking-wider text-[9px] sm:text-xs">
                                                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-fuchsia-300" /> AI Rendering Engine
                                            </Badge>
                                            <motion.p 
                                                className="text-white/80 font-medium tracking-[0.1em] text-[10px] sm:text-sm drop-shadow-md uppercase text-center px-4"
                                                animate={{ opacity: [0.4, 1, 0.4] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                {progress < 30 ? "Đang phân tích ngữ nghĩa..." : progress < 70 ? "Đang kết xuất không gian 3D..." : "Đang hoàn thiện chi tiết cuối..."}
                                            </motion.p>
                                        </div>
                                    </div>
                                    
                                    {/* Scanline overlay for that premium screen effect */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] mix-blend-overlay pointer-events-none z-40 opacity-50" />
                                </div>
                            </motion.div>
                        )}

                        {/* ─── SCENE 4: RESULT (Tilt & Laser Scanner) ─── */}
                        {scene === "result" && (
                            <motion.div
                                key="scene-result"
                                className="w-full h-full absolute inset-0 flex items-center justify-center p-4 sm:p-6 perspective-1000"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                transition={{ duration: 0.7 }}
                            >
                                {/* Immersive White Flash */}
                                <motion.div
                                    className="absolute inset-0 bg-white z-50 rounded-2xl pointer-events-none"
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: 0 }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />

                                <motion.div
                                    onMouseMove={handleCardMouseMove}
                                    onMouseLeave={handleCardMouseLeave}
                                    style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                                    className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(139,92,246,0.5)] ring-1 ring-white/20 transition-all duration-300 ease-out z-30"
                                    initial={{ scale: 0.8, filter: "blur(20px)" }}
                                    animate={{ scale: 1, filter: "blur(0px)" }}
                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {/* The Single Target Artwork */}
                                    <div className="absolute inset-0 z-0 bg-black pointer-events-auto group/img cursor-pointer">
                                        <div className="relative w-full h-full overflow-hidden bg-[#0a0a0c]">
                                            <motion.img
                                                src={RESULT_IMAGE}
                                                alt="Generated AI Art"
                                                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700 ease-out"
                                                initial={{ scale: 1 }}
                                                animate={{ scale: 1.08 }}
                                                transition={{ duration: 5, ease: "easeOut" }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors duration-300 pointer-events-none" />
                                            
                                            {/* Simulate Interactive Badges appearing on hover */}
                                            <div className="absolute top-4 right-4 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-wrap justify-end gap-2">
                                                <div className="backdrop-blur-md bg-black/40 border border-white/20 text-white/90 text-xs sm:text-sm px-3 py-1.5 rounded-lg shadow-lg hover:bg-white/20 hover:text-white transition-colors">
                                                    Upscale
                                                </div>
                                                <div className="backdrop-blur-md bg-black/40 border border-white/20 text-white/90 text-xs sm:text-sm px-3 py-1.5 rounded-lg shadow-lg hover:bg-white/20 hover:text-white transition-colors">
                                                    Variation
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Laser Scanner Line matching the image width */}
                                    <motion.div 
                                        className="absolute left-0 right-0 h-[2px] bg-white shadow-[0_0_20px_4px_rgba(217,70,239,0.8)] z-40"
                                        initial={{ top: "0%", opacity: 0 }}
                                        animate={{ top: ["0%", "100%", "200%"], opacity: [0, 1, 1, 0] }}
                                        transition={{ duration: 2.5, ease: "linear", times: [0, 0.1, 0.9, 1] }}
                                    />

                                    {/* Dark overlay at bottom for text readability (Flexible padding instead of height to prevent squishing) */}
                                    <div className="absolute inset-x-0 bottom-0 pt-16 pb-3 px-3 sm:pt-24 sm:pb-8 sm:px-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col justify-end pointer-events-none rounded-b-2xl" style={{ transform: "translateZ(30px)" }}>
                                        <Badge className="w-fit mb-2 sm:mb-3 bg-black/40 backdrop-blur-md text-white/90 border border-white/20 shadow-xl px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs">
                                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-fuchsia-300" /> Studio AI Render
                                        </Badge>
                                        <h2 className="text-white font-bold text-sm sm:text-xl lg:text-2xl leading-snug drop-shadow-xl line-clamp-2 md:line-clamp-3">
                                            {PROMPT_TEXT}
                                        </h2>
                                    </div>
                                    
                                    {/* Top Left Specs */}
                                    <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex gap-2" style={{ transform: "translateZ(20px)" }}>
                                        <div className="bg-black/40 backdrop-blur-md text-white/90 text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                                            <ZapIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" /> ~10s
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
