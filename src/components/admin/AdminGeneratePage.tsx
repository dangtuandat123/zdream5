import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { adminApi, type AdminAiModelData } from '@/lib/api';
import { toast } from 'sonner';

interface SettingItem {
    id: number;
    key: string;
    value: string | null;
    group: string;
}

// Nhãn hiển thị cho từng setting key
const settingLabels: Record<string, { label: string; description: string }> = {
    default_model: { label: 'Model mặc định', description: 'Model được chọn sẵn khi vào trang tạo ảnh' },
    default_gems_per_image: { label: 'Xu mặc định / ảnh', description: 'Giá xu mặc định khi model không có giá riêng' },
    max_images_per_request: { label: 'Số ảnh tối đa / lượt', description: 'Giới hạn số ảnh người dùng có thể tạo cùng lúc' },
};

export default function AdminGeneratePage() {
    const [settings, setSettings] = useState<SettingItem[]>([]);
    const [models, setModels] = useState<AdminAiModelData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [edits, setEdits] = useState<Record<string, string>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allSettings, allModels] = await Promise.all([
                adminApi.settings(),
                adminApi.models(),
            ]);
            // Chỉ lấy settings nhóm "generation"
            const genSettings = allSettings['generation'] ?? [];
            setSettings(genSettings);
            setModels(allModels);
            const initial: Record<string, string> = {};
            genSettings.forEach((s) => { initial[s.key] = s.value ?? ''; });
            setEdits(initial);
        } catch {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const items = settings.map((s) => ({
                key: s.key,
                value: edits[s.key] ?? s.value,
                group: s.group,
            }));
            await adminApi.updateSettings(items);
            toast.success('Đã lưu cài đặt tạo ảnh');
            fetchData();
        } catch {
            toast.error('Không thể lưu');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleModel = async (id: number) => {
        try {
            await adminApi.toggleModel(id);
            const updated = await adminApi.models();
            setModels(updated);
        } catch {
            toast.error('Không thể thay đổi trạng thái');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Cài đặt tạo ảnh</h1>
                <Button onClick={handleSave} disabled={saving} size="sm">
                    <Save className="size-4 mr-2" />
                    {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                </Button>
            </div>

            {/* Cài đặt chung cho tạo ảnh */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Thông số chung</CardTitle>
                    <CardDescription className="text-xs">
                        Cấu hình mặc định cho trang tạo ảnh /app/generate
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {settings.map((s) => {
                        const info = settingLabels[s.key];
                        return (
                            <div key={s.key} className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    {info?.label ?? s.key}
                                </Label>
                                {info?.description && (
                                    <p className="text-xs text-muted-foreground">{info.description}</p>
                                )}
                                <Input
                                    value={edits[s.key] ?? ''}
                                    onChange={(e) => setEdits({ ...edits, [s.key]: e.target.value })}
                                    className="max-w-sm"
                                />
                            </div>
                        );
                    })}
                    {settings.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Chưa có cài đặt nào. Chạy AdminSeeder để khởi tạo.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Models khả dụng trên trang tạo ảnh */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Models khả dụng</CardTitle>
                    <CardDescription className="text-xs">
                        Bật/tắt model hiển thị trên trang tạo ảnh. Quản lý chi tiết tại tab Mô hình AI.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {models.map((m) => (
                            <div key={m.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                <div className="min-w-0">
                                    <p className="font-medium text-sm">{m.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{m.model_id}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Badge variant="secondary" className="text-xs tabular-nums">
                                        {m.gems_cost} xu/ảnh
                                    </Badge>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={m.is_active}
                                            onCheckedChange={() => handleToggleModel(m.id)}
                                        />
                                        <span className={`text-xs font-medium ${m.is_active ? 'text-green-500' : 'text-muted-foreground'}`}>
                                            {m.is_active ? 'Bật' : 'Tắt'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {models.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Chưa có model nào. Thêm tại tab Mô hình AI.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
