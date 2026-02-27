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
                            Empowering creators with boundless AI generation. Build stunning realities at the speed of thought.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Studio Workspace</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">API Access</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Resources</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Documentation</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Community Prompt Guide</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-white/40">
                        © 2026 Nexus AI Art Studio. All rights reserved.
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
