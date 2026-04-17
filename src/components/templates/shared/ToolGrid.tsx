import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// === Component hiển thị ảnh có skeleton loading ===
export function ImageWithSkeleton({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const [loaded, setLoaded] = useState(false)
    return (
        <>
            {!loaded && <Skeleton className="absolute inset-0 w-full h-full" />}
            <img
                src={src}
                alt={alt}
                className={`${className ?? ""} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300 pointer-events-none`}
                onLoad={() => setLoaded(true)}
                draggable={false}
            />
        </>
    )
}

// === Loading skeleton khi đang tạo ảnh — color-shifting blobs ===
export function GenerateSkeleton({ progress, aspectRatio }: { progress: number, aspectRatio?: string }) {
    const [elapsed, setElapsed] = useState(0)
    useEffect(() => {
        const t = setInterval(() => setElapsed(s => s + 1), 1000)
        return () => clearInterval(t)
    }, [])

    return (
        <div 
            className={`relative rounded-2xl overflow-hidden border border-border/20 shadow-xl flex flex-col items-center justify-center isolate bg-[#050505] w-full min-w-0 ${!aspectRatio ? 'aspect-square' : ''}`}
            style={aspectRatio ? { aspectRatio: aspectRatio.replace(":", "/") } : undefined}
        >
            {/* Cinematic sweeps and moving grids */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                
                <div
                    className="absolute size-[250px] rounded-full blur-[80px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0.1) 100%)',
                        animation: 'loadingBlob1 8s ease-in-out infinite alternate',
                    }}
                />
                <div
                    className="absolute size-[200px] rounded-full blur-[80px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(99,102,241,0.1) 100%)',
                        animation: 'loadingBlob2 10s ease-in-out infinite alternate',
                    }}
                />
                
                {/* Sweep light */}
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-sweep" />
            </div>
            
            <style>{`
                @keyframes loadingBlob1 {
                    0% { transform: translate(-20%, -20%) scale(1); opacity: 0.5; }
                    50% { transform: translate(30%, 15%) scale(1.2); opacity: 0.8; }
                    100% { transform: translate(-5%, 40%) scale(0.9); opacity: 0.4; }
                }
                @keyframes loadingBlob2 {
                    0% { transform: translate(20%, 30%) scale(1); opacity: 0.4; }
                    50% { transform: translate(-30%, -10%) scale(1.3); opacity: 0.7; }
                    100% { transform: translate(15%, -20%) scale(0.85); opacity: 0.3; }
                }
                @keyframes sweep {
                    0% { top: 0%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>

            <div className="relative z-10 flex flex-col items-center gap-3">
                <SpinnerIcon />
                <div className="text-center">
                    <p className="text-xs text-muted-foreground/80 tabular-nums font-mono">{elapsed}s - {Math.round(progress)}%</p>
                </div>
            </div>
            
            {/* Progress bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20 z-10">
                <div className="h-full bg-primary/50 transition-all duration-300 ease-out" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
        </div>
    )
}

function SpinnerIcon() {
    return (
        <div className="relative size-12">
            <div className="absolute inset-0 rounded-full border border-primary/20" />
            <div
                className="absolute inset-0 rounded-full border border-transparent border-t-primary animate-spin"
                style={{ animationDuration: '2s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-4 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
            </div>
        </div>
    )
}
