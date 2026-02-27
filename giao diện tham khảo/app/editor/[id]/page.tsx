"use client"

import { use } from "react"
import { LogoEditor } from "@/components/logo-editor"

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <LogoEditor projectId={id} />
}
