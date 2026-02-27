import { useState } from "react"
import {
    Wand2,
    Download,
    Share2,
    Settings2,
    ArrowUp,
    Sparkles,
    Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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

export function GeneratePage() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImg, setGeneratedImg] = useState<string | null>(null)
    const [prompt, setPrompt] = useState("")

    // Settings state
    const [model, setModel] = useState("sdxl")
    const [style, setStyle] = useState("photorealistic")
    const [creativity, setCreativity] = useState([75])
    const [highRes, setHighRes] = useState(false)

    const handleGenerate = () => {
        if (!prompt.trim()) return
        setIsGenerating(true)
        setGeneratedImg(null)
        // Simulate API call
        setTimeout(() => {
            setGeneratedImg(
                "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200&auto=format&fit=crop"
            )
            setIsGenerating(false)
        }, 3000)
    }

    return (
        <TooltipProvider>
            <div className="relative flex h-full w-full flex-col overflow-hidden bg-muted/10">
                {/* 
                  Canvas Area
                  Gần như full màn hình, pb-32 để không bị che bởi thanh công cụ nổi ở viền dưới 
                */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 pb-40 overflow-auto">
                    {isGenerating ? (
                        <div className="relative flex flex-col items-center justify-center w-full max-w-4xl aspect-[16/9] rounded-2xl border bg-background/50 shadow-sm overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 animate-pulse" />
                            <Loader2 className="size-10 animate-spin text-primary opacity-50 mb-4" />
                            <p className="text-sm font-medium text-muted-foreground animate-pulse">
                                Đang xử lý không gian đa chiều...
                            </p>
                        </div>
                    ) : generatedImg ? (
                        <div className="group relative flex flex-col items-center justify-center w-full max-w-4xl aspect-[16/9] rounded-2xl bg-black/5 overflow-hidden border shadow-sm">
                            <img
                                src={generatedImg}
                                alt="Generated Art"
                                className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                            />
                            {/* Floating Action Menu on image hover */}
                            <div className="absolute top-4 right-4 flex opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 gap-2">
                                <Button size="sm" variant="secondary" className="h-9 px-3 shadow-md backdrop-blur-md bg-background/80 hover:bg-background">
                                    <Share2 className="mr-2 size-4" /> Chia sẻ
                                </Button>
                                <Button size="sm" className="h-9 px-3 shadow-md">
                                    <Download className="mr-2 size-4" /> Tải xuống
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 opacity-60">
                            <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20">
                                <Sparkles className="size-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-medium tracking-tight">Khu vực khởi tạo</h3>
                                <p className="text-muted-foreground">
                                    Mô tả trí tưởng tượng của bạn vào thanh lệnh phía dưới để hệ thống bắt đầu quá trình kiến tạo.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 
                  Floating Prompt Bar
                  Đặt ở viền dưới màn hình
                */}
                <div className="absolute bottom-8 left-1/2 w-full max-w-3xl -translate-x-1/2 px-4 z-50">
                    <div className="flex flex-col rounded-[24px] border border-border/50 bg-background/70 backdrop-blur-2xl p-2 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background">
                        {/* Text input area */}
                        <Textarea
                            placeholder="Mô tả ý tưởng của bạn (vd: 'Một thành phố cyberpunk lúc hoàng hôn...')"
                            className="min-h-[80px] w-full resize-none border-0 bg-transparent px-4 py-3 text-base font-medium shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleGenerate()
                                }
                            }}
                        />

                        {/* Control bar */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 px-2">
                            {/* Left Settings */}
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                                                    <Settings2 className="size-4" />
                                                </Button>
                                            </PopoverTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Cài đặt nâng cao</TooltipContent>
                                    </Tooltip>

                                    <PopoverContent side="top" align="start" className="w-[320px] p-4 rounded-xl shadow-xl">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 font-medium">
                                                <Wand2 className="size-4 text-primary" />
                                                Thông số kiến tạo
                                            </div>
                                            <Separator />
                                            {/* Style Select */}
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phong cách</Label>
                                                <Select value={style} onValueChange={setStyle}>
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="photorealistic">Chân thực</SelectItem>
                                                        <SelectItem value="anime">Anime</SelectItem>
                                                        <SelectItem value="digital-art">Digital Art</SelectItem>
                                                        <SelectItem value="3d-render">3D Render</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {/* Creativity Slider */}
                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Độ sáng tạo</Label>
                                                    <span className="text-xs font-medium">{creativity[0]}%</span>
                                                </div>
                                                <Slider value={creativity} onValueChange={setCreativity} max={100} step={1} />
                                            </div>
                                            {/* High-res Toggle */}
                                            <div className="flex items-center justify-between pt-2">
                                                <Label htmlFor="high-res" className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Chất lượng cao (2x)</Label>
                                                <Switch id="high-res" checked={highRes} onCheckedChange={setHighRes} />
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {/* Quick Model Selector */}
                                <Select value={model} onValueChange={setModel}>
                                    <SelectTrigger className="h-8 border-none bg-muted/50 hover:bg-muted font-medium text-xs rounded-full px-3 w-[140px] shadow-none">
                                        <div className="flex items-center gap-2 truncate">
                                            <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                                        <SelectItem value="dalle3">DALL·E 3</SelectItem>
                                        <SelectItem value="midjourney">Midjourney V6</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Right Action */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="size-10 rounded-full bg-primary hover:scale-105 transition-transform"
                                        disabled={isGenerating || !prompt.trim()}
                                        onClick={handleGenerate}
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="size-5 animate-spin" />
                                        ) : (
                                            <ArrowUp className="size-5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={10}>
                                    <span className="flex items-center gap-1">
                                        Tạo ảnh <span className="text-muted-foreground text-xs ml-1">(Enter)</span>
                                    </span>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
