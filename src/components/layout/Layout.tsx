import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout({ children, onNavigate }: { children: React.ReactNode, onNavigate?: (view: 'home' | 'studio') => void }) {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            {/* Immersive, Artistic Background Blobs - Responsive */}
            <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[60%] md:w-[50%] md:h-[50%] bg-[#FF0055]/40 md:bg-[#FF0055]/30 rounded-full blur-[100px] md:blur-[140px] mix-blend-screen pointer-events-none" />
            <div className="absolute top-[20%] right-[-20%] w-[140%] h-[50%] md:w-[40%] md:h-[40%] bg-[#7700FF]/40 md:bg-[#7700FF]/30 rounded-full blur-[100px] md:blur-[140px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[160%] h-[60%] md:w-[60%] md:h-[50%] bg-[#00D4FF]/30 md:bg-[#00D4FF]/20 rounded-full blur-[120px] md:blur-[160px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-10%] w-[130%] h-[50%] md:w-[30%] md:h-[30%] bg-[#FF00AA]/30 md:bg-[#FF00AA]/20 rounded-full blur-[100px] md:blur-[120px] mix-blend-screen pointer-events-none" />

            <Navbar onNavigate={onNavigate} />

            <main className="pb-10 relative z-10 flex flex-col flex-1 w-full">
                {children}
            </main>

            <Footer />
        </div>
    );
}
