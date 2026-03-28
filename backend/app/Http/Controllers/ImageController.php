<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\GenerateImageRequest;
use App\Models\AiModel;
use App\Models\Image;
use App\Models\Setting;
use App\Models\Template;
use App\Services\OpenRouterService;
use App\Services\PromptDesignerService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Controller xử lý tạo ảnh AI, xem danh sách, xoá ảnh.
 * 
 * Business logic được ủy quyền cho OpenRouterService & WalletService.
 */
class ImageController extends Controller
{
    public function __construct(
        private OpenRouterService $openRouterService,
        private PromptDesignerService $promptDesignerService,
        private WalletService $walletService,
    ) {}

    /**
     * Tạo ảnh AI từ prompt.
     *
     * POST /api/images/generate
     * Body: { prompt, negative_prompt?, model?, style?, aspect_ratio?, seed?, count? }
     *
     * Flow an toàn:
     *   1. Validate + tính cost
     *   2. Trừ gems TRƯỚC bằng pessimistic lock (chống race condition)
     *   3. PromptDesigner → OpenRouter → MinIO → DB
     *   4. Nếu fail → hoàn gems cho số ảnh chưa tạo được
     *   5. Partial success → trả ảnh đã tạo + thông báo rõ ràng
     */
    public function generate(GenerateImageRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $validated = $request->validated();

        $count = min(
            (int) ($validated['count'] ?? 1),
            (int) Setting::get('max_images_per_request', 4),
        );

        // Lấy gems cost từ AI model hoặc setting mặc định
        $modelId = $validated['model'] ?? Setting::get('default_model', config('services.openrouter.default_model'));
        $aiModel = AiModel::where('model_id', $modelId)->first();
        $gemsCostPerImage = $aiModel?->gems_cost ?? (int) Setting::get('default_gems_per_image', 1);
        $totalCost = $count * $gemsCostPerImage;

        // ── BƯỚC 1: Trừ gems TRƯỚC với pessimistic lock ──
        // Giải quyết race condition: 2 request cùng lúc không thể vượt quá số dư
        try {
            $this->walletService->deduct(
                user: $user,
                amount: $totalCost,
                description: "Đặt tạo {$count} ảnh AI: " . mb_substr($validated['prompt'], 0, 50),
                metadata: ['type' => 'reserve', 'count' => $count],
            );
        } catch (\RuntimeException $e) {
            $user->refresh();
            return response()->json([
                'message' => "Không đủ Kim Cương. Cần {$totalCost} 💎, bạn còn {$user->gems} 💎.",
                'gems_needed' => $totalCost,
                'gems_available' => $user->gems,
            ], 422);
        }

        // ── BƯỚC 2: Upload ảnh tham chiếu lên MinIO ──
        $referenceImageUrls = null;
        $referenceImagesBase64 = $validated['reference_images'] ?? null;
        if (!empty($referenceImagesBase64)) {
            $referenceImageUrls = [];
            $disk = config('filesystems.default');
            foreach ($referenceImagesBase64 as $base64) {
                if (!str_starts_with($base64, 'data:')) {
                    $referenceImageUrls[] = $base64;
                    continue;
                }
                $matches = [];
                preg_match('/^data:image\/(\w+);base64,/', $base64, $matches);
                $ext = $matches[1] ?? 'jpeg';
                if ($ext === 'jpg') $ext = 'jpeg';
                $decoded = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $base64));
                if ($decoded === false) continue;

                $filename = 'references/' . date('Y/m/d') . '/' . Str::uuid() . '.' . $ext;
                Storage::disk($disk)->put($filename, $decoded, 'public');
                $referenceImageUrls[] = Storage::disk($disk)->url($filename);
            }
        }

        // ── BƯỚC 3: AI Prompt Designer — tối ưu prompt trước khi sinh ảnh ──
        $aspectRatio = $validated['aspect_ratio'] ?? '1:1';
        $model = $validated['model'] ?? Setting::get('default_model', config('services.openrouter.default_model'));
        $style = $validated['style'] ?? 'photorealistic';
        $seed = (int) ($validated['seed'] ?? random_int(0, 999999999));

        $templateSystemPrompt = null;
        if (!empty($validated['template_slug'])) {
            $template = Template::where('slug', $validated['template_slug'])->first();
            $templateSystemPrompt = $template?->system_prompt;
        }

        $designResult = $this->promptDesignerService->design(
            userPrompt: $validated['prompt'],
            style: $style,
            negativePrompt: $validated['negative_prompt'] ?? null,
            templateSystemPrompt: $templateSystemPrompt,
            referenceImages: $validated['reference_images'] ?? null,
            aspectRatio: $aspectRatio,
        );

        $designedPrompt = $designResult['prompt'];
        $designedNegative = $designResult['negative_prompt'];

        // Flag từ service — đáng tin cậy hơn so sánh string (tránh double injection)
        $wasDesigned = $designResult['designed'] ?? false;

        // ── BƯỚC 4: Sinh ảnh — xử lý partial failure ──
        $generatedImages = [];
        $successCount = 0;

        for ($i = 0; $i < $count; $i++) {
            try {
                $result = $this->openRouterService->generateImage(
                    prompt: $designedPrompt,
                    negativePrompt: $wasDesigned ? null : $designedNegative,
                    aspectRatio: $aspectRatio,
                    imageSize: $validated['image_size'] ?? '1K',
                    model: $model,
                    style: $wasDesigned ? null : $style,
                    referenceImages: $validated['reference_images'] ?? null,
                );

                $image = Image::create([
                    'user_id' => $user->id,
                    'type' => 'ai',
                    'project_id' => $validated['project_id'] ?? null,
                    'prompt' => $validated['prompt'],
                    'designed_prompt' => $wasDesigned ? $designedPrompt : null,
                    'negative_prompt' => $designedNegative,
                    'model' => $model ?? config('services.openrouter.default_model'),
                    'style' => $style,
                    'aspect_ratio' => $aspectRatio,
                    'file_path' => $result['file_path'],
                    'file_url' => $result['file_url'],
                    'seed' => $seed + $i,
                    'gems_cost' => $gemsCostPerImage,
                    'reference_images' => $referenceImageUrls,
                    'template_slug' => $validated['template_slug'] ?? null,
                ]);

                $generatedImages[] = $image;
                $successCount++;
            } catch (\Throwable $e) {
                // Log lỗi nhưng tiếp tục tạo ảnh còn lại
                Log::error("Lỗi tạo ảnh [{$i}/{$count}]", [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id,
                    'prompt' => mb_substr($validated['prompt'], 0, 100),
                ]);

                // Nếu ảnh đầu tiên fail → dừng luôn (không cần thử tiếp)
                if ($successCount === 0) {
                    break;
                }
            }
        }

        // ── BƯỚC 5: Hoàn gems cho số ảnh KHÔNG tạo được ──
        $failedCount = $count - $successCount;
        if ($failedCount > 0) {
            $refundAmount = $failedCount * $gemsCostPerImage;
            $this->walletService->credit(
                user: $user,
                amount: $refundAmount,
                description: "Hoàn gems: {$failedCount}/{$count} ảnh lỗi",
                metadata: ['type' => 'refund', 'failed_count' => $failedCount],
            );
        }

        $user->refresh();

        // Nếu không tạo được ảnh nào → trả 500
        if ($successCount === 0) {
            return response()->json([
                'message' => 'Lỗi khi tạo ảnh. Gems đã được hoàn lại.',
                'gems_remaining' => $user->gems,
            ], 500);
        }

        // Partial success hoặc full success
        $message = $successCount === $count
            ? "Tạo {$count} ảnh thành công!"
            : "Tạo {$successCount}/{$count} ảnh thành công. {$failedCount} ảnh lỗi, gems đã hoàn.";

        return response()->json([
            'message' => $message,
            'images' => $generatedImages,
            'gems_remaining' => $user->gems,
        ], 201);
    }

    /**
     * Upload ảnh người dùng.
     * 
     * POST /api/images/upload
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // Max 5MB
            'project_id' => 'nullable|integer',
        ]);

        $file = $request->file('image');
        $user = $request->user();

        // Dùng extension() thay vì getClientOriginalExtension() — an toàn hơn (derive từ MIME)
        $filename = 'uploads/' . date('Y/m/d') . '/' . Str::uuid() . '.' . $file->extension();

        // Lưu vào storage
        $disk = config('filesystems.default');
        Storage::disk($disk)->put($filename, file_get_contents($file->getRealPath()), 'public');

        try {
            $image = Image::create([
                'user_id' => $user->id,
                'type' => 'upload',
                'project_id' => $request->input('project_id'),
                'prompt' => $file->getClientOriginalName(),
                'model' => 'user-upload',
                'file_path' => $filename,
                'file_url' => Storage::disk($disk)->url($filename),
                'gems_cost' => 0,
            ]);

            return response()->json([
                'message' => 'Tải lên thành công!',
                'image' => $image,
            ], 201);
        } catch (\Exception $e) {
            // Log lỗi nhưng KHÔNG trả message nội bộ cho client
            Log::error('Upload DB error', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Lỗi lưu trữ dữ liệu. Vui lòng thử lại.',
            ], 500);
        }
    }

    /**
     * Danh sách ảnh đã tạo (có phân trang).
     * 
     * GET /api/images?page=1&per_page=20
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 20), 50);
        $projectId = $request->input('project_id');

        $query = $request->user()->images()->orderByDesc('created_at');

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('template_slug')) {
            $query->where('template_slug', $request->input('template_slug'));
        }

        // Loại trừ ảnh tạo từ template khi không filter cụ thể template
        if ($request->boolean('exclude_template', false)) {
            $query->whereNull('template_slug');
        }

        $images = $query->paginate($perPage);

        return response()->json($images);
    }

    /**
     * Xoá ảnh.
     * 
     * DELETE /api/images/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $image = Image::where('user_id', $request->user()->id)
            ->findOrFail($id);

        // Xoá file vật lý khỏi storage
        $disk = config('filesystems.default');
        \Illuminate\Support\Facades\Storage::disk($disk)->delete($image->file_path);

        $image->delete();

        return response()->json([
            'message' => 'Đã xoá ảnh.',
        ]);
    }
}
