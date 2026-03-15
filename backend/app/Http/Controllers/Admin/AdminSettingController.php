<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class AdminSettingController extends Controller
{
    /**
     * Lấy tất cả settings, gom theo group.
     */
    public function index(): JsonResponse
    {
        $settings = Setting::all()->groupBy('group');

        return response()->json($settings);
    }

    /**
     * Cập nhật hàng loạt settings.
     */
    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $items = $request->validated('settings');

        foreach ($items as $item) {
            Setting::set(
                $item['key'],
                $item['value'] ?? null,
                $item['group'] ?? 'general',
            );
        }

        return response()->json([
            'message' => 'Cập nhật cài đặt thành công.',
            'settings' => Setting::all()->groupBy('group'),
        ]);
    }
}
