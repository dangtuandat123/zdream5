import { Link, useLocation } from "react-router-dom";
import {
    Image as ImageIcon,
    CreditCard,
    Settings,
    LayoutDashboard,
    Sparkles,
    LogOut,
} from "lucide-react";
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
    SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
    { id: "dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
    { id: "studio", label: "Không gian sáng tạo", icon: ImageIcon },
    { id: "billing", label: "Gói Pro", icon: CreditCard },
    { id: "settings", label: "Cài đặt", icon: Settings },
];

export function AppSidebar() {
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <Sidebar collapsible="icon" className="border-sidebar-border">
            {/* Sidebar Header - Logo */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Link to="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                                    <Sparkles className="size-4 text-white" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-heading font-bold text-base tracking-tight">
                                        Nexus Art
                                    </span>
                                    <span className="truncate text-xs text-sidebar-foreground/60">
                                        AI Studio
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Sidebar Content - Navigation */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Ứng dụng</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {NAV_ITEMS.map((item) => {
                                const isActive = location.pathname.includes(item.id);
                                return (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.label}
                                        >
                                            <Link to={`/app/${item.id}`}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Sidebar Footer - User & Logout */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <div className="flex items-center gap-3 cursor-default">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold border border-white/20">
                                    NX
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">Nhà Sáng Tạo</span>
                                    <span className="truncate text-xs text-sidebar-foreground/60">
                                        Gói Pro (Active)
                                    </span>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={logout}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            tooltip="Đăng xuất"
                        >
                            <LogOut />
                            <span>Đăng xuất</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
