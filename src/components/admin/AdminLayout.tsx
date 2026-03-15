import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Image, SwatchBook, Cpu, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const adminTabs = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/app/admin', end: true },
    { icon: Users, label: 'Người dùng', path: '/app/admin/users', end: false },
    { icon: Image, label: 'Tạo ảnh', path: '/app/admin/generate', end: false },
    { icon: SwatchBook, label: 'Kiểu mẫu', path: '/app/admin/templates', end: false },
    { icon: Cpu, label: 'Mô hình AI', path: '/app/admin/models', end: false },
    { icon: Settings, label: 'Cài đặt', path: '/app/admin/settings', end: false },
];

export default function AdminLayout() {
    return (
        <div className="flex flex-1 flex-col min-h-0">
            {/* Tab navigation — sticky, scroll ngang trên mobile */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b">
                <ScrollArea className="w-full">
                    <nav className="flex items-center gap-1 px-4 py-2 min-w-max">
                        {adminTabs.map((tab) => (
                            <NavLink
                                key={tab.path}
                                to={tab.path}
                                end={tab.end}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                <tab.icon className="size-4" />
                                {tab.label}
                            </NavLink>
                        ))}
                    </nav>
                    <ScrollBar orientation="horizontal" className="h-0" />
                </ScrollArea>
            </div>

            {/* Nội dung admin page */}
            <div className="flex-1 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
}
