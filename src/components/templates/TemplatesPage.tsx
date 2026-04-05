import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { SearchIcon, SparklesIcon, ArrowRightIcon, RefreshCw, ChevronRight } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground -mb-2">
                <Link to="/app/tools" className="hover:text-foreground transition-colors">Công cụ AI</Link>
                <ChevronRight className="size-3.5" />
                <span className="text-foreground font-medium">Mẫu thiết kế</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Mẫu thiết kế</h1>
                    <p className="text-sm text-muted-foreground">
                        Chọn mẫu → Tải ảnh lên → Nhận ảnh mới theo phong cách mẫu
                    </p>
                </div>
                <div className="relative w-full sm:w-[280px]">
                    <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm mẫu..."
                        className="pl-9 h-9"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Category Filter */}
            <ToggleGroup
                type="single"
                value={category}
                onValueChange={handleCategoryChange}
                className="flex flex-wrap justify-start gap-1"
            >
                {categories.map((cat) => (
                    <ToggleGroupItem
                        key={cat}
                        value={cat}
                        className="rounded-full px-4 text-xs h-8 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                        {cat}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>

            {/* Results count */}
            <p className="text-xs text-muted-foreground -mt-2">
                {filteredTemplates.length} mẫu
            </p>

            {/* Template Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {paginatedTemplates.map((template) => (
                    <Link
                        key={template.id}
                        to={`/app/templates/${template.slug}`}
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
    )
}
