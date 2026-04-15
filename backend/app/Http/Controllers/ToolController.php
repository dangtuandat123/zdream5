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

        $intensityHints = [
            'light' => 'Apply a subtle, light touch of',
            'medium' => 'Transform this image into',
            'strong' => 'Completely and dramatically transform this image into',
        ];
        $intensityHint = $intensityHints[$v['intensity'] ?? 'medium'] ?? $intensityHints['medium'];

        return $this->processImageTool(
            request: $request,
            toolName: 'style-transfer',
            prompt: "{$intensityHint} {$styleLabel}. Keep the exact same composition, subjects, and layout.",
            referenceImages: [$v['image']],
            aspectRatio: $this->detectAspectRatio($v['image']),
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
            aspectRatio: $this->detectAspectRatio($v['image']),
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
            aspectRatio: $v['aspect_ratio'] ?? $this->detectAspectRatio($v['images'][0]),
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
        $denoise = $v['denoise'] ?? false;
        $faceEnhance = $v['face_enhance'] ?? false;
        $creativeDetail = $v['creative_detail'] ?? false;
        $colorEnhance = $v['color_enhance'] ?? false;

        // Map scale_factor → OpenRouter image_size
        $imageSizeMap = ['1x' => '1K', '2x' => '2K', '4x' => '4K'];
        $imageSize = $imageSizeMap[$scale] ?? '2K';

        // Detect kích thước gốc để đưa context cho AI
        $aspectRatio = $this->detectAspectRatio($v['image']);
        $origDims = $this->getImageDimensions($v['image']);
        $dimsHint = $origDims
            ? "The original image is {$origDims['w']}×{$origDims['h']} pixels."
            : '';

        // Xây dựng prompt với các AI enhancement hints
        $promptParts = [];
        $promptParts[] = "Upscale and enhance this image to higher resolution ({$imageSize}).";
        if ($dimsHint) $promptParts[] = $dimsHint;
        if ($denoise) $promptParts[] = 'Reduce noise, grain and artifacts from the original image.';
        if ($faceEnhance) $promptParts[] = 'Restore and enhance facial features: fix blurry eyes, refine skin texture, correct any AI-generated face distortions.';
        if ($creativeDetail) $promptParts[] = 'Intelligently add fine details: individual hair strands, fabric textures, skin pores, material surfaces.';
        if ($colorEnhance) $promptParts[] = 'Enhance color vibrancy, improve contrast and saturation. Make colors more vivid and dynamic while keeping them natural.';
        $promptParts[] = 'Maximize sharpness, enhance edges and textures. Maintain the original composition, colors, and style exactly.';

        return $this->processImageTool(
            request: $request,
            toolName: 'upscale',
            prompt: implode(' ', $promptParts),
            referenceImages: [$v['image']],
            aspectRatio: $aspectRatio,
            imageSize: $imageSize,
        );
    }

    /**
     * Lấy kích thước thực của ảnh từ base64 data hoặc URL.
     */
    private function getImageDimensions(string $imageInput): ?array
    {
        $decoded = $this->resolveImageData($imageInput);
        if ($decoded === null) return null;

        $img = @imagecreatefromstring($decoded);
        if (!$img) return null;

        $w = imagesx($img);
        $h = imagesy($img);
        imagedestroy($img);

        return ($w > 0 && $h > 0) ? ['w' => $w, 'h' => $h] : null;
    }

    public function removeBg(RemoveBgRequest $request): JsonResponse
    {
        $v = $request->validated();
        $subjectType = $v['subject_type'] ?? 'auto';
        $edgeRefine = $v['edge_refine'] ?? 'standard';

        $subjectHints = [
            'auto' => 'the main subject',
            'person' => 'the person/people (preserve hair, clothing, accessories in fine detail)',
            'product' => 'the product/object (preserve clean edges and material details)',
            'animal' => 'the animal (preserve fur, feathers, whiskers in fine detail)',
        ];
        $edgeHints = [
            'standard' => 'Clean, standard edge quality.',
            'fine' => 'Extra fine edges — carefully preserve hair strands, fur, feathers, and soft edges with anti-aliasing.',
            'hard' => 'Sharp, crisp edges — clean hard cuts suitable for product photos and geometric shapes.',
        ];
        $subjectHint = $subjectHints[$subjectType] ?? $subjectHints['auto'];
        $edgeHint = $edgeHints[$edgeRefine] ?? $edgeHints['standard'];

        return $this->processImageTool(
            request: $request,
            toolName: 'remove-bg',
            prompt: "Remove the background completely from this image. Keep only {$subjectHint}. Output the subject on a completely transparent background (PNG with alpha channel). If transparency is not possible, use a clean solid white background. {$edgeHint} Preserve all details of the subject perfectly.",
            referenceImages: [$v['image']],
            aspectRatio: $this->detectAspectRatio($v['image']),
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
            aspectRatio: $this->detectAspectRatio($v['image']),
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
            aspectRatio: $this->detectAspectRatio($v['image']),
        );
    }

    public function extend(ExtendRequest $request): JsonResponse
    {
        $v = $request->validated();
        $dirs = implode(', ', $v['directions']);
        $desc = $v['description'] ?? 'matching the existing scene';

        // Extend changes the aspect ratio — estimate new ratio based on directions
        $origRatio = $this->detectAspectRatio($v['image']);
        $parts = explode(':', $origRatio);
        $rw = (float) $parts[0];
        $rh = (float) $parts[1];
        $extendPct = ((int) ($v['extend_ratio'] ?? 50)) / 100;
        $horizontal = array_intersect($v['directions'], ['left', 'right']);
        $vertical = array_intersect($v['directions'], ['top', 'bottom']);
        $rw += $rw * $extendPct * count($horizontal);
        $rh += $rh * $extendPct * count($vertical);
        // Re-detect closest standard ratio from computed dimensions
        $newRatioVal = $rw / $rh;
        $standards = ['1:1' => 1.0, '4:5' => 0.8, '5:4' => 1.25, '3:4' => 0.75, '4:3' => 1.333, '2:3' => 0.667, '3:2' => 1.5, '9:16' => 0.5625, '16:9' => 1.778];
        $extendRatio = '1:1';
        $minDiff = PHP_FLOAT_MAX;
        foreach ($standards as $label => $val) {
            $diff = abs($newRatioVal - $val);
            if ($diff < $minDiff) { $minDiff = $diff; $extendRatio = $label; }
        }

        return $this->processImageTool(
            request: $request,
            toolName: 'extend',
            prompt: "Extend this image outward in the following directions: {$dirs}. Continue the scene naturally, {$desc}. The extended area must blend seamlessly with the original image.",
            referenceImages: [$v['image']],
            aspectRatio: $extendRatio,
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
            $language = $v['language'] ?? 'en';
            $langInstruction = $language === 'vi'
                ? 'Write the prompt in Vietnamese (Tiếng Việt).'
                : 'Write in English.';

            $result = $this->openRouterService->analyzeImage(
                systemPrompt: "You are an expert AI image prompt engineer. Analyze the given image and write a detailed, precise prompt that could recreate this image using an AI image generator. Include: subject description, composition, lighting, color palette, art style, camera angle, mood/atmosphere, and technical details. Output ONLY the prompt text, nothing else. {$langInstruction} Under 300 words.",
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
     * Resolve image input (base64 hoặc URL) thành raw binary data.
     */
    private function resolveImageData(string $imageInput): ?string
    {
        // HTTP URL → tải về
        if (str_starts_with($imageInput, 'http://') || str_starts_with($imageInput, 'https://')) {
            try {
                $response = \Illuminate\Support\Facades\Http::timeout(15)->get($imageInput);
                return $response->successful() ? $response->body() : null;
            } catch (\Throwable) {
                return null;
            }
        }

        // Base64 data URL
        $data = preg_replace('/^data:image\/\w+;base64,/', '', $imageInput);
        $decoded = base64_decode($data);
        return $decoded !== false ? $decoded : null;
    }

    /**
     * Detect aspect ratio from image data (base64 hoặc URL).
     * Returns closest standard ratio string (e.g. '16:9', '4:3', '1:1').
     */
    private function detectAspectRatio(string $imageInput): string
    {
        $decoded = $this->resolveImageData($imageInput);
        if ($decoded === null) return '1:1';

        $img = @imagecreatefromstring($decoded);
        if (!$img) return '1:1';

        $w = imagesx($img);
        $h = imagesy($img);
        imagedestroy($img);

        if ($w <= 0 || $h <= 0) return '1:1';

        $ratio = $w / $h;

        $standards = [
            '1:1'  => 1.0,
            '4:5'  => 0.8,
            '5:4'  => 1.25,
            '3:4'  => 0.75,
            '4:3'  => 1.333,
            '2:3'  => 0.667,
            '3:2'  => 1.5,
            '9:16' => 0.5625,
            '16:9' => 1.778,
        ];

        $closest = '1:1';
        $minDiff = PHP_FLOAT_MAX;
        foreach ($standards as $label => $val) {
            $diff = abs($ratio - $val);
            if ($diff < $minDiff) {
                $minDiff = $diff;
                $closest = $label;
            }
        }

        return $closest;
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
