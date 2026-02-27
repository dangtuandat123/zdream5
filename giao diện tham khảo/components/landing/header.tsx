"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Sun, Moon, Menu, X } from "lucide-react"
import { AppLogo } from "@/components/app-logo"
import { Button } from "@/components/ui/button"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
        <Link href="/" className="flex items-center gap-2">
          <AppLogo size={32} />
          <span className="font-bold text-lg font-[family-name:var(--font-heading)]">
            Slox
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Tính năng</a>
          <a href="#showcase" className="hover:text-foreground transition-colors">Sản phẩm nổi bật</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Báo giá</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Chuyển đổi giao diện</span>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex rounded-lg">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button size="sm" asChild className="hidden sm:inline-flex rounded-lg">
            <Link href="/register">Bắt đầu</Link>
          </Button>
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Bật/tắt menu</span>
          </Button>
        </div>
      </div>
      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
          <div className="flex flex-col px-4 py-3 gap-1">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm font-medium text-foreground">Tính năng</a>
            <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm font-medium text-foreground">Sản phẩm nổi bật</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm font-medium text-foreground">Báo giá</a>
            <div className="flex gap-2 pt-2 border-t border-border mt-1">
              <Button variant="outline" size="sm" asChild className="flex-1 rounded-lg">
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button size="sm" asChild className="flex-1 rounded-lg">
                <Link href="/register">Bắt đầu</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
