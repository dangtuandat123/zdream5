import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";

export function AppShell() {
    return (
        <div className="flex min-h-svh w-full bg-background">
            {/* Sidebar cố định bên trái, chỉ hiện trên desktop (md+) */}
            <AppSidebar />

            {/* Main content — offset bởi sidebar width trên desktop */}
            <main className="flex flex-1 flex-col min-w-0 md:ml-[72px]">
                <Outlet />
            </main>
            <Toaster />
        </div>
    );
}
