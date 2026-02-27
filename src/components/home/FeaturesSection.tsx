import { Sparkles, Zap, Layers, Cpu, Code2, Palette } from "lucide-react";

const FEATURES = [
    {
        icon: <Sparkles className="w-6 h-6 text-purple-400" />,
        title: "AI-Powered Generation",
        description: "Transform your text prompts into stunning, high-definition visuals using state-of-the-art diffusion models.",
    },
    {
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
        title: "Instant Turnaround",
        description: "Experience near-instantaneous rendering speeds. No more waiting minutes for a single concept.",
    },
    {
        icon: <Layers className="w-6 h-6 text-blue-400" />,
        title: "Infinite Variations",
        description: "Generate countless variations of your core idea. Tweak, iterate, and perfect your masterpiece.",
    },
    {
        icon: <Cpu className="w-6 h-6 text-green-400" />,
        title: "Advanced Control",
        description: "Fine-tune generation parameters like steps, CFG scale, and seed for precise artistic direction.",
    },
    {
        icon: <Code2 className="w-6 h-6 text-pink-400" />,
        title: "API Integration",
        description: "Seamlessly integrate Nexus generation capabilities directly into your own applications.",
    },
    {
        icon: <Palette className="w-6 h-6 text-orange-400" />,
        title: "Style Presets",
        description: "Apply pre-configured styles ranging from photorealism to retro anime with a single click.",
    }
];

export function FeaturesSection() {
    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10 relative">
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 tracking-tight text-white">
                    Everything you need to create
                </h2>
                <p className="text-xl text-white/60 font-light">
                    Nexus combines bleeding-edge AI models with intuitive creative tools, empowering you to bring any imagination to life.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURES.map((feature, idx) => (
                    <div
                        key={idx}
                        className="group p-8 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl hover:border-white/20 transition-all duration-300 hover:bg-white/10 relative overflow-hidden"
                    >
                        {/* Subtle glow effect on hover */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />

                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-inner">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                            {feature.title}
                        </h3>
                        <p className="text-white/60 leading-relaxed font-light">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
