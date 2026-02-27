import { Outlet } from "react-router-dom";

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Separator } from "@/components/ui/separator";

export function AppShell() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* Top header bar with sidebar trigger for mobile */}
                <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border bg-black/40 backdrop-blur-xl px-4">
                    <SidebarTrigger className="-ml-1 text-white/70 hover:text-white hover:bg-white/10" />
                    <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
                    <span className="text-sm font-medium text-white/70">Nexus Art Studio</span>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col relative overflow-x-hidden bg-[#050505]">
                    {/* Ambient Background */}
                    <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none -z-10" />
                    <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none -z-10" />
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
