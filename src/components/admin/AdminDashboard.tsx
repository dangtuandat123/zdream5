import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Image, Gem, CreditCard, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminApi, type AdminDashboardData } from '@/lib/api';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CreditData {
    balance: number;
    usage: number;
    limit: number | null;
}

export default function AdminDashboard() {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [credits, setCredits] = useState<CreditData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [dashRes, credRes] = await Promise.all([
                adminApi.dashboard(),
                adminApi.openrouterCredits().catch(() => null),
            ]);
            setData(dashRes);
            if (credRes) setCredits(credRes);
        } catch {
            toast.error('Không thể tải dữ liệu dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const stats = [
        { label: 'Người dùng', value: data?.overview.total_users ?? 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/app/admin/users' },
        { label: 'Ảnh đã tạo', value: data?.overview.total_images ?? 0, icon: Image, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Xu đã tiêu', value: data?.overview.total_gems_spent ?? 0, icon: Gem, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Tín dụng API', value: credits ? `$${credits.balance.toFixed(2)}` : 'N/A', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Tổng quan</h1>
                <Button variant="outline" size="sm" onClick={fetchData}>
                    <RefreshCw className="size-4 mr-2" />
                    Làm mới
                </Button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <Card key={s.label} className="relative overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center size-10 rounded-xl ${s.bg}`}>
                                    <s.icon className={`size-5 ${s.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                                    <p className="text-xl font-bold tabular-nums">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                                </div>
                            </div>
                            {s.link && (
                                <Link to={s.link} className="absolute inset-0" />
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="size-4 text-blue-500" />
                            Người dùng mới (30 ngày)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={data?.users_over_time ?? []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="size-4 text-green-500" />
                            Ảnh tạo mới (30 ngày)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={data?.images_over_time ?? []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent activity */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Hoạt động gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {(data?.recent_activity ?? []).map((a) => (
                            <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-blue-500/10 text-blue-500">
                                        ảnh
                                    </span>
                                    <span className="truncate text-muted-foreground">{a.user?.name ?? 'Ẩn danh'}</span>
                                    <span className="truncate text-xs text-muted-foreground hidden sm:inline">— {a.prompt?.slice(0, 40)}</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-medium tabular-nums text-orange-500">-{a.gems_cost}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        ))}
                        {(data?.recent_activity ?? []).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Chưa có hoạt động nào</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
