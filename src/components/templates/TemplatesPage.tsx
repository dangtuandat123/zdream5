import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { SearchIcon, SparklesIcon, ArrowRightIcon } from "lucide-react"

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

const CATEGORIES = ["Tất cả", "Chân dung", "Phong cảnh", "Anime", "3D", "Logo", "Sản phẩm"]

const TEMPLATES = [
    { id: "1", name: "Chân dung Cyberpunk", category: "Chân dung", description: "Phong cách neon cyberpunk", thumbnail: "https://images.unsplash.com/photo-1542442828-287217bfb21f?q=80&w=400&auto=format&fit=crop" },
    { id: "2", name: "Phong cảnh Ghibli", category: "Anime", description: "Anime phong cách Studio Ghibli", thumbnail: "https://images.unsplash.com/photo-1498453488252-0974dcabe0cb?q=80&w=400&auto=format&fit=crop" },
    { id: "3", name: "Render sản phẩm 3D", category: "3D", description: "Render sản phẩm siêu thực", thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop" },
    { id: "4", name: "Logo Minimalist", category: "Logo", description: "Logo tối giản hiện đại", thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400&auto=format&fit=crop" },
    { id: "5", name: "Sơn dầu cổ điển", category: "Phong cảnh", description: "Phong cách sơn dầu Baroque", thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop" },
    { id: "6", name: "Anime Waifu", category: "Anime", description: "Nhân vật anime phong cách Nhật Bản", thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop" },
    { id: "7", name: "Ảnh thời trang", category: "Chân dung", description: "Ảnh chân dung thời trang cao cấp", thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop" },
    { id: "8", name: "Concept Art", category: "Phong cảnh", description: "Concept art game/phim", thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop" },
    { id: "9", name: "Mockup sản phẩm", category: "Sản phẩm", description: "Ảnh mockup sản phẩm chuyên nghiệp", thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop" },
    { id: "10", name: "Chibi Avatar", category: "Anime", description: "Avatar chibi dễ thương", thumbnail: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?q=80&w=400&auto=format&fit=crop" },
    { id: "11", name: "Pixel Art", category: "3D", description: "Pixel art retro game", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop" },
    { id: "12", name: "Watercolor Portrait", category: "Chân dung", description: "Chân dung phong cách màu nước", thumbnail: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=400&auto=format&fit=crop" },
]

const PER_PAGE = 12

export function TemplatesPage() {
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("Tất cả")
    const [page, setPage] = useState(1)

    // Lọc theo search + category
    const filteredTemplates = useMemo(() => {
        return TEMPLATES.filter((t) => {
            const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                t.description.toLowerCase().includes(search.toLowerCase())
            const matchesCategory = category === "Tất cả" || t.category === category
            return matchesSearch && matchesCategory
        })
    }, [search, category])

    // Phân trang client-side
    const totalPages = Math.ceil(filteredTemplates.length / PER_PAGE)
    const paginatedTemplates = useMemo(() => {
        const start = (page - 1) * PER_PAGE
        return filteredTemplates.slice(start, start + PER_PAGE)
    }, [filteredTemplates, page])

    // Reset về trang 1 khi thay đổi bộ lọc
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

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
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
                {CATEGORIES.map((cat) => (
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

            {/* Template Grid — card nghệ thuật, overlay text trên ảnh */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {paginatedTemplates.map((template) => (
                    <Link
                        key={template.id}
                        to={`/app/templates/${template.id}`}
                        className="group relative block overflow-hidden rounded-2xl bg-muted aspect-[3/4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        {/* Ảnh nền */}
                        <img
                            src={template.thumbnail}
                            alt={template.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            loading="lazy"
                        />

                        {/* Category badge — góc trên trái, backdrop-blur */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/40 text-white backdrop-blur-md">
                                {template.category}
                            </span>
                        </div>

                        {/* Gradient overlay dưới — luôn hiển thị để text đọc được */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Hover overlay — hiệu ứng khi rê chuột/chạm */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* CTA button — hiện khi hover (desktop), luôn hiện nhẹ trên mobile */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-black text-xs font-semibold shadow-lg backdrop-blur-sm">
                                <SparklesIcon className="size-3.5" />
                                Sử dụng mẫu
                            </span>
                        </div>

                        {/* Text info — góc dưới trái, trên gradient */}
                        <div className="absolute bottom-0 left-0 right-0 z-10 p-3 space-y-0.5">
                            <h3 className="text-sm font-semibold text-white truncate drop-shadow-md">
                                {template.name}
                            </h3>
                            <p className="text-[11px] text-white/70 truncate drop-shadow-sm">
                                {template.description}
                            </p>
                            {/* Arrow hint — subtle trên mobile */}
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
