"use client"

import { Link, useLocation } from "react-router-dom"
import {
  Home,
  Palette,
  Sparkles,
  Image as ImageIcon,
  Settings,
  Gem,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Menu items chính
const navItems = [
  { icon: Home, label: "Trang chủ", path: "/app/dashboard" },
  { icon: Palette, label: "Styles", path: "/app/templates" },
  { icon: Sparkles, label: "Tạo ảnh", path: "/app/generate" },
  { icon: ImageIcon, label: "Thư viện", path: "/app/library" },
]

export function AppSidebar() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === "/app/dashboard") return location.pathname.includes("dashboard")
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Desktop sidebar — cố định bên trái, chỉ hiện trên md+ */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-[72px] flex-col items-center bg-sidebar border-r border-sidebar-border py-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-white mb-6 shrink-0 hover:scale-105 active:scale-95 transition-transform"
        >
          <Sparkles className="size-5" />
        </Link>

        {/* Nav chính */}
        <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  // Base: mờ nhẹ, sạch sẽ
                  "flex flex-col items-center justify-center gap-1 w-full py-2.5 rounded-xl transition-all duration-200",
                  active
                    // Active: nền accent nổi bật, text trắng sáng
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    // Inactive: text xám nhạt, hover sáng lên
                    : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/5"
                )}
              >
                <item.icon className={cn("size-5", active && "text-white")} />
                <span className={cn(
                  "text-[10px] leading-tight",
                  active ? "font-semibold text-white" : "font-medium"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="flex flex-col items-center gap-1.5 w-full px-2 shrink-0">
          {/* Cài đặt */}
          <Link
            to="/app/settings"
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-2.5 rounded-xl transition-all duration-200",
              location.pathname.includes("settings")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/5"
            )}
          >
            <Settings className="size-5" />
            <span className="text-[10px] font-medium leading-tight">Cài đặt</span>
          </Link>

          {/* Diamond balance */}
          <div className="flex flex-col items-center gap-0.5 py-2">
            <Gem className="size-[18px] text-cyan-400" />
            <span className="text-[11px] font-bold text-sidebar-foreground tabular-nums">926</span>
          </div>

          {/* Nạp Xu CTA */}
          <Link
            to="/app/topup"
            className="w-full text-center text-[10px] font-bold py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-fuchsia-500/20"
          >
            Nạp Xu
          </Link>
        </div>
      </aside>
    </>
  )
}
