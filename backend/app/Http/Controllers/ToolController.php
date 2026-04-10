<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Tools\AdImageRequest;
use App\Http\Requests\Tools\ConsistentCharacterRequest;
use App\Http\Requests\Tools\ExtendRequest;
use App\Http\Requests\Tools\ImageToPromptRequest;
use App\Http\Requests\Tools\ImageVariationRequest;
use App\Http\Requests\Tools\InpaintingRequest;
use App\Http\Requests\Tools\RemoveBgRequest;
use App\Http\Requests\Tools\RemoveObjectRequest;
use App\Http\Requests\Tools\StyleTransferRequest;
use App\Http\Requests\Tools\UpscaleRequest;
use App\Models\Image;
use App\Models\Setting;
use App\Services\OpenRouterService;
use App\Services\PromptDesignerService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ToolController extends Controller
{
    public function __construct(
        private OpenRouterService $openRouterService,
        private PromptDesignerService $promptDesignerService,
        private WalletService $walletService,
    ) {}

    // ═══════════════════════════════════════
    // Group 1: Image Generation Tools (PromptDesigner)
    // ═══════════════════════════════════════

    public function styleTransfer(StyleTransferRequest $request): JsonResponse
    {
        $v = $request->validated();
        $styleLabels = [
            'anime' => 'anime/manga style',
            'oil-painting' => 'oil painting style',
            'watercolor' => 'watercolor painting style',
            'cyberpunk' => 'cyberpunk style',
            'pixel-art' => 'pixel art style',
            '3d-render' => '3D render style',
        ];
        $styleLabel = $styleLabels[$v['target_style']] ?? $v['target_style'];

        return $this->processImageTool(
            request: $request,
            toolName: 'style-transfer',
            prompt: "Transform this image into {$styleLabel}. Keep the exact same composition, subjects, and layout.",
            referenceImages: [$v['image']],
            taskType: 'style-transfer',
        );
    }

    public function imageVariation(ImageVariationRequest $request): JsonResponse
    {
        $v = $request->validated();
        $strength = $v['strength'] ?? 0.5;
        $hint = $strength > 0.7 ? 'significant' : ($strength > 0.4 ? 'moderate' : 'subtle');

        return $this->processImageTool(
            request: $request,
            toolName: 'image-variation',
            prompt: "Create a {$hint} variation of this image. Same concept and mood, but with fresh perspective.",
            referenceImages: [$v['image']],
            taskType: 'variation',
        );
    }

    public function adImage(AdImageRequest $request): JsonResponse
    {
        $v = $request->validated();
        $platform = $v['platform'] ?? 'general';
        $prompt = "Create a professional advertising image for this product. Context: {$v['description']}. Platform: {$platform}.";

        return $this->processImageTool(
            request: $request,
            toolName: 'ad-image',
            prompt: $prompt,
            referenceImages: [$v['image']],
            aspectRatio: $v['aspect_ratio'] ?? '1:1',
            taskType: 'ad-image',
        );
    }

    public function consistentCharacter(ConsistentCharacterRequest $request): JsonResponse
    {
        $v = $request->validated();

        return $this->processImageTool(
            request: $request,
            toolName: 'consistent-character',
            prompt: $v['scene_description'],
            referenceImages: $v['images'],
            taskType: 'character',
        );
    }

    // ═══════════════════════════════════════
    // Group 2: Image Editing Tools (Direct Prompt)
    // ═══════════════════════════════════════

    public function upscale(UpscaleRequest $request): JsonResponse
    {
        $v = $request->validated();
        $scale = $v['scale_factor'] ?? '2x';
        $imageSize = $scale === '4x' ? '4K' : '2K';

        return $this->processImageTool(
            request: $request,
            toolName: 'upscale',
            prompt: "Upscale and enhance this image to {$scale} higher resolution. Add fine details, sharpen edges, improve clarity while maintaining the original composition and style exactly.",
            referenceImages: [$v['image']],
            imageSize: $imageSize,
        );
    }

    public function removeBg(RemoveBgRequest $request): JsonResponse
    {
        $v = $request->validated();

        return $this->processImageTool(
            request: $request,
            toolName: 'remove-bg',
            prompt: "Remove the background completely from this image. Keep only the main subject. Output on a clean pure white background. Preserve all details of the subject perfectly.",
            referenceImages: [$v['image']],
        );
    }

    public function removeObject(RemoveObjectRequest $request): JsonResponse
    {
        $v = $request->validated();

        return $this->processImageTool(
            request: $request,
            toolName: 'remove-object',
            prompt: "Remove the following from this image: {$v['description']}. Fill the area naturally so it looks like the object was never there. Keep everything else exactly the same.",
            referenceImages: [$v['image']],
        );
    }

    public function inpainting(InpaintingRequest $request): JsonResponse
    {
        $v = $request->validated();

        return $this->processImageTool(
            request: $request,
            toolName: 'inpainting',
            prompt: "In the masked/highlighted region of this image, replace the content with: {$v['description']}. Blend seamlessly with the surrounding area. Keep everything outside the mask exactly the same.",
            referenceImages: [$v['image'], $v['mask']],
        );
    }

    public function extend(ExtendRequest $request): JsonResponse
    {
        $v = $request->validated();
        $dirs = implode(', ', $v['directions']);
        $desc = $v['description'] ?? 'matching the existing scene';

        return $this->processImageTool(
            request: $request,
            toolName: 'extend',
            prompt: "Extend this image outward in the following directions: {$dirs}. Continue the scene naturally, {$desc}. The extended area must blend seamlessly with the original image.",
            referenceImages: [$v['image']],
        );
    }

    // ═══════════════════════════════════════
    // Image to Prompt (Text output)
    // ═══════════════════════════════════════

    public function imageToPrompt(ImageToPromptRequest $request): JsonResponse
    {
        $v = $request->validated();

        /** @var \App\Models\User $user */
        $user = $request->user();
        $gemsCost = (int) Setting::get('tool_image-to-prompt_gems_cost', '1');

        if ($gemsCost > 0) {
            try {
                $this->walletService->deduct($user, $gemsCost, 'Tool: Ảnh thành Prompt');
            } catch (\RuntimeException $e) {
                $user->refresh();
                return response()->json([
                    'message' => "Không đủ Kim Cương. Cần {$gemsCost} 💎, bạn còn {$user->gems} 💎.",
                ], 422);
            }
        }

        try {
            $result = $this->openRouterService->analyzeImage(
                systemPrompt: 'You are an expert AI image prompt engineer. Analyze the given image and write a detailed, precise prompt that could recreate this image using an AI image generator. Include: subject description, composition, lighting, color palette, art style, camera angle, mood/atmosphere, and technical details. Output ONLY the prompt text, nothing else. Write in English, under 300 words.',
                referenceImages: [$v['image']],
            );

            $user->refresh();

            return response()->json([
                'message' => 'Phân tích thành công!',
                'result' => ['prompt' => trim($result)],
                'gems_remaining' => $user->gems,
            ]);
        } catch (\Throwable $e) {
            // Refund
            if ($gemsCost > 0) {
                $this->walletService->credit($user, $gemsCost, 'Hoàn gems: Image to Prompt lỗi');
            }
            $user->refresh();
            Log::error('Tool image-to-prompt failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Lỗi phân tích ảnh. Gems đã hoàn lại.', 'gems_remaining' => $user->gems], 500);
        }
    }

    // ═══════════════════════════════════════
    // Shared Helper
    // ═══════════════════════════════════════

    private function processImageTool(
        Request $request,
        string $toolName,
        string $prompt,
        array $referenceImages,
        ?string $negativePrompt = null,
        string $aspectRatio = '1:1',
        string $imageSize = '1K',
        ?string $taskType = null,
    ): JsonResponse {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $gemsCost = (int) Setting::get("tool_{$toolName}_gems_cost", '2');

        // 1. Deduct gems
        if ($gemsCost > 0) {
            try {
                $this->walletService->deduct($user, $gemsCost, "Tool: {$toolName}");
            } catch (\RuntimeException $e) {
                $user->refresh();
                return response()->json([
                    'message' => "Không đủ Kim Cương. Cần {$gemsCost} 💎, bạn còn {$user->gems} 💎.",
                ], 422);
            }
        }

        try {
            // 2. Upload reference images to MinIO
            $refUrls = $this->uploadReferenceImages($referenceImages);

            // 3. Optional: PromptDesigner optimization
            $designedPrompt = $prompt;
            $designedNegative = $negativePrompt;
            if ($taskType) {
                $designResult = $this->promptDesignerService->design(
                    userPrompt: $prompt,
                    negativePrompt: $negativePrompt,
                    referenceImages: $refUrls,
                    aspectRatio: $aspectRatio,
                    taskType: $taskType,
                );
                $designedPrompt = $designResult['prompt'];
                $designedNegative = $designResult['negative_prompt'];
            }

            // 4. Generate image via OpenRouter
            $result = $this->openRouterService->generateImage(
                prompt: $designedPrompt,
                negativePrompt: $designedNegative,
                aspectRatio: $aspectRatio,
                imageSize: $imageSize,
                referenceImages: $referenceImages, // Send original base64 to OpenRouter
            );

            // 5. Save to DB
            $image = Image::create([
                'user_id' => $user->id,
                'type' => 'ai',
                'prompt' => $prompt,
                'designed_prompt' => $taskType ? $designedPrompt : null,
                'negative_prompt' => $designedNegative,
                'model' => Setting::get('default_model', config('services.openrouter.default_model')),
                'style' => $toolName,
                'aspect_ratio' => $aspectRatio,
                'file_path' => $result['file_path'],
                'file_url' => $result['file_url'],
                'seed' => random_int(0, 999999999),
                'gems_cost' => $gemsCost,
                'reference_images' => $refUrls,
                'tool_name' => $toolName,
            ]);

            $user->refresh();

            return response()->json([
                'message' => 'Tạo ảnh thành công!',
                'image' => $image,
                'gems_remaining' => $user->gems,
            ], 201);
        } catch (\Throwable $e) {
            // Refund gems on failure
            if ($gemsCost > 0) {
                $this->walletService->credit($user, $gemsCost, "Hoàn gems: {$toolName} lỗi");
            }
            $user->refresh();

            Log::error("Tool {$toolName} failed", ['error' => $e->getMessage(), 'user_id' => $user->id]);
            return response()->json([
                'message' => 'Lỗi khi tạo ảnh. Gems đã được hoàn lại.',
                'gems_remaining' => $user->gems,
            ], 500);
        }
    }

    /**
     * Upload base64 images to MinIO, return URLs.
     */
    private function uploadReferenceImages(array $images): array
    {
        $urls = [];
        $disk = config('filesystems.default');

        foreach ($images as $base64) {
            if (str_starts_with($base64, 'http://') || str_starts_with($base64, 'https://')) {
                $urls[] = $base64;
                continue;
            }

            if (!str_starts_with($base64, 'data:')) {
                $base64 = "data:image/jpeg;base64,{$base64}";
            }

            $matches = [];
            preg_match('/^data:image\/(\w+);base64,/', $base64, $matches);
            $ext = $matches[1] ?? 'jpeg';
            if ($ext === 'jpg') $ext = 'jpeg';

            $decoded = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $base64));
            if ($decoded === false) continue;

            $filename = 'references/' . date('Y/m/d') . '/' . Str::uuid() . '.' . $ext;
            Storage::disk($disk)->put($filename, $decoded, 'public');
            $urls[] = Storage::disk($disk)->url($filename);
        }

        return $urls;
    }
}
