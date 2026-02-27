export function TestimonialsSection() {
    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10 relative">
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 tracking-tight text-white">
                    Loved by creators worldwide
                </h2>
                <p className="text-xl text-white/60 font-light">
                    Join thousands of independent artists, designers, and developers building the future of visual media.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Testimonial 1 */}
                <div className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl hover:bg-white/10 transition-colors relative">
                    <div className="absolute top-0 left-8 -mt-5 text-6xl text-purple-500/30 font-serif">"</div>
                    <p className="text-lg text-white/80 font-medium mb-8 leading-relaxed relative z-10">
                        Nexus completely changed my workflow. What used to take days of concept sketching now takes minutes of iterative generation. It's magic.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Sarah Jenkins</h4>
                            <p className="text-sm text-white/50">Lead Concept Artist</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 2 */}
                <div className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl hover:bg-white/10 transition-colors relative">
                    <div className="absolute top-0 left-8 -mt-5 text-6xl text-blue-500/30 font-serif">"</div>
                    <p className="text-lg text-white/80 font-medium mb-8 leading-relaxed relative z-10">
                        The API integration is phenomenal. We embedded Nexus into our own marketing tool, and our users love the instant asset generation.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="User" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Marcus Vance</h4>
                            <p className="text-sm text-white/50">CTO, AdTech Pro</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 3 */}
                <div className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl hover:bg-white/10 transition-colors relative">
                    <div className="absolute top-0 left-8 -mt-5 text-6xl text-pink-500/30 font-serif">"</div>
                    <p className="text-lg text-white/80 font-medium mb-8 leading-relaxed relative z-10">
                        I've tried every AI generator out there. Nexus wins on sheer aesthetic quality and fine-grained control over the output.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Elena Rossi</h4>
                            <p className="text-sm text-white/50">Independent Illustrator</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
