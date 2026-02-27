"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Sparkles,
  LayoutDashboardIcon,
  WandIcon,
  LayoutGridIcon,
  ZapIcon,
  SettingsIcon,
  HelpCircleIcon,
  ChevronDownIcon
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
          <SidebarMenuItem className="group/header relative flex items-center">
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 transition-opacity duration-200 group-data-[collapsible=icon]:group-hover/header:opacity-0"
            >
              <Link to="/">
                <div className="flex aspect-square size-5 items-center justify-center rounded bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                  <Sparkles className="size-3" />
                </div>
                <span className="text-base font-semibold">Nexus Art</span>
              </Link>
            </SidebarMenuButton>

            <SidebarTrigger className="ml-auto transition-all duration-200 group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:left-1 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:group-hover/header:opacity-100" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Menu chính */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Workspace Selector */}
              <SidebarMenuItem className="mb-2">
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

              {/* Main Links */}
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto" />

        {/* Bottom Actions */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Nâng cấp Pro">
                  <ZapIcon />
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">Nâng cấp Pro</span>
                    <span className="truncate text-xs text-muted-foreground">Mở khoá toàn bộ</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
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

      {/* Footer */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
