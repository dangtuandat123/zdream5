import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Image as ImageIcon, LayoutDashboard, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar({ onNavigate }: { onNavigate?: (view: 'home' | 'studio') => void }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    return (
        <nav className={cn(
            "fixed top-0 w-full z-50 transition-all duration-300 border-b",
            scrolled
                ? "bg-black/60 backdrop-blur-md border-white/5 shadow-lg"
                : "bg-transparent border-transparent"
        )}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate?.('home')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            Nexus Art
                        </span>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <span onClick={() => onNavigate?.('home')} className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4" /> Khám phá
                            </span>
                            <span onClick={() => onNavigate?.('studio')} className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Sáng tạo
                            </span>
                            <span className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                                <History className="w-4 h-4" /> Lịch sử
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/20 text-white border border-white/10 focus:ring-0">
                            <User className="w-4 h-4" />
                        </Button>
                        <Button className="hidden sm:flex bg-white text-black hover:bg-gray-200 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
                            Nâng cấp Pro
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
