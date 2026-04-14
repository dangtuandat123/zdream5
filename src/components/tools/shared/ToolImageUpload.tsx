import { useCallback, useRef, useState, useEffect } from "react"
import { Upload, X, ImageIcon, ImagePlus, Link as LinkIcon, Library, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { imageApi, type GeneratedImageData } from "@/lib/api"

const MAX_FILE_SIZE_MB = 10

interface ToolImageUploadProps {
    onImagesChange: (images: string[]) => void
    images: string[]
    multiple?: boolean
    maxFiles?: number
    label?: string
    className?: string
    variant?: "default" | "huge"
}

function UrlImportDialog({ onSelect }: { onSelect: (url: string) => void }) {
    const [url, setUrl] = useState("")
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 rounded-xl h-11 hover:bg-muted/50 transition-all font-medium text-muted-foreground hover:text-foreground border-dashed border-2 hover:border-primary/40"><LinkIcon className="size-4" /> Dán Link URL</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Tải ảnh từ Web URL</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Nhập đường dẫn trực tiếp tới ảnh (JPG, PNG, WebP...)</p>
                        <Input placeholder="https://example.com/image.jpg" value={url} onChange={(e) => setUrl(e.target.value)} className="rounded-xl h-11 bg-muted/30" />
                    </div>
                    <Button onClick={() => {
                        if (!url) return;
                        if (!url.startsWith('http')) return toast.error("URL không hợp lệ, phải bắt đầu bằng http:// hoặc https://")
                        onSelect(url)
                        setOpen(false)
                        setUrl("")
                    }} className="w-full h-11 rounded-xl">Xác nhận</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function LibraryImportDialog({ onSelect }: { onSelect: (url: string) => void }) {
    const [open, setOpen] = useState(false)
    const [images, setImages] = useState<GeneratedImageData[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setLoading(true)
            imageApi.list(1, 40).then(res => setImages(res.data)).catch(() => toast.error("Lỗi khi tải thư viện")).finally(() => setLoading(false))
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 rounded-xl h-11 hover:bg-muted/50 transition-all font-medium text-muted-foreground hover:text-foreground border-dashed border-2 hover:border-primary/40"><Library className="size-4" /> Thư viện của bạn</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col p-6 rounded-2xl">
                <DialogHeader className="mb-2">
                    <DialogTitle>Chọn từ Lịch sử Thiết kế</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 min-h-[400px]">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-4 pr-2">
                        {loading ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-50 space-y-4">
                                <Loader2 className="size-8 animate-spin" />
                                <p className="text-sm font-medium">Đang tải thư viện...</p>
                            </div>
                        ) : images.length === 0 ? (
                            <div className="col-span-full py-20 text-center opacity-50 flex flex-col items-center gap-2">
                                <ImageIcon className="size-10 mb-2 opacity-30" />
                                <p className="text-sm font-medium">Chưa có hình ảnh nào được tạo.</p>
                                <p className="text-xs">Hãy sử dụng các chức năng AI để tự động lưu ảnh tại đây.</p>
                            </div>
                        ) : (
                            images.map(img => (
                                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border bg-muted/30 group cursor-pointer hover:ring-4 hover:ring-primary/20 transition-all" onClick={() => { onSelect(img.file_url); setOpen(false) }}>
                                    <img src={img.file_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded-full flex items-center gap-1.5"><ImagePlus className="size-3" /> Chọn ảnh này</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function ToolImageUpload({
    onImagesChange,
    images,
    multiple = false,
    maxFiles = 1,
    label = "Tải ảnh lên",
    className,
    variant = "default",
}: ToolImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [imageInfo, setImageInfo] = useState<{ w: number; h: number; size: string } | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Detect image dimensions when single image loaded
    useEffect(() => {
        if (!images[0] || multiple) { setImageInfo(null); return }
        const img = new Image()
        img.onload = () => {
            const bytes = Math.round((images[0].length * 3) / 4) // approximate base64 → bytes
            const sizeStr = bytes > 1024 * 1024
                ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
                : `${Math.round(bytes / 1024)} KB`
            setImageInfo({ w: img.naturalWidth, h: img.naturalHeight, size: sizeStr })
        }
        img.src = images[0]
    }, [images, multiple])

    const processFiles = useCallback((files: FileList | null) => {
        if (!files) return
        const remaining = maxFiles - images.length
        const toProcess = Array.from(files).slice(0, remaining)

        toProcess.forEach((file) => {
            if (!file.type.startsWith("image/")) return
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                toast.error(`Ảnh quá lớn (${(file.size / (1024 * 1024)).toFixed(1)} MB). Tối đa ${MAX_FILE_SIZE_MB} MB.`)
                return
            }
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                if (result) {
                    onImagesChange(multiple ? [...images, result] : [result])
                }
            }
            reader.readAsDataURL(file)
        })
    }, [images, maxFiles, multiple, onImagesChange])

    const handleSelectFromUrlOrLibrary = (url: string) => {
        onImagesChange(multiple ? [...images, url] : [url])
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        processFiles(e.dataTransfer.files)
    }, [processFiles])

    const removeImage = (index: number) => {
        onImagesChange(images.filter((_, i) => i !== index))
    }

    if (images.length > 0 && !multiple) {
        return (
            <div className={cn("space-y-1", className)}>
                <div className="relative rounded-xl overflow-hidden border bg-muted group">
                    <img src={images[0]} alt="Upload" className="w-full max-h-[400px] object-contain" />
                    <button
                        onClick={() => { onImagesChange([]); setImageInfo(null) }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-sm"
                    >
                        <X className="size-4" />
                    </button>
                </div>
                {imageInfo && (
                    <p className="text-[10px] text-muted-foreground text-right px-1">
                        {imageInfo.w} × {imageInfo.h} px · {imageInfo.size}
                    </p>
                )}
            </div>
        )
    }

    if (images.length > 0 && multiple) {
        return (
            <div className={cn("space-y-3", className)}>
                <div className="grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                        <div key={i} className="relative rounded-lg overflow-hidden border bg-muted aspect-square group">
                            <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-destructive opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ))}
                    {images.length < maxFiles && (
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 aspect-square hover:border-primary/50 transition-colors bg-muted/10 hover:bg-muted/30"
                        >
                            <Upload className="size-5 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground font-medium">Thêm ảnh</span>
                        </button>
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    className="hidden"
                    onChange={(e) => processFiles(e.target.files)}
                />
            </div>
        )
    }

    if (variant === "huge") {
        return (
            <div className={cn("space-y-3 w-full max-w-2xl mx-auto", className)}>
                <Card
                    className={cn(
                        "relative flex flex-col items-center justify-center overflow-hidden transition-all duration-300 border-2 border-dashed shadow-none cursor-pointer w-full bg-muted/10 group rounded-2xl",
                        isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "hover:border-primary/50 hover:bg-muted/30 hover:shadow-md"
                    )}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <CardContent className="flex flex-col items-center justify-center p-10 py-16 text-center gap-5 w-full">
                        <div className="flex items-center justify-center size-20 rounded-full bg-background shadow-sm border transition-transform group-hover:scale-105 group-hover:shadow-md text-foreground group-hover:text-primary">
                            <Upload className="size-8 opacity-80" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold tracking-tight">{label}</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                Kéo thả ảnh hoặc click để chọn file từ thiết bị của bạn.
                            </p>
                        </div>
                    </CardContent>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple={multiple}
                        className="hidden"
                        onChange={(e) => processFiles(e.target.files)}
                    />
                </Card>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <UrlImportDialog onSelect={handleSelectFromUrlOrLibrary} />
                    <LibraryImportDialog onSelect={handleSelectFromUrlOrLibrary} />
                </div>
            </div>
        )
    }

    return (
        <Card
            className={cn(
                "relative flex flex-col items-center justify-center gap-2.5 p-5 sm:p-8 rounded-xl border-2 border-dashed shadow-none transition-colors cursor-pointer bg-muted/20 group",
                isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/40",
                className,
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <div className="flex items-center justify-center size-12 rounded-xl bg-background shadow-sm border group-hover:scale-105 transition-transform group-hover:border-primary/30 group-hover:text-primary">
                <ImageIcon className="size-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Kéo thả hoặc nhấn để chọn</p>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                className="hidden"
                onChange={(e) => processFiles(e.target.files)}
            />
        </Card>
    )
}

