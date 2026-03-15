"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  SwatchBook,
  WandSparkles,
  Images,
  Gem,
  Hexagon,
  LogOut,
  Menu,
  ChevronRight,
  Shield,
  Users,
  Layers,
  Cpu,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer"

// Menu items chính
const navItems = [
  { icon: LayoutDashboard, label: "Home", desc: "Trang chủ", path: "/app/home" },
  { icon: SwatchBook, label: "Kiểu mẫu", desc: "Mẫu thiết kế có sẵn", path: "/app/templates" },
  { icon: WandSparkles, label: "Tạo ảnh", desc: "Tạo ảnh bằng AI", path: "/app/generate" },
  { icon: Images, label: "Thư viện", desc: "Ảnh đã tạo và tải lên", path: "/app/library" },
]

// Admin menu items
const adminItems = [
  { icon: Shield, label: "Dashboard", desc: "Tổng quan hệ thống", path: "/app/admin" },
  { icon: Users, label: "Users", desc: "Quản lý người dùng", path: "/app/admin/users" },
  { icon: Layers, label: "Templates", desc: "Quản lý kiểu mẫu", path: "/app/admin/templates" },
  { icon: Cpu, label: "Models", desc: "Quản lý mô hình AI", path: "/app/admin/models" },
  { icon: Settings, label: "Settings", desc: "Cài đặt hệ thống", path: "/app/admin/settings" },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { gems, isAdmin, logout } = useAuth()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [commandValue, setCommandValue] = useState("")

  // Phím tắt ⌘K hoặc Ctrl+K để mở menu
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const isActive = (path: string) => {
    if (path === "/app/home") return location.pathname.includes("home")
    return location.pathname.startsWith(path)
  }

  useEffect(() => {
    if (open) {
      const activeItem = navItems.find((item) => isActive(item.path))
      setCommandValue(activeItem ? activeItem.label : "")
    }
  }, [open, location.pathname])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <>
      {/* Mobile Header (chỉ hiện trên màn hình nhỏ) */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between w-full h-[60px] px-4 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <Link to="/" className="flex items-center gap-2 active:scale-95 transition-transform">
          <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-white">
            <Hexagon className="size-4 fill-white/20" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">ZDream</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/app/topup"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 active:scale-95 transition-all text-sm font-semibold"
          >
            <Gem className="size-3.5 text-cyan-400" />
            <span className="tabular-nums">{gems}</span>
          </Link>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center size-9 rounded-full bg-secondary/80 hover:bg-secondary active:scale-95 transition-all border border-border/50 text-foreground"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* === Mobile: Drawer bottom sheet — vùng bấm lớn, UX tối ưu cho touch === */}
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <div className="px-4 pt-2 pb-8">
              {/* Navigation items — vùng bấm lớn, icon + label + desc */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <button
                      key={item.path}
                      onClick={() => runCommand(() => navigate(item.path))}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition-colors text-left",
                        active
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted active:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center size-10 rounded-xl shrink-0",
                        active ? "bg-primary/15" : "bg-muted"
                      )}>
                        <item.icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", active ? "font-semibold" : "font-medium")}>{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      {active && (
                        <div className="size-2 rounded-full bg-primary shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Admin items */}
              {isAdmin && (
                <>
                  <div className="border-t my-3" />
                  <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
                  {adminItems.map((item) => {
                    const active = isActive(item.path)
                    return (
                      <button
                        key={item.path}
                        onClick={() => runCommand(() => navigate(item.path))}
                        className={cn(
                          "flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition-colors text-left",
                          active
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted active:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center size-10 rounded-xl shrink-0",
                          active ? "bg-primary/15" : "bg-muted"
                        )}>
                          <item.icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm", active ? "font-semibold" : "font-medium")}>{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        {active && <div className="size-2 rounded-full bg-primary shrink-0" />}
                      </button>
                    )
                  })}
                </>
              )}

              {/* Separator */}
              <div className="border-t my-3" />

              {/* Nạp Xu — nổi bật */}
              <button
                onClick={() => runCommand(() => navigate('/app/topup'))}
                className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition-colors hover:bg-pink-500/10 active:bg-pink-500/15 text-left"
              >
                <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 shrink-0">
                  <Gem className="size-5 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-pink-500">Nạp Xu</p>
                  <p className="text-xs text-muted-foreground">Hiện có <span className="font-semibold text-foreground">{gems}</span> xu</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </button>

              {/* Đăng xuất */}
              <button
                onClick={() => runCommand(async () => { await logout(); navigate('/login'); })}
                className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition-colors text-left text-destructive hover:bg-destructive/10 active:bg-destructive/15"
              >
                <div className="flex items-center justify-center size-10 rounded-xl bg-destructive/10 shrink-0">
                  <LogOut className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Đăng xuất</p>
                </div>
              </button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        /* === Desktop: Command Palette — search + keyboard nav cho power users === */
        <CommandDialog open={open} onOpenChange={setOpen} commandProps={{ value: commandValue, onValueChange: setCommandValue }}>
          <CommandInput placeholder="Tìm kiếm trang hoặc tính năng..." />
          <CommandList className="scrollbar-none custom-scrollbar pb-2 pt-1">
            <CommandEmpty>Không tìm thấy phần nào.</CommandEmpty>

            <CommandGroup heading="Truy cập nhanh">
              {navItems.map((item) => {
                const active = isActive(item.path)
                return (
                  <CommandItem
                    key={item.path}
                    onSelect={() => runCommand(() => navigate(item.path))}
                    className={cn(
                      "cursor-pointer py-3",
                      active && "bg-secondary text-foreground font-semibold"
                    )}
                  >
                    <item.icon className={cn("mr-2 size-4 text-muted-foreground", active && "text-foreground")} />
                    <span className={cn("font-medium", active && "font-bold tracking-tight text-foreground")}>{item.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {isAdmin && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Admin">
                  {adminItems.map((item) => {
                    const active = isActive(item.path)
                    return (
                      <CommandItem
                        key={item.path}
                        onSelect={() => runCommand(() => navigate(item.path))}
                        className={cn(
                          "cursor-pointer py-3",
                          active && "bg-secondary text-foreground font-semibold"
                        )}
                      >
                        <item.icon className={cn("mr-2 size-4 text-muted-foreground", active && "text-foreground")} />
                        <span className={cn("font-medium", active && "font-bold tracking-tight text-foreground")}>{item.label}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </>
            )}

            <CommandSeparator />

            <CommandGroup heading="Tài khoản">
              <CommandItem
                onSelect={() => runCommand(() => navigate('/app/topup'))}
                className="cursor-pointer py-3 text-pink-500 data-[selected=true]:text-pink-600 data-[selected=true]:bg-pink-500/10"
              >
                <Gem className="mr-2 size-4" />
                <span className="font-medium">Nạp Xu</span>
                <CommandShortcut className="text-pink-500/50">Mua</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(async () => { await logout(); navigate('/login'); })}
                className="cursor-pointer py-3 text-red-500 data-[selected=true]:text-red-500 data-[selected=true]:bg-red-500/10"
              >
                <LogOut className="mr-2 size-4" />
                <span className="font-medium">Đăng xuất</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      )}

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
                  "group flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-2xl transition-all duration-300 border border-transparent",
                  active
                    ? "bg-white/10 text-white border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
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

        {/* Admin nav */}
        {isAdmin && (
          <nav className="flex flex-col items-center gap-1 w-full px-2 mt-2 pt-2 border-t border-sidebar-border">
            {adminItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "group flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-2xl transition-all duration-300 border border-transparent",
                    active
                      ? "bg-white/10 text-white border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
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
        )}

        {/* Footer */}
        <div className="flex flex-col items-center gap-1.5 w-full px-2 shrink-0">
          {/* Diamond balance */}
          <div className="flex flex-col items-center gap-0.5 py-2">
            <Gem className="size-[18px] text-cyan-400" />
            <span className="text-[11px] font-bold text-sidebar-foreground tabular-nums">{gems}</span>
          </div>

          {/* Nạp Xu CTA */}
          <Link
            to="/app/topup"
            className="w-full text-center text-[10px] font-bold py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-fuchsia-500/20"
          >
            Nạp Xu
          </Link>

          {/* Đăng xuất */}
          <button
            onClick={async () => { await logout(); navigate('/login'); }}
            className="group flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-2xl transition-all duration-300 border border-transparent text-sidebar-foreground/50 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20"
          >
            <LogOut className="size-[22px] transition-transform duration-300 ease-out group-hover:scale-110" />
            <span className="text-[10px] tracking-wide font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  )
}
