import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout({ children, onNavigate }: { children: React.ReactNode, onNavigate?: (view: 'home' | 'studio') => void }) {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            {/* Immersive, Artistic Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF0055]/40 rounded-full blur-[140px] mix-blend-screen pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#7700FF]/40 rounded-full blur-[140px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[50%] bg-[#00D4FF]/30 rounded-full blur-[160px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-[#FF00AA]/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

            <Navbar onNavigate={onNavigate} />

            <main className="pb-10 relative z-10 flex flex-col flex-1 w-full">
                {children}
            </main>

            <Footer />
        </div>
    );
}
