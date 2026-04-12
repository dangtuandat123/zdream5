import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  SearchIcon,

  ArrowRightIcon,
  Lock,
  Zap,
  LayoutTemplate,
  ZoomIn,
  Eraser,
  Wand2,
  Expand,
  PenTool,
  FileText,
  UserCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
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
    description: "Chọn mẫu thiết kế có sẵn, điền nội dung và tạo ảnh chuyên nghiệp trong vài giây",
    category: "Tạo ảnh",
    thumbnail: "/images/tools/templates.jpg",
    path: "/app/tools/templates",
    available: true,
  },
  {
    id: "consistent-character",
    name: "Nhân vật AI",
    description: "Tạo nhân vật riêng và giữ nhất quán qua mọi bối cảnh — avatar, truyện tranh, branding",
    category: "Sáng tạo",
    thumbnail: "/images/tools/consistent-character.jpg",
    path: "/app/tools/consistent-character",
    available: false,
  },
  {
    id: "upscale",
    name: "Upscale ảnh",
    description: "Phóng to ảnh lên 2x–4x mà vẫn giữ chi tiết sắc nét nhờ AI",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/upscale.jpg",
    path: "/app/tools/upscale",
    available: true,
  },
  {
    id: "remove-bg",
    name: "Xóa nền ảnh",
    description: "Tách chủ thể khỏi phông nền chỉ với một click, xuất ảnh nền trong suốt",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/remove-bg.jpg",
    path: "/app/tools/remove-bg",
    available: true,
  },
  {
    id: "image-edit",
    name: "Chỉnh sửa ảnh",
    description: "Tô vùng để xóa vật thể hoặc thay thế bằng nội dung mới — AI lấp đầy tự nhiên",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/inpainting.jpg",
    path: "/app/tools/image-edit",
    available: true,
  },
  {
    id: "extend",
    name: "Mở rộng ảnh",
    description: "Kéo dãn viền ảnh ra ngoài khung hình gốc, AI tự sinh nội dung phù hợp",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/extend.jpg",
    path: "/app/tools/extend",
    available: true,
  },
  {
    id: "style-transfer",
    name: "Chuyển phong cách",
    description: "Biến ảnh thường thành tranh anime, sơn dầu, hoạt hình, cyberpunk,...",
    category: "Sáng tạo",
    thumbnail: "/images/tools/style-transfer.jpg",
    path: "/app/tools/style-transfer",
    available: true,
  },
  {
    id: "image-to-prompt",
    name: "Ảnh thành Prompt",
    description: "AI phân tích ảnh và viết prompt chi tiết để bạn tái tạo hoặc cải tiến",
    category: "Sáng tạo",
    thumbnail: "/images/tools/image-to-prompt.jpg",
    path: "/app/tools/image-to-prompt",
    available: true,
  },
]

const categories = ["Tất cả", ...Array.from(new Set(tools.map((t) => t.category)))]

const gradientMap: Record<string, string> = {
  templates: "from-pink-600 via-rose-500 to-orange-400",
  upscale: "from-blue-600 via-cyan-500 to-teal-400",
  "remove-bg": "from-emerald-600 via-green-500 to-lime-400",
  "image-edit": "from-violet-600 via-purple-500 to-fuchsia-400",
  extend: "from-sky-600 via-blue-500 to-indigo-400",
  "style-transfer": "from-indigo-600 via-violet-500 to-purple-400",
  "consistent-character": "from-amber-600 via-orange-500 to-rose-400",
  "image-to-prompt": "from-emerald-600 via-teal-500 to-cyan-400",
}

const iconMap: Record<string, LucideIcon> = {
  templates: LayoutTemplate,
  "consistent-character": UserCheck,
  upscale: ZoomIn,
  "remove-bg": Eraser,
  "image-edit": PenTool,
  extend: Expand,
  "style-transfer": Wand2,
  "image-to-prompt": FileText,
}

function ToolCard({ tool }: { tool: AITool }) {
  const Icon = iconMap[tool.id]
  const card = (
    <div
      className={cn(
        "group relative flex items-center gap-4 sm:gap-5 p-3 sm:p-4 rounded-2xl border transition-all duration-200",
        tool.available
          ? "border-primary/20 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
          : "border-border/40 bg-card/60"
      )}
    >
      {/* Thumbnail */}
      <div className={cn(
        "relative shrink-0 size-20 sm:size-24 rounded-xl overflow-hidden",
        !tool.available && "opacity-50 grayscale"
      )}>
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br",
          gradientMap[tool.id] ?? "from-gray-600 to-gray-800"
        )} />
        {Icon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="size-8 sm:size-10 text-white/80" strokeWidth={1.5} />
          </div>
        )}
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
          <h3 className="text-sm sm:text-[15px] font-semibold truncate">{tool.name}</h3>
          {tool.available ? (
            <Badge className="shrink-0 text-[9px] px-1.5 py-0 h-[18px] bg-primary/15 text-primary border-0 font-semibold">
              <Zap className="size-2.5 mr-0.5" />
              Mở
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0 text-[9px] px-1.5 py-0 h-[18px] gap-0.5 border-border/50 text-muted-foreground">
              <Lock className="size-2" />
              Sắp ra mắt
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Arrow */}
      {tool.available && (
        <div className="shrink-0 flex items-center justify-center size-9 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <ArrowRightIcon className="size-4 text-primary group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </div>
  )

  if (tool.available && tool.path) {
    return (
      <Link to={tool.path} className="group">
        {card}
      </Link>
    )
  }

  return <div className="group">{card}</div>
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
    <div className="flex flex-1 flex-col gap-4 sm:gap-5 p-3.5 sm:p-4 lg:p-6 pb-8">

      {/* ===== HEADING ===== */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Công cụ AI</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Bộ công cụ AI mạnh mẽ cho mọi nhu cầu sáng tạo.
        </p>
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
        {totalCount} công cụ
      </p>

      {/* ===== AVAILABLE TOOLS ===== */}
      {filteredAvailable.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <Zap className="size-3.5 text-primary" />
            Sẵn sàng sử dụng
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {filteredAvailable.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {filteredAvailable.length > 0 && filteredTools.length > 0 && (
        <Separator className="opacity-50" />
      )}

      {/* ===== COMING SOON TOOLS ===== */}
      {filteredTools.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2 text-muted-foreground">
            <Lock className="size-3.5" />
            Sắp ra mắt
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
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
