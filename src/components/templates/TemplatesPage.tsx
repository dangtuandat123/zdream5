import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { SearchIcon, SparklesIcon, RefreshCw, LayoutTemplate, Images } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { templateApi, type TemplateData } from "@/lib/api"
import { useToolPanel } from "@/components/tools/ToolPanelContext"

const PER_PAGE = 12

// Options size mẫu cho Empty State
const SIZE_OPTIONS = [
    { label: "1:1", ratio: "1:1" },
    { label: "2:3", ratio: "2:3" },
    { label: "3:2", ratio: "3:2" },
    { label: "3:4", ratio: "3:4" },
    { label: "4:3", ratio: "4:3" },
    { label: "4:5", ratio: "4:5" },
    { label: "5:4", ratio: "5:4" },
    { label: "9:16", ratio: "9:16" },
    { label: "16:9", ratio: "16:9" },
    { label: "21:9", ratio: "21:9" },
]

export function TemplatesPage() {
    const [templates, setTemplates] = useState<TemplateData[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("Tất cả")
    const [page, setPage] = useState(1)

    useEffect(() => {
        templateApi.list()
            .then((res) => setTemplates(res.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    // Lấy danh sách category động từ data
    const categories = useMemo(() => {
        const cats = new Set(templates.map((t) => t.category).filter(Boolean))
        return ["Tất cả", ...Array.from(cats)]
    }, [templates])

    // Lọc theo search + category
    const filteredTemplates = useMemo(() => {
        return templates.filter((t) => {
            const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                (t.description ?? "").toLowerCase().includes(search.toLowerCase())
            const matchesCategory = category === "Tất cả" || t.category === category
            return matchesSearch && matchesCategory
        })
    }, [templates, search, category])

    // Phân trang client-side
    const totalPages = Math.ceil(filteredTemplates.length / PER_PAGE)
    const paginatedTemplates = useMemo(() => {
        const start = (page - 1) * PER_PAGE
        return filteredTemplates.slice(start, start + PER_PAGE)
    }, [filteredTemplates, page])

    const handleSearchChange = (value: string) => {
        setSearch(value)
        setPage(1)
    }
    const handleCategoryChange = (value: string) => {
        if (value) {
            setCategory(value)
            setPage(1)
        }
    }

    const goToPage = (p: number) => {
        if (p < 1 || p > totalPages || p === page) return
        setPage(p)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // ===== Đẩy Empty State Configuration lên Sidebar =====
    useToolPanel({
        title: "Ảnh kiểu mẫu",
        icon: LayoutTemplate,
        controls: (
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* 1. Mảnh ghép "Chưa chọn mẫu" nổi bật */}
                <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-5 flex flex-col items-center justify-center text-center gap-3">
                    <div className="size-12 rounded-full bg-background shadow-sm flex items-center justify-center mb-1">
                        <Images className="size-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">Bạn chưa chọn mẫu thiết kế</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                            Vui lòng chọn 1 mẫu ở không gian thư viện bên phải để kích hoạt bảng điều khiển này nhé.
                        </p>
                    </div>
                </div>

                {/* 2. Dummy Controls (làm mờ / Disable) để cho thấy giao diện sau khi chọn */}
                <div className="space-y-6 opacity-30 pointer-events-none select-none grayscale-[0.5]">
                    {/* Dummy Tỷ lệ */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">TỶ LỆ KHUNG HÌNH (Ví dụ: Chờ Tùy Chỉnh)</Label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {SIZE_OPTIONS.map(opt => (
                                <div key={opt.ratio} className="flex h-10 cursor-pointer flex-col items-center justify-center rounded-md border bg-transparent text-[11px] transition-colors">
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dummy SL Ảnh */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">SỐ LƯỢNG ẢNH ĐẦU RA</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="flex-1 flex h-8 cursor-pointer items-center justify-center rounded-md border text-xs">
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dummy Quality */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">CHẤT LƯỢNG KẾT QUẢ</Label>
                        <div className="flex gap-2">
                            {["1K", "2K", "4K"].map(q => (
                                <div key={q} className="flex-1 flex h-8 items-center justify-center rounded-md border text-xs">
                                    {q}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ),
        // Không tạo nút submit ở trạng thái này
        submitButton: null,
    }, []) // Dependencies tĩnh vì panel empty

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden relative">
            <ScrollArea className="flex-1">
                <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
                    
                    {/* Thư viện Header (Đặt tại Canvas) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold tracking-tight">Thư Viện Mẫu Thiết Kế</h1>
                                <p className="text-sm text-muted-foreground">
                                    Khám phá và chọn ngay {templates.length} mẫu có sẵn để bắt đầu sáng tạo.
                                </p>
                            </div>
                        </div>

                        {/* Thanh Search và Lọc Category đặt ngang */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3 bg-muted/30 p-2 border rounded-xl">
                            <div className="relative flex-1 max-w-sm">
                                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                                <Input
                                    placeholder="Tìm mẫu (anime, 3d, concept...)"
                                    className="pl-9 h-10 bg-background border-transparent shadow-sm focus-visible:border-primary/50 focus-visible:ring-1"
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </div>
                            
                            <div className="h-4 w-px bg-border hidden md:block mx-1"></div>

                            <ScrollArea className="flex-1 whitespace-nowrap">
                                <div className="flex w-max space-x-2 py-0.5 px-1">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => handleCategoryChange(cat)}
                                            className={`rounded-full px-4 text-xs font-medium transition-all shadow-sm h-9 ${
                                                category === cat
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    {/* Vùng Lưới Mẫu */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <h2 className="font-semibold text-foreground flex items-center gap-2">
                                <LayoutTemplate className="size-4 text-primary" />
                                Theo chủ đề: "{category}"
                            </h2>
                            <span className="text-muted-foreground">
                                Tìm thấy <b className="text-foreground">{filteredTemplates.length}</b> mẫu
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {paginatedTemplates.map((template) => (
                                <Link
                                    key={template.id}
                                    to={`/app/tools/templates/${template.slug}`}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30"
                                >
                                    <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                                        {template.thumbnail ? (
                                            <img
                                                src={template.thumbnail}
                                                alt={template.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Images className="size-8 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        
                                        {/* Overlay action */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 text-black text-xs font-bold shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
                                                <SparklesIcon className="size-4" />
                                                Chọn Mẫu Này
                                            </span>
                                        </div>

                                        <Badge variant="secondary" className="absolute top-3 left-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border-none shadow-sm font-medium z-10 text-[10px]">
                                            {template.category}
                                        </Badge>
                                    </div>

                                    <div className="p-4 space-y-1.5 flex flex-col justify-end bg-card z-10 border-t items-start">
                                        <h3 className="text-sm text-foreground font-bold line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                                            {template.name}
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                            {template.description || "Không có mô tả"}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="flex justify-center pt-6 pb-2">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => goToPage(page - 1)}
                                            className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {page > 2 && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(1)} className="cursor-pointer">1</PaginationLink>
                                        </PaginationItem>
                                    )}
                                    {page > 3 && (
                                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                                    )}

                                    {page > 1 && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(page - 1)} className="cursor-pointer">{page - 1}</PaginationLink>
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationLink isActive>{page}</PaginationLink>
                                    </PaginationItem>

                                    {page < totalPages && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(page + 1)} className="cursor-pointer">{page + 1}</PaginationLink>
                                        </PaginationItem>
                                    )}

                                    {page < totalPages - 2 && (
                                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                                    )}
                                    {page < totalPages - 1 && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(totalPages)} className="cursor-pointer">{totalPages}</PaginationLink>
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => goToPage(page + 1)}
                                            className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}

                    {filteredTemplates.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center border rounded-2xl bg-muted/20 border-dashed">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted border">
                                <SearchIcon className="size-6 text-muted-foreground/60" />
                            </div>
                            <h3 className="text-base font-semibold">Không tìm thấy mẫu thiết kế</h3>
                            <p className="text-sm text-muted-foreground/80 max-w-[250px]">
                                Rất tiếc, chúng tôi không tìm thấy mẫu nào phù hợp với từ khóa này.
                            </p>
                            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCategory("Tất cả"); setPage(1) }} className="mt-2 text-xs">
                                Xoá bộ lọc
                            </Button>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
