<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\JsonResponse;

/**
 * Controller public cho templates (không cần auth).
 */
class TemplateController extends Controller
{
    /**
     * Danh sách templates đang hoạt động.
     *
     * GET /api/templates
     */
    public function publicIndex(): JsonResponse
    {
        $templates = Template::active()
            ->reorder('created_at', 'desc')
            ->get([
                'id', 'name', 'slug', 'category', 'description',
                'system_prompt', 'model', 'thumbnail', 'effect_groups',
            ]);

        return response()->json(['data' => $templates]);
    }

    /**
     * Chi tiết template theo slug.
     *
     * GET /api/templates/{slug}
     */
    public function publicShow(string $slug): JsonResponse
    {
        $template = Template::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json($template);
    }
}
