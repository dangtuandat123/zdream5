import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  WandSparkles,
  SwatchBook,
  ArrowUpFromLine,
  Megaphone,
  Eraser,
  Palette,
  Layers,

  Sparkles,
  ScanFace,
  PaintBucket,
  Frame,
  Type,
  Replace,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface AITool {
  id: string
  name: string
  description: string
  icon: React.ElementType
  category: string
  path?: string
  badge?: string
  gradient: string
  iconColor: string
  available: boolean
}

const tools: AITool[] = [
  {
    id: "generate",
    name: "Tạo ảnh AI",
    description: "Tạo ảnh nghệ thuật từ mô tả văn bản bằng các mô hình AI hàng đầu",
    icon: WandSparkles,
    category: "Tạo ảnh",
    path: "/app/generate",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
    available: true,
  },
  {
    id: "templates",
    name: "Tạo ảnh theo kiểu mẫu",
    description: "Sử dụng mẫu thiết kế có sẵn để tạo ảnh nhanh và đẹp",
    icon: SwatchBook,
    category: "Tạo ảnh",
    path: "/app/templates",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
    available: true,
  },
  {
    id: "upscale",
    name: "Upscale ảnh",
    description: "Phóng to và nâng cao chất lượng ảnh lên 2x, 4x với AI",
    icon: ArrowUpFromLine,
    category: "Chỉnh sửa",
    badge: "Sắp ra mắt",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
    available: false,
  },
  {
    id: "ad-image",
    name: "Ảnh quảng cáo",
    description: "Tạo ảnh quảng cáo sản phẩm chuyên nghiệp cho mạng xã hội",
    icon: Megaphone,
    category: "Tạo ảnh",
    badge: "Sắp ra mắt",
    gradient: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-400",
    available: false,
  },
  {
    id: "remove-bg",
    name: "Xóa nền ảnh",
    description: "Tự động xóa phông nền, tách chủ thể chính xác bằng AI",
    icon: Eraser,
    category: "Chỉnh sửa",
    badge: "Sắp ra mắt",
    gradient: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
    available: false,
  },
  {
    id: "colorize",
    name: "Tô màu ảnh",
    description: "Thêm màu sắc tự nhiên cho ảnh đen trắng bằng AI",
    icon: Palette,
    category: "Chỉnh sửa",
    badge: "Sắp ra mắt",
    gradient: "from-fuchsia-500/20 to-pink-500/20",
    iconColor: "text-fuchsia-400",
    available: false,
  },
  {
    id: "style-transfer",
    name: "Chuyển phong cách",
    description: "Biến ảnh thành phong cách anime, tranh sơn dầu, hoạt hình,...",
    icon: PaintBucket,
    category: "Sáng tạo",
    badge: "Sắp ra mắt",
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-400",
    available: false,
  },
  {
    id: "face-swap",
    name: "Hoán đổi khuôn mặt",
    description: "Thay thế khuôn mặt trong ảnh một cách tự nhiên",
    icon: ScanFace,
    category: "Sáng tạo",
    badge: "Sắp ra mắt",
    gradient: "from-teal-500/20 to-emerald-500/20",
    iconColor: "text-teal-400",
    available: false,
  },
  {
    id: "extend",
    name: "Mở rộng ảnh",
    description: "Mở rộng viền ảnh ra ngoài khung hình gốc bằng AI",
    icon: Frame,
    category: "Chỉnh sửa",
    badge: "Sắp ra mắt",
    gradient: "from-sky-500/20 to-blue-500/20",
    iconColor: "text-sky-400",
    available: false,
  },
  {
    id: "text-to-logo",
    name: "Tạo logo",
    description: "Thiết kế logo chuyên nghiệp từ tên thương hiệu",
    icon: Type,
    category: "Sáng tạo",
    badge: "Sắp ra mắt",
    gradient: "from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-400",
    available: false,
  },
  {
    id: "batch-generate",
    name: "Tạo ảnh hàng loạt",
    description: "Tạo nhiều biến thể ảnh cùng lúc từ một prompt",
    icon: Layers,
    category: "Tạo ảnh",
    badge: "Sắp ra mắt",
    gradient: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-400",
    available: false,
  },
  {
    id: "image-variation",
    name: "Biến thể ảnh",
    description: "Tạo các phiên bản tương tự từ ảnh gốc có sẵn",
    icon: Replace,
    category: "Sáng tạo",
    badge: "Sắp ra mắt",
    gradient: "from-lime-500/20 to-green-500/20",
    iconColor: "text-lime-400",
    available: false,
  },
]

const categories = ["Tất cả", ...Array.from(new Set(tools.map((t) => t.category)))]

export function AIToolsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Tất cả")

  const filteredTools = useMemo(() => {
    let result = tools
    if (activeCategory !== "Tất cả") {
      result = result.filter((t) => t.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }
    // Available tools first
    return result.sort((a, b) => (a.available === b.available ? 0 : a.available ? -1 : 1))
  }, [search, activeCategory])

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
              <Sparkles className="size-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Công cụ AI</h1>
              <p className="text-sm text-muted-foreground">
                Khám phá bộ công cụ AI mạnh mẽ cho sáng tạo hình ảnh
              </p>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm công cụ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-border/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-4">
          {filteredTools.length} công cụ
        </p>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => tool.available && tool.path && navigate(tool.path)}
              disabled={!tool.available}
              className={cn(
                "group relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200",
                tool.available
                  ? "border-border/50 bg-card hover:bg-accent/50 hover:border-border hover:shadow-lg hover:shadow-black/5 cursor-pointer active:scale-[0.98]"
                  : "border-border/30 bg-card/50 opacity-60 cursor-not-allowed"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex items-center justify-center size-12 rounded-xl bg-gradient-to-br border border-white/5 shrink-0 transition-transform duration-200",
                  tool.gradient,
                  tool.available && "group-hover:scale-110"
                )}
              >
                <tool.icon className={cn("size-6", tool.iconColor)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold truncate">{tool.name}</h3>
                  {tool.badge && (
                    <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-5 border-border/50 text-muted-foreground">
                      {tool.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filteredTools.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Không tìm thấy công cụ nào</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("Tất cả") }}
              className="text-xs text-primary hover:underline mt-1"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
