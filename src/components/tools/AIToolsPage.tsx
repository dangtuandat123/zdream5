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

      {/* ===== TOOLS GRID ===== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredTools.map((tool) => {
          const inner = (
            <div
              className={cn(
                "group relative block overflow-hidden rounded-2xl aspect-square focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                !tool.available && "opacity-50"
              )}
            >
              {/* Thumbnail or gradient fallback */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br transition-transform duration-500 ease-out group-hover:scale-110",
                gradientMap[tool.id] ?? "from-gray-600 to-gray-800"
              )}>
                <img
                  src={tool.thumbnail}
                  alt={tool.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              </div>

              {/* Category badge */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/40 text-white backdrop-blur-md">
                  {tool.category}
                </span>
              </div>

              {/* Coming soon lock */}
              {!tool.available && (
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-black/50 text-white/80 backdrop-blur-md">
                    <Lock className="size-2.5" />
                    Sắp ra mắt
                  </span>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Hover CTA (only available) */}
              {tool.available && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-black text-xs font-semibold shadow-lg backdrop-blur-sm">
                    <SparklesIcon className="size-3.5" />
                    Sử dụng
                  </span>
                </div>
              )}

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-3 space-y-0.5">
                <h3 className="text-sm font-semibold text-white truncate drop-shadow-md">
                  {tool.name}
                </h3>
                <p className="text-[11px] text-white/70 line-clamp-2 drop-shadow-sm leading-relaxed">
                  {tool.description}
                </p>
                {tool.available && (
                  <div className="flex items-center gap-1 pt-1 text-white/50 group-hover:text-white/80 transition-colors">
                    <span className="text-[10px] font-medium">Mở công cụ</span>
                    <ArrowRightIcon className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                )}
              </div>
            </div>
          )

          if (tool.available && tool.path) {
            return (
              <Link key={tool.id} to={tool.path} className="group">
                {inner}
              </Link>
            )
          }

          return (
            <div key={tool.id} className="cursor-not-allowed">
              {inner}
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
