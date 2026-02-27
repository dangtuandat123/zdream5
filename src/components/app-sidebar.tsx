"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Sparkles,
  LayoutDashboardIcon,
  WandIcon,
  LayoutGridIcon,
  SearchIcon,
  StarIcon,
  ClockIcon,
  GiftIcon,
  ZapIcon,
  ChevronDownIcon,
  SettingsIcon,
  HelpCircleIcon,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const data = {
  user: {
    name: "Nhà Sáng Tạo",
    email: "creator@nexusart.io",
    avatar: "",
  },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Logo & Toggle */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="relative flex items-center">
            {/* Logo - Ẩn khi sidebar collapsed VÀ đang được hover */}
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 transition-opacity duration-200 group-data-[collapsible=icon]:group-hover:opacity-0"
            >
              <Link to="/">
                <div className="flex aspect-square size-5 items-center justify-center rounded bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                  <Sparkles className="size-3" />
                </div>
                <span className="text-base font-semibold">Nexus Art</span>
              </Link>
            </SidebarMenuButton>

            {/* Trigger - Nằm đè lên Logo, chỉ hiện khi sidebar collapsed VÀ đang được hover */}
            <SidebarTrigger className="absolute left-1 opacity-0 transition-opacity duration-200 group-data-[collapsible=icon]:group-hover:opacity-100" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Workspace Selector — giống "Tuấn's Lovable" */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton tooltip="Chọn không gian">
                    <Avatar className="size-5 rounded-md">
                      <AvatarFallback className="rounded-md text-[10px] bg-primary text-primary-foreground">
                        N
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate font-medium">Nhà Sáng Tạo</span>
                    <ChevronDownIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start" side="right">
                  <DropdownMenuItem>Không gian cá nhân</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Tạo không gian mới</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Nav chính — Home, Search */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.includes("dashboard")}
                tooltip="Trang chủ"
              >
                <Link to="/app/dashboard">
                  <LayoutDashboardIcon />
                  <span>Trang chủ</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Tìm kiếm">
                <SearchIcon />
                <span>Tìm kiếm</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarContent>
        {/* Group: Tạo ảnh — giống "Projects" */}
        <SidebarGroup>
          <SidebarGroupLabel>Tạo ảnh</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/app/generate"}
                  tooltip="Tạo ảnh AI"
                >
                  <Link to="/app/generate">
                    <WandIcon />
                    <span>Tạo ảnh AI</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.includes("templates")}
                  tooltip="Mẫu thiết kế"
                >
                  <Link to="/app/templates">
                    <LayoutGridIcon />
                    <span>Mẫu thiết kế</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Yêu thích">
                  <StarIcon />
                  <span>Yêu thích</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Group: Gần đây — giống "Recents" */}
        <SidebarGroup>
          <SidebarGroupLabel>Gần đây</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Cyberpunk City">
                  <ClockIcon />
                  <span>Cyberpunk Cityscape</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Anime Portrait">
                  <ClockIcon />
                  <span>Anime Portrait</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spacer */}
        <div className="mt-auto" />

        {/* Bottom CTA — giống "Share Lovable" + "Upgrade to Pro" */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Chia sẻ">
                  <GiftIcon />
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">Chia sẻ Nexus Art</span>
                    <span className="truncate text-xs text-muted-foreground">100 💎 / lượt giới thiệu</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Nâng cấp Pro">
                  <ZapIcon />
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">Nâng cấp Pro</span>
                    <span className="truncate text-xs text-muted-foreground">Mở khoá toàn bộ</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary nav — Settings, Help */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Cài đặt">
                  <Link to="/app/settings">
                    <SettingsIcon />
                    <span>Cài đặt</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Trợ giúp">
                  <HelpCircleIcon />
                  <span>Trợ giúp</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: User avatar + dropdown */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
