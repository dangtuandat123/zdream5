import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { adminApi, type AdminTemplateData } from '@/lib/api';
import { toast } from 'sonner';

type OptionItem = { value: string; label: string; prompt: string; image: string };

const emptyForm = {
    name: '', category: '', description: '', system_prompt: '', model: 'google/gemini-2.5-flash-preview-image-generation',
    thumbnail: '', sample_images: [] as string[], context_options: [] as OptionItem[], material_options: [] as OptionItem[],
    is_active: true, sort_order: 0,
};

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<AdminTemplateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // JSON input helpers
    const [sampleImagesText, setSampleImagesText] = useState('');
    const [contextOptionsText, setContextOptionsText] = useState('');
    const [materialOptionsText, setMaterialOptionsText] = useState('');

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await adminApi.templates();
            setTemplates(data);
        } catch {
            toast.error('Không thể tải templates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTemplates(); }, []);

    const openCreate = () => {
        setEditId(null);
        setForm(emptyForm);
        setSampleImagesText('');
        setContextOptionsText('');
        setMaterialOptionsText('');
        setDialogOpen(true);
    };

    const openEdit = (t: AdminTemplateData) => {
        setEditId(t.id);
        setForm({
            name: t.name, category: t.category ?? '', description: t.description ?? '',
            system_prompt: t.system_prompt ?? '', model: t.model ?? '',
            thumbnail: t.thumbnail ?? '', sample_images: t.sample_images ?? [],
            context_options: t.context_options ?? [], material_options: t.material_options ?? [],
            is_active: t.is_active, sort_order: t.sort_order ?? 0,
        });
        setSampleImagesText(JSON.stringify(t.sample_images ?? [], null, 2));
        setContextOptionsText(JSON.stringify(t.context_options ?? [], null, 2));
        setMaterialOptionsText(JSON.stringify(t.material_options ?? [], null, 2));
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let sampleImages = form.sample_images;
            let contextOptions = form.context_options;
            let materialOptions = form.material_options;
            try { sampleImages = JSON.parse(sampleImagesText || '[]'); } catch { /* keep default */ }
            try { contextOptions = JSON.parse(contextOptionsText || '[]'); } catch { /* keep default */ }
            try { materialOptions = JSON.parse(materialOptionsText || '[]'); } catch { /* keep default */ }

            const payload = { ...form, sample_images: sampleImages, context_options: contextOptions, material_options: materialOptions };

            if (editId) {
                await adminApi.updateTemplate(editId, payload);
                toast.success('Đã cập nhật template');
            } else {
                await adminApi.createTemplate(payload);
                toast.success('Đã tạo template mới');
            }
            setDialogOpen(false);
            fetchTemplates();
        } catch {
            toast.error('Không thể lưu template');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn chắc muốn xóa template này?')) return;
        try {
            await adminApi.deleteTemplate(id);
            toast.success('Đã xóa template');
            fetchTemplates();
        } catch {
            toast.error('Không thể xóa');
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Quản lý Templates</h1>
                <Button onClick={openCreate} size="sm">
                    <Plus className="size-4 mr-2" />Thêm mới
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><RefreshCw className="size-6 animate-spin text-muted-foreground" /></div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((t) => (
                        <Card key={t.id} className="overflow-hidden">
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <GripVertical className="size-4 text-muted-foreground shrink-0 cursor-grab" />
                                        <div className="min-w-0">
                                            <p className="font-semibold truncate">{t.name}</p>
                                            <p className="text-xs text-muted-foreground">{t.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Badge variant={t.is_active ? 'default' : 'secondary'} className="text-[10px]">
                                            {t.is_active ? 'Active' : 'Off'}
                                        </Badge>
                                    </div>
                                </div>
                                {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
                                <div className="flex items-center gap-1 pt-1">
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEdit(t)}>
                                        <Pencil className="size-3 mr-1" />Sửa
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive" onClick={() => handleDelete(t.id)}>
                                        <Trash2 className="size-3 mr-1" />Xóa
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {templates.length === 0 && (
                        <p className="text-sm text-muted-foreground col-span-full text-center py-8">Chưa có template nào</p>
                    )}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editId ? 'Chỉnh sửa Template' : 'Tạo Template mới'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Tên template *</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Category</Label>
                                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="vd: portrait, landscape..." />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Mô tả</Label>
                            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>System Prompt</Label>
                            <Textarea rows={4} value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Model</Label>
                                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Thumbnail URL</Label>
                                <Input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Sample Images (JSON array of URLs)</Label>
                            <Textarea rows={3} value={sampleImagesText} onChange={(e) => setSampleImagesText(e.target.value)} placeholder='["url1", "url2"]' className="font-mono text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Context Options (JSON array)</Label>
                            <Textarea rows={3} value={contextOptionsText} onChange={(e) => setContextOptionsText(e.target.value)} placeholder='["option1", "option2"]' className="font-mono text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Material Options (JSON array)</Label>
                            <Textarea rows={3} value={materialOptionsText} onChange={(e) => setMaterialOptionsText(e.target.value)} placeholder='["material1", "material2"]' className="font-mono text-xs" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                                <Label>Active</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>Sort order</Label>
                                <Input type="number" className="w-20" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleSave} disabled={saving || !form.name}>
                            {saving ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
