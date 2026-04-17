"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  WandSparkles,
  Images,
  Hexagon,
  LogOut,
  Menu,
  ChevronRight,
  Shield,
  Gem,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  { icon: WandSparkles, label: "Tạo ảnh", desc: "Tạo ảnh bằng AI", path: "/app/generate" },
  { icon: Images, label: "Thư viện", desc: "Ảnh đã tạo và tải lên", path: "/app/library" },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { gems, isAdmin, logout } = useAuth()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [commandValue, setCommandValue] = useState("")

  // Phím tắt ⌘K hoặc Ctrl+K để mở menu search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const isActive = (path: string) => {
    if (path === "/app/home") return location.pathname.includes("home")
    if (path === "/app/admin") return location.pathname.startsWith("/app/admin")
    return location.pathname.startsWith(path)
  }

  useEffect(() => {
    if (isSearchOpen || isDrawerOpen) {
      const activeItem = navItems.find((item) => isActive(item.path))
      setCommandValue(activeItem ? activeItem.label : "")
    }
  }, [isSearchOpen, isDrawerOpen, location.pathname])

  const runCommand = (command: () => void) => {
    setIsSearchOpen(false)
    setIsDrawerOpen(false)
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
          <Link to="/app/topup">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border-white/5 active:scale-95 transition-all cursor-pointer backdrop-blur-md">
              <Gem className="size-3.5 text-[#60a5fa]" strokeWidth={2.5} />
              <span className="tabular-nums">{gems}</span>
            </Badge>
          </Link>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center justify-center size-9 rounded-full bg-secondary/80 hover:bg-secondary active:scale-95 transition-all border border-border/50 text-foreground"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* === Mobile: Drawer bottom sheet === */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="bg-[#2a2d31]/95 backdrop-blur-xl border-t border-white/10 text-white rounded-t-2xl">
            <div className="px-4 pt-2 pb-8">
              {/* Navigation items */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <button
                      key={item.path}
                      onClick={() => runCommand(() => navigate(item.path))}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition-colors text-left border border-transparent",
                        active
                          ? "bg-white/10 border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                          : "hover:bg-white/10 active:bg-white/15"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center size-10 rounded-xl shrink-0",
                        active ? "bg-primary/15" : "bg-white/5"
                      )}>
                        <item.icon className={cn(
                          "size-[22px] transition-transform duration-300 ease-out", 
                          active ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", active ? "font-bold text-white shadow-black" : "font-medium text-white/90")}>{item.label}</p>
                        <p className={cn("text-xs", active ? "text-white/70" : "text-white/50")}>{item.desc}</p>
                      </div>
                      {active && (
                        <div className="size-2 rounded-full bg-primary shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Admin — 1 nút duy nhất */}
              {isAdmin && (
                <>
              <div className="border-t border-white/10 my-3" />
                  <button
                    onClick={() => runCommand(() => navigate("/app/admin"))}
                    className={cn(
                      "flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition-colors text-left border border-transparent",
                      isActive("/app/admin")
                        ? "bg-white/10 border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                        : "hover:bg-white/10 active:bg-white/15"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center size-10 rounded-xl shrink-0",
                      isActive("/app/admin") ? "bg-primary/15" : "bg-white/5"
                    )}>
                      <Shield className={cn(
                        "size-[22px] transition-transform duration-300 ease-out", 
                        isActive("/app/admin") ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", isActive("/app/admin") ? "font-bold text-white shadow-black" : "font-medium text-white/90")}>Admin</p>
                      <p className={cn("text-xs", isActive("/app/admin") ? "text-white/70" : "text-white/50")}>Quản lý hệ thống</p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </button>
                </>
              )}

              {/* Separator */}
              <div className="border-t my-3" />

              {/* Nạp Kim Cương mobile */}
              <button
                onClick={() => runCommand(() => navigate('/app/topup'))}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition-colors text-left border border-transparent",
                  isActive("/app/topup")
                    ? "bg-white/10 border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                    : "hover:bg-white/10 active:bg-white/15"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center size-10 rounded-xl shrink-0",
                  isActive("/app/topup") ? "bg-blue-500/15" : "bg-white/5"
                )}>
                  <Gem className={cn(
                    "size-[22px] transition-transform duration-300 ease-out text-[#60a5fa]", 
                    isActive("/app/topup") ? "scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" : "text-[#60a5fa]/70"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", isActive("/app/topup") ? "font-bold text-white shadow-black" : "font-medium text-white/90")}>
                    {gems} Kim Cương
                  </p>
                  <p className={cn("text-xs", isActive("/app/topup") ? "text-white/70" : "text-white/50")}>Nạp thêm</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </button>

              {/* Đăng xuất */}
              <button
                onClick={() => runCommand(async () => { await logout(); navigate('/login'); })}
                className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition-colors text-left text-red-400 hover:bg-red-500/10 active:bg-red-500/20"
              >
                <div className="flex items-center justify-center size-10 rounded-xl bg-red-500/10 shrink-0">
                  <LogOut className="size-[22px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Đăng xuất</p>
                </div>
              </button>
            </div>
          </DrawerContent>
        </Drawer>

      {/* === Desktop: Command Palette (Search Overlay) === */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} commandProps={{ value: commandValue, onValueChange: setCommandValue }}>
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
                  <CommandItem
                    onSelect={() => runCommand(() => navigate("/app/admin"))}
                    className={cn(
                      "cursor-pointer py-3",
                      isActive("/app/admin") && "bg-secondary text-foreground font-semibold"
                    )}
                  >
                    <Shield className={cn("mr-2 size-4 text-muted-foreground", isActive("/app/admin") && "text-foreground")} />
                    <span className={cn("font-medium", isActive("/app/admin") && "font-bold tracking-tight text-foreground")}>Admin Panel</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            <CommandSeparator />

            <CommandGroup heading="Tài khoản">
              <CommandItem
                onSelect={() => runCommand(() => navigate('/app/topup'))}
                className="cursor-pointer py-3"
              >
                <Gem className="mr-2 size-4 text-[#60a5fa]" />
                <span className="font-medium text-[#60a5fa]">Nạp Kim Cương</span>
                <CommandShortcut>{gems} 💎</CommandShortcut>
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

      {/* Desktop sidebar — cố định bên trái, chỉ hiện trên md+ */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-[84px] flex-col items-center bg-[#2a2d31]/95 backdrop-blur-xl border-r border-white/10 py-4">

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

        {/* Footer */}
        <div className="flex flex-col items-center gap-1.5 w-full px-2 shrink-0">
          {/* Admin — 1 nút duy nhất */}
          {isAdmin && (
            <Link
              to="/app/admin"
              className={cn(
                "group flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-2xl transition-all duration-300 border border-transparent mb-1",
                isActive("/app/admin")
                  ? "bg-white/10 text-white border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                  : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/5 active:bg-white/10"
              )}
            >
              <Shield className={cn(
                "size-[22px] transition-transform duration-300 ease-out",
                isActive("/app/admin") ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "group-hover:scale-110"
              )} />
              <span className={cn(
                "text-[10px] tracking-wide",
                isActive("/app/admin") ? "font-bold text-white shadow-black" : "font-medium"
              )}>
                Admin
              </span>
            </Link>
          )}

          {/* Kim Cương balance + Nạp */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/app/topup"
                  className={cn(
                    "group flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-2xl transition-all duration-300 border border-transparent mb-1",
                    isActive("/app/topup")
                      ? "bg-white/10 text-white border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                      : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/5 active:bg-white/10"
                  )}
                >
                  <Gem className={cn(
                    "size-[22px] transition-transform duration-300 ease-out text-[#60a5fa]",
                    isActive("/app/topup") ? "scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" : "group-hover:scale-110 text-[#60a5fa]/70"
                  )} />
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      "text-[11px] tabular-nums font-bold leading-none mb-1 mt-0.5",
                      isActive("/app/topup") ? "text-white shadow-black" : "text-white/90"
                    )}>{gems}</span>
                    <span className={cn(
                      "text-[9px] tracking-wide leading-none",
                      isActive("/app/topup") ? "font-bold text-white shadow-black" : "font-medium opacity-70"
                    )}>
                      Nạp thêm
                    </span>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <p>Bạn có <strong>{gems}</strong> Kim Cương 💎</p>
                <p className="text-muted-foreground">Nhấn để nạp thêm</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
