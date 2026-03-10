import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Gem,
    CreditCard,
    CheckCircle2,
    ShieldCheck,
    Copy,
    ArrowRight,
    Zap,
    Gift
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

// ============================================================
// Dữ liệu Gói Nạp
// ============================================================
const PACKAGES = [
    {
        id: "pkg_basic",
        name: "Người Mới",
        gems: 100,
        bonus: 0,
        price: 50000,
        popular: false,
        icon: Gem,
        color: "text-blue-400",
        bg: "from-blue-500/10 to-transparent",
        border: "border-blue-500/20",
        activeBorder: "border-blue-500",
    },
    {
        id: "pkg_pro",
        name: "Chuyên Nghiệp",
        gems: 500,
        bonus: 50,
        price: 200000,
        popular: true,
        icon: Zap,
        color: "text-violet-400",
        bg: "from-violet-500/10 to-transparent",
        border: "border-violet-500/20",
        activeBorder: "border-violet-500",
    },
    {
        id: "pkg_master",
        name: "Trùm AI",
        gems: 2000,
        bonus: 500,
        price: 500000,
        popular: false,
        icon: Gift,
        color: "text-amber-400",
        bg: "from-amber-500/10 to-transparent",
        border: "border-amber-500/20",
        activeBorder: "border-amber-500",
    },
]

// ============================================================
// Thông tin ngân hàng nhận (Placeholder - Thay đổi theo thực tế)
// ============================================================
const BANK_INFO = {
    bankId: "MB", // Ngân hàng MB Bank
    accountNo: "0123456789",
    accountName: "ZREAM STUDIO",
}

export function TopUpPage() {
    const [selectedPkgId, setSelectedPkgId] = useState<string>(PACKAGES[1].id)
    const [isProcessing, setIsProcessing] = useState(false)

    const selectedPkg = PACKAGES.find(p => p.id === selectedPkgId) || PACKAGES[1]

    // Content chuyển khoản: NAPXU + Số điện thoại hoặc ID user
    const transferContent = `NAPXU ZDREAM`

    // URL VietQR tạo mã tự động động
    // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<ACCOUNT_NAME>
    const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact.png?amount=${selectedPkg.price}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    }

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`Đã sao chép ${label}`)
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8 max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <CreditCard className="size-6 text-primary" />
                    Nạp Kim Cương (Xu)
                </h1>
                <p className="text-muted-foreground">
                    Thanh toán nhanh chóng qua VietQR. Nạp Kim Cương để tiếp tục hành trình sáng tạo không giới hạn.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cột trái: Chọn Gói (Chiếm 7 cột) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span className="flex items-center justify-center size-6 rounded-full bg-primary/20 text-primary text-xs">1</span>
                        Chọn gói Kim Cương
                    </h2>

                    <div className="grid gap-4">
                        {PACKAGES.map((pkg) => (
                            <Card
                                key={pkg.id}
                                className={`relative cursor-pointer transition-all duration-300 overflow-hidden ${selectedPkgId === pkg.id
                                    ? `ring-2 ring-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.15)] ${pkg.bg}`
                                    : `hover:bg-muted/50 ${pkg.border}`
                                    }`}
                                onClick={() => setSelectedPkgId(pkg.id)}
                            >
                                {pkg.popular && (
                                    <div className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">
                                        PHỔ BIẾN NHẤT
                                    </div>
                                )}
                                <CardContent className="p-5 flex items-center justify-between relative z-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`size-12 rounded-xl bg-background border shadow-sm flex items-center justify-center ${selectedPkgId === pkg.id ? 'ring-1 ring-violet-500/50' : ''}`}>
                                            <pkg.icon className={`size-6 ${pkg.color}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{pkg.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center text-lg font-black tracking-tight">
                                                    {pkg.gems} <Gem className="size-4 ml-1 text-cyan-400" />
                                                </div>
                                                {pkg.bonus > 0 && (
                                                    <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-500 border-none font-bold text-[10px] px-1.5 py-0 h-5">
                                                        +{pkg.bonus} Thưởng
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                                            {formatCurrency(pkg.price)}
                                        </div>
                                        {selectedPkgId === pkg.id && (
                                            <div className="text-xs text-violet-400 font-medium flex items-center justify-end gap-1 mt-1">
                                                <CheckCircle2 className="size-3" /> Đang chọn
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-200">
                        <ShieldCheck className="size-4 text-blue-400" />
                        <AlertDescription className="text-xs ml-2">
                            Giao dịch được bảo mật và tự động cộng Kim Cương vào tài khoản trong vòng 1-3 phút sau khi thanh toán thành công.
                        </AlertDescription>
                    </Alert>
                </div>

                {/* Cột phải: Thanh toán VietQR (Chiếm 5 cột) */}
                <div className="lg:col-span-5">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                        <span className="flex items-center justify-center size-6 rounded-full bg-primary/20 text-primary text-xs">2</span>
                        Quét mã thanh toán
                    </h2>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedPkg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-violet-500/20 shadow-[0_0_40px_rgba(139,92,246,0.1)] relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600"></div>
                                <CardHeader className="text-center pb-2">
                                    <CardTitle className="text-xl">Tổng thanh toán</CardTitle>
                                    <CardDescription>
                                        Sử dụng App Ngân hàng hoặc Momo để quét mã
                                    </CardDescription>
                                    <div className="text-3xl font-black text-white mt-2">
                                        {formatCurrency(selectedPkg.price)}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center gap-6 pt-4">
                                    {/* QR Code Container */}
                                    <div className="bg-white p-3 rounded-2xl shadow-xl w-64 h-64 relative group">
                                        <img
                                            src={qrUrl}
                                            alt="VietQR Code"
                                            className="w-full h-full object-contain rounded-xl"
                                        />
                                        <div className="absolute inset-0 border-2 border-violet-500/50 rounded-2xl pointer-events-none scale-105 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300"></div>
                                    </div>

                                    {/* Thông tin CK thủ công */}
                                    <div className="w-full space-y-3 bg-muted/30 p-4 rounded-xl border border-muted">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Ngân hàng:</span>
                                            <span className="font-bold">{BANK_INFO.bankId}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Chủ tài khoản:</span>
                                            <span className="font-bold">{BANK_INFO.accountName}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm group/item">
                                            <span className="text-muted-foreground">Số tài khoản:</span>
                                            <div className="flex items-center gap-2 font-mono font-bold">
                                                {BANK_INFO.accountNo}
                                                <Button variant="ghost" size="icon" className="size-6 opacity-50 group-hover/item:opacity-100" onClick={() => handleCopy(BANK_INFO.accountNo, "Số tài khoản")}>
                                                    <Copy className="size-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm group/item">
                                            <span className="text-muted-foreground">Nội dung:</span>
                                            <div className="flex items-center gap-2 font-mono font-bold text-violet-400">
                                                {transferContent}
                                                <Button variant="ghost" size="icon" className="size-6 opacity-50 group-hover/item:opacity-100 text-violet-400" onClick={() => handleCopy(transferContent, "Nội dung chuyển khoản")}>
                                                    <Copy className="size-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3 bg-muted/10 pt-4">
                                    <Button
                                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-12"
                                        onClick={() => {
                                            setIsProcessing(true)
                                            toast.loading("Đang chờ xác nhận giao dịch...", { duration: 3000 })
                                            setTimeout(() => {
                                                setIsProcessing(false)
                                                toast.success("Hệ thống sẽ cộng Kim Cương sau khi nhận được tiền.")
                                            }, 3000)
                                        }}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? "Đang kiểm tra..." : "Tôi đã thanh toán"} <ArrowRight className="size-4 ml-2" />
                                    </Button>
                                    <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                                        Bằng việc thanh toán, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Hoàn tiền của ZDream.
                                    </p>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
