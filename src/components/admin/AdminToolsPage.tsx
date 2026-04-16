import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hammer, Sparkles, MoveUp, Crop, Eraser, PenTool } from 'lucide-react';
import AdminTemplatesPage from './AdminTemplatesPage';

export default function AdminToolsPage() {
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
                        Chỉnh Sửa (Xoá vật thể/Vẽ thêm)
                    </TabsTrigger>
                    <TabsTrigger value="style-transfer" className="flex items-center gap-2 data-[state=active]:bg-background">
                        <PenTool className="size-4" />
                        Chuyển Phong Cách
                    </TabsTrigger>
                </TabsList>

                {/* Templates (Kiểu mẫu) - Đã có tính năng hoàn chỉnh */}
                <TabsContent value="templates" className="m-0 p-0 border rounded-xl bg-card overflow-hidden shadow-sm">
                    {/* Bọc trong 1 div để không bị lặp class padding nếu cần, hoặc cứ để AdminTemplatesPage tự lo padding */}
                    <AdminTemplatesPage />
                </TabsContent>

                {/* Các placeholder cho các tools còn lại */}
                <TabsContent value="upscale">
                    <div className="p-12 text-center border-2 border-dashed rounded-xl bg-card/50 flex flex-col items-center justify-center">
                        <MoveUp className="size-8 text-muted-foreground mb-3 opacity-50" />
                        <h3 className="font-medium text-lg">Làm Nét Ảnh (Upscale)</h3>
                        <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                            Công cụ này hiện đang hoạt động tự động không cần cấu hình. Trong tương lai, bạn có thể thiết lập giới hạn, loại model upscale tại đây.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="remove-bg">
                    <div className="p-12 text-center border-2 border-dashed rounded-xl bg-card/50 flex flex-col items-center justify-center">
                        <Crop className="size-8 text-muted-foreground mb-3 opacity-50" />
                        <h3 className="font-medium text-lg">Xóa Phông</h3>
                        <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                            Cấu hình API Xóa Phông hoặc các model nội bộ sẽ được tích hợp tại đây.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="image-edit">
                    <div className="p-12 text-center border-2 border-dashed rounded-xl bg-card/50 flex flex-col items-center justify-center">
                        <Eraser className="size-8 text-muted-foreground mb-3 opacity-50" />
                        <h3 className="font-medium text-lg">Chỉnh Sửa Nâng Cao</h3>
                        <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                            Chưa có tuỳ chỉnh riêng cho công cụ Xoá vật/Inpaint ở thời điểm hiện tại.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="style-transfer">
                    <div className="p-12 text-center border-2 border-dashed rounded-xl bg-card/50 flex flex-col items-center justify-center">
                        <PenTool className="size-8 text-muted-foreground mb-3 opacity-50" />
                        <h3 className="font-medium text-lg">Chuyển Phong Cách</h3>
                        <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                            Các bộ lọc phong cách ảnh tĩnh (Style Filters) sẽ được quản lý tại đây trong thời gian tới.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
