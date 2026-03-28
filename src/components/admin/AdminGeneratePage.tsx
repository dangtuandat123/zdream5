import { useState, useEffect } from 'react';
import { Save, RefreshCw, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { adminApi, type AdminAiModelData } from '@/lib/api';
import { toast } from 'sonner';

interface SettingItem {
    id: number;
    key: string;
    value: string | null;
    group: string;
}

// Metadata cho settings generation
const settingMeta: Record<string, { label: string; description: string; type: 'text' | 'number' | 'select'; options?: { value: string; label: string }[] }> = {
    default_model: { label: 'Model mặc định', description: 'Model được chọn sẵn khi vào trang tạo ảnh', type: 'text' },
    default_gems_per_image: { label: 'Gems mặc định / ảnh', description: 'Giá gems mặc định khi model không có giá riêng', type: 'number' },
    max_images_per_request: { label: 'Số ảnh tối đa / lượt', description: 'Giới hạn số ảnh người dùng có thể tạo cùng lúc', type: 'number' },
    default_aspect_ratio: {
        label: 'Tỉ lệ mặc định', description: 'Tỉ lệ ảnh mặc định khi tạo ảnh', type: 'select',
        options: [
            { value: '1:1', label: '1:1 (Vuông)' },
            { value: '16:9', label: '16:9 (Ngang)' },
            { value: '9:16', label: '9:16 (Dọc)' },
            { value: '4:3', label: '4:3' },
            { value: '3:2', label: '3:2' },
        ],
    },
    default_style: {
        label: 'Phong cách mặc định', description: 'Phong cách ảnh mặc định', type: 'select',
        options: [
            { value: 'photorealistic', label: 'Chân thực' },
            { value: 'anime', label: 'Anime' },
            { value: 'digital-art', label: 'Digital Art' },
            { value: 'oil-painting', label: 'Sơn dầu' },
            { value: 'watercolor', label: 'Màu nước' },
            { value: '3d-render', label: '3D Render' },
            { value: 'pixel-art', label: 'Pixel Art' },
        ],
    },
};

// Settings cho Prompt Designer — render riêng
const PROMPT_DESIGNER_KEYS = ['prompt_designer_enabled', 'prompt_designer_model', 'prompt_designer_system_prompt'];

const promptDesignerMeta: Record<string, { label: string; description: string; type: 'switch' | 'text' | 'textarea' }> = {
    prompt_designer_enabled: { label: 'Bật AI Prompt Designer', description: 'Tự động dùng AI để phân tích ảnh tham chiếu và thiết kế prompt tối ưu trước khi sinh ảnh', type: 'switch' },
    prompt_designer_model: { label: 'Model LLM', description: 'Model text (có vision) dùng để thiết kế prompt. Nên dùng model nhanh và rẻ.', type: 'text' },
    prompt_designer_system_prompt: { label: 'System Prompt', description: 'Hướng dẫn cho AI Prompt Designer. Để trống để dùng mặc định.', type: 'textarea' },
};

// Thứ tự hiển thị (chỉ settings chung, không bao gồm prompt designer)
const SETTING_ORDER = ['default_model', 'default_gems_per_image', 'max_images_per_request', 'default_aspect_ratio', 'default_style'];

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
            const genSettings = allSettings['generation'] ?? [];
            setSettings(genSettings);
            setModels(allModels);
            const initial: Record<string, string> = {};
            genSettings.forEach((s: SettingItem) => { initial[s.key] = s.value ?? ''; });
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

    // Tách settings chung và prompt designer
    const generalSettings = settings.filter(s => !PROMPT_DESIGNER_KEYS.includes(s.key));
    const designerSettings = settings.filter(s => PROMPT_DESIGNER_KEYS.includes(s.key));

    // Sắp xếp settings theo thứ tự cố định
    const sortedSettings = [...generalSettings].sort((a, b) => {
        const ia = SETTING_ORDER.indexOf(a.key);
        const ib = SETTING_ORDER.indexOf(b.key);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    const renderInput = (s: SettingItem) => {
        const meta = settingMeta[s.key];
        const value = edits[s.key] ?? '';

        if (meta?.type === 'number') {
            return (
                <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => setEdits({ ...edits, [s.key]: e.target.value })}
                    className="max-w-sm"
                />
            );
        }

        if (meta?.type === 'select' && meta.options) {
            return (
                <Select value={value} onValueChange={(v) => setEdits({ ...edits, [s.key]: v })}>
                    <SelectTrigger className="max-w-sm">
                        <SelectValue placeholder="Chọn..." />
                    </SelectTrigger>
                    <SelectContent>
                        {meta.options.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        return (
            <Input
                value={value}
                onChange={(e) => setEdits({ ...edits, [s.key]: e.target.value })}
                className="max-w-sm"
            />
        );
    };

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
                <CardContent className="space-y-5">
                    {sortedSettings.map((s) => {
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
                                    <p className="text-xs text-muted-foreground -mt-0.5">{meta.description}</p>
                                )}
                                {renderInput(s)}
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

            {/* AI Prompt Designer */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="size-5 text-violet-500" />
                        <CardTitle className="text-base">AI Prompt Designer</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                        Workflow AI tự động phân tích ảnh tham chiếu, hiểu yêu cầu và thiết kế prompt tối ưu trước khi sinh ảnh.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {designerSettings.length > 0 ? (
                        PROMPT_DESIGNER_KEYS.map(key => {
                            const s = designerSettings.find(ds => ds.key === key);
                            if (!s) return null;
                            const meta = promptDesignerMeta[s.key];
                            if (!meta) return null;
                            const value = edits[s.key] ?? '';

                            return (
                                <div key={s.key} className="space-y-1.5">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <Label className="text-sm font-medium">{meta.label}</Label>
                                        <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0">{s.key}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground -mt-0.5">{meta.description}</p>
                                    {meta.type === 'switch' ? (
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={value === '1'}
                                                onCheckedChange={(v) => setEdits({ ...edits, [s.key]: v ? '1' : '0' })}
                                            />
                                            <span className={`text-xs font-medium ${value === '1' ? 'text-green-500' : 'text-muted-foreground'}`}>
                                                {value === '1' ? 'Đang bật' : 'Đã tắt'}
                                            </span>
                                        </div>
                                    ) : meta.type === 'textarea' ? (
                                        <Textarea
                                            value={value}
                                            onChange={(e) => setEdits({ ...edits, [s.key]: e.target.value })}
                                            placeholder="Để trống để dùng system prompt mặc định..."
                                            rows={8}
                                            className="font-mono text-xs"
                                        />
                                    ) : (
                                        <Input
                                            value={value}
                                            onChange={(e) => setEdits({ ...edits, [s.key]: e.target.value })}
                                            placeholder="google/gemini-2.5-flash"
                                            className="max-w-sm"
                                        />
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Chưa có cài đặt Prompt Designer. Chạy AdminSeeder để khởi tạo.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Models khả dụng */}
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
                                        {m.gems_cost} gems/ảnh
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
