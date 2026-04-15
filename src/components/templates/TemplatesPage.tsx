import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { SearchIcon, SparklesIcon, ArrowRightIcon, RefreshCw, LayoutTemplate } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
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

    // ===== Đẩy controls lên sidebar — đồng bộ với các tool khác =====
    useToolPanel({
        title: "Mẫu thiết kế",
        icon: LayoutTemplate,
        controls: (
            <div className="space-y-4">
                {/* Tìm kiếm */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">TÌM KIẾM</Label>
                    <div className="relative w-full">
                        <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm mẫu (anime, 3d, concept...)"
                            className="pl-8 h-8 text-xs bg-muted/40 border-transparent focus-visible:border-primary focus-visible:ring-1"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                {/* Danh mục */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">DANH MỤC</Label>
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                                    category === cat
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Thống kê */}
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-xs text-muted-foreground space-y-1">
                    <p>Tìm thấy <span className="font-semibold text-foreground">{filteredTemplates.length}</span> mẫu</p>
                    <p className="text-[10px]">Chọn mẫu → Tải ảnh lên → Nhận ảnh mới siêu đẹp</p>
                </div>
            </div>
        ),
    }, [search, category, categories, filteredTemplates.length])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden relative">
            {/* Template Grid — full canvas width */}
            <ScrollArea className="flex-1">
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {paginatedTemplates.map((template) => (
                            <Link
                                key={template.id}
                                to={`/app/tools/templates/${template.slug}`}
                                className="group relative block overflow-hidden rounded-2xl bg-muted aspect-[3/4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                {template.thumbnail && (
                                    <img
                                        src={template.thumbnail}
                                        alt={template.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                                        loading="lazy"
                                    />
                                )}

                                <div className="absolute top-2.5 left-2.5 z-10">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/40 text-white backdrop-blur-md">
                                        {template.category}
                                    </span>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-black text-xs font-semibold shadow-lg backdrop-blur-sm">
                                        <SparklesIcon className="size-3.5" />
                                        Sử dụng mẫu
                                    </span>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 z-10 p-3 space-y-0.5">
                                    <h3 className="text-sm font-semibold text-white truncate drop-shadow-md">
                                        {template.name}
                                    </h3>
                                    <p className="text-[11px] text-white/70 truncate drop-shadow-sm">
                                        {template.description}
                                    </p>
                                    <div className="flex items-center gap-1 pt-1 text-white/50 group-hover:text-white/80 transition-colors">
                                        <span className="text-[10px] font-medium">Xem chi tiết</span>
                                        <ArrowRightIcon className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="flex justify-center pt-2 pb-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => goToPage(page - 1)}
                                            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>

                                    {page > 2 && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(1)}>1</PaginationLink>
                                        </PaginationItem>
                                    )}
                                    {page > 3 && (
                                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                                    )}

                                    {page > 1 && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(page - 1)}>{page - 1}</PaginationLink>
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationLink isActive>{page}</PaginationLink>
                                    </PaginationItem>

                                    {page < totalPages && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(page + 1)}>{page + 1}</PaginationLink>
                                        </PaginationItem>
                                    )}

                                    {page < totalPages - 2 && (
                                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                                    )}
                                    {page < totalPages - 1 && (
                                        <PaginationItem>
                                            <PaginationLink onClick={() => goToPage(totalPages)}>{totalPages}</PaginationLink>
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => goToPage(page + 1)}
                                            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}

                    {filteredTemplates.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                                <SearchIcon className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-base font-medium">Không tìm thấy mẫu nào</p>
                            <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc danh mục.</p>
                            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCategory("Tất cả"); setPage(1) }}>
                                Xoá bộ lọc
                            </Button>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
