import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="flex flex-1 flex-col gap-4 md:flex-row">
            {/* Left Canvas Area */}
            <Card className="flex flex-1 flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ImageIcon className="h-4 w-4" /> Bảng vẽ
                    </CardTitle>
                    {generatedImg && (
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                                <Share2 className="mr-2 h-4 w-4" /> Chia sẻ
                            </Button>
                            <Button size="sm">
                                <Download className="mr-2 h-4 w-4" /> Tải xuống
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center p-8">
                    {isGenerating ? (
                        <div className="flex flex-col items-center gap-4">
                            <Skeleton className="h-64 w-64 rounded-xl" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    ) : generatedImg ? (
                        <img
                            src={generatedImg}
                            alt="Generated Art"
                            className="max-h-full max-w-full rounded-xl object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                <ImageIcon className="h-8 w-8" />
                            </div>
                            <p className="text-base font-medium">Bảng vẽ của bạn đang trống</p>
                            <p className="text-sm">Sử dụng bảng điều khiển để tạo nên kiệt tác đầu tiên của bạn.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Right/Bottom Generation Console */}
            <Card className="w-full shrink-0 md:w-[400px] lg:w-[450px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Settings2 className="h-4 w-4" /> Bảng điều khiển
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs defaultValue="text" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Văn bản</TabsTrigger>
                            <TabsTrigger value="image">Ảnh mẫu</TabsTrigger>
                        </TabsList>

                        <TabsContent value="text" className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Câu lệnh</Label>
                                <Textarea
                                    placeholder="VD: Một thành phố tương lai với ô tô bay, phong cách cyberpunk, độ chi tiết cao..."
                                    className="min-h-[120px] resize-none"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="image" className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Ảnh gốc</Label>
                                <Card className="cursor-pointer border-dashed transition-colors hover:bg-accent">
                                    <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Nhấp để tải lên hoặc kéo & thả</p>
                                            <p className="text-xs text-muted-foreground">SVG, PNG, JPG hoặc GIF (tối đa 10MB)</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="space-y-2">
                                <Label>Câu lệnh chỉnh sửa</Label>
                                <Textarea
                                    placeholder="Chúng ta nên chỉnh sửa bức ảnh này thế nào?"
                                    className="min-h-[80px] resize-none"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Separator />

                    {/* Settings */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Độ sáng tạo</Label>
                                <span className="text-xs text-muted-foreground">80%</span>
                            </div>
                            <Slider defaultValue={[80]} max={100} step={1} />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="high-res">Độ phân giải cao</Label>
                            <Switch id="high-res" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Đang tạo..." : (
                            <>
                                <Wand2 className="mr-2 h-5 w-5" /> Tạo tác phẩm
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
