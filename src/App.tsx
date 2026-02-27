import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { DiscoverApps } from "@/components/gallery/DiscoverApps";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { StudioWorkspace } from "@/components/studio/StudioWorkspace";

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'studio'>('home');

  return (
    <Layout onNavigate={setCurrentView}>
      {currentView === 'home' ? (
        <>
          <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center relative z-10 w-full">
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
              <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-[#FF0055]/50 rounded-full blur-[120px] mix-blend-screen"></div>
              <div className="absolute bottom-[20%] right-[15%] w-[45vw] h-[45vw] bg-[#7700FF]/50 rounded-full blur-[130px] mix-blend-screen"></div>
              <div className="absolute top-[30%] text-center w-[50vw] h-[50vw] bg-[#00D4FF]/40 rounded-full blur-[140px] mix-blend-screen pointer-events-none"></div>
              <div className="absolute top-[40%] text-center w-[30vw] h-[30vw] bg-[#FF00AA]/30 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
            </div>

            <h1 className="text-5xl md:text-6xl font-sans font-bold mb-4 tracking-tight text-white !leading-tight">
              Build something Lovable
            </h1>

            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mb-12 font-medium">
              Create apps and websites by chatting with AI
            </p>

            <div className="w-full max-w-[800px] bg-[#222222]/95 backdrop-blur-xl rounded-[24px] p-2 flex flex-col justify-between min-h-[140px] border border-white/5 shadow-2xl transition-all focus-within:ring-1 focus-within:ring-white/20 relative z-20">
              <div className="px-4 pt-3 flex-1">
                <input
                  type="text"
                  className="flex rounded-md border border-input transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full bg-transparent border-none text-[15px] font-medium text-white placeholder:text-white/50 focus-visible:ring-0 shadow-none h-auto p-0"
                  placeholder="Ask Lovable to create a landing page for"
                />
              </div>

              <div className="flex items-center justify-between px-3 pb-2 pt-8">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 shrink-0">
                  <span className="text-lg leading-none font-light mb-0.5">+</span>
                </button>

                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow py-2 rounded-full bg-[#3B59DF] hover:bg-[#3B59DF]/90 text-white text-xs px-4 h-8 font-medium">
                    Plan
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent w-8 h-8 text-white/50 hover:text-white rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic w-4 h-4" aria-hidden="true">
                      <path d="M12 19v3"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <rect x="9" y="2" width="6" height="13" rx="3"></rect>
                    </svg>
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4 -rotate-90" aria-hidden="true">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Section replacing GalleryGrid */}
          <DiscoverApps />

          {/* Stats Section */}
          <StatsSection />

          {/* Features Section */}
          <FeaturesSection />

          {/* Testimonials Section */}
          <TestimonialsSection />
        </>
      ) : (
        <StudioWorkspace />
      )}
    </Layout>
  )
}

export default App
