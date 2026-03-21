import { Link } from "react-router-dom"
import { Sparkles } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function Footer() {
    return (
        <footer className="w-full border-t border-border/30 mt-0 z-10 relative bg-background">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2.5 mb-4 group w-fit">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white group-hover:scale-105 transition-transform">
                                <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">ZDream</span>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Tiếp sức cho các nhà sáng tạo với công nghệ AI không giới hạn. Xây dựng những thực tại tuyệt mỹ với tốc độ của tư duy.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4">Sản phẩm</h4>
                        <ul className="space-y-3">
                            <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Không gian Sáng tạo</Link></li>
                            <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Truy cập API</Link></li>
                            <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Bảng giá</a></li>
                            <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Nhật ký Cập nhật</Link></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4">Tài nguyên</h4>
                        <ul className="space-y-3">
                            <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tài liệu tham khảo</Link></li>
                            <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cộng đồng Prompt</Link></li>
                            <li><a href="mailto:support@zdream.vn" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Trung tâm Trợ giúp</a></li>
                            <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4">Pháp lý</h4>
                        <ul className="space-y-3">
                            <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Điều khoản Dịch vụ</Link></li>
                            <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Chính sách Bảo mật</Link></li>
                            <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Chính sách Cookie</Link></li>
                        </ul>
                    </div>
                </div>

                <Separator className="mb-8 bg-border/30" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        &copy; 2026 ZDream. Đã đăng ký Bản quyền.
                    </p>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-violet-500/10 hover:text-violet-400 transition-colors">
                            <span className="text-xs font-bold leading-none">X</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-violet-500/10 hover:text-violet-400 transition-colors">
                            <span className="text-xs font-bold leading-none">in</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-violet-500/10 hover:text-violet-400 transition-colors">
                            <span className="text-xs font-bold leading-none">Gh</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
