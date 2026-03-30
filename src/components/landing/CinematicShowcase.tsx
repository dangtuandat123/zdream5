import { useEffect, useState, useRef, useCallback } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
    Sparkles,
    WandSparkles,
    Star,
    Palette,
    ZapIcon,
    ArrowUp,
    Wand2,
    ImageIcon,
    RectangleHorizontal,
    Check,
    MousePointerClick,
    MonitorPlay,
} from "lucide-react"

// ============================================================
// DATA
// ============================================================

const PROMPT_TEXT = "A cute fox wearing a spacesuit, floating in galaxy"
const STYLES = ["Digital Art", "Anime", "Chân thực", "3D Render", "Sơn dầu"]
const RATIOS = ["1:1", "3:4", "4:3", "16:9", "9:16"]
const RESULT_IMG = "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&h=450&auto=format&fit=crop"

// ============================================================
// SCENE TYPES
// ============================================================

type Scene = "idle" | "prompt" | "style" | "generate" | "result" | "pause"

// Con trỏ chuột giả lập
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
    const [scene, setScene] = useState<Scene>("idle")
    const [typedLength, setTypedLength] = useState(0)
    const [activeStyle, setActiveStyle] = useState(-1)
    const [activeRatio, setActiveRatio] = useState(-1)
    const [progress, setProgress] = useState(0)
    const [showCursor, setShowCursor] = useState(false)
    const [cursorClick, setCursorClick] = useState(0)
    const [cursorTarget, setCursorTarget] = useState(0)
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
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

    // Tính toán vị trí cursor dựa trên ref thực tế
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

    // Bắt đầu khi vào view
    useEffect(() => {
        if (isInView && scene === "idle") setScene("prompt")
    }, [isInView, scene])

    // === SCENE: PROMPT — breathing pause → cursor arrives → click → typing begins → moves to gen button → click ===
    useEffect(() => {
        if (scene !== "prompt") return
        setTypedLength(0)
        setShowCursor(false)
        setCursorClick(0)
        setCursorTarget(0)
        
        // 800ms: cursor appears and glides to text input
        addTimeout(() => setShowCursor(true), 800)
        
        // 1600ms: cursor clicks text input
        addTimeout(() => setCursorClick(c => c + 1), 1600)
        
        // 1800ms: typing starts
        const typingDuration = PROMPT_TEXT.length * 70
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
            }, 70)
        }, 1800)
        
        // After typing finishes + 400ms pause: cursor glides to "ArrowUp" generate button
        const postTypingDelay = 1800 + typingDuration
        addTimeout(() => setCursorTarget(1), postTypingDelay + 400)
        
        // Cursor arrives and clicks button
        addTimeout(() => setCursorClick(c => c + 1), postTypingDelay + 1200)
        
        // Advance scene shortly after click
        addTimeout(() => { setShowCursor(false); setScene("style") }, postTypingDelay + 1600)
        
        return () => { if (typingInterval) clearInterval(typingInterval) }
    }, [scene, addTimeout])

    // === SCENE: STYLE — cursor arrives → click style → pause → cursor moves → click ratio ===
    useEffect(() => {
        if (scene !== "style") return
        setActiveStyle(-1)
        setActiveRatio(-1)
        setCursorTarget(0)
        setShowCursor(false)
        setCursorClick(0)
        // 800ms breathing pause
        // 1.0s: cursor appears, slides to style area
        addTimeout(() => { setShowCursor(true); setCursorTarget(1) }, 1000)
        // 2.0s: cursor clicks (ripple)
        addTimeout(() => setCursorClick(c => c + 1), 2000)
        // 2.2s: style highlights (after cursor click)
        addTimeout(() => setActiveStyle(0), 2200)
        // 3.2s: cursor slides down to ratio area
        addTimeout(() => setCursorTarget(3), 3200)
        // 4.0s: cursor clicks ratio
        addTimeout(() => setCursorClick(c => c + 1), 4000)
        // 4.2s: ratio highlights
        addTimeout(() => setActiveRatio(3), 4200)
        // 5.5s: advance
        addTimeout(() => { setShowCursor(false); setScene("generate") }, 5500)
    }, [scene, addTimeout])

    // === SCENE: GENERATE — progress bar ===
    useEffect(() => {
        if (scene !== "generate") return
        setProgress(0)
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { clearInterval(interval); return 100 }
                return prev + 1.5
            })
        }, 55)
        addTimeout(() => setScene("result"), 4000)
        return () => clearInterval(interval)
    }, [scene, addTimeout])

    // === SCENE: RESULT — show kết quả ===
    useEffect(() => {
        if (scene !== "result") return
        addTimeout(() => setScene("pause"), 5500)
    }, [scene, addTimeout])

    // === SCENE: PAUSE — reset ===
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
        <div ref={containerRef} className="relative w-full max-w-5xl mx-auto">
            {/* === MAIN SHOWCASE CONTAINER (Fake Browser Window) === */}
            <div className="relative rounded-2xl overflow-hidden bg-background/60 border border-border/20 shadow-2xl ring-1 ring-white/[0.04] min-h-[420px] sm:min-h-[480px]">
                
                {/* Window Header */}
                <div className="h-12 border-b border-white/[0.08] bg-black/40 flex items-center px-4 justify-between relative z-20">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 rounded-md px-4 py-1.5 text-[11px] font-medium text-white/40 border border-white/5">
                        <MonitorPlay className="h-3 w-3" />
                        zdream.vn/app/generate
                    </div>
                </div>

                {/* Background glow */}
                <div className="absolute inset-x-0 bottom-0 top-12 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(139,92,246,0.06),transparent)] pointer-events-none" />

                {/* === DECORATIONS — Giống Hero section === */}
                {/* 1. WandSparkles floating */}
                <motion.div className="absolute z-0 top-[12%] right-[10%] pointer-events-none opacity-50 text-violet-400"
                    animate={{ y: [0, -15, 0], rotate: [0, 12, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                    <WandSparkles className="w-8 h-8 md:w-12 md:h-12 drop-shadow-[0_0_18px_rgba(139,92,246,0.6)]" />
                </motion.div>
                {/* 2. Sparkles floating */}
                <motion.div className="absolute z-0 top-[45%] left-[6%] pointer-events-none opacity-40 text-fuchsia-400 hidden lg:block"
                    animate={{ y: [0, 20, 0], rotate: [0, -15, 8, 0], scale: [1, 1.15, 1] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                    <Sparkles className="w-7 h-7 md:w-10 md:h-10 drop-shadow-[0_0_14px_rgba(217,70,239,0.5)]" />
                </motion.div>
                {/* 3. Glass Sphere */}
                <motion.div className="absolute z-0 bottom-[25%] left-[5%] pointer-events-none opacity-35 hidden lg:block"
                    animate={{ y: [0, 25, 0], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
                    <svg width="50" height="50" viewBox="0 0 100 100" fill="url(#cs-sphere-grad)" className="drop-shadow-[0_0_18px_rgba(139,92,246,0.2)]">
                        <defs><radialGradient id="cs-sphere-grad" cx="30%" cy="30%" r="70%"><stop stopColor="#c4b5fd" /><stop offset="1" stopColor="#4c1d95" /></radialGradient></defs>
                        <circle cx="50" cy="50" r="40" opacity="0.8" />
                        <path d="M 30 30 Q 50 10 70 30" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
                    </svg>
                </motion.div>
                {/* 4. Glowing Diamond */}
                <motion.div className="absolute z-0 top-[65%] right-[8%] pointer-events-none opacity-40 hidden lg:block"
                    animate={{ y: [0, -18, 0], rotate: [0, 90, 180] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="url(#cs-diamond-grad)" strokeWidth="1.5" className="drop-shadow-[0_0_14px_rgba(217,70,239,0.5)]">
                        <defs><linearGradient id="cs-diamond-grad" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#f0abfc" /><stop offset="1" stopColor="#c084fc" /></linearGradient></defs>
                        <path d="M12 2L2 12l10 10 10-10L12 2z" />
                    </svg>
                </motion.div>
                {/* 5. Star Dust */}
                <motion.div className="absolute z-0 bottom-[15%] right-[20%] pointer-events-none opacity-25 text-white"
                    animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360], opacity: [0.1, 0.35, 0.1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <Star className="w-6 h-6 fill-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
                </motion.div>


                {/* === SCENE CONTENT (CENTER — ISOLATED) === */}
                <div ref={sceneContainerRef} className="relative flex items-center justify-center min-h-[420px] sm:min-h-[480px] p-6 sm:p-10">
                    {/* GLOBAL MAGIC CURSOR — positioned by ref-based getBoundingClientRect */}
                    <AnimatePresence>
                        {showCursor && (scene === 'prompt' || scene === 'style') && (
                            <motion.div
                                className="absolute text-white pointer-events-none z-50 hidden sm:block"
                                style={{ left: 0, top: 0 }}
                                initial={{ x: cursorPos.x + 30, y: cursorPos.y + 20, opacity: 0 }}
                                animate={{ x: cursorPos.x, y: cursorPos.y, opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: 'spring', stiffness: 50, damping: 14 }}
                            >
                                <CursorSVG className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" />
                                {cursorClick > 0 && (
                                    <motion.div
                                        key={`global-click-${cursorClick}`}
                                        className="absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-violet-400/60"
                                        initial={{ scale: 0.5, opacity: 0.8 }}
                                        animate={{ scale: [0.5, 3], opacity: [0.8, 0] }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                        {/* ─── SCENE: PROMPT ─── */}
                        {scene === "prompt" && (
                            <motion.div
                                key="scene-prompt"
                                className="w-full max-w-2xl mx-auto flex flex-col items-center"
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* Fake cursor con trỏ */}
                                <motion.div
                                    className="text-violet-400 mb-3"
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <MousePointerClick className="h-5 w-5" />
                                </motion.div>

                                {/* ═══ CAPTION: chũ chạy từ trái sang phải + stagger từng chữ ═══ */}
                                <motion.div
                                    className="mb-5 overflow-hidden"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <motion.h3
                                        className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-center"
                                        initial={{ x: -80, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300">Nhập mô tả </span>
                                        <motion.span
                                            className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6, duration: 0.4 }}
                                        >
                                            ý tưởng
                                        </motion.span>
                                    </motion.h3>
                                    {/* Animated underline chạy theo chữ */}
                                    <motion.div
                                        className="mx-auto mt-2 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-transparent rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: '60%' }}
                                        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                                    />
                                </motion.div>
                                {/* Prompt bar — cực to, tách biệt */}
                                <div className="w-full relative">
                                    <div className="relative w-full border-2 border-violet-500/40 rounded-2xl bg-[#1a1b1e]/90 shadow-2xl shadow-violet-500/10 ring-1 ring-violet-500/20 overflow-hidden">
                                        {/* Glow effect behind */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-violet-500/5 pointer-events-none"
                                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <div ref={promptInputRef} className="px-5 sm:px-6 py-4 sm:py-5">
                                            <p className="text-base sm:text-lg lg:text-xl text-white/90 font-medium leading-relaxed min-h-[32px]">
                                                {PROMPT_TEXT.substring(0, typedLength)}
                                                <motion.span
                                                    className="inline-block w-[2px] h-[1.2em] bg-violet-400 ml-0.5 align-middle"
                                                    animate={{ opacity: [1, 0, 1] }}
                                                    transition={{ duration: 0.8, repeat: Infinity }}
                                                />
                                            </p>
                                        </div>
                                        {/* Toolbar */}
                                        <div className="flex items-center justify-between px-4 pb-3">
                                            <div className="flex items-center gap-1">
                                                <div className="h-7 w-7 rounded-full flex items-center justify-center text-white/20">
                                                    <ImageIcon className="h-3.5 w-3.5" />
                                                </div>
                                                <Badge variant="secondary" className="text-[9px] h-5 rounded-full px-2 bg-white/5 text-white/30 border-0">16:9</Badge>
                                                <Badge variant="secondary" className="text-[9px] h-5 rounded-full px-2 bg-white/5 text-white/30 border-0">×2</Badge>
                                            </div>
                                            <motion.div
                                                ref={generateBtnRef}
                                                className="h-9 w-9 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30"
                                                animate={typedLength > 10 ? { scale: [1, 1.1, 1] } : {}}
                                                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ─── SCENE: STYLE ─── */}
                        {scene === "style" && (
                            <motion.div
                                key="scene-style"
                                className="w-full max-w-lg mx-auto flex flex-col items-center gap-8"
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* ═══ CAPTION: text rơi từ trên xuống giữa các component ═══ */}
                                <motion.div
                                    className="text-center mb-2"
                                    initial={{ y: -30, opacity: 0, scale: 0.9 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                                        <motion.span
                                            className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 to-violet-300 inline-block"
                                            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                            style={{ backgroundSize: '200% 200%' }}
                                        >
                                            Tùy chỉnh
                                        </motion.span>{' '}
                                        <span className="text-white/80">phong cách</span>
                                    </h3>
                                </motion.div>
                                {/* Phong cách */}
                                <div className="w-full space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Palette className="h-4 w-4 text-violet-400" />
                                        <span className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">Phong cách</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {STYLES.map((style, i) => (
                                            <motion.div
                                                key={style}
                                                ref={i === 0 ? firstStyleRef : undefined}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.08, duration: 0.4 }}
                                            >
                                                <Badge
                                                    variant={activeStyle === i ? "default" : "outline"}
                                                    className={`cursor-default text-sm px-4 py-2 transition-all duration-500 ${activeStyle === i
                                                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-lg shadow-violet-500/30 scale-110 ring-2 ring-violet-400/40"
                                                        : "border-white/15 text-white/50 hover:border-white/30"
                                                        }`}
                                                >
                                                    {style}
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </div>
                                    {/* Cursor click animation khi chọn */}
                                    <AnimatePresence>
                                        {activeStyle >= 0 && (
                                            <motion.div
                                                className="flex justify-center"
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                                                transition={{ duration: 0.8 }}
                                            >
                                                <Check className="h-5 w-5 text-green-400" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* ═══ CAPTION giữa 2 section: slide ngang từ phải ═══ */}
                                <motion.div
                                    className="flex items-center gap-3 justify-center py-1"
                                    initial={{ x: 40, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-violet-500/40" />
                                    <span className="text-[11px] uppercase tracking-[0.2em] text-violet-300/60 font-semibold">&</span>
                                    <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-fuchsia-500/40" />
                                </motion.div>

                                {/* Tỷ lệ */}
                                <div className="w-full space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <RectangleHorizontal className="h-4 w-4 text-fuchsia-400" />
                                        <span className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">Tỷ lệ khung hình</span>
                                    </div>
                                    <div className="flex gap-2 justify-center">
                                        {RATIOS.map((ratio, i) => (
                                            <motion.div
                                                key={ratio}
                                                ref={i === 3 ? targetRatioRef : undefined}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-500 ${activeRatio === i
                                                    ? "bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30 scale-110 ring-2 ring-violet-400/30"
                                                    : "bg-white/[0.04] text-white/40 border border-white/10"
                                                    }`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                                            >
                                                {ratio}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                            </motion.div>
                        )}

                        {/* ─── SCENE: GENERATE ─── */}
                        {scene === "generate" && (
                            <motion.div
                                key="scene-generate"
                                className="w-full max-w-lg mx-auto flex flex-col items-center gap-5 relative"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* ═══ CENTRAL ORB — Icon + Orbital Rings + Energy Waves ═══ */}
                                <div className="relative flex items-center justify-center w-44 h-44 sm:w-52 sm:h-52">
                                    {/* Energy ripple waves */}
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={`wave-${i}`}
                                            className="absolute inset-0 rounded-full border border-violet-500/20"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: [0.5, 1.8], opacity: [0.6, 0] }}
                                            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
                                        />
                                    ))}

                                    {/* Orbital ring 1 — fast, dashed */}
                                    <motion.div
                                        className="absolute inset-2"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
                                            <defs>
                                                <linearGradient id="gen-orbit1" x1="0" y1="0" x2="200" y2="200">
                                                    <stop stopColor="#a78bfa" stopOpacity="0.6" />
                                                    <stop offset="0.5" stopColor="transparent" />
                                                    <stop offset="1" stopColor="#c084fc" stopOpacity="0.4" />
                                                </linearGradient>
                                            </defs>
                                            <circle cx="100" cy="100" r="90" stroke="url(#gen-orbit1)" strokeWidth="1.5" strokeDasharray="8 12" />
                                        </svg>
                                        <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                                    </motion.div>

                                    {/* Orbital ring 2 — reversed */}
                                    <motion.div
                                        className="absolute inset-5"
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
                                            <defs>
                                                <linearGradient id="gen-orbit2" x1="200" y1="0" x2="0" y2="200">
                                                    <stop stopColor="#e879f9" stopOpacity="0.5" />
                                                    <stop offset="0.5" stopColor="transparent" />
                                                    <stop offset="1" stopColor="#a78bfa" stopOpacity="0.3" />
                                                </linearGradient>
                                            </defs>
                                            <circle cx="100" cy="100" r="90" stroke="url(#gen-orbit2)" strokeWidth="1" strokeDasharray="4 16" />
                                        </svg>
                                        <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.8)]" />
                                    </motion.div>

                                    {/* Orbital ring 3 — tilted, slow */}
                                    <motion.div
                                        className="absolute -inset-2 [transform:rotateX(60deg)]"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
                                            <circle cx="100" cy="100" r="95" stroke="rgba(192,132,252,0.15)" strokeWidth="1" strokeDasharray="6 20" />
                                        </svg>
                                    </motion.div>

                                    {/* Breathing glow ring */}
                                    <motion.div
                                        className="absolute inset-[30%] rounded-2xl"
                                        animate={{
                                            boxShadow: [
                                                '0 0 30px rgba(139,92,246,0.2), inset 0 0 20px rgba(139,92,246,0.1)',
                                                '0 0 60px rgba(139,92,246,0.4), inset 0 0 30px rgba(139,92,246,0.2)',
                                                '0 0 30px rgba(139,92,246,0.2), inset 0 0 20px rgba(139,92,246,0.1)',
                                            ]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />

                                    {/* Central icon */}
                                    <motion.div
                                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-violet-700/30 backdrop-blur-sm flex items-center justify-center ring-1 ring-violet-400/30 z-10"
                                        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <Wand2 className="h-9 w-9 sm:h-11 sm:w-11 text-violet-300 drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]" />
                                        <motion.div
                                            className="absolute -top-1.5 -right-1.5 text-fuchsia-300"
                                            animate={{ scale: [0.8, 1.3, 0.8], rotate: [0, 180, 360] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Sparkles className="h-4 w-4 drop-shadow-[0_0_6px_rgba(232,121,249,0.6)]" />
                                        </motion.div>
                                        <motion.div
                                            className="absolute -bottom-1 -left-1.5 text-violet-300"
                                            animate={{ scale: [1, 0.7, 1], rotate: [0, -90, -180] }}
                                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                                        >
                                            <Star className="w-3 h-3 fill-violet-300 drop-shadow-[0_0_4px_rgba(167,139,250,0.5)]" />
                                        </motion.div>
                                    </motion.div>
                                </div>

                                {/* ═══ CAPTION ═══ */}
                                <motion.div className="text-center space-y-2">
                                    <motion.h3
                                        className="text-2xl sm:text-3xl font-black tracking-tight"
                                        initial={{ scale: 0.8, opacity: 0, y: 10 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <motion.span
                                            className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300"
                                            style={{ filter: 'drop-shadow(0 0 16px rgba(139,92,246,0.5))' }}
                                        >
                                            AI đang sáng tạo
                                        </motion.span>
                                        <motion.span
                                            className="inline-flex ml-1"
                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <span className="text-fuchsia-300/70">...</span>
                                        </motion.span>
                                    </motion.h3>
                                    <motion.p
                                        className="text-white/40 text-sm italic max-w-sm mx-auto"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        "{PROMPT_TEXT}"
                                    </motion.p>
                                </motion.div>

                                {/* ═══ PROGRESS BAR — Premium glowing ═══ */}
                                <motion.div
                                    className="w-full max-w-sm space-y-2.5"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    <div className="flex justify-between text-xs px-1">
                                        <span className="text-white/40 font-medium">Đang xử lý</span>
                                        <motion.span
                                            className="text-violet-300 font-mono tabular-nums font-bold text-sm"
                                            key={Math.round(progress)}
                                            initial={{ scale: 1.3, color: '#e879f9' }}
                                            animate={{ scale: 1, color: '#c4b5fd' }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {Math.round(progress)}%
                                        </motion.span>
                                    </div>
                                    <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden relative ring-1 ring-white/[0.04]">
                                        <motion.div
                                            className="h-full rounded-full relative overflow-hidden"
                                            style={{
                                                width: `${progress}%`,
                                                background: 'linear-gradient(90deg, #7c3aed, #c026d3, #a855f7, #7c3aed)',
                                                backgroundSize: '200% 100%',
                                            }}
                                        >
                                            <motion.div
                                                className="absolute inset-0"
                                                style={{ background: 'linear-gradient(90deg, #7c3aed, #c026d3, #a855f7, #7c3aed)', backgroundSize: '200% 100%' }}
                                                animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                                        </motion.div>
                                        <motion.div
                                            className="absolute -bottom-1 left-0 h-3 rounded-full blur-md"
                                            style={{
                                                width: `${progress}%`,
                                                background: 'linear-gradient(90deg, rgba(124,58,237,0.4), rgba(192,38,211,0.4))',
                                            }}
                                        />
                                    </div>
                                </motion.div>

                                {/* ═══ CONSTELLATION PARTICLES ═══ */}
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute rounded-full pointer-events-none"
                                        style={{
                                            width: 2 + (i % 3) * 2,
                                            height: 2 + (i % 3) * 2,
                                            left: `${10 + (i * 7) % 80}%`,
                                            top: `${8 + (i * 11) % 84}%`,
                                            background: i % 2 === 0 ? 'rgba(167,139,250,0.5)' : 'rgba(232,121,249,0.4)',
                                            boxShadow: i % 3 === 0 ? '0 0 6px rgba(167,139,250,0.4)' : 'none',
                                        }}
                                        animate={{
                                            y: [0, -20 - (i % 4) * 15, 0],
                                            x: [0, (i % 2 === 0 ? 10 : -10), 0],
                                            opacity: [0, 0.8, 0],
                                            scale: [0, 1.2, 0],
                                        }}
                                        transition={{
                                            duration: 2.5 + (i % 3) * 0.8,
                                            repeat: Infinity,
                                            delay: (i * 0.35) % 3,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                ))}
                            </motion.div>
                        )}

                        {/* ─── SCENE: RESULT ─── */}
                        {scene === "result" && (
                            <motion.div
                                key="scene-result"
                                className="w-full max-w-2xl mx-auto"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* White flash */}
                                <motion.div
                                    className="absolute inset-0 bg-white/40 rounded-2xl pointer-events-none z-20"
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                />

                                {/* Result image */}
                                <div className="relative rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl group">
                                    <motion.div
                                        className="relative aspect-video"
                                        initial={{ scale: 1.1 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                    >
                                        <img
                                            src={RESULT_IMG}
                                            alt="AI Generated Artwork"
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                    </motion.div>

                                    {/* ═══ CAPTION: text sweep ngang qua ảnh từ phải ═══ */}
                                    <motion.div
                                        className="absolute top-4 left-4 z-10 pointer-events-none"
                                        initial={{ x: 60, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <motion.h3
                                            className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                                            animate={{ textShadow: ['0 0 0px rgba(139,92,246,0)', '0 0 20px rgba(139,92,246,0.5)', '0 0 0px rgba(139,92,246,0)'] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-200 to-fuchsia-200">
                                                Tác phẩm AI
                                            </span>
                                        </motion.h3>
                                        {/* Shimmer trail */}
                                        <motion.div
                                            className="mt-1.5 h-[2px] bg-gradient-to-r from-violet-400 via-fuchsia-400 to-transparent rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
                                        />
                                    </motion.div>

                                    {/* Speed badge */}
                                    <motion.div
                                        className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full ring-1 ring-white/10"
                                        initial={{ opacity: 0, scale: 0.7, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                                    >
                                        <ZapIcon className="h-3.5 w-3.5 text-amber-400" />
                                        <span className="text-[11px] font-bold text-white/90">~10 giây</span>
                                    </motion.div>

                                    {/* Bottom info bar */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 p-4"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                    >
                                        <p className="text-white/80 text-sm font-medium mb-2 drop-shadow-md">
                                            {PROMPT_TEXT}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Badge className="text-[10px] bg-violet-600/60 backdrop-blur text-white border border-violet-500/30">Digital Art</Badge>
                                            <Badge className="text-[10px] bg-black/50 backdrop-blur text-white/80 border border-white/10">16:9</Badge>
                                            <Badge className="text-[10px] bg-black/50 backdrop-blur text-white/80 border border-white/10">×2</Badge>
                                        </div>
                                    </motion.div>

                                    {/* Sparkle decorations */}
                                    <motion.div
                                        className="absolute top-6 left-6 text-violet-400 pointer-events-none"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                                        transition={{ duration: 1.5, delay: 0.3 }}
                                    >
                                        <Sparkles className="h-5 w-5" />
                                    </motion.div>
                                    <motion.div
                                        className="absolute bottom-16 right-8 text-fuchsia-400 pointer-events-none"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                                        transition={{ duration: 1.5, delay: 0.7 }}
                                    >
                                        <Star className="w-4 h-4 fill-fuchsia-400" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    )
}
