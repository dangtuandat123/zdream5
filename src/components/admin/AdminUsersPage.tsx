import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Shield, Gem, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

interface UserItem {
    id: number;
    name: string;
    email: string;
    gems: number;
    level: number;
    avatar: string | null;
    images_count: number;
    created_at: string;
}

const LEVEL_LABELS: Record<number, { label: string; color: string }> = {
    0: { label: 'User', color: 'bg-zinc-500/10 text-zinc-500' },
    1: { label: 'Mod', color: 'bg-blue-500/10 text-blue-500' },
    2: { label: 'Admin', color: 'bg-orange-500/10 text-orange-500' },
    99: { label: 'Super', color: 'bg-red-500/10 text-red-500' },
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Dialogs
    const [levelDialog, setLevelDialog] = useState<UserItem | null>(null);
    const [newLevel, setNewLevel] = useState('0');
    const [gemsDialog, setGemsDialog] = useState<UserItem | null>(null);
    const [gemsAmount, setGemsAmount] = useState('');
    const [gemsType, setGemsType] = useState<'credit' | 'deduct'>('credit');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.users({ page, search: search || undefined });
            setUsers(res.data);
            setLastPage(res.last_page);
            setTotal(res.total);
        } catch {
            toast.error('Không thể tải danh sách users');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Debounce search
    useEffect(() => {
        setPage(1);
    }, [search]);

    const handleUpdateLevel = async () => {
        if (!levelDialog) return;
        try {
            await adminApi.updateUserLevel(levelDialog.id, parseInt(newLevel));
            toast.success('Đã cập nhật level');
            setLevelDialog(null);
            fetchUsers();
        } catch {
            toast.error('Không thể cập nhật level');
        }
    };

    const handleAdjustGems = async () => {
        if (!gemsDialog || !gemsAmount) return;
        try {
            await adminApi.adjustGems(gemsDialog.id, { type: gemsType, amount: parseInt(gemsAmount), description: `Admin ${gemsType}` });
            toast.success(`Đã ${gemsType === 'credit' ? 'cộng' : 'trừ'} ${gemsAmount} gems`);
            setGemsDialog(null);
            setGemsAmount('');
            fetchUsers();
        } catch {
            toast.error('Không thể điều chỉnh gems');
        }
    };

    const levelBadge = (level: number) => {
        const info = LEVEL_LABELS[level] ?? LEVEL_LABELS[0];
        return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${info.color}`}>{info.label}</span>;
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Quản lý Users</h1>
                <Badge variant="secondary">{total} users</Badge>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm tên hoặc email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-muted-foreground text-left">
                                    <th className="px-4 py-3 font-medium">User</th>
                                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                                    <th className="px-4 py-3 font-medium text-center">Level</th>
                                    <th className="px-4 py-3 font-medium text-right">Gems</th>
                                    <th className="px-4 py-3 font-medium text-right hidden md:table-cell">Ảnh</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground"><RefreshCw className="size-4 animate-spin inline mr-2" />Đang tải...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Không tìm thấy user nào</td></tr>
                                ) : users.map((u) => (
                                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                                                    {u.avatar ? <img src={u.avatar} className="size-8 rounded-full object-cover" /> : u.name[0]?.toUpperCase()}
                                                </div>
                                                <span className="font-medium truncate max-w-[120px]">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">{u.email}</td>
                                        <td className="px-4 py-3 text-center">{levelBadge(u.level)}</td>
                                        <td className="px-4 py-3 text-right font-medium tabular-nums">{u.gems}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell tabular-nums">{u.images_count}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setLevelDialog(u); setNewLevel(String(u.level)); }}>
                                                    <Shield className="size-3 mr-1" />Level
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setGemsDialog(u); setGemsAmount(''); setGemsType('credit'); }}>
                                                    <Gem className="size-3 mr-1" />Gems
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                        <ChevronLeft className="size-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Trang {page} / {lastPage}</span>
                    <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}>
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            )}

            {/* Level Dialog */}
            <Dialog open={!!levelDialog} onOpenChange={() => setLevelDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Đổi Level — {levelDialog?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Label>Level mới</Label>
                        <Select value={newLevel} onValueChange={setNewLevel}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">0 — User</SelectItem>
                                <SelectItem value="1">1 — Mod</SelectItem>
                                <SelectItem value="2">2 — Admin</SelectItem>
                                <SelectItem value="99">99 — Super</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLevelDialog(null)}>Hủy</Button>
                        <Button onClick={handleUpdateLevel}>Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Gems Dialog */}
            <Dialog open={!!gemsDialog} onOpenChange={() => setGemsDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Điều chỉnh Gems — {gemsDialog?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Label>Loại</Label>
                        <Select value={gemsType} onValueChange={(v) => setGemsType(v as 'credit' | 'deduct')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="credit">Cộng gems</SelectItem>
                                <SelectItem value="deduct">Trừ gems</SelectItem>
                            </SelectContent>
                        </Select>
                        <Label>Số lượng</Label>
                        <Input type="number" min="1" value={gemsAmount} onChange={(e) => setGemsAmount(e.target.value)} placeholder="Nhập số gems..." />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGemsDialog(null)}>Hủy</Button>
                        <Button onClick={handleAdjustGems} disabled={!gemsAmount || parseInt(gemsAmount) <= 0}>Xác nhận</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
