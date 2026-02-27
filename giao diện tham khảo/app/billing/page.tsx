"use client"

import { useState, useEffect } from "react"
import { CreditCard, Gem, ArrowUpRight, History, Loader2 } from "lucide-react"
import { VietQRModal } from "@/components/vietqr-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/api"
import { toast } from "sonner"

const diamondPackages = [
    { name: "Starter", diamonds: 50, price: "49.000₫", numericPrice: 49000, bonus: "" },
    { name: "Popular", diamonds: 120, price: "99.000₫", numericPrice: 99000, bonus: "+20%" },
    { name: "Best Value", diamonds: 280, price: "199.000₫", numericPrice: 199000, bonus: "+40%" },
]

export default function BillingPage() {
    const { user, fetchUser } = useAuth()
    const [selectedPackage, setSelectedPackage] = useState<any>(null)
    const [customDiamonds, setCustomDiamonds] = useState<number>(20)
    const [transactions, setTransactions] = useState<any[]>([])
    const [isLoadingTx, setIsLoadingTx] = useState(true)
    const [isCreatingOrder, setIsCreatingOrder] = useState(false)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/transactions')
                setTransactions(res.data)
            } catch (error) {
                console.error("Failed to load transactions", error)
            } finally {
                setIsLoadingTx(false)
            }
        }
        fetchHistory()
    }, [])

    const handleSelectPackage = async (pkg: any) => {
        setIsCreatingOrder(true)
        try {
            const res = await api.post('/transactions/create-order', {
                diamonds: pkg.diamonds,
                amount: pkg.numericPrice
            })
            setSelectedPackage({
                ...pkg,
                order_id: res.data.order_id
            })
        } catch (error) {
            console.error("Order creation failed", error)
            toast.error("Không thể tạo đơn hàng lúc này. Vui lòng thử lại.")
        } finally {
            setIsCreatingOrder(false)
        }
    }

    return (
        <div className="flex-1 overflow-y-scroll overflow-x-hidden">
            <div className="p-3 sm:p-4 md:p-6 max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)] mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        Nạp Kim Cương
                    </h1>
                    <p className="text-muted-foreground text-sm animate-in fade-in slide-in-from-bottom-5 duration-500 delay-75 fill-mode-both">
                        Quản lý số dư và nạp thêm kim cương để tiếp tục sáng tạo.
                    </p>
                </div>
                <Separator className="animate-in fade-in duration-700" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">

                    {/* Left Column: Balance & Top-up */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-card/40 backdrop-blur-sm border-primary/20 shadow-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50" />
                            <CardContent className="p-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="font-semibold text-lg">Số dư hiện tại</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Bạn có thể tạo thêm 12 logo với số kim cương này.</p>
                                </div>
                                <div className="text-left sm:text-right flex items-center gap-3 bg-background/50 p-4 rounded-2xl border border-primary/20 shadow-inner">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                                        <Gem className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-4xl text-foreground font-[family-name:var(--font-heading)] leading-none">
                                            {user?.diamonds ?? 0}
                                        </p>
                                        <p className="text-xs text-primary font-medium mt-1">Kim cương</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-sm border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    Chọn gói nạp
                                </CardTitle>
                                <CardDescription>Kim cương không bao giờ hết hạn. Thanh toán an toàn qua VNPay, Momo, hoặc Thẻ quốc tế.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {diamondPackages.map((pkg) => (
                                        <div
                                            key={pkg.name}
                                            className={cn(
                                                "relative p-5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer",
                                                pkg.name === "Popular"
                                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-100 sm:scale-105 z-10"
                                                    : "border-border/50 bg-background/50 hover:border-primary/50"
                                            )}
                                        >
                                            {pkg.bonus && (
                                                <span className="absolute -top-3 -right-2 px-2.5 py-1 text-[10px] font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-full shadow-sm">
                                                    {pkg.bonus}
                                                </span>
                                            )}
                                            {pkg.name === "Popular" && (
                                                <Badge className="absolute -top-3 bg-primary text-primary-foreground border-none text-[10px]">
                                                    Khuyên dùng
                                                </Badge>
                                            )}

                                            <p className="text-sm text-muted-foreground font-medium mb-3 mt-2">{pkg.name}</p>

                                            <div className="flex items-center gap-1.5 mb-4">
                                                <Gem className={cn("h-5 w-5", pkg.name === "Popular" ? "text-primary drop-shadow-sm" : "text-muted-foreground")} />
                                                <p className={cn("font-extrabold text-2xl font-[family-name:var(--font-heading)]", pkg.name === "Popular" ? "text-foreground" : "text-foreground/80")}>
                                                    {pkg.diamonds}
                                                </p>
                                            </div>

                                            <Button
                                                variant={pkg.name === "Popular" ? "default" : "outline"}
                                                className="w-full h-10 font-bold cursor-pointer"
                                                onClick={() => handleSelectPackage(pkg)}
                                                disabled={isCreatingOrder}
                                            >
                                                {pkg.price}
                                            </Button>
                                        </div>
                                    ))}

                                    {/* Custom Package */}
                                    <div className="relative p-5 rounded-xl border border-border/50 bg-background/50 flex flex-col items-center text-center transition-all hover:border-primary/50">
                                        <p className="text-sm text-muted-foreground font-medium mb-3 mt-2">Tùy chọn</p>

                                        <div className="flex items-center justify-center gap-1.5 mb-4 border-b border-border hover:border-primary/50 transition-colors pb-1 px-4 group">
                                            <Gem className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                type="number"
                                                min={20}
                                                value={customDiamonds || ""}
                                                onChange={(e) => setCustomDiamonds(parseInt(e.target.value) || 0)}
                                                className="w-16 sm:w-20 h-8 text-2xl font-extrabold font-[family-name:var(--font-heading)] bg-transparent border-0 ring-0 focus-visible:ring-0 p-0 text-center text-foreground/80 focus:text-foreground shadow-none"
                                            />
                                        </div>

                                        <Button
                                            variant="outline"
                                            className="w-full h-10 font-bold cursor-pointer"
                                            disabled={customDiamonds < 20 || isCreatingOrder}
                                            onClick={() => handleSelectPackage({
                                                name: "Tùy chọn",
                                                diamonds: customDiamonds,
                                                numericPrice: customDiamonds * 1000,
                                                price: new Intl.NumberFormat('vi-VN').format(customDiamonds * 1000) + '₫'
                                            })}
                                        >
                                            {customDiamonds >= 20 ? (new Intl.NumberFormat('vi-VN').format(customDiamonds * 1000) + '₫') : "Tối thiểu 20"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: History */}
                    <div className="lg:col-span-1">
                        <Card className="bg-card/40 backdrop-blur-sm border-border/60 shadow-sm h-full flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <History className="h-4 w-4 text-muted-foreground" />
                                    Lịch sử giao dịch
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden flex flex-col">
                                {isLoadingTx ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
                                        <History className="h-8 w-8 mb-2 opacity-20" />
                                        <p>Chưa có giao dịch nào.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pr-2 overflow-y-auto">
                                        {transactions.map((tx) => (
                                            <div key={tx.id} className="flex items-start justify-between gap-2 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="text-sm font-medium">{tx.description}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {new Date(tx.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <p className={cn(
                                                        "text-sm font-bold flex items-center gap-1",
                                                        tx.amount > 0 ? "text-emerald-500" : "text-foreground"
                                                    )}>
                                                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} <Gem className="h-3 w-3" />
                                                    </p>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[9px] mt-1 px-1.5",
                                                        tx.status === 'completed' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                                                        tx.status === 'pending' && "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                                    )}>
                                                        {tx.status === 'completed' ? 'Thành công' : tx.status === 'pending' ? 'Chờ thanh toán' : tx.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Button variant="ghost" className="w-full mt-4 text-xs text-muted-foreground h-8">
                                    Xem tất cả
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <VietQRModal
                isOpen={!!selectedPackage}
                onClose={() => {
                    setSelectedPackage(null)
                    fetchUser() // Refresh balance in case they paid
                }}
                packageInfo={selectedPackage}
            />
        </div>
    )
}
