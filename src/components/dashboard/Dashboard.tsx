import { Link } from "react-router-dom"
import {
    WandSparkles,
    SwatchBook,
    Images,
    CrownIcon,
    Search,
    Heart,
    Sparkles,
    VideoIcon,
    MoreHorizontal
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// Dữ liệu mẫu phong phú cho Feed Masonry - Đậm chất AI Art
const FEED_ITEMS = [
    {
        id: "1",
        image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop",
        creator: "AIArtist_Pro",
        avatar: "https://i.pravatar.cc/150?u=1",
        likes: 1205,
        type: "image",
        aspectRatio: "aspect-[3/4]"
    },
    {
        id: "2",
        image: "https://images.unsplash.com/photo-1580477667995-2b92f353364e?q=80&w=600&auto=format&fit=crop",
        creator: "AnimeLover",
        avatar: "https://i.pravatar.cc/150?u=2",
        likes: 842,
        type: "video",
        aspectRatio: "aspect-square"
    },
    {
        id: "3",
        image: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800&auto=format&fit=crop",
        creator: "CyberpunkNeo",
        avatar: "https://i.pravatar.cc/150?u=3",
        likes: 3410,
        type: "image",
        aspectRatio: "aspect-[4/5]"
    },
    {
        id: "4",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=700&auto=format&fit=crop",
        creator: "PortraitMaster",
        avatar: "https://i.pravatar.cc/150?u=4",
        likes: 672,
        type: "image",
        aspectRatio: "aspect-[3/4]"
    },
    {
        id: "5",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
        creator: "RenderGenius",
        avatar: "https://i.pravatar.cc/150?u=5",
        likes: 2190,
        type: "video",
        aspectRatio: "aspect-video"
    },
    {
        id: "6",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
        creator: "FantasyWorld",
        avatar: "https://i.pravatar.cc/150?u=6",
        likes: 954,
        type: "image",
        aspectRatio: "aspect-square"
    },
    {
        id: "7",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=700&auto=format&fit=crop",
        creator: "ProductDesign",
        avatar: "https://i.pravatar.cc/150?u=7",
        likes: 432,
        type: "image",
        aspectRatio: "aspect-[4/5]"
    },
    {
        id: "8",
        image: "https://images.unsplash.com/photo-1506744012022-28d54c1bb264?q=80&w=800&auto=format&fit=crop",
        creator: "LandscapeAI",
        avatar: "https://i.pravatar.cc/150?u=8",
        likes: 5120,
        type: "image",
        aspectRatio: "aspect-[3/4]"
    },
    {
        id: "9",
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
        creator: "DreamCatcher",
        avatar: "https://i.pravatar.cc/150?u=9",
        likes: 890,
        type: "image",
        aspectRatio: "aspect-square"
    },
    {
        id: "10",
        image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=800&auto=format&fit=crop",
        creator: "AbstractArt",
        avatar: "https://i.pravatar.cc/150?u=10",
        likes: 350,
        type: "video",
        aspectRatio: "aspect-[16/9]"
    }
]

export function Dashboard() {
    return (
        <div className="relative flex flex-1 flex-col min-h-screen pb-6 lg:pb-8 font-sans selection:bg-primary/30">
            
            {/* ========= TOP SECTION: BANNERS & QUICK TOOLS ========= */}
            <div className="flex flex-col gap-6 p-4 lg:p-6 lg:pb-0">
                
                {/* 🌟 1. HERO BANNERS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* Main Hero Banner: ZDream Studio (Trái) - Chuẩn Shadcn Card */}
                    <Card className="relative col-span-1 lg:col-span-2 overflow-hidden rounded-[20px] min-h-[280px] sm:min-h-[320px] border-white/5 border-[0.5px] bg-[#1a0b2e] shadow-2xl group cursor-pointer">
                        {/* Vector Wave Background Simulation */}
                        <div className="absolute inset-0 z-0">
                            <div className="absolute top-0 right-[-10%] w-[80%] h-[120%] rounded-[100%] bg-gradient-to-l from-violet-600/80 to-transparent blur-[80px] opacity-70 group-hover:opacity-90 transition-opacity duration-1000"></div>
                            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[80%] rounded-[100%] bg-[#0f0724] blur-[60px] opacity-90"></div>
                        </div>

                        <CardContent className="relative z-10 h-full flex flex-col justify-center items-start p-6 sm:p-10">
                            <Badge variant="outline" className="mb-6 bg-white/5 text-white/[0.85] border-white/10 hover:bg-white/10 py-1.5 px-3 backdrop-blur-md rounded-md font-medium text-xs">
                                <Sparkles className="size-3.5 mr-1.5 text-blue-400" /> ZDream Studio
                            </Badge>
                            
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05] mb-4">
                                Biến Ý Tưởng Thành<br />
                                Tác Phẩm Nghệ Thuật
                            </h1>
                            
                            <p className="text-sm sm:text-[15px] text-white/70 max-w-[320px] font-medium leading-relaxed">
                                Nâng tầm sáng tạo với các mô hình AI thế hệ mới. Khám phá kho tàng phong cách đa dạng chỉ trong vài giây.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Promo Banner: Gói Độc Quyền (Phải) - Chuẩn Shadcn Card */}
                    <Card className="relative col-span-1 overflow-hidden rounded-[20px] min-h-[240px] sm:min-h-[320px] border-white/5 border-[0.5px] bg-gradient-to-br from-[#0c3e29] to-[#042817] group cursor-pointer shadow-lg p-0">
                        {/* Green Glow Accent */}
                        <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-emerald-500/10 blur-[90px] rounded-full group-hover:bg-emerald-400/20 transition-colors duration-700"></div>

                        <CardContent className="relative z-10 h-full flex flex-col justify-center items-start p-6 sm:p-8">
                            <Badge className="mb-5 bg-emerald-700/40 hover:bg-emerald-600/40 text-emerald-100 border border-emerald-500/30 rounded-md font-semibold text-[10px] tracking-widest px-2.5 py-0.5 uppercase shadow-none">
                                <CrownIcon className="size-3 mr-1 fill-emerald-100" /> GÓI ĐỘC QUYỀN
                            </Badge>
                            
                            <h2 className="text-2xl lg:text-[28px] font-black text-white tracking-tight leading-[1.1] mb-4 drop-shadow-sm">
                                ZDream Pro Series<br/>
                                Giảm Đến <span className="text-emerald-400">50%</span>
                            </h2>
                            
                            <p className="text-emerald-50/60 text-xs leading-relaxed mb-6 font-medium max-w-[220px]">
                                Bypass giới hạn API. Mở khóa độ phân giải 4K cho toàn bộ tài nguyên.
                            </p>
                            
                            <Button className="bg-[#10b981] hover:bg-[#059669] text-emerald-950 font-bold rounded-full px-6 py-4 shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all h-auto mt-auto sm:mt-0">
                                Nâng Cấp Ngay <span className="ml-2 font-normal">→</span>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* 🎯 2. QUICK NAV BAR (Horizontal Scroll Menu - Glassmorphism) */}
                <ScrollArea className="w-full whitespace-nowrap pb-2 clean-horizontal-scroll">
                    <div className="flex w-max space-x-3 sm:space-x-4 px-1 snap-x snap-mandatory">
                        
                        <Link to="/app/generate" className="w-[180px] sm:w-[200px] shrink-0 snap-center group rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent hover:from-primary/50 hover:to-primary/10 transition-all duration-300">
                            <div className="flex items-center gap-3.5 bg-black/40 backdrop-blur-md rounded-[15px] p-4 h-full group-hover:bg-black/60 transition-colors">
                                <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(currentcolor,0.3)]">
                                    <Sparkles className="size-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white tracking-wide">Tạo Ảnh AI</span>
                                    <span className="text-[10px] text-zinc-400 font-medium tracking-wide border-b border-primary/20 pb-0.5 w-fit">Đỉnh Cao</span>
                                </div>
                            </div>
                        </Link>

                        <Link to="/app/templates" className="w-[180px] sm:w-[200px] shrink-0 snap-center group rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent hover:from-purple-500/50 hover:to-purple-500/10 transition-all duration-300">
                            <div className="flex items-center gap-3.5 bg-black/40 backdrop-blur-md rounded-[15px] p-4 h-full group-hover:bg-black/60 transition-colors">
                                <div className="flex items-center justify-center size-10 rounded-full bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                    <SwatchBook className="size-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white tracking-wide">Kiểu Mẫu</span>
                                    <span className="text-[10px] text-zinc-400 font-medium tracking-wide">Preset Thiết Kế</span>
                                </div>
                            </div>
                        </Link>

                        <Link to="/app/generate" className="w-[180px] sm:w-[200px] shrink-0 snap-center group rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent hover:from-sky-500/50 hover:to-sky-500/10 transition-all duration-300">
                            <div className="flex items-center gap-3.5 bg-black/40 backdrop-blur-md rounded-[15px] p-4 h-full group-hover:bg-black/60 transition-colors">
                                <div className="flex items-center justify-center size-10 rounded-full bg-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                                    <WandSparkles className="size-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white tracking-wide">Chỉnh Nét</span>
                                    <span className="text-[10px] text-zinc-400 font-medium tracking-wide">Inpainting</span>
                                </div>
                            </div>
                        </Link>

                        <Link to="/app/library" className="w-[180px] sm:w-[200px] shrink-0 snap-center group rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent hover:from-amber-500/50 hover:to-amber-500/10 transition-all duration-300">
                            <div className="flex items-center gap-3.5 bg-black/40 backdrop-blur-md rounded-[15px] p-4 h-full group-hover:bg-black/60 transition-colors">
                                <div className="flex items-center justify-center size-10 rounded-full bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                    <Images className="size-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white tracking-wide">Thư Viện</span>
                                    <span className="text-[10px] text-zinc-400 font-medium tracking-wide">Lưu Trữ Riêng</span>
                                </div>
                            </div>
                        </Link>
                        
                    </div>
                    <ScrollBar orientation="horizontal" className="invisible" />
                </ScrollArea>
                
            </div>

            {/* ========= COMMUNITY / FEED SECTION ========= */}
            <div className="flex flex-col gap-6 p-4 lg:p-6 mt-4">
                
                {/* Headers & Search Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl px-5 shadow-lg drop-shadow">Đề xuất</Button>
                        <Button variant="ghost" className="text-zinc-500 hover:text-white rounded-xl px-4 transition-colors">Theo dõi</Button>
                        <div className="w-[1px] h-4 bg-white/10 mx-2 hidden sm:block"></div>
                        <Button variant="ghost" className="text-zinc-500 hover:text-white rounded-xl px-4 transition-colors">Sự kiện</Button>
                    </div>

                    <div className="flex flex-1 md:flex-none w-full md:w-auto items-center gap-3">
                        <div className="relative w-full md:w-[280px]">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Tìm kiếm nguồn cảm hứng..."
                                className="pl-9 h-10 w-full rounded-xl bg-black/40 border-white/5 focus-visible:ring-1 focus-visible:ring-white/20 transition-all font-medium placeholder:text-zinc-600"
                            />
                        </div>
                        <Button className="shrink-0 rounded-xl h-10 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:brightness-110 border-none transition-all font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            Chia Sẻ Artwork
                        </Button>
                    </div>
                </div>

                {/* Sub-filters Categories */}
                <div className="flex items-center gap-6 overflow-x-auto pb-4 clean-horizontal-scroll text-[13px] font-semibold text-zinc-500 tracking-wide">
                    <span className="text-white cursor-pointer hover:text-white whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Dành cho bạn</span>
                    <span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Chân dung điện ảnh</span>
                    <span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Phong cách Anime</span>
                    <span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Nhiếp ảnh đường phố</span>
                    <span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Kiểu mẫu Kiến trúc</span>
                    <span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">3D Engine</span>
                </div>

                {/* MASONRY GRID - Refactored to Standard CSS Grid with aspect ratio locking */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4">
                    {FEED_ITEMS.map((item) => (
                        <div key={item.id} className={`relative group rounded-[18px] overflow-hidden cursor-pointer bg-zinc-900 border border-white/5 ring-1 ring-inset ring-white/10 shadow-lg transition-transform hover:-translate-y-1 duration-300 ${item.aspectRatio}`}>
                            {/* Artwork Image */}
                            <img 
                                src={item.image} 
                                alt="AI Generation" 
                                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                loading="lazy"
                            />
                            
                            {/* Inner Glass Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-1">
                                        {/* Hiển thị Icon định dạng nếu cần */}
                                        {item.type === "video" && (
                                            <div className="size-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-sm">
                                                <VideoIcon className="size-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="size-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-white/20">
                                        <MoreHorizontal className="size-4 text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2">
                                        <img src={item.avatar} alt="Avatar" className="size-6 rounded-full border border-white/20 shadow-sm" />
                                        <span className="text-[11px] sm:text-xs font-semibold text-white truncate max-w-[80px] sm:max-w-[120px] drop-shadow-md">{item.creator}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-white/90">
                                        <Heart className="size-4 hover:fill-rose-500 hover:text-rose-500 transition-colors drop-shadow" />
                                        <span className="text-[11px] font-bold tabular-nums drop-shadow">{item.likes}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>



        </div>
    )
}
