"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogoWizard } from "@/components/logo-wizard"

export default function CreatePage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = (config: Record<string, string>) => {
    setIsGenerating(true)
    sessionStorage.setItem("logoConfig", JSON.stringify(config))
    router.push("/app/create/generating")
  }

  return (
    <LogoWizard onGenerate={handleGenerate} isGenerating={isGenerating} />
  )
}
