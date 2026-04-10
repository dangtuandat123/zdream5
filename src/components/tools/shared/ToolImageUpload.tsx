import { useCallback, useRef, useState } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolImageUploadProps {
    onImagesChange: (images: string[]) => void
    images: string[]
    multiple?: boolean
    maxFiles?: number
    label?: string
    className?: string
}

export function ToolImageUpload({
    onImagesChange,
    images,
    multiple = false,
    maxFiles = 1,
    label = "Tải ảnh lên",
    className,
}: ToolImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const processFiles = useCallback((files: FileList | null) => {
        if (!files) return
        const remaining = maxFiles - images.length
        const toProcess = Array.from(files).slice(0, remaining)

        toProcess.forEach((file) => {
            if (!file.type.startsWith("image/")) return
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
            <div className={cn("relative rounded-xl overflow-hidden border bg-muted", className)}>
                <img src={images[0]} alt="Upload" className="w-full max-h-[400px] object-contain" />
                <button
                    onClick={() => onImagesChange([])}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                    <X className="size-4" />
                </button>
            </div>
        )
    }

    if (images.length > 0 && multiple) {
        return (
            <div className={cn("space-y-3", className)}>
                <div className="grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                        <div key={i} className="relative rounded-lg overflow-hidden border bg-muted aspect-square">
                            <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ))}
                    {images.length < maxFiles && (
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="flex items-center justify-center rounded-lg border-2 border-dashed border-border/50 aspect-square hover:border-primary/50 transition-colors"
                        >
                            <Upload className="size-5 text-muted-foreground" />
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

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-colors cursor-pointer",
                isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50",
                className,
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <div className="flex items-center justify-center size-12 rounded-xl bg-muted">
                <ImageIcon className="size-6 text-muted-foreground" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Kéo thả hoặc click để chọn ảnh</p>
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
