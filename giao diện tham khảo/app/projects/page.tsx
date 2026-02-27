"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Grid3X3, List, MoreHorizontal, Trash2, Download, Copy, PlusCircle, FolderOpen, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import api from "@/lib/api"

export default function ProjectsPage() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [logos, setLogos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/projects')
      setLogos(res.data)
    } catch (error) {
      toast.error("Không tải được danh sách dự án")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/projects/${deleteTarget}`)
      toast.success("Đã xóa dự án thành công")
      setDeleteTarget(null)
      fetchProjects()
    } catch (error) {
      toast.error("Không thể xóa dự án lúc này")
    }
  }

  const filtered = logos?.filter((l) =>
    l.brand_name?.toLowerCase().includes(search.toLowerCase())
  ) || []

  const logoToDelete = logos?.find((l) => l.id === deleteTarget)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex-1 overflow-y-scroll overflow-x-hidden">
      <div className="p-3 sm:p-4 md:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)]">
              Logo Của Tôi
            </h1>
            <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">{logos.length}</Badge>
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "list")}>
            <TabsList className="h-8 sm:h-9">
              <TabsTrigger value="grid" className="gap-1.5 text-xs px-2.5">
                <Grid3X3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Lưới</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5 text-xs px-2.5">
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Danh Sách</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator className="mb-4 sm:mb-6" />

        {/* Search */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm logo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 text-justify"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-4">
                <FolderOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-base mb-1 text-justify">Không tìm thấy logo</p>
              <p className="text-sm text-muted-foreground mb-4 text-justify">
                {search ? `Không có kết quả cho "${search}"` : "Tạo logo đầu tiên để bắt đầu"}
              </p>
              {!search && (
                <Button asChild>
                  <Link href="/app/create">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Tạo Logo
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
            {filtered.map((logo, index) => (
              <Card
                key={logo.id}
                className="group hover:border-primary/50 transition-all duration-300 overflow-hidden py-0 hover:-translate-y-1.5 hover:shadow-[0_10px_40px_-10px_rgba(var(--primary),0.2)] bg-card/50 backdrop-blur-sm"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-0">
                  <Link href={`/app/editor/${logo.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center p-6 sm:p-10 group-hover:scale-105 transition-transform duration-500 rounded-t-xl overflow-hidden">
                      <div
                        className="w-full h-full drop-shadow-xl group-hover:drop-shadow-2xl transition-all duration-500 [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: logo.svg_content || "" }}
                      />
                    </div>
                  </Link>
                  <div className="p-3 sm:p-4 border-t border-border/50 flex items-center justify-between bg-background/80 backdrop-blur-md relative z-10">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors text-justify">{logo.brand_name || "Untitled"}</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 text-justify">{formatDate(logo.created_at)}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Tùy chọn khác</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" /> Tải Xuống
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" /> Nhân Bản
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteTarget(logo.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
            {filtered.map((logo, index) => (
              <Link key={logo.id} href={`/app/editor/${logo.id}`}>
                <Card
                  className={cn(
                    "group hover:border-primary/50 transition-all duration-300 py-0 hover:-translate-y-1 hover:shadow-[0_8px_30px_-10px_rgba(var(--primary),0.2)] bg-card/50 backdrop-blur-sm overflow-hidden relative"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-3 sm:p-4 flex items-center gap-4 sm:gap-6 relative z-10 bg-background/80 backdrop-blur-md">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl flex items-center justify-center p-2 sm:p-2.5 shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                      <div
                        className="w-full h-full drop-shadow-md group-hover:drop-shadow-lg transition-all duration-500 [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: logo.svg_content || "" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors text-justify">{logo.brand_name || "Untitled"}</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 flex items-center text-justify">
                        <span className="font-medium text-foreground/70">{logo.style || "AI"}</span>
                        <span className="mx-1.5 opacity-30">•</span>
                        <span>{formatDate(logo.created_at)}</span>
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Tùy chọn khác</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" /> Tải Xuống
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" /> Nhân Bản
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.preventDefault()
                            setDeleteTarget(logo.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa &quot;{logoToDelete?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Logo và tất cả các file liên quan sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
