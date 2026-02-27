import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Image as ImageIcon, LayoutDashboard, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    const scrollTo = (id: string) => {
        // If not on homepage, navigate to homepage first
        if (window.location.pathname !== '/') {
            navigate('/');
        }
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                const headerOffset = 80;
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }, 100);
    };

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
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            Nexus Art
                        </span>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <span onClick={() => scrollTo('gallery')} className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4" /> Khám phá
                            </span>
                            <span onClick={() => scrollTo('features')} className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Tính năng
                            </span>
                            <span onClick={() => scrollTo('pricing')} className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                                <History className="w-4 h-4" /> Bảng giá
                            </span>
                            {isLoggedIn ? (
                                <Link to="/app/dashboard" className="text-white/70 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2 relative ml-4">
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                                    </span>
                                    <ImageIcon className="w-4 h-4" /> Bảng điều khiển
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <Link to="/app/dashboard">
                                <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/20 text-white border border-white/10 focus:ring-0">
                                    <User className="w-4 h-4" />
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/login" className="hidden sm:block">
                                <Button variant="ghost" className="text-white hover:bg-white/10 font-medium">
                                    Đăng nhập
                                </Button>
                            </Link>
                        )}

                        <Button onClick={() => scrollTo('pricing')} className="hidden md:flex bg-white text-black hover:bg-gray-200 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
                            Nâng cấp Pro
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
