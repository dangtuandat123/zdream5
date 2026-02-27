import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { AppLogo } from "@/components/app-logo"

const footerLinks = [
    { label: "Tính năng", href: "#features" },
    { label: "Sản phẩm", href: "#showcase" },
    { label: "Báo giá", href: "#pricing" },
]

export function Footer() {
    return (
        <footer className="border-t border-border/50 bg-background">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <AppLogo size={32} />
                        <span className="font-bold text-lg font-[family-name:var(--font-heading)]">
                            Slox
                        </span>
                    </div>
                    <nav className="flex items-center gap-6">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <Separator className="my-6" />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Slox. Đã đăng ký bản quyền.</p>
                    <p>Được xây dựng bởi AI. Dành cho nhà sáng tạo.</p>
                </div>
            </div>
        </footer>
    )
}
