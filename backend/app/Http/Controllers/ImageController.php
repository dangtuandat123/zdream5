<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\GenerateImageRequest;
use App\Models\AiModel;
use App\Models\Image;
use App\Models\Setting;
use App\Services\OpenRouterService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        private WalletService $walletService,
    ) {}

    /**
     * Tạo ảnh AI từ prompt.
     * 
     * POST /api/images/generate
     * Body: { prompt, negative_prompt?, model?, style?, aspect_ratio?, seed?, count? }
     * 
     * Flow: Validate → Check gems → Gọi OpenRouter → Lưu DB → Trừ gems → Trả kết quả
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

        // Kiểm tra đủ gems
        if ($user->gems < $totalCost) {
            return response()->json([
                'message' => "Không đủ Kim Cương. Cần {$totalCost} 💎, bạn còn {$user->gems} 💎.",
                'gems_needed' => $totalCost,
                'gems_available' => $user->gems,
            ], 422);
        }

        $generatedImages = [];
        $aspectRatio = $validated['aspect_ratio'] ?? '1:1';
        $model = $validated['model'] ?? Setting::get('default_model', config('services.openrouter.default_model'));
        $style = $validated['style'] ?? 'photorealistic';
        $seed = (int) ($validated['seed'] ?? random_int(0, 999999999));

        // Upload ảnh tham chiếu lên MinIO + lưu vào thư viện người dùng
        $referenceImageUrls = null;
        $referenceImagesBase64 = $validated['reference_images'] ?? null;
        if (!empty($referenceImagesBase64)) {
            $referenceImageUrls = [];
            $disk = config('filesystems.default');
            foreach ($referenceImagesBase64 as $base64) {
                // Nếu đã là URL (không phải base64) thì giữ nguyên
                if (!str_starts_with($base64, 'data:')) {
                    $referenceImageUrls[] = $base64;
                    continue;
                }
                // Decode base64 và upload lên MinIO
                $matches = [];
                preg_match('/^data:image\/(\w+);base64,/', $base64, $matches);
                $ext = $matches[1] ?? 'jpeg';
                if ($ext === 'jpg') $ext = 'jpeg';
                $decoded = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $base64));
                if ($decoded === false) continue;

                $filename = 'references/' . date('Y/m/d') . '/' . Str::uuid() . '.' . $ext;
                Storage::disk($disk)->put($filename, $decoded, 'public');
                $fileUrl = Storage::disk($disk)->url($filename);

                // Tạo record Image type='upload' để hiện trong thư viện người dùng
                Image::create([
                    'user_id' => $user->id,
                    'type' => 'upload',
                    'project_id' => $validated['project_id'] ?? null,
                    'prompt' => 'Ảnh tham chiếu',
                    'model' => 'user-upload',
                    'file_path' => $filename,
                    'file_url' => $fileUrl,
                    'gems_cost' => 0,
                ]);

                $referenceImageUrls[] = $fileUrl;
            }
        }

        try {
            for ($i = 0; $i < $count; $i++) {
                // Gọi OpenRouter API để tạo ảnh
                $result = $this->openRouterService->generateImage(
                    prompt: $validated['prompt'],
                    negativePrompt: $validated['negative_prompt'] ?? null,
                    aspectRatio: $aspectRatio,
                    imageSize: $validated['image_size'] ?? '1K',
                    model: $model,
                    style: $style,
                    referenceImages: $validated['reference_images'] ?? null,
                );

                // Lưu vào database
                $image = Image::create([
                    'user_id' => $user->id,
                    'type' => 'ai',
                    'project_id' => $validated['project_id'] ?? null,
                    'prompt' => $validated['prompt'],
                    'negative_prompt' => $validated['negative_prompt'] ?? null,
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

                // Trừ gems
                $this->walletService->deduct(
                    user: $user,
                    amount: $gemsCostPerImage,
                    description: "Tạo ảnh AI: " . mb_substr($validated['prompt'], 0, 50),
                    metadata: ['image_id' => $image->id],
                );

                $generatedImages[] = $image;
            }

            // Refresh user để lấy gems mới nhất
            $user->refresh();

            return response()->json([
                'message' => "Tạo {$count} ảnh thành công!",
                'images' => $generatedImages,
                'gems_remaining' => $user->gems,
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => 'Lỗi khi tạo ảnh: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload ảnh người dùng.
     * 
     * POST /api/images/upload
     */
    public function upload(Request $request): JsonResponse
    {
        \Illuminate\Support\Facades\Log::debug('Upload request received', [
            'has_file' => $request->hasFile('image'),
            'file_name' => $request->file('image')?->getClientOriginalName(),
            'file_size' => $request->file('image')?->getSize(),
        ]);

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // Max 5MB
            'project_id' => 'nullable|integer',
        ]);

        $file = $request->file('image');
        $user = $request->user();

        // Tạo đường dẫn file unique tương tự AI images
        $filename = 'uploads/' . date('Y/m/d') . '/' . Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Lưu vào storage
        $disk = config('filesystems.default');
        $stored = Storage::disk($disk)->put($filename, file_get_contents($file->getRealPath()), 'public');

        \Illuminate\Support\Facades\Log::debug('File storage result', ['filename' => $filename, 'stored' => $stored]);

        try {
            // Lưu database
            $image = Image::create([
                'user_id' => $user->id,
                'type' => 'upload',
                'project_id' => $request->input('project_id'),
                'prompt' => $file->getClientOriginalName(), // Lưu tên gốc vào prompt để ref
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
            \Illuminate\Support\Facades\Log::error('Database error during upload', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Lỗi lưu trữ dữ liệu: ' . $e->getMessage(),
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
