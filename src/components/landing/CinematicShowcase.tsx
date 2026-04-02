import { useEffect, useState, useRef, useCallback } from "react"
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
    Sparkles,
    ArrowUp,
    ImageIcon,
    ZapIcon,
    MonitorPlay,
    History,
    Settings2,
    Upload
} from "lucide-react"

// ============================================================
// DATA & CONSTANTS
// ============================================================

const PROMPT_TEXT = "@Ảnh 1 hãy đưa cô ấy đến một buổi tiệc bãi biển phong cách Y2K cổ điển"
const PROMPT_AFTER_MENTION = "hãy đưa cô ấy đến một buổi tiệc bãi biển phong cách Y2K cổ điển"
const REF_IMAGE = "/assets/ref_person.png"
const STYLES = [
    { name: "Digital Art", image: "/assets/style_digital_art.png", glow: "rgba(139,92,246,0.8)" },
    { name: "Anime", image: "/assets/style_anime.png", glow: "rgba(236,72,153,0.8)" },
    { name: "Chân thực", image: "/assets/style_realistic.png", glow: "rgba(16,185,129,0.7)" },
    { name: "3D Render", image: "/assets/style_3d_render.png", glow: "rgba(56,189,248,0.7)" },
    { name: "Sơn dầu", image: "/assets/style_oil_painting.png", glow: "rgba(251,146,60,0.7)" },
    { name: "Cyberpunk", image: "/assets/style_cyberpunk.png", glow: "rgba(234,179,8,0.8)" },
    { name: "Watercolor", image: "/assets/style_watercolor.png", glow: "rgba(147,197,253,0.7)" },
    { name: "Pixel Art", image: "/assets/style_pixel_art.png", glow: "rgba(52,211,153,0.7)" },
    { name: "Phác hoạ", image: "/assets/style_sketch.png", glow: "rgba(209,213,219,0.5)" },
    { name: "Fantasy", image: "/assets/style_fantasy.png", glow: "rgba(167,139,250,0.8)" },
]
const RESULT_IMAGE = "/assets/result_beach_party.png"

type Scene = "idle" | "compose" | "generate" | "result" | "pause"
type ComposePhase = "drag-ref" | "show-mention" | "typing" | "reveal-styles" | "pick-style" | "click-generate" | "flash"

function CursorSVG({ className }: { className?: string }) {
    return (
        <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    )
}

// Generate random matrix numbers for the background effect
function MatrixBackground({ progress }: { progress: number }) {
    const [matrix, setMatrix] = useState("")
    const isActive = progress <= 98
    
    useEffect(() => {
        if (!isActive) return
        const interval = setInterval(() => {
            let str = ""
            const chars = "01VXZAXY&%#@!<>{}[]" 
            for (let i = 0; i < 200; i++) {
                str += chars[Math.floor(Math.random() * chars.length)] + " "
            }
            setMatrix(str)
        }, 100)
        return () => clearInterval(interval)
    }, [isActive])

    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.03] select-none pointer-events-none break-all text-[8px] font-mono leading-none tracking-widest text-[#a855f7] z-0">
            {matrix}
        </div>
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
    const targetStyleRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(containerRef, { once: false, margin: "-100px" })

    // Scene & Flow State
    const [scene, setScene] = useState<Scene>("idle")
    const [composePhase, setComposePhase] = useState<ComposePhase>("typing")
    const [typedLength, setTypedLength] = useState(0)
    const [activeStyle, setActiveStyle] = useState(-1)
    const [progress, setProgress] = useState(0)
    const [refInPrompt, setRefInPrompt] = useState(false) // ảnh ref đã "bay" vào prompt chưa
    const [refDragging, setRefDragging] = useState(false) // đang kéo ảnh ref
    
    // Smooth Coverflow Scroll
    const scrollTarget = useMotionValue(0)
    const scrollX = useSpring(scrollTarget, { stiffness: 60, damping: 15, mass: 1.2 })

    // Fake Cursor State
    const [showCursor, setShowCursor] = useState(false)
    const [cursorClick, setCursorClick] = useState(0)
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

    // Spotlight & 3D Tilt for Result Window
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const cardX = useMotionValue(0)
    const cardY = useMotionValue(0)
    const springX = useSpring(cardX, { stiffness: 150, damping: 20 })
    const springY = useSpring(cardY, { stiffness: 150, damping: 20 })
    const rotateX = useMotionTemplate`${springY}deg`
    const rotateY = useMotionTemplate`${springX}deg`

    function handleWindowMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const { currentTarget, clientX, clientY } = e
        const { left, top, width, height } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
        
        if (scene === "result") {
            const xPct = ((clientX - left) / width) - 0.5
            const yPct = ((clientY - top) / height) - 0.5
            cardX.set(xPct * 15)
            cardY.set(yPct * -15)
        }
    }

    function handleWindowMouseLeave() {
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

    // Cursor Follow Logic
    useEffect(() => {
        const container = sceneContainerRef.current
        if (!container || !showCursor) return

        const getPos = (el: HTMLElement | null, offsetX = 0.5, offsetY = 0.5) => {
            if (!el) return { x: 0, y: 0 }
            const cRect = container.getBoundingClientRect()
            const eRect = el.getBoundingClientRect()
            return {
                x: eRect.left - cRect.left + eRect.width * offsetX,
                y: eRect.top - cRect.top + eRect.height * offsetY
            }
        }

        let target: HTMLElement | null = null
        if (composePhase === 'typing') target = promptInputRef.current
        else if (composePhase === 'pick-style') target = targetStyleRef.current
        else if (composePhase === 'click-generate') target = generateBtnRef.current

        // Delay getting the position slightly to allow camera shift to settle
        requestAnimationFrame(() => {
            setCursorPos(getPos(target, 0.7, 0.5))
        })
    }, [showCursor, composePhase, activeStyle, typedLength])

    // Start Demo Cycle
    useEffect(() => {
        if (isInView && scene === "idle") setScene("compose")
    }, [isInView, scene])

    // ============================================
    // THE MASTER TIMELINE (Extreme Version)
    // ============================================
    useEffect(() => {
        if (scene !== "compose") return
        
        // Dọn dẹp mọi timeout cũ trước khi bắt đầu timeline mới
        clearAllTimeouts()
        
        setTypedLength(0)
        setActiveStyle(-1)
        scrollTarget.set(-(5 * 166 + 75))
        setShowCursor(false)
        setCursorClick(0)
        setRefInPrompt(false)
        setRefDragging(false)
        setComposePhase("drag-ref")

        // 0. Floating ref image appears visibly, pauses to let user see it, then drags into prompt
        addTimeout(() => setRefDragging(true), 2200) // start drag animation after 1.5s of floating
        addTimeout(() => {
            setRefDragging(false)
            setRefInPrompt(true) // ảnh đã vào trong prompt (xuất hiện chip @Ảnh 1)
            setComposePhase("show-mention")
        }, 3600)

        // 1. Start typing after mention settled
        addTimeout(() => {
            setComposePhase("typing")
            setShowCursor(true)
        }, 4400)
        addTimeout(() => setCursorClick(c => c + 1), 4600)

        const baseCharMs = 50
        let typingInterval: ReturnType<typeof setInterval> | null = null
        addTimeout(() => {
            typingInterval = setInterval(() => {
                setTypedLength(prev => {
                    if (prev >= PROMPT_AFTER_MENTION.length) {
                        if (typingInterval) clearInterval(typingInterval)
                        typingInterval = null
                        return prev
                    }
                    return prev + 1
                })
            }, baseCharMs)
        }, 4800)

        // 2. Camera snap back & Reveal Styles
        const typingDuration = PROMPT_AFTER_MENTION.length * baseCharMs
        const revealTime = 4800 + typingDuration + 800
        addTimeout(() => {
            setShowCursor(false)
            setComposePhase("reveal-styles")
        }, revealTime)

        // 3. Cinematic Coverflow Pan
        const scrollStartTime = revealTime + 900
        addTimeout(() => {
            // Smoothly pan through the gallery to show off the 3D
            scrollTarget.set(-75) // Pan to card 0 to show variety
        }, scrollStartTime)

        // Return scroll and Pick Focus Target
        const returnScrollTime = scrollStartTime + 2200
        addTimeout(() => {
            scrollTarget.set(-(5 * 166 + 75)) // Return to card 5 (Cyberpunk)
        }, returnScrollTime)

        const pickTime = returnScrollTime + 800
        addTimeout(() => {
            setComposePhase("pick-style")
            setShowCursor(true)
        }, pickTime)
        addTimeout(() => setCursorClick(c => c + 1), pickTime + 700)
        
        // Impact selection!
        addTimeout(() => setActiveStyle(5), pickTime + 850)

        // 4. Dive to Generate Key
        const genTime = pickTime + 1800
        addTimeout(() => {
            setComposePhase("click-generate")
        }, genTime)
        addTimeout(() => setCursorClick(c => c + 1), genTime + 800)
        
        // FLASH BANG & Execute
        addTimeout(() => {
            setShowCursor(false)
            setComposePhase("flash") // the explosion state
        }, genTime + 1100)

        addTimeout(() => {
            setScene("generate")
            setComposePhase("typing") // Reset phase early to avoid stuck state
        }, genTime + 1300)

        return () => { if (typingInterval) clearInterval(typingInterval) }
    }, [scene, addTimeout, clearAllTimeouts, scrollTarget])

    // Generate Forge Logic
    useEffect(() => {
        if (scene !== "generate") return
        setProgress(0)
        const totalDuration = 4200
        const intervalMs = 40
        const steps = totalDuration / intervalMs
        const increment = 100 / steps
        let current = 0
        
        const interval = setInterval(() => {
            current += increment
            // Add slight random stutter for "processing" feel
            const jitter = Math.random() > 0.8 ? (Math.random() * 2 - 1) : 0
            setProgress(Math.min(100, current + jitter))
            
            if (current >= 100) clearInterval(interval)
        }, intervalMs)
        
        addTimeout(() => setScene("result"), totalDuration + 200)
        return () => clearInterval(interval)
    }, [scene, addTimeout])

    // Result Showoff
    useEffect(() => {
        if (scene !== "result") return
        addTimeout(() => setScene("pause"), 6000)
    }, [scene, addTimeout])

    // Loop
    useEffect(() => {
        if (scene !== "pause") return
        addTimeout(() => setScene("compose"), 1200)
    }, [scene, addTimeout])

    // --- Virtual Camera Computations ---
    // When typing, the camera tracks the text cursor (x-axis pan).
    const isTyping = scene === "compose" && composePhase === "typing"
    const cameraScale = isTyping ? 1.4 : scene === "compose" ? 1 : 1
    // Estimate typing width pan to keep text centered. Max offset ~160px.
    const cameraPanX = isTyping ? -Math.min(typedLength * 2.2, 160) : 0
    const cameraPanY = isTyping ? 30 : 0 // Focus lower initially
    
    // Determine screen shake for the click
    const isExploding = composePhase === "flash"

    return (
        <div ref={containerRef} className="relative w-full max-w-5xl mx-auto z-10 perspective-1000">
            {/* Extremely dramatic ambient lighting layer */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[700px] overflow-hidden rounded-full opacity-[0.15] blur-[120px] pointer-events-none z-0 flex items-center justify-center mix-blend-screen">
                <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="absolute w-[600px] h-[600px] bg-fuchsia-600 rounded-full" />
                <motion.div animate={{ rotate: -360, scale: [1, 1.3, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute w-[500px] h-[500px] bg-violet-600 rounded-full mix-blend-color-dodge translate-x-20" />
                <motion.div animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} className="absolute w-[700px] h-[400px] bg-blue-600 rounded-full mix-blend-overlay -translate-y-20" />
            </div>

            {/* === MAIN UI WINDOW === */}
            <div
                onMouseMove={handleWindowMouseMove}
                onMouseLeave={handleWindowMouseLeave}
                className="group/window relative rounded-3xl overflow-hidden border border-white/[0.12] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] bg-[#050508]/80 backdrop-blur-3xl z-10"
            >
                {/* Glare line on window top */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50 z-50 pointer-events-none" />

                {/* Spotlight hover effect */}
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500 group-hover/window:opacity-100 z-50 mix-blend-screen"
                    style={{
                        background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(167, 139, 250, 0.15), transparent 80%)`,
                    }}
                />

                {/* Cyber Matrix Layout Base */}
                <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

                {/* Window Header */}
                <div className="h-[46px] border-b border-white/[0.08] bg-white/[0.03] flex items-center px-5 justify-between relative z-40 backdrop-blur-2xl">
                    <div className="flex gap-2.5 items-center">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-[0_0_10px_rgba(255,95,86,0.3)]" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-[0_0_10px_rgba(255,189,46,0.3)]" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-[0_0_10px_rgba(39,201,63,0.3)]" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 rounded-xl px-6 py-1.5 text-[11px] font-medium text-white/50 border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                        <MonitorPlay className="h-3.5 w-3.5 text-violet-400" />
                        zdream.vn/app/generate
                    </div>
                </div>

                {/* === SCENE CONTAINER === */}
                <div ref={sceneContainerRef} className="relative flex items-center justify-center p-6 h-[480px] sm:h-[500px] lg:h-[540px] w-full overflow-hidden">
                    
                    {/* The White Flash Bang Overlay */}
                    <AnimatePresence>
                        {isExploding && (
                            <motion.div
                                key="flash-bang"
                                className="absolute inset-0 bg-white z-[150] pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0], scale: [1, 1.1, 1.2] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, times: [0, 0.2, 1], ease: "easeOut" }}
                            />
                        )}
                    </AnimatePresence>

                    {/* VIRTUAL CAMERA LENS */}
                    <motion.div 
                        className="relative w-full h-full flex items-center justify-center z-10"
                        animate={{ 
                            scale: isExploding ? 1.5 : cameraScale, 
                            x: cameraPanX, 
                            y: cameraPanY,
                            filter: isExploding ? "brightness(3) contrast(2)" : "brightness(1) contrast(1)"
                        }}
                        transition={{ 
                            type: 'spring', 
                            stiffness: isTyping ? 120 : 60, // follow faster during typing, drift smoothly when zooming out
                            damping: isTyping ? 25 : 15,
                            mass: 1.2
                        }}
                    >
                        {/* Cursor overlays camera so it shrinks/grows relative to screen, not scene */}
                        <AnimatePresence>
                            {showCursor && scene === 'compose' && !isExploding && (
                                <motion.div
                                    className="absolute text-white pointer-events-none z-[100] hidden md:block"
                                    style={{ left: 0, top: 0, x: cursorPos.x, y: cursorPos.y }}
                                    initial={{ opacity: 0, scale: 1.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                                >
                                    <CursorSVG className="w-7 h-7 text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] filter contrast-125" />
                                    {cursorClick > 0 && (
                                        <motion.div
                                            key={`click-${cursorClick}`}
                                            className="absolute top-0 left-0 w-7 h-7 rounded-full border-[3px] border-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.8)]"
                                            initial={{ scale: 0.1, opacity: 1 }}
                                            animate={{ scale: [0.1, 4], opacity: [1, 0] }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                        />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            {/* ═══ COMPOSE SCENE (Extreme 3D Version) ═══ */}
                            {scene === "compose" && (
                                <motion.div
                                    key="scene-compose"
                                    className="w-full max-w-4xl flex flex-col items-center justify-center relative perspective-2000"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                                    transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                                >
                                    {/* ─── 3D COVERFLOW STYLES CAROUSEL ─── */}
                                    <motion.div
                                        className="w-full flex justify-center relative z-40 pointer-events-none"
                                        initial={false}
                                        animate={{
                                            height: (composePhase === 'reveal-styles' || composePhase === 'pick-style' || composePhase === 'click-generate' || composePhase === 'flash') ? 250 : 0,
                                            opacity: (composePhase === 'reveal-styles' || composePhase === 'pick-style' || composePhase === 'click-generate' || composePhase === 'flash') ? 1 : 0,
                                            marginBottom: (composePhase === 'reveal-styles' || composePhase === 'pick-style' || composePhase === 'click-generate' || composePhase === 'flash') ? (activeStyle !== -1 ? 0 : 40) : 0,
                                            marginTop: (activeStyle !== -1) ? 40 : 0,
                                        }}
                                        transition={{ duration: 1, type: 'spring', bounce: 0.3 }}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        <div className="flex items-center justify-center relative w-full h-[250px] overflow-visible">
                                            <motion.div className="flex gap-4 items-center absolute left-1/2" style={{ x: scrollX, transformStyle: 'preserve-3d' }}>
                                                {STYLES.map((style, i) => {
                                                    const isActive = activeStyle === i
                                                    // Calculate roughly distance for inactive perspective
                                                    const dist = isActive ? 0 : (activeStyle >= 0 ? Math.abs(activeStyle - i) : 1)
                                                    
                                                    return (
                                                        <motion.div
                                                            key={style.name}
                                                            ref={i === 5 ? targetStyleRef : undefined}
                                                            className={`relative flex-shrink-0 w-[150px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto cursor-pointer border ${isActive ? 'border-white/40' : 'border-white/10'}`}
                                                            style={{
                                                                aspectRatio: '3/4',
                                                                transformOrigin: '50% 100%'
                                                            }}
                                                            animate={{
                                                                scale: isActive ? 1.08 : (activeStyle >= 0 ? Math.max(0.75, 0.9 - dist * 0.05) : 0.9),
                                                                opacity: isActive ? 1 : (activeStyle >= 0 ? Math.max(0.1, 0.5 - dist * 0.1) : 0.6),
                                                                rotateY: isActive ? 0 : (activeStyle === -1 ? 0 : (i < activeStyle ? 25 : -25)),
                                                                z: isActive ? 50 : -dist * 60,
                                                                y: isActive ? -15 : 0,
                                                                boxShadow: isActive ? `0 20px 50px -10px ${style.glow}, 0 0 0 2px rgba(255,255,255,0.4)` : '0 10px 30px -10px rgba(0,0,0,0.5)'
                                                            }}
                                                        >
                                                            <img 
                                                                src={style.image} 
                                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000"
                                                                style={{ transform: isActive ? 'scale(1.1) translateY(-5%)' : 'scale(1)' }}
                                                                alt="" 
                                                            />
                                                            {/* High-end vignette & label gradient */}
                                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_30%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
                                                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none flex items-end px-3 pb-3">
                                                                <div className="w-full flex items-center justify-between">
                                                                    <span className={`text-xs font-black tracking-wide ${isActive ? 'text-white' : 'text-white/60'} drop-shadow-md uppercase`}>{style.name}</span>
                                                                    {isActive && (
                                                                        <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6 }} className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,1)]">
                                                                            <Sparkles className="w-2.5 h-2.5 text-black" />
                                                                        </motion.div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                            </motion.div>
                                        </div>
                                    </motion.div>

                                    {/* ─── CENTERED FLOATING REF IMAGE (scene level) ─── */}
                                    <AnimatePresence>
                                        {(composePhase === 'drag-ref') && !refInPrompt && (
                                            <motion.div
                                                key="floating-ref-center"
                                                className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <motion.div
                                                    className="w-full text-center absolute top-[-100px]"
                                                    animate={{ opacity: 0 }} // Hidden for now based on feedback
                                                    transition={{ duration: 0.5 }}
                                                >
                                                </motion.div>

                                                <motion.div
                                                    initial={{ scale: 0.5, y: -80 }}
                                                    animate={refDragging ? {
                                                        // Thu nhỏ và rơi thẳng xuống chính giữa prompt box (ở vị trí y: 0)
                                                        scale: [1, 0.7, 0.25],
                                                        y: [-80, -30, 0],
                                                        rotate: [0, -2, 5],
                                                        opacity: [1, 1, 0],
                                                    } : {
                                                        // Hiện to rõ ràng ở giữa màn hình (nhích lên 80px để nhường chỗ)
                                                        scale: 1,
                                                        x: 0,
                                                        y: [-80, -86, -80],
                                                        rotate: 0,
                                                        opacity: 1,
                                                    }}
                                                    transition={refDragging ? {
                                                        duration: 1.1,
                                                        ease: [0.25, 1, 0.5, 1], // Smooth deceleration
                                                        opacity: { duration: 0.4, delay: 0.7 } // Fade out only at the very end
                                                    } : {
                                                        scale: { duration: 0.6, type: 'spring', bounce: 0.5 },
                                                        y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
                                                    }}
                                                    className="flex flex-col items-center relative"
                                                >
                                                    {/* Giữ nguyên khung kính cao cấp, không switch class đột ngột để tránh giật lag */}
                                                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-[2rem] overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(139,92,246,0.3),_0_0_20px_rgba(217,70,239,0.2)] bg-black/40 backdrop-blur-xl">
                                                        {/* Top Glare for 3D glass effect */}
                                                        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                                                        
                                                        <img src={REF_IMAGE} alt="Reference" className="w-full h-full object-cover scale-[1.02]" />
                                                        
                                                        {/* Cinematic inner shadow */}
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/30 pointer-events-none" />
                                                    </div>

                                                    {/* Fake Cursor Removed for cleaner look */}
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* ─── DYNAMIC PROMPT BOX (slides up from below) ─── */}
                                    <motion.div 
                                        className="w-full max-w-4xl relative z-30"
                                        initial={false}
                                        animate={{
                                            y: (composePhase === 'drag-ref' && !refDragging && !refInPrompt) ? 120 : 0,
                                            opacity: (composePhase === 'drag-ref' && !refDragging && !refInPrompt) ? 0 : 1,
                                            scale: (activeStyle !== -1) ? 0.95 : (refInPrompt ? [0.97, 1.02, 1] : 1),
                                        }}
                                        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                                    >
                                        {/* Impact Neon Glow Explosion */}
                                        <motion.div
                                            className="absolute -inset-8 bg-primary/40 rounded-[40px] blur-3xl pointer-events-none z-[-1]"
                                            animate={{ 
                                                opacity: refInPrompt ? [0, 0.8, 0] : 0,
                                                scale: refInPrompt ? [0.9, 1.1, 1.2] : 0.9
                                            }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                        <motion.div
                                            className="absolute bottom-full mb-8 left-0 right-0 text-center pointer-events-none"
                                            initial={false}
                                            animate={{ 
                                                opacity: isTyping ? 1 : 0,
                                                y: isTyping ? 0 : -20,
                                                scale: isTyping ? 1 : 0.95
                                            }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        >
                                            <h2 className="text-white text-3xl sm:text-4xl font-black tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                                                Nhập ý tưởng của bạn!
                                            </h2>
                                        </motion.div>

                                        <div className="relative flex flex-col w-full transition-all duration-300 border rounded-[28px] backdrop-blur-xl border-border/30 bg-[#37393b]/85 shadow-[0_30px_60px_rgba(0,0,0,0.8)] pointer-events-auto overflow-hidden">
                                            
                                            {/* Authentic Drop Zone Overlay */}
                                            <AnimatePresence>
                                                {refDragging && (
                                                    <motion.div
                                                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-[28px]"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
                                                        exit={{ opacity: 0, scale: 1.1, filter: "brightness(2)" }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <motion.div 
                                                            className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-3"
                                                            animate={{ scale: [1, 1.1, 1] }} 
                                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                                        >
                                                            <Upload className="w-6 h-6 text-white/90" strokeWidth={2.5} />
                                                        </motion.div>
                                                        <span className="text-white font-bold text-lg tracking-wide">Thả ảnh tham chiếu vào đây</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Top Glare */}
                                            <div className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                                            
                                            {/* Reference image thumbnail row (inside prompt, appears after drag-in) */}
                                            <AnimatePresence>
                                                {refInPrompt && (
                                                    <motion.div
                                                        className="flex items-center gap-2 px-5 pt-4 pb-1 sm:px-6"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                                                    >
                                                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-primary/40 shadow-[0_0_20px_rgba(139,92,246,0.3)] flex-shrink-0">
                                                            <img src={REF_IMAGE} alt="Reference" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                                            <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                                <span className="text-[8px] text-white font-bold">✕</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            
                                            {/* Text Input Area */}
                                            <div ref={promptInputRef} className="relative px-3 py-3 sm:px-4 sm:py-4">
                                                <div className="w-full border-0 bg-transparent px-3 text-lg sm:text-xl font-medium focus:ring-0 outline-none leading-[28px] sm:leading-[32px] pt-[8px] pb-[8px] sm:pt-[12px] sm:pb-[12px] text-foreground min-h-[56px] flex items-center flex-wrap gap-1">
                                                    {/* @Ảnh 1 mention chip (appears after ref lands in prompt) */}
                                                    {refInPrompt && (
                                                        <motion.span
                                                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-base sm:text-lg font-medium whitespace-nowrap"
                                                            style={{ 
                                                                color: 'hsl(var(--primary))', 
                                                                background: 'hsl(var(--primary) / 0.15)',
                                                            }}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ type: 'spring', bounce: 0.4 }}
                                                        >
                                                            @Ảnh 1
                                                        </motion.span>
                                                    )}

                                                    {/* Typed text (after the mention) */}
                                                    <span className="text-white/90">
                                                        {PROMPT_AFTER_MENTION.substring(0, typedLength)}
                                                    </span>
                                                    
                                                    {/* Extreme Pulsing Neon Cursor */}
                                                    {composePhase === 'typing' && (
                                                        <motion.span
                                                            className="inline-block w-[3.5px] h-[1.1em] rounded-full bg-white ml-2 align-text-bottom relative"
                                                            animate={{ opacity: [1, 0.4, 1], scaleY: [1, 1.05, 1] }}
                                                            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                                                        >
                                                            {/* Cursor glow bleed */}
                                                            <div className="absolute inset-0 bg-fuchsia-400 blur-sm mix-blend-screen scale-x-150 scale-y-125" />
                                                            <div className="absolute inset-0 bg-fuchsia-500 blur-md scale-[3]" />
                                                        </motion.span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tools & Send Button (Bottom) */}
                                            <div className="flex items-center justify-between px-4 pb-3 sm:px-5 sm:pb-4">
                                                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pr-2">
                                                    <div className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-full text-muted-foreground cursor-pointer hover:bg-muted/40 hover:text-foreground transition-colors">
                                                        <History className="size-5 sm:size-[22px]" />
                                                    </div>
                                                    <div className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-full text-muted-foreground cursor-pointer hover:bg-muted/40 hover:text-foreground transition-colors">
                                                        <ImageIcon className="size-5 sm:size-[22px]" />
                                                    </div>
                                                    <div className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-full text-muted-foreground cursor-pointer hover:bg-muted/40 hover:text-foreground transition-colors">
                                                        <Settings2 className="size-5 sm:size-[22px]" />
                                                    </div>
                                                    
                                                    <div className="hidden sm:flex items-center gap-2.5 ml-2 border-l border-border/50 pl-4">
                                                        <span className="text-sm font-medium text-muted-foreground tracking-wide">Flux.1 Pro</span>
                                                        <Badge variant="secondary" className="hidden lg:inline-flex text-[11px] h-7 rounded-full font-bold px-3 bg-background/50 border-border/50">
                                                            16:9
                                                        </Badge>
                                                        <Badge variant="secondary" className="hidden lg:inline-flex text-[11px] h-7 rounded-full font-bold px-2.5 bg-background/50 border-border/50">
                                                            ×2
                                                        </Badge>
                                                        {activeStyle >= 0 && (
                                                            <Badge className="h-7 rounded-full px-3 text-[11px] font-black bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 text-fuchsia-200 border border-fuchsia-500/40 uppercase tracking-widest">
                                                                <Sparkles className="w-3 h-3 mr-1.5 inline" />
                                                                {STYLES[activeStyle].name}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Send Action */}
                                                <motion.div
                                                    ref={generateBtnRef}
                                                    className={`rounded-full shrink-0 flex items-center justify-center size-11 sm:size-12 ${typedLength > 0 ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"}`}
                                                    animate={
                                                        composePhase === 'click-generate'
                                                            ? { scale: [1, 1.25, 0.9], background: "#fff", color: "#000" } // Click anticipation
                                                            : typedLength >= PROMPT_TEXT.length
                                                                ? { scale: [1, 1.08, 1], boxShadow: "0 0 40px rgba(217,70,239,0.5)" }
                                                                : {}
                                                    }
                                                    transition={{ duration: composePhase === 'click-generate' ? 0.3 : 1.5, repeat: composePhase === 'click-generate' ? 0 : Infinity }}
                                                >
                                                    <ArrowUp className="size-5 sm:size-6 stroke-[3]" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* ═══ GENERATE SCENE (Matrix Core Forge) ═══ */}
                            {scene === "generate" && (
                                <motion.div
                                    key="scene-generate"
                                    className="w-full max-w-4xl mx-auto flex items-center justify-center p-2 sm:p-4 z-20"
                                    initial={{ opacity: 0, scale: 1.2, filter: "brightness(2) contrast(1.5) blur(20px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "brightness(1) contrast(1) blur(0px)" }}
                                    exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-[#020203] border border-white/[0.08] shadow-[0_0_100px_rgba(139,92,246,0.3)] inset-ring">
                                        
                                        {/* Matrix Data Rain Background */}
                                        <MatrixBackground progress={progress} />

                                        {/* Base Image resolving from chaos */}
                                        <div className="absolute inset-0 z-0">
                                            <motion.img
                                                src={RESULT_IMAGE}
                                                alt="rendering..."
                                                className="w-full h-full object-cover mix-blend-luminosity"
                                                style={{
                                                    // Resolves from violent blur and super saturation
                                                    filter: `blur(${Math.max(60 - progress, 0)}px) contrast(${1 + (100 - progress)*0.02})`,
                                                    scale: 1.2 - (progress * 0.002),
                                                    opacity: progress * 0.01 // slowly fades in
                                                }}
                                            />
                                        </div>

                                        {/* Violent Scanning Ray */}
                                        <motion.div
                                            className="absolute top-0 bottom-0 w-[4px] z-20 mix-blend-screen"
                                            style={{
                                                left: `${progress}%`,
                                                background: 'linear-gradient(to bottom, transparent, #fff, transparent)',
                                                boxShadow: '0 0 40px 10px rgba(217,70,239,0.8), 0 0 100px 20px rgba(139,92,246,0.4), -20px 0 30px rgba(255,255,255,0.2)'
                                            }}
                                            animate={{ opacity: [0.8, 1, 0.8], x: [0, 5, 0, -2, 0] }}
                                            transition={{ duration: 0.1, repeat: Infinity }}
                                        />

                                        {/* Core Ring Hologram */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                                            <div className="relative flex items-center justify-center">
                                                {/* Pulsing Energy Aura */}
                                                <motion.div
                                                    className="absolute rounded-full pointer-events-none mix-blend-screen"
                                                    style={{ width: 220, height: 220 }}
                                                    animate={{ scale: [1, 1.2, 1], rotate: 360, opacity: progress > 90 ? 0 : [0.3, 0.6, 0.3] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                                >
                                                    <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(217,70,239,0.8),transparent)] blur-xl" />
                                                </motion.div>

                                                {/* Precision SVG Ring */}
                                                <svg width="140" height="140" viewBox="0 0 140 140" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
                                                    <circle cx="70" cy="70" r="64" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                                    <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2 6" />
                                                    <motion.circle
                                                        cx="70" cy="70" r="64"
                                                        fill="none" strokeWidth="4" strokeLinecap="round"
                                                        stroke="url(#progressTech)"
                                                        strokeDasharray={`${2 * Math.PI * 64}`}
                                                        style={{ strokeDashoffset: 2 * Math.PI * 64 * (1 - progress / 100) }}
                                                        filter="url(#glowTech)"
                                                    />
                                                    <defs>
                                                        <linearGradient id="progressTech" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#fff" />
                                                            <stop offset="50%" stopColor="#d946ef" />
                                                            <stop offset="100%" stopColor="#8b5cf6" />
                                                        </linearGradient>
                                                        <filter id="glowTech" x="-50%" y="-50%" width="200%" height="200%">
                                                            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur1" />
                                                            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur2" />
                                                            <feMerge><feMergeNode in="blur2" /><feMergeNode in="blur1" /><feMergeNode in="SourceGraphic" /></feMerge>
                                                        </filter>
                                                    </defs>
                                                </svg>

                                                {/* Digital Percentage Display */}
                                                <div className="relative w-28 h-28 rounded-full bg-black/60 backdrop-blur-2xl border border-white/20 flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(217,70,239,0.3)]">
                                                    <span className="text-4xl font-black text-white tracking-tighter tabular-nums" style={{ textShadow: "0 0 20px rgba(255,255,255,0.8)" }}>
                                                        {Math.floor(progress)}
                                                    </span>
                                                    <span className="text-[10px] text-fuchsia-300 font-black tracking-[0.3em] uppercase mt-1">%</span>
                                                </div>
                                            </div>

                                            {/* Technical Status Badges */}
                                            <div className="mt-8 flex flex-col items-center gap-3">
                                                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-sm px-4 py-2 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                                                    <motion.div
                                                        className="w-2 h-2 bg-fuchsia-500 shadow-[0_0_10px_#d946ef]"
                                                        animate={{ opacity: [1, 0, 1] }}
                                                        transition={{ duration: 0.1, repeat: Infinity }} // rapid blink
                                                    />
                                                    <span className="text-[11px] font-mono text-white/80 tracking-widest uppercase">
                                                        {progress < 25 ? "INITIATING_CORE..." : progress < 60 ? "NEURAL_RENDERING" : progress < 90 ? "UPSCALE_PASS_01" : "FINAL_COMPOSITE"}
                                                    </span>
                                                </div>
                                                <div className="w-48 h-[1px] bg-white/20 relative overflow-hidden">
                                                    <motion.div className="absolute inset-y-0 left-0 bg-white" style={{ width: `${progress}%`, boxShadow: "0 0 10px #fff" }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* TV Scanlines */}
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.2)_1px,transparent_1px)] bg-[size:100%_4px] mix-blend-overlay pointer-events-none z-50" />
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══ RESULT SCENE (Showcase Art) ═══ */}
                            {scene === "result" && (
                                <motion.div
                                    key="scene-result"
                                    className="w-full max-w-4xl absolute inset-0 flex items-center justify-center p-4 sm:p-6 mx-auto perspective-2000"
                                    initial={{ opacity: 0, scale: 0.8, filter: "brightness(3) contrast(1.5)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "brightness(1) contrast(1)" }}
                                    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    <motion.div
                                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                                        className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-[0_50px_150px_-20px_rgba(139,92,246,0.6)] ring-2 ring-white/10 z-30"
                                    >
                                        <div className="absolute inset-0 z-0 bg-black pointer-events-auto group/img cursor-auto">
                                            <div className="relative w-full h-full overflow-hidden">
                                                <motion.img
                                                    src={RESULT_IMAGE}
                                                    alt="Generated AI Art"
                                                    className="w-full h-full object-cover"
                                                    initial={{ scale: 1 }}
                                                    animate={{ scale: 1.05 }}
                                                    transition={{ duration: 6, ease: "easeOut" }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none flex flex-col justify-end p-8" style={{ transform: "translateZ(30px)" }}>
                                                    <Badge className="w-fit mb-4 bg-white/10 backdrop-blur-xl text-white border border-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-saturate-200">
                                                        <Sparkles className="w-4 h-4 mr-2" /> Studio Render
                                                    </Badge>
                                                    <h2 className="text-white font-black text-2xl sm:text-3xl lg:text-4xl leading-tight drop-shadow-2xl">
                                                        {PROMPT_TEXT}
                                                    </h2>
                                                </div>

                                                <div className="absolute top-6 left-6 flex gap-2" style={{ transform: "translateZ(20px)" }}>
                                                    <div className="bg-black/60 backdrop-blur-xl text-white font-mono text-xs px-4 py-2 rounded-lg border border-white/20 flex items-center gap-2">
                                                        <ZapIcon className="w-4 h-4 text-[#d946ef]" /> 4K_UPSCALE
                                                    </div>
                                                </div>

                                                {/* Refined Laser Scanner Reveal */}
                                                <motion.div 
                                                    className="absolute left-0 right-0 h-[3px] bg-white shadow-[0_0_40px_10px_rgba(217,70,239,1)] z-40"
                                                    initial={{ top: "-10%", opacity: 0 }}
                                                    animate={{ top: ["-10%", "110%"], opacity: [0, 1, 1, 0] }}
                                                    transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
