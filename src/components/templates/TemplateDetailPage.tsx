import { useState, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import {
    ArrowLeftIcon,
    UploadIcon,
    Download,
    Share2,
    Loader2,
    ImageIcon,
    Sparkles,
    Settings2,
    ArrowUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Dữ liệu mẫu
const TEMPLATES: Record<string, { name: string; category: string; description: string }> = {
    "1": { name: "Chân dung Cyberpunk", category: "Chân dung", description: "Biến đổi ảnh thành phong cách Cyberpunk với ánh neon rực rỡ" },
    "2": { name: "Phong cảnh Ghibli", category: "Anime", description: "Chuyển đổi ảnh phong cảnh thành phong cách Studio Ghibli" },
    "3": { name: "Render sản phẩm 3D", category: "3D", description: "Tạo ảnh render 3D siêu thực cho sản phẩm" },
    "4": { name: "Logo Minimalist", category: "Logo", description: "Thiết kế lại logo theo phong cách tối giản" },
    "5": { name: "Sơn dầu cổ điển", category: "Phong cảnh", description: "Mang vẻ đẹp cổ điển Baroque cho ảnh" },
    "6": { name: "Anime Waifu", category: "Anime", description: "Tạo nhân vật anime từ ảnh chân dung" },
    "7": { name: "Ảnh thời trang", category: "Chân dung", description: "Ảnh chân dung thời trang cao cấp" },
    "8": { name: "Concept Art", category: "Phong cảnh", description: "Concept art game/phim" },
    "9": { name: "Mockup sản phẩm", category: "Sản phẩm", description: "Ảnh mockup sản phẩm chuyên nghiệp" },
    "10": { name: "Chibi Avatar", category: "Anime", description: "Avatar chibi dễ thương" },
    "11": { name: "Pixel Art", category: "3D", description: "Pixel art retro game" },
    "12": { name: "Watercolor Portrait", category: "Chân dung", description: "Chân dung phong cách màu nước" },
}

export function TemplateDetailPage() {
    const { id } = useParams<{ id: string }>()
    const template = TEMPLATES[id || "1"] || TEMPLATES["1"]

    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImg, setGeneratedImg] = useState<string | null>(null)
    const [strength, setStrength] = useState([70])
    const [quality, setQuality] = useState("high")
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
        <TooltipProvider>
            <div className="relative flex h-full w-full flex-col overflow-hidden bg-muted/10">
                {/* Top Bar — Breadcrumb + Template Info */}
                <div className="flex items-center justify-between border-b px-4 py-3 lg:px-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                            <Link to="/app/templates">
                                <ArrowLeftIcon className="size-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-semibold">{template.name}</h1>
                            <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                        </div>
                    </div>
                    <p className="hidden text-xs text-muted-foreground sm:block max-w-xs truncate">
                        {template.description}
                    </p>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 pb-36 overflow-auto">
                    {isGenerating ? (
                        <div className="relative flex flex-col items-center justify-center w-full max-w-3xl aspect-[4/3] rounded-2xl border bg-background/50 shadow-sm overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/5 animate-pulse" />
                            <Loader2 className="size-10 animate-spin text-primary opacity-50 mb-4" />
                            <p className="text-sm font-medium text-muted-foreground animate-pulse">
                                Đang tạo ảnh theo mẫu "{template.name}"...
                            </p>
                        </div>
                    ) : generatedImg ? (
                        <div className="group relative flex items-center justify-center w-full max-w-3xl aspect-[4/3] rounded-2xl bg-black/5 overflow-hidden border shadow-sm">
                            <img
                                src={generatedImg}
                                alt="Generated"
                                className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                            />
                            <div className="absolute top-4 right-4 flex opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 gap-2">
                                <Button size="sm" variant="secondary" className="h-9 px-3 shadow-md backdrop-blur-md bg-background/80 hover:bg-background">
                                    <Share2 className="mr-2 size-4" /> Chia sẻ
                                </Button>
                                <Button size="sm" className="h-9 px-3 shadow-md">
                                    <Download className="mr-2 size-4" /> Tải xuống
                                </Button>
                            </div>
                        </div>
                    ) : uploadedImage ? (
                        <div className="relative flex flex-col items-center gap-4 w-full max-w-3xl">
                            <div className="flex items-center justify-center w-full aspect-[4/3] rounded-2xl border bg-background/50 overflow-hidden shadow-sm">
                                <img
                                    src={uploadedImage}
                                    alt="Uploaded"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Ảnh gốc đã sẵn sàng. Nhấn ⬆ để bắt đầu tạo.
                            </p>
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 opacity-60 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="flex size-20 items-center justify-center rounded-3xl border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-primary/50 hover:bg-primary/5">
                                <UploadIcon className="size-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-medium tracking-tight">Tải ảnh lên</h3>
                                <p className="text-muted-foreground">
                                    Nhấp vào đây hoặc kéo ảnh gốc vào để AI biến đổi theo mẫu <strong>"{template.name}"</strong>
                                </p>
                                <p className="text-xs text-muted-foreground/70">PNG, JPG hoặc WEBP · tối đa 10MB</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Floating Bottom Bar */}
                <div className="absolute bottom-8 left-1/2 w-full max-w-2xl -translate-x-1/2 px-4 z-50">
                    <div className="flex items-center justify-between rounded-[20px] border border-border/50 bg-background/70 backdrop-blur-2xl p-3 shadow-2xl">
                        {/* Left: Upload + Settings */}
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 rounded-full px-4 text-xs"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <UploadIcon className="mr-2 size-4" />
                                        {uploadedImage ? "Đổi ảnh" : "Tải ảnh lên"}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Chọn ảnh gốc để biến đổi</TooltipContent>
                            </Tooltip>

                            <Popover>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-9 rounded-full">
                                                <Settings2 className="size-4" />
                                            </Button>
                                        </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Thông số</TooltipContent>
                                </Tooltip>

                                <PopoverContent side="top" align="start" className="w-[300px] p-4 rounded-xl shadow-xl">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 font-medium text-sm">
                                            <Sparkles className="size-4 text-primary" />
                                            Thông số biến đổi
                                        </div>
                                        <Separator />
                                        {/* Strength Slider */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mức biến đổi</Label>
                                                <span className="text-xs font-medium">{strength[0]}%</span>
                                            </div>
                                            <Slider value={strength} onValueChange={setStrength} max={100} step={1} />
                                            <p className="text-[11px] text-muted-foreground">
                                                Cao = sáng tạo hơn · Thấp = giữ nguyên ảnh gốc
                                            </p>
                                        </div>
                                        {/* Quality Select */}
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Chất lượng</Label>
                                            <Select value={quality} onValueChange={setQuality}>
                                                <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="standard">Chuẩn (512×512)</SelectItem>
                                                    <SelectItem value="high">Cao (1024×1024)</SelectItem>
                                                    <SelectItem value="ultra">Siêu nét (2048×2048)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Center: Template name */}
                        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                            <ImageIcon className="size-3.5" />
                            <span className="truncate max-w-[150px]">{template.name}</span>
                        </div>

                        {/* Right: Generate */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    className="size-10 rounded-full bg-primary hover:scale-105 transition-transform"
                                    disabled={isGenerating || !uploadedImage}
                                    onClick={handleGenerate}
                                >
                                    {isGenerating ? (
                                        <Loader2 className="size-5 animate-spin" />
                                    ) : (
                                        <ArrowUp className="size-5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={10}>Tạo ảnh</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
