import { useState, useEffect } from 'react';
import { Save, RefreshCw, Settings2, Image, CreditCard, Globe, SwatchBook } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// Cấu hình hiển thị cho từng nhóm setting
const groupConfig: Record<string, { label: string; icon: LucideIcon; description: string }> = {
    general: { label: 'Chung', icon: Settings2, description: 'Cài đặt chung của hệ thống' },
    generation: { label: 'Tạo ảnh', icon: Image, description: 'Cấu hình liên quan đến tạo ảnh AI' },
    templates: { label: 'Kiểu mẫu', icon: SwatchBook, description: 'Cài đặt mặc định cho kiểu mẫu' },
    billing: { label: 'Thanh toán', icon: CreditCard, description: 'Cài đặt xu và thanh toán' },
    api: { label: 'API', icon: Globe, description: 'Cấu hình kết nối API bên ngoài' },
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Record<string, SettingItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [edits, setEdits] = useState<Record<string, string>>({});
    const [activeGroup, setActiveGroup] = useState('');

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await adminApi.settings();
            setSettings(data);
            const initial: Record<string, string> = {};
            Object.values(data).flat().forEach((s: SettingItem) => {
                initial[s.key] = s.value ?? '';
            });
            setEdits(initial);
            // Chọn nhóm đầu tiên nếu chưa chọn
            const groups = Object.keys(data);
            if (groups.length > 0 && !groups.includes(activeGroup)) {
                setActiveGroup(groups[0]);
            }
        } catch {
            toast.error('Không thể tải settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Chỉ lưu nhóm đang chọn
            const items = (settings[activeGroup] ?? []).map((s: SettingItem) => ({
                key: s.key,
                value: edits[s.key] ?? s.value,
                group: s.group,
            }));
            await adminApi.updateSettings(items);
            toast.success('Đã lưu cài đặt');
            fetchSettings();
        } catch {
            toast.error('Không thể lưu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const groups = Object.keys(settings);
    const activeSettings = settings[activeGroup] ?? [];

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
                        <CardContent className="space-y-4">
                            {activeSettings.map((s) => (
                                <div key={s.key} className="space-y-1.5">
                                    <Label className="text-xs font-mono text-muted-foreground">{s.key}</Label>
                                    <Input
                                        value={edits[s.key] ?? ''}
                                        onChange={(e) => setEdits({ ...edits, [s.key]: e.target.value })}
                                    />
                                </div>
                            ))}
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
