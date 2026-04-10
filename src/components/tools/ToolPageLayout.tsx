import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToolPageLayoutProps {
    /** Tên tool hiển thị trên breadcrumb */
    title: string
    /** Mô tả ngắn dưới title */
    description?: string
    /** Phần header bên phải (search, filter, actions) */
    headerRight?: React.ReactNode
    children: React.ReactNode
}

export function ToolPageLayout({ title, description, headerRight, children }: ToolPageLayoutProps) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            {/* Breadcrumb + Back */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground -mb-2">
                <Button variant="ghost" size="icon" className="size-7 -ml-1 mr-0.5 shrink-0" asChild>
                    <Link to="/app/tools"><ArrowLeft className="size-3.5" /></Link>
                </Button>
                <Link to="/app/tools" className="hover:text-foreground transition-colors">Công cụ AI</Link>
                <ChevronRight className="size-3.5" />
                <span className="text-foreground font-medium truncate">{title}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {headerRight}
            </div>

            {/* Content */}
            {children}
        </div>
    )
}
