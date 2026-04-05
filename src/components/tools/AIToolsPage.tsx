import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  SearchIcon,
  SparklesIcon,
  ArrowRightIcon,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface AITool {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  path?: string
  available: boolean
}

const tools: AITool[] = [
  {
    id: "templates",
    name: "Tạo ảnh theo kiểu mẫu",
    description: "Sử dụng mẫu thiết kế có sẵn để tạo ảnh nhanh và đẹp",
    category: "Tạo ảnh",
    thumbnail: "/images/tools/templates.jpg",
    path: "/app/templates",
    available: true,
  },
  {
    id: "upscale",
    name: "Upscale ảnh",
    description: "Phóng to và nâng cao chất lượng ảnh lên 2x, 4x với AI",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/upscale.jpg",
    available: false,
  },
  {
    id: "ad-image",
    name: "Ảnh quảng cáo",
    description: "Tạo ảnh quảng cáo sản phẩm chuyên nghiệp cho mạng xã hội",
    category: "Tạo ảnh",
    thumbnail: "/images/tools/ad-image.jpg",
    available: false,
  },
  {
    id: "remove-bg",
    name: "Xóa nền ảnh",
    description: "Tự động xóa phông nền, tách chủ thể chính xác bằng AI",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/remove-bg.jpg",
    available: false,
  },
  {
    id: "colorize",
    name: "Tô màu ảnh",
    description: "Thêm màu sắc tự nhiên cho ảnh đen trắng bằng AI",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/colorize.jpg",
    available: false,
  },
  {
    id: "style-transfer",
    name: "Chuyển phong cách",
    description: "Biến ảnh thành phong cách anime, tranh sơn dầu, hoạt hình,...",
    category: "Sáng tạo",
    thumbnail: "/images/tools/style-transfer.jpg",
    available: false,
  },
  {
    id: "face-swap",
    name: "Hoán đổi khuôn mặt",
    description: "Thay thế khuôn mặt trong ảnh một cách tự nhiên",
    category: "Sáng tạo",
    thumbnail: "/images/tools/face-swap.jpg",
    available: false,
  },
  {
    id: "extend",
    name: "Mở rộng ảnh",
    description: "Mở rộng viền ảnh ra ngoài khung hình gốc bằng AI",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/extend.jpg",
    available: false,
  },
  {
    id: "text-to-logo",
    name: "Tạo logo",
    description: "Thiết kế logo chuyên nghiệp từ tên thương hiệu",
    category: "Sáng tạo",
    thumbnail: "/images/tools/text-to-logo.jpg",
    available: false,
  },
  {
    id: "batch-generate",
    name: "Tạo ảnh hàng loạt",
    description: "Tạo nhiều biến thể ảnh cùng lúc từ một prompt",
    category: "Tạo ảnh",
    thumbnail: "/images/tools/batch-generate.jpg",
    available: false,
  },
  {
    id: "image-variation",
    name: "Biến thể ảnh",
    description: "Tạo các phiên bản tương tự từ ảnh gốc có sẵn",
    category: "Sáng tạo",
    thumbnail: "/images/tools/image-variation.jpg",
    available: false,
  },
]

const categories = ["Tất cả", ...Array.from(new Set(tools.map((t) => t.category)))]

// Gradient fallbacks khi chưa có thumbnail
const gradientMap: Record<string, string> = {
  templates: "from-pink-600 via-rose-500 to-orange-400",
  upscale: "from-blue-600 via-cyan-500 to-teal-400",
  "ad-image": "from-orange-600 via-amber-500 to-yellow-400",
  "remove-bg": "from-emerald-600 via-green-500 to-lime-400",
  colorize: "from-fuchsia-600 via-pink-500 to-rose-400",
  "style-transfer": "from-indigo-600 via-violet-500 to-purple-400",
  "face-swap": "from-teal-600 via-emerald-500 to-green-400",
  extend: "from-sky-600 via-blue-500 to-indigo-400",
  "text-to-logo": "from-amber-600 via-yellow-500 to-orange-400",
  "batch-generate": "from-rose-600 via-red-500 to-pink-400",
  "image-variation": "from-lime-600 via-green-500 to-emerald-400",
}

export function AIToolsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Tất cả")

  const filteredTools = useMemo(() => {
    let result = tools
    if (category !== "Tất cả") {
      result = result.filter((t) => t.category === category)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => (a.available === b.available ? 0 : a.available ? -1 : 1))
  }, [search, category])

  const handleCategoryChange = (value: string) => {
    if (value) setCategory(value)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-5 p-3.5 sm:p-4 lg:p-6 pb-8">

      {/* ===== HERO BANNER ===== */}
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
        style={{ backgroundImage: "url(/images/gradient-blue.png?v=1)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4 sm:p-8 lg:p-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/10 text-white/90 backdrop-blur-md shadow-lg mb-4 sm:mb-6">
            <SparklesIcon className="size-3" />
            Bộ công cụ AI
          </span>
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight mb-1 sm:mb-2">
            Công cụ AI
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-lg leading-relaxed">
            Khám phá bộ công cụ AI mạnh mẽ — từ tạo ảnh theo mẫu, upscale, xóa nền đến chuyển phong cách nghệ thuật.
          </p>
        </div>
      </div>

      {/* ===== SEARCH + FILTER ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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

        <div className="relative w-full sm:w-[280px]">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm công cụ..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value) }}
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground -mt-2">
        {filteredTools.length} công cụ
      </p>

      {/* ===== TOOLS LIST ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {filteredTools.map((tool) => {
          const card = (
            <div
              className={cn(
                "group relative flex items-center gap-4 p-3 sm:p-4 rounded-2xl border transition-all duration-200",
                tool.available
                  ? "border-border/50 bg-card hover:bg-accent/50 hover:border-border hover:shadow-lg hover:shadow-black/5 active:scale-[0.99]"
                  : "border-border/30 bg-card/50 cursor-not-allowed"
              )}
            >
              {/* Thumbnail */}
              <div className={cn(
                "relative shrink-0 size-16 sm:size-20 rounded-xl overflow-hidden",
                !tool.available && "opacity-50"
              )}>
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br",
                  gradientMap[tool.id] ?? "from-gray-600 to-gray-800"
                )} />
                <img
                  src={tool.thumbnail}
                  alt={tool.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              </div>

              {/* Content */}
              <div className={cn("flex-1 min-w-0", !tool.available && "opacity-60")}>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold truncate">{tool.name}</h3>
                  {!tool.available && (
                    <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-5 gap-1 border-border/50 text-muted-foreground">
                      <Lock className="size-2.5" />
                      Sắp ra mắt
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-1.5">
                  {tool.description}
                </p>
                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">
                  {tool.category}
                </Badge>
              </div>

              {/* Arrow (available only) */}
              {tool.available && (
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              )}
            </div>
          )

          if (tool.available && tool.path) {
            return (
              <Link key={tool.id} to={tool.path} className="group">
                {card}
              </Link>
            )
          }

          return (
            <div key={tool.id} className="group">
              {card}
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {filteredTools.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <SearchIcon className="size-6 text-muted-foreground" />
          </div>
          <p className="text-base font-medium">Không tìm thấy công cụ nào</p>
          <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa hoặc danh mục.</p>
          <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCategory("Tất cả") }}>
            Xoá bộ lọc
          </Button>
        </div>
      )}
    </div>
  )
}
