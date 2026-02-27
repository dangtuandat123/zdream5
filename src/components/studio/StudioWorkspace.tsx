import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Wand2, Upload, Settings2, Image as ImageIcon, Download, Share2 } from "lucide-react";

export function StudioWorkspace() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImg, setGeneratedImg] = useState<string | null>(null);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setGeneratedImg("https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200&auto=format&fit=crop");
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto p-4 gap-6 h-[calc(100vh-5rem)]">
            {/* Left Canvas Area */}
            <div className="flex-1 glass-panel rounded-3xl overflow-hidden relative flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <h2 className="font-heading font-semibold text-white/80 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Bảng vẽ
                    </h2>
                    {generatedImg && (
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-white/70 hover:text-white">
                                <Share2 className="w-4 h-4 mr-2" /> Chia sẻ
                            </Button>
                            <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                                <Download className="w-4 h-4 mr-2" /> Tải xuống
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
                    {isGenerating ? (
                        <div className="flex flex-col items-center gap-4 animate-pulse">
                            <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                            <p className="font-medium text-purple-300">Đang tổng hợp điểm ảnh...</p>
                        </div>
                    ) : generatedImg ? (
                        <img
                            src={generatedImg}
                            alt="Generated Art"
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-fade-in"
                        />
                    ) : (
                        <div className="text-center text-white/40 max-w-md">
                            <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
                                <ImageIcon className="w-10 h-10 text-white/20" />
                            </div>
                            <p className="text-lg mb-2">Bảng vẽ của bạn đang trống</p>
                            <p className="text-sm">Sử dụng bảng điều khiển để tạo nên kiệt tác đầu tiên của bạn.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right/Bottom Generation Console */}
            <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 glass-panel rounded-3xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-black/20">
                    <h2 className="font-heading font-semibold text-white flex items-center gap-2">
                        <Settings2 className="w-4 h-4" /> Bảng điều khiển
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <Tabs defaultValue="text" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl mb-6">
                            <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all">
                                Văn bản
                            </TabsTrigger>
                            <TabsTrigger value="image" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all">
                                Ảnh mẫu
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="text" className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white/80">Câu lệnh</label>
                                <Textarea
                                    placeholder="VD: Một thành phố tương lai với ô tô bay, phong cách cyberpunk, độ chi tiết cao..."
                                    className="min-h-[120px] bg-black/40 border-white/10 text-white placeholder:text-white/30 resize-none focus-visible:ring-purple-500/50 rounded-xl"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="image" className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white/80">Ảnh gốc</label>
                                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-white/60 group-hover:text-white" />
                                    </div>
                                    <p className="text-sm font-medium text-white/80 mb-1">Nhấp để tải lên hoặc kéo & thả</p>
                                    <p className="text-xs text-white/40">SVG, PNG, JPG hoặc GIF (tối đa 10MB)</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white/80">Câu lệnh chỉnh sửa</label>
                                <Textarea
                                    placeholder="Chúng ta nên chỉnh sửa bức ảnh này thế nào?"
                                    className="min-h-[80px] bg-black/40 border-white/10 text-white placeholder:text-white/30 resize-none focus-visible:ring-purple-500/50 rounded-xl"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-8 space-y-6 pt-6 border-t border-white/10">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-white/80">Độ sáng tạo</label>
                                <span className="text-xs text-white/50">80%</span>
                            </div>
                            <Slider defaultValue={[80]} max={100} step={1} className="w-full" />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="text-sm font-medium text-white/80">Độ phân giải cao</label>
                            <Switch />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-black/40">
                    <Button
                        className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Đang tạo..." : (
                            <>
                                <Wand2 className="w-5 h-5 mr-2" /> Tạo tác phẩm
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
