export function StatsSection() {
    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 relative">
            <div className="mb-12">
                <h2 className="text-4xl font-heading font-bold mb-2">Nexus qua những con số</h2>
                <p className="text-xl text-white/70">Hàng triệu nhà sáng tạo đang biến ý tưởng thành hiện thực</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat Card 1 */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl rounded-[2rem] p-10 flex flex-col justify-between h-[300px] hover:bg-white/10 transition-colors">
                    <h3 className="text-6xl font-bold tracking-tight">36M+</h3>
                    <p className="text-lg text-white/60">tác phẩm được tạo trên Nexus</p>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl rounded-[2rem] p-10 flex flex-col justify-between h-[300px] hover:bg-white/10 transition-colors">
                    <h3 className="text-6xl font-bold tracking-tight">200K+</h3>
                    <p className="text-lg text-white/60">hình ảnh được tạo mỗi ngày trên Nexus</p>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl rounded-[2rem] p-10 flex flex-col justify-between h-[300px] hover:bg-white/10 transition-colors">
                    <h3 className="text-6xl font-bold tracking-tight">300M</h3>
                    <p className="text-lg text-white/60">lượt truy cập mỗi ngày vào các hồ sơ được xây dựng bằng Nexus</p>
                </div>
            </div>
        </div>
    );
}
