import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell() {
    return (
        <div className="flex flex-col md:flex-row min-h-svh w-full bg-background">
            {/* Mobile Header và Desktop Sidebar */}
            <AppSidebar />

            {/* Main content — offset bởi sidebar width trên desktop */}
            <main className="flex flex-1 flex-col min-w-0 md:ml-[84px]">
                <Outlet />
            </main>
        </div>
    );
}
