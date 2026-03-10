"use client"

import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  SwatchBook,
  WandSparkles,
  Images,
  Settings2,
  Gem,
  Hexagon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Menu items chính
const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/app/home" },
  { icon: SwatchBook, label: "Kiểu mẫu", path: "/app/templates" },
  { icon: WandSparkles, label: "Tạo ảnh", path: "/app/generate" },
  { icon: Images, label: "Thư viện", path: "/app/library" },
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
          className="relative flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-white mb-8 shrink-0 hover:scale-110 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-95 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Hexagon className="size-6 fill-white/20 relative z-10 animate-[spin_10s_linear_infinite]" />
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
                  // Base: Nút bo góc lớn, spacing thoáng
                  "group flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-2xl transition-all duration-300 border border-transparent",
                  active
                    // Active: Glassmorphism nổi bật, đổ bóng trắng (hoặc accent)
                    ? "bg-white/10 text-white border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                    // Inactive: Làm mờ text, hover sẽ sáng lên
                    : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/5 active:bg-white/10"
                )}
              >
                <item.icon className={cn(
                  "size-[22px] transition-transform duration-300 ease-out", 
                  active ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "group-hover:scale-110"
                )} />
                <span className={cn(
                  "text-[10px] tracking-wide",
                  active ? "font-bold text-white shadow-black" : "font-medium"
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
              "group flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-2xl transition-all duration-300 border border-transparent",
              location.pathname.includes("settings")
                ? "bg-white/10 text-white border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/5 active:bg-white/10"
            )}
          >
            <Settings2 className={cn(
                  "size-[22px] transition-transform duration-300 ease-out", 
                  location.pathname.includes("settings") ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "group-hover:scale-110"
                )} />
            <span className={cn(
                  "text-[10px] tracking-wide",
                  location.pathname.includes("settings") ? "font-bold text-white shadow-black" : "font-medium"
                )}>
                Cài đặt
            </span>
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
