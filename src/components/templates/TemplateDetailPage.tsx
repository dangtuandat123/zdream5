import { useState, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeftIcon, UploadIcon, ImageIcon, Wand2, Download, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Dữ liệu mẫu (giả lập)
const TEMPLATES: Record<string, { name: string; category: string; description: string }> = {
    "1": { name: "Chân dung Cyberpunk", category: "Chân dung", description: "Biến đổi ảnh của bạn thành phong cách Cyberpunk với ánh neon rực rỡ, hiệu ứng holographic và bầu không khí tương lai." },
    "2": { name: "Phong cảnh Ghibli", category: "Anime", description: "Chuyển đổi ảnh phong cảnh thành phong cách Studio Ghibli với màu sắc pastel, đám mây bông gòn và ánh sáng mộng mơ." },
    "3": { name: "Render sản phẩm 3D", category: "3D", description: "Tạo ảnh render 3D siêu thực cho sản phẩm của bạn với hiệu ứng ánh sáng studio chuyên nghiệp." },
    "4": { name: "Logo Minimalist", category: "Logo", description: "Thiết kế lại logo theo phong cách tối giản, hiện đại với đường nét sạch sẽ và sắc nét." },
    "5": { name: "Sơn dầu cổ điển", category: "Phong cảnh", description: "Mang lại vẻ đẹp cổ điển Baroque cho ảnh phong cảnh với kỹ thuật sơn dầu đầy ấn tượng." },
    "6": { name: "Anime Waifu", category: "Anime", description: "Tạo nhân vật anime từ ảnh chân dung, phong cách manga Nhật Bản với chi tiết cao." },
}

export function TemplateDetailPage() {
    const { id } = useParams<{ id: string }>()
    const template = TEMPLATES[id || "1"] || TEMPLATES["1"]

    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImg, setGeneratedImg] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => setUploadedImage(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleGenerate = () => {
        if (!uploadedImage) return
        setIsGenerating(true)
        setGeneratedImg(null)
        setTimeout(() => {
            setGeneratedImg(
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
            )
            setIsGenerating(false)
        }, 3000)
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link to="/app/templates">
                        <ArrowLeftIcon className="mr-2 size-4" /> Quay lại
                    </Link>
                </Button>
            </div>

            {/* Template Info */}
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">{template.name}</h1>
                    <Badge variant="outline">{template.category}</Badge>
                </div>
                <p className="text-muted-foreground mt-1">{template.description}</p>
            </div>

            <div className="flex flex-1 flex-col gap-4 lg:flex-row">
                {/* Left: Template Preview + Kết quả */}
                <div className="flex flex-1 flex-col gap-4">
                    {/* Mẫu preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Mẫu gốc</CardTitle>
                            <CardDescription>Đây là phong cách AI sẽ áp dụng cho ảnh của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                                <ImageIcon className="size-12 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Kết quả */}
                    {(isGenerating || generatedImg) && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Kết quả</CardTitle>
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
                            <CardContent>
                                {isGenerating ? (
                                    <div className="flex flex-col items-center gap-4 py-8">
                                        <Skeleton className="h-48 w-48 rounded-xl" />
                                        <Skeleton className="h-4 w-40" />
                                        <p className="text-sm text-muted-foreground">Đang tạo ảnh theo mẫu...</p>
                                    </div>
                                ) : generatedImg ? (
                                    <img
                                        src={generatedImg}
                                        alt="Generated"
                                        className="max-w-full rounded-lg object-contain"
                                    />
                                ) : null}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right: Upload + Settings */}
                <Card className="w-full shrink-0 lg:w-[380px]">
                    <CardHeader>
                        <CardTitle className="text-base">Tải ảnh gốc</CardTitle>
                        <CardDescription>Tải lên ảnh bạn muốn biến đổi theo mẫu này</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Upload Zone */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {uploadedImage ? (
                            <div className="space-y-3">
                                <img
                                    src={uploadedImage}
                                    alt="Uploaded"
                                    className="max-h-48 w-full rounded-lg object-contain bg-muted"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Chọn ảnh khác
                                </Button>
                            </div>
                        ) : (
                            <Card
                                className="cursor-pointer border-dashed transition-colors hover:bg-accent"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                                    <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                                        <UploadIcon className="size-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Nhấp để tải lên</p>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG hoặc WEBP (tối đa 10MB)
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Separator />

                        {/* Settings */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Mức độ biến đổi</Label>
                                <span className="text-xs text-muted-foreground">70%</span>
                            </div>
                            <Slider defaultValue={[70]} max={100} step={1} />
                            <p className="text-xs text-muted-foreground">
                                Cao hơn = sáng tạo hơn, thấp hơn = gần với ảnh gốc hơn
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Chất lượng đầu ra</Label>
                            <Select defaultValue="high">
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn chất lượng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Chuẩn (512x512)</SelectItem>
                                    <SelectItem value="high">Cao (1024x1024)</SelectItem>
                                    <SelectItem value="ultra">Siêu nét (2048x2048)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleGenerate}
                            disabled={isGenerating || !uploadedImage}
                        >
                            {isGenerating ? (
                                "Đang tạo..."
                            ) : (
                                <>
                                    <Wand2 className="mr-2 size-5" /> Tạo ảnh theo mẫu
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
