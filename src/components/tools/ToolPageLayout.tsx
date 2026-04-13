import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface ToolPageLayoutProps {
    /** Tên tool hiển thị trên breadcrumb */
    title: string
    /** Mô tả ngắn dưới title */
    description?: string
    /** Tool icon */
    icon?: LucideIcon
    /** Gradient class for tool accent */
    gradient?: string
    /** Phần header bên phải (search, filter, actions) */
    headerRight?: React.ReactNode
    children: React.ReactNode
}

export function ToolPageLayout({ title, description, icon: Icon, gradient, headerRight, children }: ToolPageLayoutProps) {
    return (
        <div className="flex flex-1 flex-col gap-0 p-4 lg:p-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                <Button variant="ghost" size="icon" className="size-7 -ml-1 mr-0.5 shrink-0" asChild>
                    <Link to="/app/tools"><ArrowLeft className="size-3.5" /></Link>
                </Button>
                <Link to="/app/tools" className="hover:text-foreground transition-colors">Công cụ AI</Link>
                <ChevronRight className="size-3.5" />
                <span className="text-foreground font-medium truncate">{title}</span>
            </nav>

            {/* Hero header with gradient accent */}
            <div className={cn(
                "relative rounded-2xl overflow-hidden mb-6 p-5 sm:p-6",
                gradient || "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
            )}>
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_70%)]" />
                <div className="relative flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        {Icon && (
                            <div className="flex items-center justify-center size-11 rounded-xl bg-background/80 backdrop-blur border shadow-sm">
                                <Icon className="size-5 text-primary" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
                            {description && (
                                <p className="text-sm text-muted-foreground mt-0.5 max-w-lg">{description}</p>
                            )}
                        </div>
                    </div>
                    {headerRight}
                </div>
            </div>

            {/* Content */}
            {children}
        </div>
    )
}
