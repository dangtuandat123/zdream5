import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hammer, Sparkles, MoveUp, Crop, Eraser, PenTool, Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import AdminTemplatesPage from './AdminTemplatesPage';

interface ToolSetting {
    id: string;
    label: string;
    desc: string;
    keyBase: string; // e.g. "upscale", "remove-bg"
}

const TOOLS_CONFIG: ToolSetting[] = [
    { id: 'upscale', label: 'Làm Nét Ảnh (Upscale)', desc: 'Cấu hình chi phí cho công cụ nâng cấp độ phân giải.', keyBase: 'upscale' },
    { id: 'remove-bg', label: 'Xóa Phông (Remove BG)', desc: 'Cấu hình chi phí cho công cụ tách nền ảnh tự động.', keyBase: 'remove-bg' },
    { id: 'image-edit', label: 'Chỉnh Sửa Nâng Cao', desc: 'Tuỳ chỉnh cho công cụ Xoá vật thể và Inpainting.', keyBase: 'image-edit' },
    { id: 'style-transfer', label: 'Chuyển Phong Cách', desc: 'Thiết lập cho công cụ biến đổi phong cách ảnh (Style Transfer).', keyBase: 'style-transfer' },
    { id: 'extend', label: 'Mở Rộng Ảnh (Outpaint)', desc: 'Thiết lập chi phí cho tính năng vẽ tiếp viền ngoài.', keyBase: 'extend' },
    { id: 'image-to-prompt', label: 'Phân Tích Ảnh (Img2Prompt)', desc: 'Công cụ trích xuất Prompt từ hình ảnh.', keyBase: 'image-to-prompt' },
];

export default function AdminToolsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const allSettings = await adminApi.settings();
            const toolsSettings = allSettings['tools'] ?? [];
            const initial: Record<string, string> = {};
            toolsSettings.forEach((s: any) => { initial[s.key] = s.value ?? ''; });
            setSettings(initial);
        } catch {
            toast.error('Không thể tải cấu hình công cụ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async (keyBase: string) => {
        setSaving(true);
        try {
            // Save enabled switch and gems cost for this specific tool
            const items = [
                { key: `tool_${keyBase}_enabled`, value: settings[`tool_${keyBase}_enabled`] ?? '1', group: 'tools' },
                { key: `tool_${keyBase}_gems_cost`, value: settings[`tool_${keyBase}_gems_cost`] ?? '2', group: 'tools' },
            ];
            await adminApi.updateSettings(items);
            toast.success('Đã lưu cấu hình công cụ');
            fetchData();
        } catch {
            toast.error('Không thể lưu cấu hình');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Hammer className="size-6 text-primary" />
                    Quản lý Công cụ AI
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Cấu hình và tuỳ chỉnh dữ liệu cho các công cụ AI (Kiểu mẫu, Làm nét, Xoá nền...)
                </p>
            </div>

            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="flex flex-wrap h-auto w-full justify-start p-1 mb-4 gap-1 bg-muted/50">
                    <TabsTrigger value="templates" className="flex items-center gap-2 data-[state=active]:bg-background">
                        <Sparkles className="size-4" />
                        Kiểu Mẫu
                    </TabsTrigger>
                    <TabsTrigger value="upscale" className="flex items-center gap-2 data-[state=active]:bg-background">
                        <MoveUp className="size-4" />
                        Làm Nét Ảnh
                    </TabsTrigger>
                    <TabsTrigger value="remove-bg" className="flex items-center gap-2 data-[state=active]:bg-background">
                        <Crop className="size-4" />
                        Xóa Phông
                    </TabsTrigger>
                    <TabsTrigger value="image-edit" className="flex items-center gap-2 data-[state=active]:bg-background">
                        <Eraser className="size-4" />
                        Chỉnh Sửa (Xoá vật/Inpaint)
                    </TabsTrigger>
                    <TabsTrigger value="style-transfer" className="flex items-center gap-2 data-[state=active]:bg-background">
                        <PenTool className="size-4" />
                        Chuyển Phong Cách
                    </TabsTrigger>
                    <TabsTrigger value="other-tools" className="flex items-center gap-2 data-[state=active]:bg-background">
                        <Hammer className="size-4" />
                        Công cụ khác
                    </TabsTrigger>
                </TabsList>

                {/* --- TEMPLATES --- */}
                <TabsContent value="templates" className="m-0 p-0 border rounded-xl bg-card overflow-hidden shadow-sm">
                    <AdminTemplatesPage />
                </TabsContent>

                {/* --- CHUNG CHO CÁC TOOLS --- */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {TOOLS_CONFIG.map(tool => {
                            // Tools chính được chia tab
                            if (['extend', 'image-to-prompt'].includes(tool.id)) return null;

                            return (
                                <TabsContent key={tool.id} value={tool.id} className="m-0 space-y-4">
                                    <Card>
                                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                            <div>
                                                <CardTitle className="text-lg">{tool.label}</CardTitle>
                                                <CardDescription>{tool.desc}</CardDescription>
                                            </div>
                                            <Button onClick={() => handleSave(tool.keyBase)} disabled={saving} size="sm">
                                                <Save className="size-4 mr-2" />
                                                {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="space-y-5">
                                            <div className="flex items-center justify-between gap-2 p-4 border rounded-lg bg-muted/30">
                                                <div className="space-y-0.5">
                                                    <Label className="text-base font-medium">Trạng thái hoạt động</Label>
                                                    <p className="text-xs text-muted-foreground">Cho phép người dùng sử dụng công cụ này.</p>
                                                </div>
                                                <Switch
                                                    checked={(settings[`tool_${tool.keyBase}_enabled`] ?? '1') === '1'}
                                                    onCheckedChange={(v) => updateSetting(`tool_${tool.keyBase}_enabled`, v ? '1' : '0')}
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label>Chi phí cơ bản (Gems / Lượt)</Label>
                                                <Input 
                                                    type="number" 
                                                    min="0"
                                                    value={settings[`tool_${tool.keyBase}_gems_cost`] ?? '2'} 
                                                    onChange={(e) => updateSetting(`tool_${tool.keyBase}_gems_cost`, e.target.value)} 
                                                    className="max-w-sm"
                                                />
                                                <p className="text-[11px] text-muted-foreground">Cấu hình xu mặc định hệ thống sẽ trừ vào tài khoản người dùng khi dùng công cụ này.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            );
                        })}

                        {/* --- CÔNG CỤ KHÁC (Gộp chung) --- */}
                        <TabsContent value="other-tools" className="m-0 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {TOOLS_CONFIG.filter(t => ['extend', 'image-to-prompt'].includes(t.id)).map(tool => (
                                    <Card key={tool.id}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">{tool.label}</CardTitle>
                                            <CardDescription className="text-xs">{tool.desc}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label className="text-sm font-medium">Trạng thái</Label>
                                                <Switch
                                                    checked={(settings[`tool_${tool.keyBase}_enabled`] ?? '1') === '1'}
                                                    onCheckedChange={(v) => updateSetting(`tool_${tool.keyBase}_enabled`, v ? '1' : '0')}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-sm">Chi phí (Gems)</Label>
                                                <Input 
                                                    type="number" 
                                                    min="0"
                                                    value={settings[`tool_${tool.keyBase}_gems_cost`] ?? '1'} 
                                                    onChange={(e) => updateSetting(`tool_${tool.keyBase}_gems_cost`, e.target.value)} 
                                                />
                                            </div>
                                            <Button onClick={() => handleSave(tool.keyBase)} disabled={saving} size="sm" variant="secondary" className="w-full mt-2">
                                                <Save className="size-3.5 mr-2" /> Lưu
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
