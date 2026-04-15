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
  Sparkles,
  ArrowLeft,
  ImageIcon,
  ChevronRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToolPanelProvider, useToolPanelState } from "./ToolPanelContext"

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
  {
    id: "ad-image",
    name: "Ảnh quảng cáo",
    description: "Tạo ảnh sản phẩm chuyên nghiệp bằng AI.",
    category: "Sáng tạo",
    thumbnail: "/images/tools/ad-image.jpg",
    path: "/app/tools/ad-image",
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
  "ad-image": "from-rose-600 via-pink-500 to-amber-400",
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
  "ad-image": ImageIcon,
}

function ToolListCard({ tool }: { tool: AITool }) {
  const location = useLocation()
  const isActive = location.pathname.includes(tool.path || "unavailable")
  const Icon = iconMap[tool.id]
  
  const card = (
    <div
      className={cn(
        "group relative flex items-center gap-3.5 p-2.5 rounded-xl border transition-all duration-200",
        tool.available
          ? isActive 
             ? "border-primary/50 bg-primary/10 shadow-sm" 
             : "border-transparent bg-transparent hover:bg-muted/60"
          : "opacity-40 grayscale"
      )}
    >
      <div className="relative shrink-0 size-11 rounded-xl overflow-hidden border border-black/5 dark:border-white/5 shadow-sm">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", gradientMap[tool.id] ?? "from-gray-600 to-gray-800")} />
        {Icon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="size-5 text-white shadow-sm" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 pr-1 py-0.5">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className={cn("text-xs font-bold truncate", isActive ? "text-primary" : "text-foreground")}>
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
        <p className="text-[11px] text-muted-foreground leading-[1.3] line-clamp-2" title={tool.description}>
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
  const availableTools = tools.filter(t => t.available)

  return (
    <ScrollArea className="w-full h-full bg-muted/10">
        <div className="p-8 md:p-12 lg:p-16 max-w-6xl mx-auto min-h-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <div className="inline-flex items-center justify-center p-3 mb-2 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                    <Sparkles className="size-8" />
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                    Khám phá AI ZDream5
                </h1>
                <p className="text-lg text-muted-foreground/80 max-w-xl mx-auto font-medium">
                    Biến mọi định dạng nội dung thành kiệt tác sống động với bộ công cụ đa năng chuẩn Studio.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTools.map(tool => {
                    const Icon = iconMap[tool.id]
                    return (
                        <Link key={tool.id} to={tool.path!} className="group relative flex flex-col p-6 rounded-[2rem] border bg-background/50 hover:bg-background/90 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 outline-none backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="shrink-0 size-14 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 relative shadow-sm">
                                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", gradientMap[tool.id] ?? "from-gray-600 to-gray-800")} />
                                    {Icon && <Icon className="absolute inset-0 m-auto size-6 text-white drop-shadow-md" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{tool.name}</h3>
                                    <Badge variant="secondary" className="px-2 py-0 mt-1 text-[10px] uppercase tracking-wider font-semibold bg-muted/60 text-muted-foreground">{tool.category}</Badge>
                                </div>
                            </div>
                            <p className="text-sm text-foreground/60 leading-relaxed font-medium flex-1">
                                {tool.description}
                            </p>
                            <div className="mt-6 flex items-center justify-end text-xs font-bold text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 ease-out">
                                Khởi tạo ngay 
                                <div className="ml-2 bg-primary/10 rounded-full p-1 border border-primary/20">
                                    <ChevronRight className="size-3.5" strokeWidth={3} />
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
            
            <div className="text-center mt-16 text-xs text-muted-foreground font-medium flex-col flex items-center justify-center gap-2">
                <LayoutTemplate className="size-5 opacity-50" />
                Dự án liên tục cập nhật công cụ AI thế hệ mới nhất hàng tháng.
            </div>
        </div>
    </ScrollArea>
  )
}

// === Tool Catalog Panel ===
function ToolCatalogPanel() {
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
    <>
      <div className="p-4 flex flex-col gap-3 shrink-0 border-b bg-background/95 backdrop-blur z-10">
        <div>
          <h1 className="text-base font-bold tracking-tight">Công cụ AI</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Chọn công cụ để bắt đầu sáng tạo</p>
        </div>
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
              className="rounded-md px-2 text-[11px] font-semibold h-7 leading-none data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm flex-1 truncate"
            >
              {cat}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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

      <ScrollArea className="flex-1">
        <div className="px-3 py-3 space-y-4">
          {filteredAvailable.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 pb-1">Đang hoạt động</h2>
              <div className="flex flex-col gap-0.5">
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
              <div className="flex flex-col gap-0.5">
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
      </ScrollArea>
    </>
  )
}

// === Tool Config Panel (Drill-down khi đã chọn tool) ===
function ToolConfigPanel() {
  const { panel } = useToolPanelState()
  if (!panel) return null

  const Icon = panel.icon

  return (
    <div className="flex flex-col h-full bg-background absolute inset-0">
      {/* Header với nút Back và tên tool */}
      <div className="px-4 py-3 shrink-0 border-b bg-background/95 backdrop-blur z-20">
        <div className="flex items-center gap-2.5">
          <Link to="/app/tools" replace className="shrink-0 size-8 -ml-1 rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" />
          </Link>
          {Icon && (
            <div className="shrink-0 size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="size-4 text-primary" />
            </div>
          )}
          <h2 className="text-sm font-bold truncate">{panel.title}</h2>
        </div>
      </div>

      <Tabs defaultValue="config" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b bg-muted/20 shrink-0">
          <TabsList className="w-full h-8">
            <TabsTrigger value="config" className="flex-1 text-xs px-2 py-1 h-6">Tùy chỉnh</TabsTrigger>
            {panel.historyPanel && <TabsTrigger value="history" className="flex-1 text-xs px-2 py-1 h-6">Lịch sử ảnh</TabsTrigger>}
          </TabsList>
        </div>

        <TabsContent value="config" className="flex-1 flex flex-col m-0 outline-none min-h-0 data-[state=inactive]:hidden border-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-5">
              {panel.controls}
            </div>
          </ScrollArea>
          {/* Sticky bottom submit button */}
          {panel.submitButton && (
            <div className="p-4 border-t bg-background/95 backdrop-blur shrink-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
              {panel.submitButton}
            </div>
          )}
        </TabsContent>

        {panel.historyPanel && (
          <TabsContent value="history" className="flex-1 m-0 outline-none data-[state=inactive]:hidden border-0 bg-muted/5">
            <ScrollArea className="h-full">
                <div className="p-4">
                  {panel.historyPanel}
                </div>
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

// === Main Layout Component ===
function AIToolsLayoutInner() {
  const location = useLocation()
  const { panel } = useToolPanelState()
  
  const isToolIndex = location.pathname === "/app/tools" || location.pathname === "/app/tools/"
  const showCatalog = isToolIndex || !panel

  return (
    <div className="flex w-full h-[calc(100dvh-60px)] md:h-dvh overflow-hidden bg-background">
      
      {/* COL 2: DYNAMIC PANEL */}
      <aside className="w-[300px] xl:w-[340px] shrink-0 border-r bg-card/5 flex flex-col h-full relative overflow-hidden">
        {/* Catalog panel */}
        <div className={cn(
          "absolute inset-0 flex flex-col transition-all duration-300 ease-in-out",
          showCatalog 
            ? "translate-x-0 opacity-100" 
            : "-translate-x-full opacity-0 pointer-events-none"
        )}>
          <ToolCatalogPanel />
        </div>

        {/* Config panel — slide in từ phải */}
        <div className={cn(
          "absolute inset-0 flex flex-col transition-all duration-300 ease-in-out",
          !showCatalog 
            ? "translate-x-0 opacity-100" 
            : "translate-x-full opacity-0 pointer-events-none"
        )}>
          <ToolConfigPanel />
        </div>
      </aside>

      {/* COL 3: FULL-WIDTH OUTPUT CANVAS */}
      <main className="flex-1 h-full overflow-hidden relative">
        <Outlet />
      </main>

    </div>
  )
}

export function AIToolsLayout() {
  return (
    <ToolPanelProvider>
      <AIToolsLayoutInner />
    </ToolPanelProvider>
  )
}
