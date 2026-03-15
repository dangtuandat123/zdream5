<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTemplateRequest;
use App\Http\Requests\Admin\UpdateTemplateRequest;
use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminTemplateController extends Controller
{
    /**
     * Danh sách tất cả templates (kể cả inactive).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Template::orderByDesc('created_at');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        return response()->json($query->get());
    }

    /**
     * Tạo template mới.
     */
    public function store(StoreTemplateRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);
        $data['created_by'] = $request->user()->id;

        // Đảm bảo slug unique
        $originalSlug = $data['slug'];
        $counter = 1;
        while (Template::withTrashed()->where('slug', $data['slug'])->exists()) {
            $data['slug'] = $originalSlug . '-' . $counter++;
        }

        $template = Template::create($data);

        return response()->json([
            'message' => 'Tạo template thành công.',
            'data' => $template,
        ], 201);
    }

    /**
     * Chi tiết template.
     */
    public function show(int $id): JsonResponse
    {
        $template = Template::findOrFail($id);

        return response()->json($template);
    }

    /**
     * Cập nhật template.
     */
    public function update(UpdateTemplateRequest $request, int $id): JsonResponse
    {
        $template = Template::findOrFail($id);
        $data = $request->validated();

        // Tự động update slug nếu đổi tên
        if (isset($data['name']) && $data['name'] !== $template->name) {
            $data['slug'] = Str::slug($data['name']);
            $originalSlug = $data['slug'];
            $counter = 1;
            while (Template::withTrashed()->where('slug', $data['slug'])->where('id', '!=', $id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $counter++;
            }
        }

        $template->update($data);

        return response()->json([
            'message' => 'Cập nhật template thành công.',
            'data' => $template->fresh(),
        ]);
    }

    /**
     * Xóa mềm template.
     */
    public function destroy(int $id): JsonResponse
    {
        $template = Template::findOrFail($id);
        $template->delete();

        return response()->json([
            'message' => 'Đã xóa template.',
        ]);
    }

    /**
     * Upload ảnh cho template (thumbnail hoặc effect option image).
     * POST /api/admin/templates/upload-image
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $file = $request->file('image');
        $filename = 'templates/' . date('Y/m/d') . '/' . Str::uuid() . '.' . $file->getClientOriginalExtension();

        $disk = config('filesystems.default');
        Storage::disk($disk)->put($filename, file_get_contents($file->getRealPath()), 'public');

        return response()->json([
            'url' => Storage::disk($disk)->url($filename),
            'path' => $filename,
        ]);
    }

    /**
     * Sắp xếp lại thứ tự templates.
     */
    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer', 'exists:templates,id'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->input('items') as $item) {
            Template::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'message' => 'Đã sắp xếp lại.',
        ]);
    }
}
