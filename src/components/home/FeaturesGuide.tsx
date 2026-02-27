import { motion } from "framer-motion";
import { Wand2, Layers, Zap } from "lucide-react";

export function FeaturesGuide() {
    return (
        <div id="features" className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-32 z-10 relative">
            <div className="text-center mb-24 max-w-4xl mx-auto relative">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-heading font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40"
                >
                    Kiến tạo nghệ thuật đỉnh cao
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl md:text-2xl text-white/60 font-light"
                >
                    Khám phá bộ công cụ sáng tạo vô tận được thiết kế dành riêng cho những khối óc không chấp nhận giới hạn.
                </motion.p>
            </div>

            {/* Feature 1: Text to Image */}
            <div className="flex flex-col lg:flex-row items-center gap-16 mb-40">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 space-y-8"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <Wand2 className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
                        Chuyển đổi Ngôn từ thành <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Kiệt tác</span>
                    </h3>
                    <p className="text-xl text-white/50 leading-relaxed font-light">
                        Mô tả ý tưởng của bạn bằng bất kỳ ngôn ngữ nào. AI lõi kép của chúng tôi sẽ phân tích ngữ cảnh, ánh sáng và bố cục để tạo ra những tác phẩm nghệ thuật vượt xa trí tưởng tượng của bạn chỉ trong vài giây.
                    </p>
                    <ul className="space-y-4 text-white/70">
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                <span className="text-xs text-purple-400">✓</span>
                            </div>
                            Hiểu định dạng hội thoại tự nhiên
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                <span className="text-xs text-purple-400">✓</span>
                            </div>
                            Hỗ trợ hàng ngàn phong cách nghệ thuật khác nhau
                        </li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 w-full relative group"
                >
                    <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full group-hover:bg-purple-500/30 transition-colors duration-700"></div>
                    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl aspectRatio-[4/3]">
                        <img
                            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
                            alt="Abstract AI Art"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                        <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
                            <p className="text-sm font-light text-white italic">"Một thành phố tương lai chìm trong ánh đèn neon phản chiếu trên mặt đường ướt sũng, phong cách cyberpunk rực rỡ..."</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Feature 2: Image to Image */}
            <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 w-full relative group"
                >
                    <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full group-hover:bg-blue-500/30 transition-colors duration-700"></div>
                    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"
                            alt="Refined UI layout"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute top-8 right-8 flex gap-2">
                            <div className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                <Layers className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 space-y-8"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <Zap className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
                        Biến đổi từ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Hình ảnh Gốc</span>
                    </h3>
                    <p className="text-xl text-white/50 leading-relaxed font-light">
                        Tải lên bản phác thảo thô hoặc một bức ảnh có sẵn. Nexus sẽ áp dụng phong cách mới, nâng cấp độ phân giải và thêm các chi tiết nghệ thuật mượt mà trong khi vẫn giữ nguyên cấu trúc gốc.
                    </p>
                    <ul className="space-y-4 text-white/70">
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <span className="text-xs text-blue-400">✓</span>
                            </div>
                            Kiểm soát mức độ sáng tạo (Creativity/Denoising)
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <span className="text-xs text-blue-400">✓</span>
                            </div>
                            Nâng cấp chi tiết siêu thực
                        </li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
}
