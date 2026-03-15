import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Power, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { adminApi, type AdminAiModelData } from '@/lib/api';
import { toast } from 'sonner';

const emptyForm = {
    name: '', model_id: '', provider: 'openrouter', gems_cost: 1, is_active: true, sort_order: 0, config: {} as Record<string, unknown>,
};

export default function AdminModelsPage() {
    const [models, setModels] = useState<AdminAiModelData[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [configText, setConfigText] = useState('{}');
    const [saving, setSaving] = useState(false);

    const fetchModels = async () => {
        setLoading(true);
        try {
            setModels(await adminApi.models());
        } catch {
            toast.error('Không thể tải models');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchModels(); }, []);

    const openCreate = () => {
        setEditId(null);
        setForm(emptyForm);
        setConfigText('{}');
        setDialogOpen(true);
    };

    const openEdit = (m: AdminAiModelData) => {
        setEditId(m.id);
        setForm({ name: m.name, model_id: m.model_id, provider: m.provider, gems_cost: m.gems_cost, is_active: m.is_active, sort_order: m.sort_order ?? 0, config: m.config ?? {} });
        setConfigText(JSON.stringify(m.config ?? {}, null, 2));
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let config = form.config;
            try { config = JSON.parse(configText); } catch { /* keep */ }
            const payload = { ...form, config };

            if (editId) {
                await adminApi.updateModel(editId, payload);
                toast.success('Đã cập nhật model');
            } else {
                await adminApi.createModel(payload);
                toast.success('Đã thêm model');
            }
            setDialogOpen(false);
            fetchModels();
        } catch {
            toast.error('Không thể lưu model');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await adminApi.toggleModel(id);
            fetchModels();
        } catch {
            toast.error('Không thể toggle');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Xóa model này?')) return;
        try {
            await adminApi.deleteModel(id);
            toast.success('Đã xóa');
            fetchModels();
        } catch {
            toast.error('Không thể xóa');
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Quản lý AI Models</h1>
                <Button onClick={openCreate} size="sm"><Plus className="size-4 mr-2" />Thêm model</Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><RefreshCw className="size-6 animate-spin text-muted-foreground" /></div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-muted-foreground text-left">
                                    <th className="px-4 py-3 font-medium">Tên</th>
                                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Model ID</th>
                                    <th className="px-4 py-3 font-medium text-center">Gems</th>
                                    <th className="px-4 py-3 font-medium text-center">Active</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {models.map((m) => (
                                    <tr key={m.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="px-4 py-3 font-medium">{m.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">{m.model_id}</td>
                                        <td className="px-4 py-3 text-center tabular-nums">{m.gems_cost}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={m.is_active ? 'default' : 'secondary'} className="text-[10px] cursor-pointer" onClick={() => handleToggle(m.id)}>
                                                <Power className="size-3 mr-1" />{m.is_active ? 'On' : 'Off'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEdit(m)}>
                                                    <Pencil className="size-3 mr-1" />Sửa
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive" onClick={() => handleDelete(m.id)}>
                                                    <Trash2 className="size-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {models.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có model nào</td></tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editId ? 'Sửa Model' : 'Thêm Model'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label>Tên hiển thị *</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Model ID *</Label>
                            <Input value={form.model_id} onChange={(e) => setForm({ ...form, model_id: e.target.value })} placeholder="google/gemini-2.5-flash-..." className="font-mono text-xs" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Provider</Label>
                                <Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Gems Cost</Label>
                                <Input type="number" min={0} value={form.gems_cost} onChange={(e) => setForm({ ...form, gems_cost: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Config (JSON)</Label>
                            <Textarea rows={3} value={configText} onChange={(e) => setConfigText(e.target.value)} className="font-mono text-xs" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                            <Label>Active</Label>
                            <Label className="ml-4">Sort</Label>
                            <Input type="number" className="w-20" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleSave} disabled={saving || !form.name || !form.model_id}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
