import { Sparkles } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background text-foreground">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground group-hover:opacity-90 transition-opacity">
              <Sparkles className="h-4 w-4" />
            </div>
            ZDream
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
        />
        <div className="absolute inset-0 bg-background/20 pointer-events-none"></div>
      </div>
    </div>
  )
}
