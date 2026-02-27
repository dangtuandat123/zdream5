import { Header } from "./components/landing/header"
import { Hero } from "./components/landing/hero"
import { Features } from "./components/landing/features"
import { Showcase } from "./components/landing/showcase"
import { Pricing } from "./components/landing/pricing"
import { Cta } from "./components/landing/cta"
import { Footer } from "./components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-y-auto overflow-x-hidden scroll-smooth bg-background selection:bg-primary/30 selection:text-primary-foreground relative">
      <Header />
      <main className="flex flex-col w-full">
        <Hero />
        <Features />
        <Showcase />
        <Pricing />
        <section className="min-h-[100dvh] w-full flex flex-col justify-between shrink-0">
          <Cta />
          <Footer />
        </section>
      </main>
    </div>
  )
}
