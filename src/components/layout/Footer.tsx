export function Footer() {
    return (
        <footer className="w-full border-t border-white/10 mt-20 z-10 relative bg-black">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="font-heading font-bold text-xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            Nexus Art
                        </h3>
                        <p className="text-sm text-white/50 font-light mb-4 max-w-xs">
                            Tiếp sức cho các nhà sáng tạo với công nghệ AI không giới hạn. Xây dựng những thực tại tuyệt mỹ với tốc độ của tư duy.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Sản phẩm</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Không gian Sáng tạo</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Truy cập API</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Bảng giá</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Nhật ký Cập nhật</a></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Tài nguyên</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Tài liệu tham khảo</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Cộng đồng Prompt</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Trung tâm Trợ giúp</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Pháp lý</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Điều khoản Dịch vụ</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Chính sách Bảo mật</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Chính sách Cookie</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-white/40">
                        © 2026 Nexus AI Art Studio. Đã đăng ký Bản quyền.
                    </p>
                    <div className="flex gap-4">
                        {/* Social mockups */}
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                            <span className="text-white/50 text-xs font-bold leading-none">X</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                            <span className="text-white/50 text-xs font-bold leading-none">in</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                            <span className="text-white/50 text-xs font-bold leading-none">Gh</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
