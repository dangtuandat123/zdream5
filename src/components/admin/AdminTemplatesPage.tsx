import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, GripVertical, RefreshCw, Upload, X, ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { adminApi, type AdminTemplateData, type AdminAiModelData, type EffectGroup, type EffectOption } from '@/lib/api';
import { toast } from 'sonner';

// === Image Upload Component ===
function ImageUploader({ value, onChange, className }: { value: string; onChange: (url: string) => void; className?: string }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file: File) => {
        setUploading(true);
        try {
            const res = await adminApi.uploadTemplateImage(file);
            onChange(res.url);
        } catch {
            toast.error('Upload ảnh thất bại');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`relative ${className ?? ''}`}>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
            {value ? (
                <div className="relative group rounded-lg overflow-hidden border">
                    <img src={value} alt="" className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>Đổi</Button>
                        <Button size="sm" variant="destructive" onClick={() => onChange('')}><X className="size-3" /></Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-foreground transition"
                >
                    {uploading ? <RefreshCw className="size-5 animate-spin" /> : <Upload className="size-5" />}
                    <span className="text-xs">{uploading ? 'Đang tải...' : 'Tải ảnh lên'}</span>
                </button>
            )}
        </div>
    );
}

// === Small image uploader for effect options ===
function SmallImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file: File) => {
        setUploading(true);
        try {
            const res = await adminApi.uploadTemplateImage(file);
            onChange(res.url);
        } catch {
            toast.error('Upload ảnh thất bại');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="shrink-0">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
            {value ? (
                <div className="relative group size-16 rounded-md overflow-hidden border">
                    <img src={value} alt="" className="size-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Button size="icon" variant="destructive" className="size-6" onClick={() => onChange('')}><X className="size-3" /></Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="size-16 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground hover:border-primary/50 transition"
                >
                    {uploading ? <RefreshCw className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
                </button>
            )}
        </div>
    );
}

// === Effect Group Builder ===
function EffectGroupBuilder({ groups, onChange }: { groups: EffectGroup[]; onChange: (groups: EffectGroup[]) => void }) {
    const addGroup = () => {
        onChange([...groups, { name: '', options: [{ value: '', label: '', prompt: '', image: '' }] }]);
    };

    const removeGroup = (gi: number) => {
        onChange(groups.filter((_, i) => i !== gi));
    };

    const updateGroupName = (gi: number, name: string) => {
        const updated = [...groups];
        updated[gi] = { ...updated[gi], name };
        onChange(updated);
    };

    const addOption = (gi: number) => {
        const updated = [...groups];
        updated[gi] = { ...updated[gi], options: [...updated[gi].options, { value: '', label: '', prompt: '', image: '' }] };
        onChange(updated);
    };

    const removeOption = (gi: number, oi: number) => {
        const updated = [...groups];
        updated[gi] = { ...updated[gi], options: updated[gi].options.filter((_, i) => i !== oi) };
        onChange(updated);
    };

    const updateOption = (gi: number, oi: number, field: keyof EffectOption, value: string) => {
        const updated = [...groups];
        const opts = [...updated[gi].options];
        opts[oi] = { ...opts[oi], [field]: value };
        // Auto-fill value from label if empty
        if (field === 'label' && !opts[oi].value) {
            opts[oi].value = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        updated[gi] = { ...updated[gi], options: opts };
        onChange(updated);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Nhóm hiệu ứng</Label>
                <Button type="button" size="sm" variant="outline" onClick={addGroup}>
                    <Plus className="size-3 mr-1" />Thêm nhóm
                </Button>
            </div>

            {groups.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                    Chưa có nhóm hiệu ứng nào. Nhấn "Thêm nhóm" để tạo (vd: Bối cảnh, Chất liệu, ...)
                </p>
            )}

            <Accordion type="multiple" className="space-y-2">
                {groups.map((group, gi) => (
                    <AccordionItem key={gi} value={`group-${gi}`} className="border rounded-lg px-3">
                        <AccordionTrigger className="py-2 hover:no-underline">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-sm font-medium truncate">{group.name || `Nhóm ${gi + 1}`}</span>
                                <Badge variant="secondary" className="text-[10px]">{group.options.length} tuỳ chọn</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Tên nhóm (vd: Bối cảnh, Chất liệu...)"
                                    value={group.name}
                                    onChange={(e) => updateGroupName(gi, e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="button" size="sm" variant="destructive" onClick={() => removeGroup(gi)}>
                                    <Trash2 className="size-3" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {group.options.map((opt, oi) => (
                                    <div key={oi} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                                        <SmallImageUploader value={opt.image} onChange={(url) => updateOption(gi, oi, 'image', url)} />
                                        <div className="flex-1 grid grid-cols-2 gap-1.5">
                                            <Input placeholder="Tên hiển thị" value={opt.label} onChange={(e) => updateOption(gi, oi, 'label', e.target.value)} className="text-xs h-8" />
                                            <Input placeholder="Giá trị (value)" value={opt.value} onChange={(e) => updateOption(gi, oi, 'value', e.target.value)} className="text-xs h-8" />
                                            <Input placeholder="Prompt gợi ý" value={opt.prompt} onChange={(e) => updateOption(gi, oi, 'prompt', e.target.value)} className="text-xs h-8 col-span-2" />
                                        </div>
                                        <Button type="button" size="icon" variant="ghost" className="size-7 shrink-0 text-destructive" onClick={() => removeOption(gi, oi)}>
                                            <X className="size-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button type="button" size="sm" variant="outline" className="w-full" onClick={() => addOption(gi)}>
                                <Plus className="size-3 mr-1" />Thêm tuỳ chọn
                            </Button>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

// === Main Page ===
const emptyForm = {
    name: '', category: '', description: '', system_prompt: '', model: 'google/gemini-2.5-flash-preview-image-generation',
    thumbnail: '', effect_groups: [] as EffectGroup[],
    is_active: true, sort_order: 0,
};

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<AdminTemplateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [availableModels, setAvailableModels] = useState<AdminAiModelData[]>([]);

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
    useEffect(() => { adminApi.models().then(setAvailableModels).catch(() => {}); }, []);

    const openCreate = () => {
        setEditId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (t: AdminTemplateData) => {
        setEditId(t.id);
        setForm({
            name: t.name, category: t.category ?? '', description: t.description ?? '',
            system_prompt: t.system_prompt ?? '', model: t.model ?? '',
            thumbnail: t.thumbnail ?? '', effect_groups: t.effect_groups ?? [],
            is_active: t.is_active, sort_order: t.sort_order ?? 0,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { ...form };
            if (editId) {
                await adminApi.updateTemplate(editId, payload);
                toast.success('Đã cập nhật kiểu mẫu');
            } else {
                await adminApi.createTemplate(payload);
                toast.success('Đã tạo kiểu mẫu mới');
            }
            setDialogOpen(false);
            fetchTemplates();
        } catch {
            toast.error('Không thể lưu kiểu mẫu');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn chắc muốn xóa kiểu mẫu này?')) return;
        try {
            await adminApi.deleteTemplate(id);
            toast.success('Đã xóa kiểu mẫu');
            fetchTemplates();
        } catch {
            toast.error('Không thể xóa');
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Quản lý kiểu mẫu</h1>
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
                            {t.thumbnail && (
                                <img src={t.thumbnail} alt={t.name} className="w-full h-32 object-cover" />
                            )}
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
                                            {t.is_active ? 'Đang bật' : 'Đã tắt'}
                                        </Badge>
                                    </div>
                                </div>
                                {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
                                {t.effect_groups && t.effect_groups.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                        {t.effect_groups.map((g, i) => (
                                            <Badge key={i} variant="outline" className="text-[10px]">{g.name}: {g.options.length}</Badge>
                                        ))}
                                    </div>
                                )}
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
                        <p className="text-sm text-muted-foreground col-span-full text-center py-8">Chưa có kiểu mẫu nào</p>
                    )}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editId ? 'Chỉnh sửa kiểu mẫu' : 'Tạo kiểu mẫu mới'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Basic info */}
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Tên kiểu mẫu *</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Danh mục</Label>
                                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="vd: Chân dung, Phong cảnh..." />
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

                        {/* Model + Thumbnail */}
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Mô hình AI</Label>
                                <Select value={form.model} onValueChange={(v) => setForm({ ...form, model: v })}>
                                    <SelectTrigger><SelectValue placeholder="Chọn mô hình" /></SelectTrigger>
                                    <SelectContent>
                                        {availableModels.map((m) => (
                                            <SelectItem key={m.model_id} value={m.model_id}>
                                                {m.name} <span className="text-muted-foreground text-xs ml-1">({m.model_id})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Ảnh đại diện (ảnh mẫu)</Label>
                                <ImageUploader value={form.thumbnail} onChange={(url) => setForm({ ...form, thumbnail: url })} />
                            </div>
                        </div>

                        {/* Effect Groups */}
                        <EffectGroupBuilder
                            groups={form.effect_groups}
                            onChange={(groups) => setForm({ ...form, effect_groups: groups })}
                        />

                        {/* Active + Sort */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                                <Label>Kích hoạt</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>Thứ tự</Label>
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
