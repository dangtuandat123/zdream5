import { useState, useEffect } from 'react';
import { Save, RefreshCw, Settings2, CreditCard, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SettingItem {
    id: number;
    key: string;
    value: string | null;
    group: string;
}

// Metadata cho từng setting key: label thân thiện, mô tả, loại input
const settingMeta: Record<string, { label: string; description: string; type: 'text' | 'number' | 'boolean' }> = {
    // General
    site_name: { label: 'Tên trang web', description: 'Tên hiển thị của nền tảng', type: 'text' },
    site_description: { label: 'Mô tả trang web', description: 'Mô tả ngắn gọn về nền tảng', type: 'text' },
    new_user_gems: { label: 'Gems tặng user mới', description: 'Số gems tặng khi đăng ký tài khoản', type: 'number' },
    maintenance_mode: { label: 'Chế độ bảo trì', description: 'Bật để tạm ngưng truy cập cho user thường', type: 'boolean' },

    // Billing
    gem_price_vnd: { label: 'Giá 1 gem (VNĐ)', description: 'Tỷ giá quy đổi VNĐ sang gems', type: 'number' },
    min_topup_gems: { label: 'Nạp tối thiểu (gems)', description: 'Số gems tối thiểu cho 1 lần nạp', type: 'number' },
    bank_name: { label: 'Tên ngân hàng', description: 'Ngân hàng nhận chuyển khoản', type: 'text' },
    bank_account: { label: 'Số tài khoản', description: 'Số tài khoản ngân hàng', type: 'text' },
    bank_owner: { label: 'Chủ tài khoản', description: 'Tên chủ tài khoản ngân hàng', type: 'text' },

    // API
    openrouter_timeout: { label: 'Timeout (giây)', description: 'Thời gian chờ tối đa khi gọi OpenRouter API', type: 'number' },
    openrouter_base_url: { label: 'OpenRouter Base URL', description: 'URL gốc của OpenRouter API', type: 'text' },
    max_upload_size_mb: { label: 'Upload tối đa (MB)', description: 'Dung lượng file upload tối đa', type: 'number' },
};

// Cấu hình hiển thị cho từng nhóm setting (không bao gồm generation — đã có tab "Tạo ảnh" riêng)
const groupConfig: Record<string, { label: string; icon: LucideIcon; description: string }> = {
    general: { label: 'Chung', icon: Settings2, description: 'Cài đặt chung của hệ thống' },
    billing: { label: 'Thanh toán', icon: CreditCard, description: 'Cài đặt thanh toán và ngân hàng' },
    api: { label: 'API', icon: Globe, description: 'Cấu hình kết nối API bên ngoài' },
};

// Thứ tự hiển thị cố định cho các group (ẩn generation)
const GROUP_ORDER = ['general', 'billing', 'api'];

// Thứ tự hiển thị cố định cho settings trong mỗi group
const SETTING_ORDER: Record<string, string[]> = {
    general: ['site_name', 'site_description', 'new_user_gems', 'maintenance_mode'],
    billing: ['gem_price_vnd', 'min_topup_gems', 'bank_name', 'bank_account', 'bank_owner'],
    api: ['openrouter_base_url', 'openrouter_timeout', 'max_upload_size_mb'],
};

// Groups bị ẩn khỏi Settings page (đã được quản lý ở tab riêng)
const HIDDEN_GROUPS = ['generation'];

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Record<string, SettingItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [edits, setEdits] = useState<Record<string, string>>({});
    const [activeGroup, setActiveGroup] = useState('general');

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await adminApi.settings();
            // Loại bỏ groups đã có tab riêng
            const filtered: Record<string, SettingItem[]> = {};
            for (const [group, items] of Object.entries(data)) {
                if (!HIDDEN_GROUPS.includes(group)) {
                    filtered[group] = items as SettingItem[];
                }
            }
            setSettings(filtered);
            const initial: Record<string, string> = {};
            Object.values(filtered).flat().forEach((s: SettingItem) => {
                initial[s.key] = s.value ?? '';
            });
            setEdits(initial);
        } catch {
            toast.error('Không thể tải settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const items = (settings[activeGroup] ?? []).map((s: SettingItem) => ({
                key: s.key,
                value: edits[s.key] ?? s.value,
                group: s.group,
            }));
            await adminApi.updateSettings(items);
            toast.success('Đã lưu cài đặt');
            // Cập nhật state local cho group vừa save (không gọi fetchData để giữ edits ở groups khác)
            setSettings(prev => ({
                ...prev,
                [activeGroup]: (prev[activeGroup] ?? []).map((s) => ({
                    ...s,
                    value: edits[s.key] ?? s.value,
                })),
            }));
        } catch {
            toast.error('Không thể lưu');
        } finally {
            setSaving(false);
        }
    };

    const updateEdit = (key: string, value: string) => {
        setEdits(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Sắp xếp groups theo thứ tự cố định
    const groups = GROUP_ORDER.filter(g => settings[g]?.length > 0);
    // Thêm bất kỳ group nào trong data nhưng không nằm trong ORDER
    Object.keys(settings).forEach(g => {
        if (!groups.includes(g) && settings[g]?.length > 0) groups.push(g);
    });

    // Sắp xếp settings trong group hiện tại theo thứ tự cố định
    const sortSettings = (items: SettingItem[], group: string): SettingItem[] => {
        const order = SETTING_ORDER[group];
        if (!order) return items;
        return [...items].sort((a, b) => {
            const ia = order.indexOf(a.key);
            const ib = order.indexOf(b.key);
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });
    };

    const activeSettings = sortSettings(settings[activeGroup] ?? [], activeGroup);

    if (groups.length === 0) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Cài đặt hệ thống</h1>
                <p className="text-sm text-muted-foreground text-center py-8">
                    Chưa có setting nào. Chạy AdminSeeder để khởi tạo.
                </p>
            </div>
        );
    }

    const getGroupConfig = (group: string) =>
        groupConfig[group] ?? { label: group, icon: Settings2, description: '' };

    // Render input phù hợp cho từng setting
    const renderInput = (s: SettingItem) => {
        const meta = settingMeta[s.key];
        const value = edits[s.key] ?? '';

        if (!meta || meta.type === 'text') {
            return (
                <Input
                    value={value}
                    onChange={(e) => updateEdit(s.key, e.target.value)}
                    placeholder={meta?.label ?? s.key}
                />
            );
        }

        if (meta.type === 'number') {
            return (
                <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => updateEdit(s.key, e.target.value)}
                    placeholder="0"
                />
            );
        }

        if (meta.type === 'boolean') {
            return (
                <div className="flex items-center gap-3 pt-1">
                    <Switch
                        checked={value === '1' || value === 'true'}
                        onCheckedChange={(checked) => updateEdit(s.key, checked ? '1' : '0')}
                    />
                    <span className="text-sm text-muted-foreground">
                        {value === '1' || value === 'true' ? 'Đang bật' : 'Đang tắt'}
                    </span>
                </div>
            );
        }

        return (
            <Input
                value={value}
                onChange={(e) => updateEdit(s.key, e.target.value)}
            />
        );
    };

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Mobile: thanh tab ngang cuộn được */}
                <ScrollArea className="w-full md:hidden">
                    <nav className="flex items-center gap-1 pb-2">
                        {groups.map((group) => {
                            const cfg = getGroupConfig(group);
                            const Icon = cfg.icon;
                            return (
                                <button key={group} onClick={() => setActiveGroup(group)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                                        activeGroup === group
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}>
                                    <Icon className="size-4" />{cfg.label}
                                </button>
                            );
                        })}
                    </nav>
                    <ScrollBar orientation="horizontal" className="h-0" />
                </ScrollArea>

                {/* Desktop: sidebar dọc */}
                <nav className="hidden md:flex md:w-52 shrink-0 flex-col gap-1">
                    {groups.map((group) => {
                        const cfg = getGroupConfig(group);
                        const Icon = cfg.icon;
                        const count = (settings[group] ?? []).length;
                        return (
                            <button key={group} onClick={() => setActiveGroup(group)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors",
                                    activeGroup === group
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}>
                                <Icon className="size-4 shrink-0" />
                                <div className="min-w-0">
                                    <p className="truncate">{cfg.label}</p>
                                    <p className={cn(
                                        "text-xs truncate",
                                        activeGroup === group ? "text-primary-foreground/70" : "text-muted-foreground/70"
                                    )}>{count} mục</p>
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* Bảng setting của nhóm đang chọn */}
                <div className="flex-1 min-w-0">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">{getGroupConfig(activeGroup).label}</CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                        {getGroupConfig(activeGroup).description}
                                    </CardDescription>
                                </div>
                                <Button onClick={handleSave} disabled={saving} size="sm">
                                    <Save className="size-4 mr-2" />
                                    {saving ? 'Đang lưu...' : 'Lưu'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {activeSettings.map((s) => {
                                const meta = settingMeta[s.key];
                                return (
                                    <div key={s.key} className="space-y-1.5">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <Label className="text-sm font-medium">
                                                {meta?.label ?? s.key}
                                            </Label>
                                            <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">
                                                {s.key}
                                            </span>
                                        </div>
                                        {meta?.description && (
                                            <p className="text-xs text-muted-foreground -mt-0.5">
                                                {meta.description}
                                            </p>
                                        )}
                                        {renderInput(s)}
                                    </div>
                                );
                            })}
                            {activeSettings.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Không có cài đặt nào trong nhóm này
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
