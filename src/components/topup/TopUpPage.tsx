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
    Gift,
    Calculator
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
    // Gói Tùy Chỉnh
    {
        id: "pkg_custom",
        name: "Tự nhập số tiền",
        gems: 0, // Tính động
        bonus: 0,
        price: 0, // Tính động
        popular: false,
        icon: Calculator,
        color: "text-emerald-400",
        bg: "from-emerald-500/10 to-transparent",
        border: "border-emerald-500/20",
        activeBorder: "border-emerald-500",
    }
]

// Tỷ giá quy đổi (VD: 50,000đ = 100 Gem -> 500đ = 1 Gem)
const VND_PER_GEM = 500
const MIN_CUSTOM_AMOUNT = 10000

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
    const [customAmountStr, setCustomAmountStr] = useState<string>("50000") // String cho thẻ input để dễ format
    const [isProcessing, setIsProcessing] = useState(false)

    // Tính toán số tiền thực tế và số kim cương nhận được cho gói đang chọn
    const customAmountNum = parseInt(customAmountStr.replace(/[^0-9]/g, "")) || 0

    const isCustom = selectedPkgId === "pkg_custom"
    const selectedPkg = PACKAGES.find(p => p.id === selectedPkgId) || PACKAGES[1]

    const currentPrice = isCustom ? Math.max(customAmountNum, MIN_CUSTOM_AMOUNT) : selectedPkg.price
    const currentGems = isCustom ? Math.floor(currentPrice / VND_PER_GEM) : selectedPkg.gems

    // Content chuyển khoản: NAPXU + Số điện thoại hoặc ID user
    const transferContent = `NAPXU ZDREAM`

    // URL VietQR tạo mã tự động động
    const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact.png?amount=${currentPrice}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    }

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`Đã sao chép ${label}`)
    }

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Chỉ cho phép nhập số
        let val = e.target.value.replace(/[^0-9]/g, "")
        if (val === "") val = "0"
        
        // Cập nhật state (nhưng vẫn format ngầm nếu cần)
        setCustomAmountStr(val)
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:min-h-[calc(100vh-theme(spacing.16))] max-w-6xl mx-auto w-full">
            {/* Header - Rút gọn spacing */}
            <div className="flex flex-col gap-1 shrink-0">
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2">
                    <CreditCard className="size-5 lg:size-6 text-primary" />
                    Nạp Kim Cương (Xu)
                </h1>
                <p className="text-sm text-muted-foreground">
                    Thanh toán siêu tốc qua VietQR. Trải nghiệm sáng tạo không gián đoạn.
                </p>
            </div>

            {/* Layout chính: 2 cột trên Desktop, cho phép cuộn nội dung cột trái nếu cần */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1">
                
                {/* ----------------------------------------------------
                    Cột trái: Chọn Gói (Chiếm 7 cột)
                ------------------------------------------------------*/}
                <div className="lg:col-span-7 flex flex-col gap-4 h-full">
                    <h2 className="text-base font-semibold flex items-center gap-2 shrink-0">
                        <span className="flex items-center justify-center size-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">1</span>
                        Chọn gói Kim Cương
                    </h2>

                    {/* Danh sách package */}
                    <div className="flex flex-col gap-3">
                        {PACKAGES.map((pkg) => (
                            <Card
                                key={pkg.id}
                                className={`relative transition-all duration-300 overflow-hidden ${selectedPkgId === pkg.id
                                    ? `ring-2 ring-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.15)] ${pkg.bg}`
                                    : `hover:bg-muted/50 ${pkg.border} cursor-pointer`
                                    }`}
                                onClick={() => {
                                    if (selectedPkgId !== pkg.id) {
                                        setSelectedPkgId(pkg.id)
                                    }
                                }}
                            >
                                {pkg.popular && (
                                    <div className="absolute top-0 right-0 bg-violet-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10 pointer-events-none">
                                        PHỔ BIẾN NHẤT
                                    </div>
                                )}
                                <CardContent className="p-4 flex flex-col relative z-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-10 lg:size-12 rounded-xl bg-background border shadow-sm flex items-center justify-center shrink-0 ${selectedPkgId === pkg.id ? 'ring-1 ring-violet-500/50' : ''}`}>
                                                <pkg.icon className={`size-5 lg:size-6 ${pkg.color}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base lg:text-lg leading-tight">{pkg.name}</h3>
                                                
                                                {/* Hiển thị gems nếu là gói cố định */}
                                                {pkg.id !== "pkg_custom" && (
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <div className="flex items-center text-base lg:text-lg font-black tracking-tight leading-tight">
                                                            {pkg.gems} <Gem className="size-3.5 lg:size-4 ml-1 text-cyan-400" />
                                                        </div>
                                                        {pkg.bonus > 0 && (
                                                            <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-500 border-none font-bold text-[9px] lg:text-[10px] px-1.5 py-0 h-4 lg:h-5">
                                                                +{pkg.bonus} Thưởng
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Hiển thị gem realtime cho thẻ custom khi đang chọn */}
                                                {pkg.id === "pkg_custom" && selectedPkgId === "pkg_custom" && (
                                                    <div className="flex items-center gap-1 mt-0.5 text-emerald-400 font-bold text-sm">
                                                        =&gt; Nhận {currentGems} <Gem className="size-3 ml-0.5" />
                                                    </div>
                                                )}
                                                {pkg.id === "pkg_custom" && selectedPkgId !== "pkg_custom" && (
                                                    <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                                                        Nhập số tiền mong muốn
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="text-right shrink-0">
                                            {pkg.id !== "pkg_custom" ? (
                                                <div className="text-lg lg:text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                                                    {formatCurrency(pkg.price)}
                                                </div>
                                            ) : (
                                                selectedPkgId === "pkg_custom" && (
                                                    <div className="text-lg lg:text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                                                        {formatCurrency(currentPrice)}
                                                    </div>
                                                )
                                            )}
                                            
                                            {selectedPkgId === pkg.id && (
                                                <div className="text-[10px] lg:text-xs text-violet-400 font-medium flex items-center justify-end gap-1 mt-0.5">
                                                    <CheckCircle2 className="size-3" /> Đang chọn
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Input cho số tiền tùy chỉnh (chỉ hiện khi chọn gói này) */}
                                    {pkg.id === "pkg_custom" && selectedPkgId === "pkg_custom" && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 rounded-xl bg-background/50 border border-emerald-500/20 shadow-inner flex flex-col gap-2">
                                                <label className="text-xs font-semibold text-muted-foreground">Nhập số tiền Nạp (VNĐ)</label>
                                                <div className="relative">
                                                    <Input 
                                                        type="text"
                                                        value={new Intl.NumberFormat('vi-VN').format(customAmountNum)}
                                                        onChange={handleCustomAmountChange}
                                                        className="pl-5 pr-12 h-12 text-lg lg:text-xl font-bold bg-background border-emerald-500/30 focus-visible:ring-emerald-500"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">đ</span>
                                                </div>
                                                {customAmountNum > 0 && customAmountNum < MIN_CUSTOM_AMOUNT && (
                                                    <p className="text-xs font-medium text-destructive mt-1 flex items-center">
                                                        *Số tiền nạp tối thiểu là {formatCurrency(MIN_CUSTOM_AMOUNT)}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Spacer pushing alert down */}
                        <div className="mt-auto pt-4">
                            {/* Alert bảo mật */}
                            <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-200 py-3">
                                <ShieldCheck className="size-4 text-blue-400" />
                                <AlertDescription className="text-xs ml-2 leading-relaxed">
                                    Giao dịch được mã hóa 256-bit. Kim Cương tự động cộng vào tài khoản trong 1-3 phút.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </div>

                {/* ----------------------------------------------------
                    Cột phải: Thanh toán VietQR (Chiếm 5 cột)
                ------------------------------------------------------*/}
                <div className="lg:col-span-5 flex flex-col gap-4 h-full sticky top-6">
                    <h2 className="text-base font-semibold flex items-center gap-2 shrink-0">
                        <span className="flex items-center justify-center size-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">2</span>
                        Quét mã thanh toán
                    </h2>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedPkg.id + currentPrice.toString()}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1"
                        >
                            {/* Card thanh toán */}
                            <Card className="border-violet-500/20 shadow-[0_0_40px_rgba(139,92,246,0.1)] relative overflow-hidden flex flex-col h-full lg:min-h-[500px]">
                                {/* Dải màu top */}
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600"></div>
                                
                                <CardHeader className="text-center pb-2 pt-5 shrink-0">
                                    <CardTitle className="text-lg">Tổng thanh toán</CardTitle>
                                    <div className="text-2xl lg:text-3xl font-black text-white mt-1">
                                        {formatCurrency(currentPrice)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 font-medium bg-muted/50 inline-block px-3 py-1 rounded-full mx-auto">
                                        Nhận ngay: <span className="text-violet-400 font-bold">{currentGems} 💎</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex flex-col items-center gap-4 pt-2 flex-1">
                                    
                                    {/* VietQR Code Box */}
                                    <div className="bg-white p-2.5 rounded-[1.25rem] shadow-xl w-48 h-48 lg:w-56 lg:h-56 relative group shrink-0">
                                        {(isCustom && customAmountNum < MIN_CUSTOM_AMOUNT) ? (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-center bg-muted/20 rounded-xl border-2 border-dashed border-muted p-4">
                                                <AlertDescription className="text-xs text-muted-foreground font-medium">
                                                    Vui lòng nhập số tiền hợp lệ (tối thiểu {formatCurrency(MIN_CUSTOM_AMOUNT)}) để tạo mã QR
                                                </AlertDescription>
                                            </div>
                                        ) : (
                                            <>
                                                <img
                                                    src={qrUrl}
                                                    alt="VietQR Code"
                                                    className="w-full h-full object-contain rounded-xl"
                                                />
                                                <div className="absolute inset-0 border-2 border-violet-500/50 rounded-[1.25rem] pointer-events-none scale-105 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300"></div>
                                            </>
                                        )}
                                    </div>

                                    {/* Bank Info Table - Compact */}
                                    <div className="w-full bg-muted/30 rounded-xl border border-muted divide-y divide-border text-xs lg:text-sm">
                                        <div className="flex justify-between items-center px-4 py-2.5">
                                            <span className="text-muted-foreground">Ngân hàng:</span>
                                            <span className="font-bold">{BANK_INFO.bankId}</span>
                                        </div>
                                        <div className="flex justify-between items-center px-4 py-2.5">
                                            <span className="text-muted-foreground">Chủ thẻ:</span>
                                            <span className="font-bold truncate max-w-[150px]">{BANK_INFO.accountName}</span>
                                        </div>
                                        <div className="flex justify-between items-center px-4 py-2.5 group/item">
                                            <span className="text-muted-foreground shrink-0">Số tài khoản:</span>
                                            <div className="flex items-center gap-2 font-mono font-bold truncate">
                                                {BANK_INFO.accountNo}
                                                <Button variant="ghost" size="icon" className="size-5 opacity-50 group-hover/item:opacity-100 hover:bg-background" onClick={() => handleCopy(BANK_INFO.accountNo, "Số tài khoản")}>
                                                    <Copy className="size-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center px-4 py-2.5 group/item bg-violet-500/5 rounded-b-xl">
                                            <span className="text-violet-300 shrink-0">Nội dung CK:</span>
                                            <div className="flex items-center gap-2 font-mono font-bold text-violet-400 truncate">
                                                {transferContent}
                                                <Button variant="ghost" size="icon" className="size-5 opacity-50 group-hover/item:opacity-100 text-violet-400 hover:bg-violet-500/20 hover:text-violet-300" onClick={() => handleCopy(transferContent, "Nội dung chuyển khoản")}>
                                                    <Copy className="size-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Mẹo nhỏ */}
                                     <p className="text-[10px] text-muted-foreground/70 text-center px-2 mt-auto pb-2">
                                        Sử dụng App Ngân hàng hoặc Momo để quét mã QR bên trên. Ghi đúng nội dung CK để được duyệt tự động.
                                    </p>

                                </CardContent>
                                
                                <CardFooter className="bg-muted/10 pt-4 mt-auto shrink-0">
                                    <Button
                                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-11 lg:h-12 shadow-[0_4px_14px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center gap-2"
                                        onClick={() => {
                                            setIsProcessing(true)
                                            toast.loading("Đang chờ xác nhận giao dịch...", { duration: 3000 })
                                            setTimeout(() => {
                                                setIsProcessing(false)
                                                toast.success("Thành công! Kim Cương đã về ví.")
                                            }, 3000)
                                        }}
                                        disabled={isProcessing || (isCustom && customAmountNum < MIN_CUSTOM_AMOUNT)}
                                    >
                                        {isProcessing ? "Đang xử lý..." : "Tôi đã thanh toán"} <ArrowRight className="size-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
