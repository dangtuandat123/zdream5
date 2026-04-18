/**
 * ImageViewer — Shared fullscreen image viewer thống nhất.
 * Kết hợp ImageLightbox + info panel + action bar.
 * Dùng chung cho GeneratePage, LibraryPage, và các trang khác.
 */
import { useMemo, useCallback, useState, useEffect } from "react"
import { ImageLightbox } from "@/components/ui/image-lightbox"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    Download, Trash2, RotateCcw, ImageIcon, Wand2, Copy,
    Box, Palette, Ruler, Hash, Clock, Gem, Loader2,
} from "lucide-react"

// ══════════════════════════════════════════════════════════════
// Kiểu dữ liệu chung — tất cả trang đều map data vào interface này
// ══════════════════════════════════════════════════════════════

export interface ImageViewerItem {
    id: string
    url: string
    type: "ai" | "upload"
    prompt?: string
    designedPrompt?: string
    negativePrompt?: string
    referenceImages?: string[]
    model?: string
    style?: string
    /** Label hiển thị tỷ lệ, ví dụ: "1:1", "16:9" */
    aspectRatio?: string
    seed?: number
    gemsCost?: number
    /** Chuỗi ngày đã format sẵn, ví dụ: "18/04/2026 09:30" */
    createdAt?: string
}

export interface ImageViewerProps {
    /** Mở/đóng viewer */
    open: boolean
    onClose: () => void
    /** Danh sách items */
    items: ImageViewerItem[]
    /** Index hiện tại */
    currentIndex: number
    onIndexChange: (index: number) => void
    /** Max zoom (default 3) */
    maxZoom?: number

    // ── Action callbacks — chỉ render nút nếu callback được truyền ──

    /** Tải xuống ảnh */
    onDownload?: (item: ImageViewerItem) => void
    /** Xoá ảnh */
    onDelete?: (item: ImageViewerItem) => void
    /** Tạo lại với cùng prompt (GeneratePage) */
    onRegenerate?: (item: ImageViewerItem) => void
    /** Dùng ảnh làm tham chiếu (GeneratePage) */
    onUseAsReference?: (item: ImageViewerItem) => void
    /** Tạo tương tự — navigate đến trang generate (LibraryPage) */
    onCreateSimilar?: (item: ImageViewerItem) => void
    /** Loading state cho nút "Tạo lại" */
    isRegenerating?: boolean
}

// ══════════════════════════════════════════════════════════════
// Sub-components nội bộ
// ══════════════════════════════════════════════════════════════

/** Highlight @mention và [Ảnh tham chiếu N] trong prompt */
function HighlightedPrompt({ text }: { text: string }) {
    const parts = text.split(/(\[Ảnh tham chiếu \d+\]|@(?:Ảnh|anh|ảnh)\s*\d+)/gi)
    return (
        <p className="text-sm text-white/85 leading-relaxed">
            {parts.map((part, i) =>
                /^(\[Ảnh tham chiếu \d+\]|@(?:Ảnh|anh|ảnh)\s*\d+)$/i.test(part)
                    ? <span key={i} className="text-violet-400 bg-violet-500/15 rounded px-1 py-0.5 text-xs font-semibold">{part}</span>
                    : <span key={i}>{part}</span>
            )}
        </p>
    )
}


/** Một ô metadata nhỏ (Model, Style, Seed, ...) — card style */
function MetaField({ icon: Icon, label, value, title, truncate, capitalize, tabular }: {
    icon: typeof Box
    label: string
    value: string
    title?: string
    truncate?: boolean
    capitalize?: boolean
    tabular?: boolean
}) {
    return (
        <div className="bg-white/[0.04] rounded-lg px-3 py-2.5 space-y-1 border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-white/40">
                <Icon className="size-3" />
                <span className="text-[10px] uppercase tracking-wider">{label}</span>
            </div>
            <p
                className={`text-[13px] text-white/85 font-medium leading-snug ${truncate ? "truncate" : ""} ${capitalize ? "capitalize" : ""} ${tabular ? "tabular-nums" : ""}`}
                title={title}
            >
                {value}
            </p>
        </div>
    )
}

/** Panel thông tin chi tiết ảnh — sidebar phải trên desktop, bottom sheet trên mobile */
function ViewerInfoPanel({ item }: { item: ImageViewerItem }) {
    const [promptExpanded, setPromptExpanded] = useState(false)
    const [designedPromptExpanded, setDesignedPromptExpanded] = useState(false)

    // Reset collapsed state khi chuyển ảnh
    useEffect(() => {
        setPromptExpanded(false)
        setDesignedPromptExpanded(false)
    }, [item.id])

    const handleCopy = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`Đã sao chép ${label}`, { id: `copy-${label}` })
    }, [])

    // Kiểm tra có metadata nào không
    const hasMetadata = item.model || item.style || item.aspectRatio ||
        (item.seed !== undefined && item.seed !== null) ||
        (item.gemsCost !== undefined && item.gemsCost > 0) ||
        item.createdAt

    return (
        <>
            {/* ── Prompt ── */}
            {item.prompt && (
                <div className="px-5 pt-4 pb-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Prompt</p>
                        <button
                            className="flex items-center gap-1 text-[10px] text-white/35 hover:text-white/70 transition-colors"
                            onClick={() => handleCopy(item.prompt!, "prompt")}
                        >
                            <Copy className="size-3" />
                            Sao chép
                        </button>
                    </div>
                    <div className={promptExpanded ? '' : 'max-h-[100px] overflow-hidden relative'}>
                        <HighlightedPrompt text={item.prompt} />
                        {!promptExpanded && item.prompt.length > 200 && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-neutral-900 to-transparent pointer-events-none" />
                        )}
                    </div>
                    {item.prompt.length > 200 && (
                        <button
                            onClick={() => setPromptExpanded(!promptExpanded)}
                            className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
                        >
                            {promptExpanded ? '△ Thu gọn' : '▽ Xem thêm'}
                        </button>
                    )}
                </div>
            )}

            {/* ── AI Designed Prompt ── */}
            {item.designedPrompt && (
                <div className="px-5 py-3 space-y-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                            Prompt nâng cao
                        </p>
                        <button
                            className="flex items-center gap-1 text-[10px] text-white/35 hover:text-white/70 transition-colors"
                            onClick={() => handleCopy(item.designedPrompt!, "AI prompt")}
                        >
                            <Copy className="size-3" />
                            Sao chép
                        </button>
                    </div>
                    <div className={designedPromptExpanded ? '' : 'max-h-[100px] overflow-hidden relative'}>
                        <p className="text-sm text-white/75 leading-relaxed">{item.designedPrompt}</p>
                        {!designedPromptExpanded && item.designedPrompt.length > 200 && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-neutral-900 to-transparent pointer-events-none" />
                        )}
                    </div>
                    {item.designedPrompt.length > 200 && (
                        <button
                            onClick={() => setDesignedPromptExpanded(!designedPromptExpanded)}
                            className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
                        >
                            {designedPromptExpanded ? '△ Thu gọn' : '▽ Xem thêm'}
                        </button>
                    )}
                </div>
            )}

            {/* ── Negative Prompt ── */}
            {item.negativePrompt && (
                <div className="px-5 py-3 space-y-2 border-t border-white/5">
                    <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Từ khoá loại trừ</p>
                    <p className="text-sm text-white/65 leading-relaxed">{item.negativePrompt}</p>
                </div>
            )}

            {/* ── Ảnh tham chiếu ── */}
            {item.referenceImages && item.referenceImages.length > 0 && (
                <div className="px-5 py-3 space-y-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Ảnh tham chiếu</p>
                        <span className="text-[9px] font-bold bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
                            {item.referenceImages.length}
                        </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {item.referenceImages.map((src, i) => (
                            <div key={i} className="aspect-square relative">
                                <a href={src} target="_blank" rel="noreferrer" className="block w-full h-full relative cursor-pointer hover:opacity-80 transition-opacity">
                                    <img src={src} className="absolute inset-0 w-full h-full rounded-lg object-cover border border-white/10" alt="ref" />
                                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-white border border-white/20 text-[9px] font-bold h-4 w-4 rounded-full shadow-sm flex items-center justify-center z-10">
                                        {i + 1}
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Metadata Grid ── */}
            {hasMetadata && (
                <div className="px-5 py-3 border-t border-white/[0.06]">
                    <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-3">Thông số</p>
                    <div className="grid grid-cols-2 gap-2">
                        {item.model && (
                            <MetaField icon={Box} label="Model" value={item.model.split("/").pop() || item.model} title={item.model} truncate />
                        )}
                        {item.style && (
                            <MetaField icon={Palette} label="Style" value={item.style} capitalize />
                        )}
                        {item.aspectRatio && (
                            <MetaField icon={Ruler} label="Tỷ lệ" value={item.aspectRatio} />
                        )}
                        {item.seed !== undefined && item.seed !== null && (
                            <MetaField icon={Hash} label="Seed" value={String(item.seed)} tabular />
                        )}
                        {item.gemsCost !== undefined && item.gemsCost > 0 && (
                            <MetaField icon={Gem} label="Chi phí" value={`${item.gemsCost} 💎`} />
                        )}
                        {item.createdAt && (
                            <MetaField icon={Clock} label="Ngày tạo" value={item.createdAt} />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

// ══════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════

export function ImageViewer({
    open,
    onClose,
    items,
    currentIndex,
    onIndexChange,
    maxZoom = 3,
    onDownload,
    onDelete,
    onRegenerate,
    onUseAsReference,
    onCreateSimilar,
    isRegenerating,
}: ImageViewerProps) {
    const safeIndex = Math.min(Math.max(currentIndex, 0), items.length - 1)
    const currentItem = items[safeIndex]

    // Chỉ tính URL list khi items thay đổi
    const imageUrls = useMemo(() => items.map(item => item.url), [items])

    if (!currentItem) return null

    return (
        <ImageLightbox
            open={open}
            onClose={onClose}
            images={imageUrls}
            currentIndex={safeIndex}
            onIndexChange={onIndexChange}
            maxZoom={maxZoom}
            actions={
                <>
                    {/* Tải xuống */}
                    {onDownload && (
                        <Button variant="ghost" size="icon" title="Tải xuống"
                            className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 py-0 rounded-xl"
                            onClick={() => onDownload(currentItem)}>
                            <Download className="size-4" />
                        </Button>
                    )}

                    {/* Dùng làm ảnh tham chiếu (GeneratePage) */}
                    {onUseAsReference && (
                        <Button variant="ghost" title="Ảnh tham chiếu"
                            className="text-white hover:bg-white/20 gap-1.5 h-8 sm:h-9 rounded-xl px-2 sm:px-3"
                            onClick={() => onUseAsReference(currentItem)}>
                            <ImageIcon className="size-4" />
                            <span className="hidden sm:inline text-xs font-medium">Tham chiếu</span>
                        </Button>
                    )}

                    {/* Tạo tương tự (LibraryPage) */}
                    {onCreateSimilar && currentItem.type === "ai" && currentItem.prompt && (
                        <Button variant="ghost" title="Tạo tương tự"
                            className="text-white hover:bg-white/20 gap-1.5 h-8 sm:h-9 rounded-xl px-2 sm:px-3"
                            onClick={() => onCreateSimilar(currentItem)}>
                            <Wand2 className="size-4" />
                            <span className="hidden sm:inline text-xs font-medium">Tạo tương tự</span>
                        </Button>
                    )}

                    {/* Tạo lại (GeneratePage) */}
                    {onRegenerate && (
                        <Button variant="ghost" title="Tạo lại"
                            className="text-white hover:bg-white/20 gap-1.5 h-8 sm:h-9 rounded-xl px-2 sm:px-3"
                            disabled={isRegenerating}
                            onClick={() => onRegenerate(currentItem)}>
                            {isRegenerating ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                            <span className="hidden sm:inline text-xs font-medium">{isRegenerating ? "Đang tạo..." : "Tạo lại"}</span>
                        </Button>
                    )}

                    {/* Xoá — luôn ở cuối, tách biệt tránh bấm nhầm */}
                    {onDelete && (
                        <>
                            <div className="w-px h-5 bg-white/10 mx-0.5" />
                            <Button variant="ghost" size="icon" title="Xoá ảnh"
                                className="text-red-400 hover:bg-red-500/20 hover:text-red-400 h-8 w-8 sm:h-9 sm:w-9 py-0 rounded-xl mr-0.5"
                                onClick={() => onDelete(currentItem)}>
                                <Trash2 className="size-4" />
                            </Button>
                        </>
                    )}
                </>
            }
            infoPanel={<ViewerInfoPanel item={currentItem} />}
        />
    )
}
