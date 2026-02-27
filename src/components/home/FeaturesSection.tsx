import { MouseEvent } from "react";
import { Sparkles, Zap, Cpu, Palette } from "lucide-react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const itemVariants: any = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

function FeatureCard({ colSpan, children, bgType, colorClass }: any) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            variants={itemVariants}
            onMouseMove={handleMouseMove}
            className={`group relative rounded-[40px] flex flex-col justify-end overflow-hidden border border-white/5 bg-[#050505]/40 backdrop-blur-3xl hover:border-white/20 transition-colors duration-500 shadow-2xl ${colSpan}`}
        >
            <motion.div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none`}
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            500px circle at ${mouseX}px ${mouseY}px,
                            ${bgType},
                            transparent 80%
                        )
                    `,
                }}
            />
            {/* Glowing borders ring */}
            <div className="absolute inset-0 z-0 p-[1px] rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -mx-[1px] -my-[1px] pointer-events-none">
                <div className={`w-full h-full rounded-[40px] opacity-20 blur-md ${colorClass}`}></div>
            </div>

            <div className="relative z-10 p-10 h-full flex flex-col pointer-events-none">
                {children}
            </div>
        </motion.div>
    );
}

export function FeaturesSection() {
    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-32 z-10 relative">
            <div className="text-center mb-24 max-w-4xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120px] bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-[80px] -z-10 rounded-full"
                />

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-6xl md:text-8xl font-heading font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30"
                >
                    Defy Reality.
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl md:text-3xl text-white/50 font-light"
                >
                    A generative engine built for visionaries who refuse to compromise.
                </motion.p>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[350px]"
            >
                <FeatureCard
                    colSpan="col-span-1 md:col-span-3 row-span-2"
                    bgType="rgba(120,0,255,0.15)"
                    colorClass="bg-purple-500"
                >
                    <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#000] to-transparent z-0 pointer-events-none"></div>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="absolute right-[-10%] top-[10%] w-[800px] h-[800px] rounded-full blur-[80px] -z-10 mix-blend-screen opacity-50 group-hover:opacity-100 pointer-events-none"
                        style={{ background: 'conic-gradient(from 0deg, rgba(168,85,247,0.1), rgba(236,72,153,0.05), transparent)' }}
                    />

                    <div className="relative z-10 flex-1 flex flex-col justify-end">
                        <div className="w-24 h-24 rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center mb-10 shadow-[inset_0_2px_20px_rgba(255,255,255,0.1)] group-hover:-translate-y-4 transition-transform duration-700 pointer-events-auto">
                            <Sparkles className="w-12 h-12 text-purple-400" />
                        </div>
                        <h3 className="text-5xl md:text-6xl font-heading font-black text-white mb-6 tracking-tight leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all">Hyper-Sensory<br />AI Rendering</h3>
                        <p className="text-2xl text-white/50 leading-relaxed max-w-2xl font-light">
                            Experience unparalleled focal depth and texture accuracy. Our next-gen diffusion pipeline breathes impossible life into your raw ideas.
                        </p>
                    </div>
                </FeatureCard>

                <FeatureCard
                    colSpan="col-span-1 md:col-span-1 row-span-1"
                    bgType="rgba(0,255,150,0.15)"
                    colorClass="bg-emerald-500"
                >
                    <div className="flex-1 flex flex-col justify-start">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform duration-500 pointer-events-auto">
                            <Zap className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3">Zero<br /> Latency</h3>
                    </div>
                    <p className="text-white/40 leading-relaxed text-lg">Sub-second generation. Instantaneous feedback loops.</p>
                </FeatureCard>

                <FeatureCard
                    colSpan="col-span-1 md:col-span-1 row-span-1"
                    bgType="rgba(255,100,50,0.15)"
                    colorClass="bg-orange-500"
                >
                    <div className="flex-1 flex flex-col justify-start">
                        <div className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 text-orange-400 group-hover:scale-110 transition-transform duration-500 pointer-events-auto">
                            <Palette className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3">Infinite<br /> Styles</h3>
                    </div>
                    <p className="text-white/40 leading-relaxed text-lg">From neon cyberpunk to hyper-realistic baroque.</p>
                </FeatureCard>

                <FeatureCard
                    colSpan="col-span-1 md:col-span-4 row-span-1"
                    bgType="rgba(0,150,255,0.15)"
                    colorClass="bg-blue-500"
                >
                    {/* Noisy texture overlay */}
                    <div className="absolute inset-0 w-full h-full opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-1000 mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                    <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-6 mb-6 pointer-events-auto">
                                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Cpu className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-4xl md:text-5xl font-heading font-extrabold text-white">Full Engine API</h3>
                            </div>
                            <p className="text-xl text-white/50 leading-relaxed">
                                Hook directly into our neural core. Expose latent space parameters, controlnet pipelines, and seed-locking mechanisms right from your terminal.
                            </p>
                        </div>
                        <div className="flex-shrink-0 pointer-events-auto w-full md:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full md:w-auto px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:bg-neutral-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                            >
                                Integrate Now
                            </motion.button>
                        </div>
                    </div>
                </FeatureCard>
            </motion.div>
        </div>
    );
}
