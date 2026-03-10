import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";

export function Layout() {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <main className="relative z-10 flex flex-col flex-1 w-full">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
