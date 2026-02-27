import { useState } from "react"
import { ImageIcon, Wand2, Download, Share2, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function GeneratePage() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImg, setGeneratedImg] = useState<string | null>(null)
    const [prompt, setPrompt] = useState("")

    const handleGenerate = () => {
        if (!prompt.trim()) return
        setIsGenerating(true)
        setGeneratedImg(null)
        // Giả lập API call
        setTimeout(() => {
            setGeneratedImg(
                "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200&auto=format&fit=crop"
            )
            setIsGenerating(false)
        }, 2500)
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row lg:p-6">
            {/* Canvas bên trái */}
            <Card className="flex flex-1 flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ImageIcon className="size-4" /> Bảng vẽ
                    </CardTitle>
                    {generatedImg && (
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                                <Share2 className="mr-2 size-4" /> Chia sẻ
                            </Button>
                            <Button size="sm">
                                <Download className="mr-2 size-4" /> Tải xuống
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center p-8">
                    {isGenerating ? (
                        <div className="flex flex-col items-center gap-4">
                            <Skeleton className="h-64 w-64 rounded-xl" />
                            <Skeleton className="h-4 w-48" />
                            <p className="text-sm text-muted-foreground">Đang tạo tác phẩm...</p>
                        </div>
                    ) : generatedImg ? (
                        <img
                            src={generatedImg}
                            alt="Generated Art"
                            className="max-h-full max-w-full rounded-xl object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
                            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
                                <ImageIcon className="size-8" />
                            </div>
                            <p className="text-base font-medium">Bảng vẽ đang trống</p>
                            <p className="text-sm">Nhập mô tả ở bên phải để AI tạo ảnh cho bạn.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Console bên phải */}
            <Card className="w-full shrink-0 md:w-[380px] lg:w-[420px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Settings2 className="size-4" /> Bảng điều khiển
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Prompt */}
                    <div className="space-y-2">
                        <Label>Mô tả ý tưởng</Label>
                        <Textarea
                            placeholder="VD: Một thành phố tương lai lúc hoàng hôn, phong cách cyberpunk, độ chi tiết cao, ánh sáng neon..."
                            className="min-h-[120px] resize-none"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    <Separator />

                    {/* Model */}
                    <div className="space-y-2">
                        <Label>Mô hình AI</Label>
                        <Select defaultValue="sdxl">
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn mô hình" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                                <SelectItem value="dalle3">DALL·E 3</SelectItem>
                                <SelectItem value="midjourney">Midjourney v6</SelectItem>
                                <SelectItem value="flux">Flux Pro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Style */}
                    <div className="space-y-2">
                        <Label>Phong cách</Label>
                        <Select defaultValue="photorealistic">
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn phong cách" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="photorealistic">Chân thực</SelectItem>
                                <SelectItem value="anime">Anime</SelectItem>
                                <SelectItem value="watercolor">Màu nước</SelectItem>
                                <SelectItem value="oil-painting">Sơn dầu</SelectItem>
                                <SelectItem value="digital-art">Digital Art</SelectItem>
                                <SelectItem value="3d-render">3D Render</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* Creativity Slider */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Độ sáng tạo</Label>
                            <span className="text-xs text-muted-foreground">75%</span>
                        </div>
                        <Slider defaultValue={[75]} max={100} step={1} />
                    </div>

                    {/* High-res Toggle */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="high-res">Độ phân giải cao (2x)</Label>
                        <Switch id="high-res" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                    >
                        {isGenerating ? (
                            "Đang tạo..."
                        ) : (
                            <>
                                <Wand2 className="mr-2 size-5" /> Tạo ảnh
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
