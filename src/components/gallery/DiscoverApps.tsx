import { Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISCOVER_ITEMS = [
    {
        id: 1,
        img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
        title: "Iconstack",
        desc: "Hơn 50,000 biểu tượng SVG miễn phí",
        likes: 979,
        logo: "I"
    },
    {
        id: 2,
        img: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop",
        title: "Attendflow",
        desc: "Tiếp thị sự kiện trở nên đơn giản",
        likes: 710,
        logo: "AF"
    },
    {
        id: 3,
        img: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800&auto=format&fit=crop",
        title: "creativable",
        desc: "CRM All-in-one, Trợ lý AI, v.v...",
        likes: 456,
        logo: "C"
    },
    {
        id: 4,
        img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop",
        title: "Pilates Circle by Cult",
        desc: "Chuyển động toàn diện.",
        likes: 419,
        logo: "P"
    },
    {
        id: 5,
        img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=800&auto=format&fit=crop",
        title: "Opux AI",
        desc: "Mọi ứng dụng thành công đều bắt đầ...",
        likes: 369,
        logo: "O"
    },
    {
        id: 6,
        img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
        title: "NeuroTunes AI",
        desc: "Công cụ phát nhạc thích ứng...",
        likes: 283,
        logo: "N",
        isVideo: true
    },
    {
        id: 7,
        img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=800&auto=format&fit=crop",
        title: "Schedra",
        desc: "Nền tảng tạo nội dung tất cả trong m...",
        likes: 195,
        logo: "S"
    },
    {
        id: 8,
        img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
        title: "Createspace",
        desc: "Truyền thông AI thật đơn giản",
        likes: 163,
        logo: "CS"
    },
];

export function DiscoverApps() {
    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-32 mb-20 z-10 relative">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="text-4xl font-heading font-bold mb-2">Khám phá tác phẩm</h2>
                    <p className="text-xl text-white/70">Xem những gì người khác đang sáng tạo</p>
                </div>
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 bg-transparent rounded-lg px-6">
                    Xem tất cả
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {DISCOVER_ITEMS.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                        <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md relative mb-4 shadow-xl">
                            <img
                                src={item.img}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                            />
                            {item.isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <Play className="w-5 h-5 text-white ml-1" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold shrink-0 shadow-inner">
                                    {item.logo}
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white leading-tight">{item.title}</h3>
                                    <p className="text-sm text-white/50 truncate max-w-[200px]">{item.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/50 group-hover:text-white/80 transition-colors pt-1">
                                <Heart className="w-4 h-4" />
                                <span className="text-sm">{item.likes}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
