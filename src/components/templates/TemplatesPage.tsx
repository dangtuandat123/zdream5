import { useState } from "react"
import { Link } from "react-router-dom"
import { SearchIcon, ImageIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mẫu thiết kế</h1>
                <p className="text-muted-foreground">
                    Chọn một mẫu, tải ảnh gốc lên và AI sẽ tạo ảnh theo phong cách mẫu cho bạn.
                </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm mẫu..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
                {filteredTemplates.length} mẫu được tìm thấy
            </p>

            {/* Template Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredTemplates.map((template) => (
                    <Card
                        key={template.id}
                        className="group overflow-hidden transition-colors hover:border-primary/50"
                    >
                        <CardContent className="p-0">
                            <div className="flex aspect-square items-center justify-center bg-muted transition-colors group-hover:bg-muted/80">
                                <ImageIcon className="size-10 text-muted-foreground" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 p-3">
                            <div className="w-full">
                                <p className="text-sm font-medium truncate">{template.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                            </div>
                            <div className="flex w-full items-center justify-between">
                                <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                                    <Link to={`/app/templates/${template.id}`}>Chọn</Link>
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                        <SearchIcon className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-base font-medium">Không tìm thấy mẫu nào</p>
                    <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc danh mục.</p>
                    <Button variant="outline" onClick={() => { setSearch(""); setCategory("Tất cả") }}>
                        Xoá bộ lọc
                    </Button>
                </div>
            )}
        </div>
    )
}
