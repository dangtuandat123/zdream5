"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Monitor, User, Bell, CreditCard, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const themeOptions = [
  { id: "light", label: "Sáng", icon: Sun },
  { id: "dark", label: "Tối", icon: Moon },
  { id: "system", label: "Hệ Thống", icon: Monitor },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john@example.com")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex-1 overflow-y-scroll overflow-x-hidden">
      <div className="p-3 sm:p-4 md:p-6 max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)] mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          Cài Đặt
        </h1>
        <Separator className="mb-6 animate-in fade-in duration-700" />

        <Tabs defaultValue="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <TabsList className="bg-muted/50 backdrop-blur-md">
            <TabsTrigger value="profile" className="gap-1.5 data-[state=active]:shadow-sm">
              <User className="h-3.5 w-3.5" />
              Hồ Sơ
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5 data-[state=active]:shadow-sm">
              <Sun className="h-3.5 w-3.5" />
              Giao Diện
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="bg-card/40 backdrop-blur-sm border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Thông Tin Hồ Sơ</CardTitle>
                <CardDescription className="text-justify">Cập nhật tên và địa chỉ email của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Họ Tên</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 bg-background/50 focus-visible:ring-primary/30 text-justify"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 bg-background/50 focus-visible:ring-primary/30 text-justify"
                  />
                </div>
                <Button size="sm" className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">Lưu Thay Đổi</Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-card/40 backdrop-blur-sm border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  Thông Báo
                </CardTitle>
                <CardDescription className="text-justify">Quản lý cách bạn nhận thông báo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Thông báo qua email", desc: "Nhận cập nhật về logo của bạn" },
                  { label: "Cảnh báo tạo logo", desc: "Nhận thông báo khi logo đã sẵn sàng" },
                  { label: "Email tiếp thị", desc: "Mẹo và thông tin cập nhật sản phẩm" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-justify">{item.label}</p>
                      <p className="text-xs text-muted-foreground text-justify">{item.desc}</p>
                    </div>
                    <Switch defaultChecked className="shrink-0 data-[state=checked]:bg-primary" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="bg-card/40 backdrop-blur-sm border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Chủ Đề</CardTitle>
                <CardDescription className="text-justify">Chọn giao diện màu sắc của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 active:scale-[0.97]",
                        mounted && theme === opt.id
                          ? "border-primary bg-primary/10 shadow-[0_0_15px_-3px_var(--color-primary)] scale-[1.02]"
                          : "border-border/50 bg-background/50 hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <opt.icon className={cn("h-5 w-5 transition-colors duration-300", mounted && theme === opt.id ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-sm font-medium transition-colors duration-300", mounted && theme === opt.id ? "text-foreground" : "text-muted-foreground")}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
