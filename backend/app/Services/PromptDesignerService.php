<?php

declare(strict_types=1);

namespace App\Services;

use App\Ai\Agents\AdImageDesigner;
use App\Ai\Agents\BasePromptDesigner;
use App\Ai\Agents\CharacterDesigner;
use App\Ai\Agents\GenerateDesigner;
use App\Ai\Agents\StyleTransferDesigner;
use App\Ai\Agents\VariationDesigner;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Files\Base64Image;
use Laravel\Ai\Files\RemoteImage;

/**
 * Orchestrator cho hệ thống Prompt Designer.
 *
 * Chọn agent phù hợp theo taskType, xây dựng context,
 * gọi LLM và trả về kết quả structured.
 *
 * Backward compatible — ImageController không cần thay đổi.
 */
class PromptDesignerService
{
    /**
     * Kiểm tra Prompt Designer có được bật không.
     */
    public function isEnabled(): bool
    {
        return (bool) (int) Setting::get('prompt_designer_enabled', '1');
    }

    /**
     * Thiết kế prompt tối ưu bằng AI.
     *
     * @param string      $userPrompt          Prompt gốc từ user
     * @param string|null $style               Phong cách ảnh (anime, photorealistic, ...)
     * @param string|null $negativePrompt      Negative prompt gốc
     * @param string|null $templateSystemPrompt System prompt từ template (nếu dùng template)
     * @param array|null  $referenceImages     Ảnh tham chiếu (base64 data URL hoặc HTTP URL)
     * @param string|null $aspectRatio         Tỉ lệ ảnh
     * @param string      $taskType            Loại task: generate|template|style-transfer|variation|ad-image|character
     *
     * @return array{prompt: string, negative_prompt: string|null, designed: bool}
     */
    public function design(
        string $userPrompt,
        ?string $style = null,
        ?string $negativePrompt = null,
        ?string $templateSystemPrompt = null,
        ?array $referenceImages = null,
        ?string $aspectRatio = null,
        string $taskType = 'generate',
    ): array {
        // Fallback nếu tắt hoặc không có API key
        if (!$this->isEnabled() || empty(config('services.openrouter.api_key'))) {
            return $this->fallback($userPrompt, $negativePrompt);
        }

        try {
            return $this->callDesigner(
                $userPrompt,
                $style,
                $negativePrompt,
                $templateSystemPrompt,
                $referenceImages,
                $aspectRatio,
                $taskType,
            );
        } catch (\Throwable $e) {
            Log::warning('PromptDesigner failed, using fallback', [
                'error' => $e->getMessage(),
                'taskType' => $taskType,
                'prompt' => mb_substr($userPrompt, 0, 100),
            ]);

            return $this->fallback($userPrompt, $negativePrompt);
        }
    }

    /**
     * Chọn agent theo taskType, xây dựng context và gọi LLM.
     */
    private function callDesigner(
        string $userPrompt,
        ?string $style,
        ?string $negativePrompt,
        ?string $templateSystemPrompt,
        ?array $referenceImages,
        ?string $aspectRatio,
        string $taskType,
    ): array {
        $model = Setting::get('prompt_designer_model', 'google/gemini-2.5-flash');

        // Chọn agent phù hợp
        $agent = $this->resolveAgent($taskType)->withModel($model);

        // Xây dựng user message text
        $userText = $this->buildUserText(
            $userPrompt,
            $style,
            $negativePrompt,
            $templateSystemPrompt,
            $referenceImages,
            $aspectRatio,
            $taskType,
        );

        // Xây dựng attachments (ảnh tham chiếu)
        $attachments = $this->buildAttachments($referenceImages);

        // Gọi agent — structured output trả về array-like response
        $response = $agent->prompt(
            prompt: $userText,
            attachments: $attachments,
        );

        // Structured output → truy cập trực tiếp qua ArrayAccess
        $prompt = $response['prompt'] ?? null;
        $negative = $response['negative_prompt'] ?? null;

        if (empty($prompt)) {
            Log::warning('PromptDesigner: Structured output missing prompt field', [
                'response' => (string) $response,
            ]);

            return $this->fallback($userPrompt, $negativePrompt);
        }

        return [
            'prompt' => trim($prompt),
            'negative_prompt' => !empty($negative) ? trim($negative) : $negativePrompt,
            'designed' => true,
        ];
    }

    /**
     * Chọn agent class theo task type.
     */
    private function resolveAgent(string $taskType): BasePromptDesigner
    {
        return match ($taskType) {
            'generate', 'template' => new GenerateDesigner(),
            'style-transfer'       => new StyleTransferDesigner(),
            'variation'            => new VariationDesigner(),
            'ad-image'             => new AdImageDesigner(),
            'character'            => new CharacterDesigner(),
            default                => new GenerateDesigner(),
        };
    }

    /**
     * Xây dựng user message text với context đầy đủ.
     */
    private function buildUserText(
        string $userPrompt,
        ?string $style,
        ?string $negativePrompt,
        ?string $templateSystemPrompt,
        ?array $referenceImages,
        ?string $aspectRatio,
        string $taskType,
    ): string {
        $hasRefs = !empty($referenceImages);
        $hasTemplate = !empty($templateSystemPrompt);

        // Context header — giúp LLM hiểu yêu cầu ngay lập tức
        $parts = [];

        // Task type context
        $taskLabel = match ($taskType) {
            'generate'       => $hasTemplate ? 'TEMPLATE-GUIDED generation' : ($hasRefs ? 'REFERENCE-BASED generation' : 'TEXT-ONLY generation'),
            'template'       => 'TEMPLATE-GUIDED generation',
            'style-transfer' => 'STYLE TRANSFER',
            'variation'      => 'IMAGE VARIATION',
            'ad-image'       => 'ADVERTISING IMAGE',
            'character'      => 'CONSISTENT CHARACTER',
            default          => 'IMAGE GENERATION',
        };
        $parts[] = "## Task: {$taskLabel}";

        // User prompt
        $parts[] = "User prompt: {$userPrompt}";

        // Style
        if ($style && $style !== 'photorealistic') {
            $parts[] = "Rendering style: {$style}";
        }

        // Aspect ratio
        if ($aspectRatio) {
            $parts[] = "Aspect ratio: {$aspectRatio}";
        }

        // Negative prompt từ user
        if ($negativePrompt) {
            $parts[] = "User wants to AVOID: {$negativePrompt}";
        }

        // Template creative direction
        if ($hasTemplate) {
            $parts[] = "\n## Template Creative Direction\n{$templateSystemPrompt}";
        }

        // Reference images context
        if ($hasRefs) {
            $refCount = count($referenceImages);
            $parts[] = "\n## Reference Images ({$refCount} attached)";

            if ($refCount === 1) {
                $parts[] = "→ This is the MAIN SUBJECT. Describe it with extreme precision.";
            } else {
                $parts[] = "→ Image 1 = MAIN SUBJECT (preserve exactly).\n→ Images 2-{$refCount} = style/mood/environment reference.";
            }
        }

        return implode("\n", $parts);
    }

    /**
     * Chuyển đổi reference images thành Laravel AI attachments.
     *
     * @return array<RemoteImage|Base64Image>
     */
    private function buildAttachments(?array $referenceImages): array
    {
        if (empty($referenceImages)) {
            return [];
        }

        $attachments = [];
        $count = 0;

        foreach ($referenceImages as $imgRef) {
            if ($count >= 6) {
                break;
            }

            if (str_starts_with($imgRef, 'http://') || str_starts_with($imgRef, 'https://')) {
                $attachments[] = new RemoteImage($imgRef);
            } elseif (str_starts_with($imgRef, 'data:image/')) {
                // Tách mime và base64 data từ data URL
                $parts = explode(',', $imgRef, 2);
                $base64Data = $parts[1] ?? $imgRef;
                $mimeMatch = [];
                preg_match('/^data:(image\/[^;]+);/', $imgRef, $mimeMatch);
                $mime = $mimeMatch[1] ?? 'image/jpeg';

                $attachments[] = new Base64Image($base64Data, $mime);
            } else {
                // Raw base64 → mặc định jpeg
                $attachments[] = new Base64Image($imgRef, 'image/jpeg');
            }

            $count++;
        }

        return $attachments;
    }

    /**
     * Fallback — trả prompt gốc khi Designer tắt hoặc gặp lỗi.
     */
    private function fallback(string $prompt, ?string $negativePrompt): array
    {
        return [
            'prompt' => $prompt,
            'negative_prompt' => $negativePrompt,
            'designed' => false,
        ];
    }
}
