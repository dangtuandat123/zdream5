import { useLocation } from "react-router-dom"

export function SiteHeader() {
  const location = useLocation()

  const pageTitle = location.pathname.includes("dashboard")
    ? "Trang chủ"
    : location.pathname.includes("generate")
      ? "Tạo ảnh AI"
      : location.pathname.includes("templates")
        ? "Mẫu thiết kế"
        : location.pathname.includes("settings")
          ? "Cài đặt"
          : "Nexus Art"

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
      <h1 className="text-base font-medium">{pageTitle}</h1>
    </header>
  )
}
