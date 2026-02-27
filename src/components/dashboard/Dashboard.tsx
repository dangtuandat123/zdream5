import { motion } from "framer-motion";
import { Image as ImageIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Dashboard() {
    return (
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl md:text-4xl font-heading font-bold text-white mb-2"
                    >
                        Tổng quan Tổng hợp
                    </motion.h1>
                    <p className="text-white/50">Theo dõi hoạt động và giới hạn API của bạn.</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-[#050505] border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white/60 font-medium">Đã tạo tháng này</h3>
                            <ImageIcon className="w-5 h-5 text-white/30" />
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">1,204</p>
                        <p className="text-sm text-emerald-400">+12% so với tháng trước</p>
                    </div>
                    <div className="bg-[#050505] border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white/60 font-medium">Giờ API đã dùng</h3>
                            <Clock className="w-5 h-5 text-white/30" />
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">42.5h</p>
                        <p className="text-sm text-white/40">Trong tổng số 50h của gói Pro</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                        <h3 className="text-white font-medium mb-2">Nâng cấp không hãn mức?</h3>
                        <Button size="sm" className="bg-white text-black hover:bg-gray-200 font-bold rounded-lg w-full">
                            Lên gói Studio
                        </Button>
                    </div>
                </div>

                {/* Recent Generations List */}
                <div className="bg-[#050505] border border-white/10 rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white">Tác phẩm gần đây</h2>
                        <Button variant="ghost" className="text-white/50 hover:text-white">Xem tất cả</Button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-black/50 overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=100&auto=format&fit=crop" alt="Thumbnail" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white mb-1">Cyberpunk Cityscape #{item}</h4>
                                        <p className="text-xs text-white/40 font-mono">2048x1024 • txt2img • 45 steps</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-white/60 mb-1">Hôm nay</p>
                                    <Button size="sm" variant="outline" className="h-8 border-white/20 text-white hover:bg-white/10 bg-transparent">Tải xuống</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
