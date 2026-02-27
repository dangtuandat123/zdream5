import { useState } from "react"
import { Link } from "react-router-dom"
import { SearchIcon, ImageIcon, SparklesIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const CATEGORIES = ["Tất cả", "Chân dung", "Phong cảnh", "Anime", "3D", "Logo", "Sản phẩm"]

const TEMPLATES = [
    { id: "1", name: "Chân dung Cyberpunk", category: "Chân dung", description: "Phong cách neon cyberpunk" },
    { id: "2", name: "Phong cảnh Ghibli", category: "Anime", description: "Anime phong cách Studio Ghibli" },
    { id: "3", name: "Render sản phẩm 3D", category: "3D", description: "Render sản phẩm siêu thực" },
    { id: "4", name: "Logo Minimalist", category: "Logo", description: "Logo tối giản hiện đại" },
    { id: "5", name: "Sơn dầu cổ điển", category: "Phong cảnh", description: "Phong cách sơn dầu Baroque" },
    { id: "6", name: "Anime Waifu", category: "Anime", description: "Nhân vật anime phong cách Nhật Bản" },
    { id: "7", name: "Ảnh thời trang", category: "Chân dung", description: "Ảnh chân dung thời trang cao cấp" },
    { id: "8", name: "Concept Art", category: "Phong cảnh", description: "Concept art game/phim" },
    { id: "9", name: "Mockup sản phẩm", category: "Sản phẩm", description: "Ảnh mockup sản phẩm chuyên nghiệp" },
    { id: "10", name: "Chibi Avatar", category: "Anime", description: "Avatar chibi dễ thương" },
    { id: "11", name: "Pixel Art", category: "3D", description: "Pixel art retro game" },
    { id: "12", name: "Watercolor Portrait", category: "Chân dung", description: "Chân dung phong cách màu nước" },
]

export function TemplatesPage() {
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("Tất cả")

    const filteredTemplates = TEMPLATES.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = category === "Tất cả" || t.category === category
        return matchesSearch && matchesCategory
    })

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
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Category Filter — nằm ngang, chọn nhanh bằng ToggleGroup */}
            <ToggleGroup
                type="single"
                value={category}
                onValueChange={(v) => v && setCategory(v)}
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

            {/* Template Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredTemplates.map((template) => (
                    <Link
                        key={template.id}
                        to={`/app/templates/${template.id}`}
                        className="group"
                    >
                        <Card className="overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
                            <CardContent className="p-0">
                                <div className="relative flex aspect-[4/3] items-center justify-center bg-muted transition-colors group-hover:bg-muted/70">
                                    <ImageIcon className="size-10 text-muted-foreground/30" />
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                        <div className="flex items-center gap-2 text-white text-sm font-medium">
                                            <SparklesIcon className="size-4" />
                                            Sử dụng mẫu
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 space-y-1">
                                    <p className="text-sm font-medium truncate">{template.name}</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                                        <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">
                                            {template.category}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                        <SearchIcon className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-base font-medium">Không tìm thấy mẫu nào</p>
                    <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc danh mục.</p>
                    <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCategory("Tất cả") }}>
                        Xoá bộ lọc
                    </Button>
                </div>
            )}
        </div>
    )
}
