import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  SearchIcon,
  SparklesIcon,
  ArrowRightIcon,
  Lock,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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

/* ========== AVAILABLE TOOL — card dọc, thumbnail lớn ========== */
function AvailableToolCard({ tool }: { tool: AITool }) {
  return (
    <Link to={tool.path ?? "#"} className="group">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98]">
        {/* Thumbnail lớn */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br",
            gradientMap[tool.id] ?? "from-gray-600 to-gray-800"
          )} />
          <img
            src={tool.thumbnail}
            alt={tool.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
          {/* Overlay gradient phía dưới */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* Badge góc trên */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 text-primary-foreground border-0 text-[10px] px-2 py-0.5 font-semibold backdrop-blur-sm shadow-md">
              <Zap className="size-3 mr-1" />
              Sẵn sàng
            </Badge>
          </div>
          {/* CTA hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 text-black text-sm font-semibold shadow-xl backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-300">
              <SparklesIcon className="size-4" />
              Sử dụng ngay
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold truncate mb-1">{tool.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{tool.description}</p>
            </div>
            <div className="shrink-0 flex items-center justify-center size-9 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mt-0.5">
              <ArrowRightIcon className="size-4 text-primary group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-medium">{tool.category}</Badge>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ========== COMING SOON TOOL — card dọc, nhỏ gọn hơn ========== */
function ComingSoonToolCard({ tool }: { tool: AITool }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/60">
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden opacity-50 grayscale">
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

      {/* Lock overlay */}
      <div className="absolute top-3 right-3">
        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[10px] gap-1 border-border/60 text-muted-foreground font-medium">
          <Lock className="size-2.5" />
          Sắp ra mắt
        </Badge>
      </div>

      {/* Info */}
      <div className="p-3.5 sm:p-4">
        <h3 className="text-[13px] sm:text-sm font-semibold truncate mb-1 text-foreground/70">{tool.name}</h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{tool.description}</p>
        <div className="mt-2.5">
          <Badge variant="secondary" className="text-[10px] font-medium opacity-60">{tool.category}</Badge>
        </div>
      </div>
    </div>
  )
}

export function AIToolsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Tất cả")

  const availableTools = useMemo(() => tools.filter((t) => t.available), [])

  const filteredTools = useMemo(() => {
    let result = tools.filter((t) => !t.available)
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
    return result
  }, [search, category])

  const filteredAvailable = useMemo(() => {
    if (!search.trim() && category === "Tất cả") return availableTools
    let result = availableTools
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
    return result
  }, [availableTools, search, category])

  const handleCategoryChange = (value: string) => {
    if (value) setCategory(value)
  }

  const totalCount = filteredAvailable.length + filteredTools.length

  return (
    <div className="flex flex-1 flex-col gap-5 sm:gap-6 p-3.5 sm:p-4 lg:p-6 pb-8">

      {/* ===== HERO BANNER ===== */}
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
        style={{ backgroundImage: "url(/images/gradient-blue.png?v=1)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-5 sm:p-8 lg:p-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/10 text-white/90 backdrop-blur-md shadow-lg mb-4 sm:mb-6">
            <SparklesIcon className="size-3" />
            Bộ công cụ AI
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight mb-1.5 sm:mb-2">
            Công cụ AI
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-lg leading-relaxed">
            Khám phá bộ công cụ AI mạnh mẽ — từ tạo ảnh theo mẫu, upscale, xóa nền đến chuyển phong cách nghệ thuật.
          </p>
        </div>
      </div>

      {/* ===== SEARCH + FILTER ===== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <ToggleGroup
          type="single"
          value={category}
          onValueChange={handleCategoryChange}
          className="flex flex-wrap justify-start gap-1.5"
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
        {totalCount} công cụ
      </p>

      {/* ===== AVAILABLE TOOLS ===== */}
      {filteredAvailable.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-semibold tracking-tight flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            Sẵn sàng sử dụng
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredAvailable.map((tool) => (
              <AvailableToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {filteredAvailable.length > 0 && filteredTools.length > 0 && (
        <Separator className="opacity-50" />
      )}

      {/* ===== COMING SOON TOOLS ===== */}
      {filteredTools.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-semibold tracking-tight flex items-center gap-2 text-muted-foreground">
            <Lock className="size-4" />
            Sắp ra mắt
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredTools.map((tool) => (
              <ComingSoonToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {totalCount === 0 && (
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
