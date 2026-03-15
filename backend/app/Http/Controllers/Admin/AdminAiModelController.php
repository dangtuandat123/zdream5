<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAiModelRequest;
use App\Http\Requests\Admin\UpdateAiModelRequest;
use App\Models\AiModel;
use Illuminate\Http\JsonResponse;

class AdminAiModelController extends Controller
{
    /**
     * Danh sách tất cả AI models.
     */
    public function index(): JsonResponse
    {
        return response()->json(
            AiModel::orderBy('sort_order')->get()
        );
    }

    /**
     * Tạo AI model mới.
     */
    public function store(StoreAiModelRequest $request): JsonResponse
    {
        $model = AiModel::create($request->validated());

        return response()->json([
            'message' => 'Thêm model thành công.',
            'data' => $model,
        ], 201);
    }

    /**
     * Cập nhật AI model.
     */
    public function update(UpdateAiModelRequest $request, int $id): JsonResponse
    {
        $model = AiModel::findOrFail($id);
        $model->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật model thành công.',
            'data' => $model->fresh(),
        ]);
    }

    /**
     * Xóa AI model.
     */
    public function destroy(int $id): JsonResponse
    {
        AiModel::findOrFail($id)->delete();

        return response()->json(['message' => 'Đã xóa model.']);
    }

    /**
     * Toggle bật/tắt model.
     */
    public function toggle(int $id): JsonResponse
    {
        $model = AiModel::findOrFail($id);
        $model->update(['is_active' => !$model->is_active]);

        return response()->json([
            'message' => $model->is_active ? 'Đã bật model.' : 'Đã tắt model.',
            'data' => $model,
        ]);
    }
}
