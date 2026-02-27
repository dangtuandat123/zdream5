import { motion } from "framer-motion";

const TESTIMONIALS = [
    {
        quote: "Nexus completely obliterated my production bottlenecks. What used to mandate days of grueling concept sketching now emerges in minutes of iterative, joyful generation. It's nothing short of magic.",
        name: "Sarah Jenkins",
        role: "Lead Concept Artist, Riot Games",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        angle: -2,
        color: "from-pink-500/20 to-purple-500/5",
        delay: 0
    },
    {
        quote: "The API integration is phenomenal. We embedded Nexus into our own marketing tool, and our users love the instant asset generation. Revenue is up 300%.",
        name: "Marcus Vance",
        role: "CTO, AdTech Pro",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
        angle: 2,
        color: "from-blue-500/20 to-cyan-500/5",
        delay: 0.15
    },
    {
        quote: "I've tried every AI generator out there. Nexus wins on sheer aesthetic quality and fine-grained control over the output. It respects the artist's intent.",
        name: "Elena Rossi",
        role: "Independent Illustrator",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        angle: -1,
        color: "from-amber-500/20 to-orange-500/5",
        delay: 0.3
    }
];

export function TestimonialsSection() {
    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-40 z-10 relative overflow-hidden">
            {/* Giant blurred background elements */}
            <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-fuchsia-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10"></div>

            <div className="text-center mb-32 max-w-4xl mx-auto relative z-20">
                <motion.h2
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="text-5xl md:text-8xl font-heading font-black mb-8 tracking-tighter text-white uppercase text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-neutral-600"
                >
                    Cult Following
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="text-2xl md:text-3xl text-white/40 font-light"
                >
                    Loved by the most demanding visual pioneers.
                </motion.p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 relative z-20">
                {TESTIMONIALS.map((t, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 150, rotate: t.angle * 3 }}
                        whileInView={{ opacity: 1, y: 0, rotate: t.angle }}
                        whileHover={{ y: -20, rotate: 0, scale: 1.05, zIndex: 30 }}
                        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                        transition={{
                            duration: 0.8,
                            delay: t.delay,
                            type: "spring",
                            bounce: 0.4
                        }}
                        className={`w-full lg:w-1/3 p-12 rounded-[40px] bg-[#050505]/80 backdrop-blur-3xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] relative group overflow-hidden cursor-crosshair`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-screen pointer-events-none`}></div>

                        <div className="absolute -top-10 -left-10 text-[180px] text-white/5 font-serif leading-none group-hover:text-white/10 transition-colors duration-500 pointer-events-none">"</div>

                        <p className="text-xl md:text-2xl text-white/80 font-serif leading-relaxed italic mb-12 relative z-10 group-hover:text-white transition-colors">
                            {t.quote}
                        </p>

                        <div className="flex items-center gap-6 relative z-10 pointer-events-none">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <img className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/20 relative z-10 object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" src={t.avatar} alt="User" />
                            </div>
                            <div>
                                <h4 className="font-heading font-bold text-white text-xl md:text-2xl">{t.name}</h4>
                                <p className="text-xs md:text-sm text-white/40 uppercase tracking-widest mt-1 font-semibold">{t.role}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
