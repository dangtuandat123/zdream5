<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    /**
     * Lấy danh sách dự án của user
     */
    public function index(Request $request): JsonResponse
    {
        $projects = $request->user()->projects()->orderBy('created_at', 'desc')->get();
        return response()->json([
            'data' => $projects,
        ]);
    }

    /**
     * Tạo dự án mới
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $project = $request->user()->projects()->create($validated);

        return response()->json([
            'message' => 'Dự án đã được tạo',
            'data' => $project,
        ], 201);
    }

    /**
     * Xóa dự án
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $project = $request->user()->projects()->findOrFail($id);

        // Gỡ ảnh khỏi project trước khi xoá — tránh orphaned foreign key
        \App\Models\Image::where('project_id', $project->id)->update(['project_id' => null]);

        $project->delete();

        return response()->json([
            'message' => 'Đã xóa dự án',
        ]);
    }
}
