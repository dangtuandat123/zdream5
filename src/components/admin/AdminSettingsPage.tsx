import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

interface SettingItem {
    id: number;
    key: string;
    value: string | null;
    group: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Record<string, SettingItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [edits, setEdits] = useState<Record<string, string>>({});

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await adminApi.settings();
            setSettings(data);
            // Initialize edits from current values
            const initial: Record<string, string> = {};
            Object.values(data).flat().forEach((s: SettingItem) => {
                initial[s.key] = s.value ?? '';
            });
            setEdits(initial);
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
            const items = Object.values(settings).flat().map((s: SettingItem) => ({
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

    const groupNames: Record<string, string> = {
        general: 'Chung',
        generation: 'Tạo ảnh',
        billing: 'Thanh toán',
        api: 'API',
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
                <Button onClick={handleSave} disabled={saving} size="sm">
                    <Save className="size-4 mr-2" />
                    {saving ? 'Đang lưu...' : 'Lưu tất cả'}
                </Button>
            </div>

            {Object.entries(settings).map(([group, items]) => (
                <Card key={group}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{groupNames[group] ?? group}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(items as SettingItem[]).map((s) => (
                            <div key={s.key} className="space-y-1.5">
                                <Label className="text-xs font-mono text-muted-foreground">{s.key}</Label>
                                <Input
                                    value={edits[s.key] ?? ''}
                                    onChange={(e) => setEdits({ ...edits, [s.key]: e.target.value })}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            {Object.keys(settings).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Chưa có setting nào. Chạy AdminSeeder để khởi tạo.</p>
            )}
        </div>
    );
}
