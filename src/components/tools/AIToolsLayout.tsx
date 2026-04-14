import { useState, useMemo } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import {
  SearchIcon,
  Lock,
  LayoutTemplate,
  ZoomIn,
  Eraser,
  Wand2,
  Expand,
  PenTool,
  FileText,
  UserCheck,
  Sparkles
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
    name: "Ảnh kiểu mẫu",
    description: "Tạo ảnh từ mẫu thiết kế có sẵn siêu nhanh chóng.",
    category: "Tạo ảnh",
    thumbnail: "/images/tools/templates.jpg",
    path: "/app/tools/templates",
    available: true,
  },
  {
    id: "consistent-character",
    name: "Nhân vật AI",
    description: "Tạo nhân vật riêng và giữ nhất quán qua mọi bối cảnh.",
    category: "Sáng tạo",
    thumbnail: "/images/tools/consistent-character.jpg",
    path: "/app/tools/consistent-character",
    available: false,
  },
  {
    id: "upscale",
    name: "Upscale ảnh",
    description: "Phóng ảnh lên 2x–4x giữ chi tiết sắc nét.",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/upscale.jpg",
    path: "/app/tools/upscale",
    available: true,
  },
  {
    id: "remove-bg",
    name: "Xóa nền ảnh",
    description: "Tách nền chỉ với một click chuột.",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/remove-bg.jpg",
    path: "/app/tools/remove-bg",
    available: true,
  },
  {
    id: "image-edit",
    name: "Chỉnh sửa ảnh",
    description: "Xóa/Thay thế bằng AI thông minh lấp đầy vùng chọn.",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/inpainting.jpg",
    path: "/app/tools/image-edit",
    available: true,
  },
  {
    id: "extend",
    name: "Mở rộng ảnh",
    description: "Kéo giãn ảnh và AI sinh bổ sung xung quanh.",
    category: "Chỉnh sửa",
    thumbnail: "/images/tools/extend.jpg",
    path: "/app/tools/extend",
    available: true,
  },
  {
    id: "style-transfer",
    name: "Chuyển phong cách",
    description: "Anime, sơn dầu, hoạt hình, cyberpunk, v.v.",
    category: "Sáng tạo",
    thumbnail: "/images/tools/style-transfer.jpg",
    path: "/app/tools/style-transfer",
    available: true,
  },
  {
    id: "image-to-prompt",
    name: "Ảnh → Prompt",
    description: "AI phân tích ảnh ra prompt chữ chi tiết.",
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

function ToolListCard({ tool }: { tool: AITool }) {
  const location = useLocation()
  const isActive = location.pathname.includes(tool.path || "unavailable")
  const Icon = iconMap[tool.id]
  
  const card = (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200",
        tool.available
          ? isActive 
             ? "border-primary/50 bg-primary/10 shadow-sm" 
             : "border-transparent bg-transparent hover:bg-muted/60"
          : "opacity-40 grayscale"
      )}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 size-11 rounded-lg overflow-hidden border border-black/5 dark:border-white/5">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", gradientMap[tool.id] ?? "from-gray-600 to-gray-800")} />
        {Icon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="size-5 text-white shadow-sm" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2">
          <h3 className={cn("text-[13px] font-semibold truncate", isActive ? "text-primary" : "text-foreground")}>
            {tool.name}
          </h3>
          {tool.available ? (
             isActive && <div className="size-1.5 rounded-full bg-primary" />
          ) : (
            <Badge variant="outline" className="shrink-0 text-[8px] px-1 py-0 h-4 gap-0.5 border-border/50 text-muted-foreground mr-auto ml-0">
              <Lock className="size-2" />
              Sắp ra
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1 mt-0.5" title={tool.description}>
          {tool.description}
        </p>
      </div>
    </div>
  )

  if (tool.available && tool.path) {
    return (
      <Link to={tool.path} className="block outline-none" replace>
        {card}
      </Link>
    )
  }

  return <div className="cursor-not-allowed">{card}</div>
}

export function AIToolsIndex() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center p-8 text-muted-foreground animate-in fade-in duration-500">
      <div className="size-24 rounded-3xl bg-muted border border-border/50 flex items-center justify-center mb-6 shadow-sm">
        <Sparkles className="size-10 text-muted-foreground/60" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">Bộ Công Cụ AI ZDream5</h2>
      <p className="max-w-[280px] text-sm text-muted-foreground leading-relaxed">
        Vui lòng chọn một công cụ quyền năng ở danh sách bên trái để bắt đầu thỏa sức sáng tạo.
      </p>
    </div>
  )
}

export function AIToolsLayout() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Tất cả")

  const availableTools = useMemo(() => tools.filter((t) => t.available), [])

  const filteredTools = useMemo(() => {
    let result = tools.filter((t) => !t.available)
    if (category !== "Tất cả") result = result.filter((t) => t.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    }
    return result
  }, [search, category])

  const filteredAvailable = useMemo(() => {
    if (!search.trim() && category === "Tất cả") return availableTools
    let result = availableTools
    if (category !== "Tất cả") result = result.filter((t) => t.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    }
    return result
  }, [availableTools, search, category])

  const handleCategoryChange = (value: string) => {
    if (value) setCategory(value)
  }

  return (
    <div className="flex w-full h-[calc(100vh-65px)] overflow-hidden bg-background">
      
      {/* SECONDARY SIDEBAR: Tool Catalog */}
      <aside className="w-[300px] xl:w-[320px] shrink-0 border-r bg-card/10 flex flex-col h-full">
        {/* Header section fixed */}
        <div className="p-4 flex flex-col gap-4 shrink-0 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.05)] z-10 bg-background/95 backdrop-blur">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Công cụ AI</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Bộ công cụ AI mạnh mẽ nâng tầm sáng tạo.</p>
          </div>
          <div className="w-full">
            <ToggleGroup
              type="single"
              value={category}
              onValueChange={handleCategoryChange}
              className="flex justify-between w-full p-1 bg-muted/40 rounded-lg"
            >
              {categories.map((cat) => (
                <ToggleGroupItem
                  key={cat}
                  value={cat}
                  className="rounded-md px-2 text-[10px] font-medium h-6 leading-none data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm flex-1"
                >
                  {cat}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="relative w-full">
            <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm công cụ..."
              className="pl-8 h-8 text-xs bg-muted/40 border-transparent focus-visible:border-primary focus-visible:ring-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable list section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {filteredAvailable.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 pb-1">Đang hoạt động</h2>
              <div className="flex flex-col gap-1">
                {filteredAvailable.map((tool) => (
                  <ToolListCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          )}

          {filteredTools.length > 0 && (
            <div className="space-y-1">
              <Separator className="mx-2 mb-3 mt-1 opacity-50" />
              <h2 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 pb-1">Sắp ra mắt</h2>
              <div className="flex flex-col gap-1">
                {filteredTools.map((tool) => (
                  <ToolListCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          )}

          {filteredAvailable.length === 0 && filteredTools.length === 0 && (
            <div className="text-center py-10 opacity-70">
              <p className="text-xs font-medium">Không tìm thấy công cụ</p>
            </div>
          )}
        </div>
      </aside>

      {/* WORKSPACE AREA */}
      <main className="flex-1 h-full overflow-hidden relative bg-muted/10">
        <Outlet />
      </main>

    </div>
  )
}
