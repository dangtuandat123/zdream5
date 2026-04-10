<?php

declare(strict_types=1);

namespace App\Services;

use App\Ai\Agents\PromptDesignerAgent;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Files\Base64Image;
use Laravel\Ai\Files\RemoteImage;

/**
 * AI Prompt Designer — Workflow thông minh tối ưu prompt trước khi sinh ảnh.
 *
 * Flow: Nhận prompt thô + ảnh tham chiếu + context → Gọi LLM text (có vision)
 *       → Phân tích, hiểu, thiết kế → Trả về prompt chuyên nghiệp.
 *
 * Sử dụng Laravel AI SDK (laravel/ai) với OpenRouter provider.
 */
class PromptDesignerService
{
    /** System prompt mặc định — admin có thể tùy chỉnh qua Settings */
    private const DEFAULT_SYSTEM_PROMPT = <<<'PROMPT'
You are an expert AI image prompt designer for ZDream. You receive a user request (text + optional reference images + optional style/template context) and output a single optimized prompt for an AI image generation model.

## Step 1 — Classify the request into one of these MODES:

**MODE A — Text-only (no reference images):**
The user describes what they want from scratch. Be CREATIVE: invent vivid details, professional lighting, cinematic composition, rich atmosphere. Add specific art-direction details the user likely wants but didn't articulate.

**MODE B — Reference + Enhance (reference images provided, user wants the SAME subject):**
The user uploaded a product, person, object, or scene and wants it in a better/different setting. You MUST:
- Describe the EXACT subject from the reference with surgical precision: shape, material, texture, color, branding/text, proportions, distinctive features.
- NEVER alter, replace, reimagine, or "improve" the subject itself.
- Only enhance what SURROUNDS the subject: background, lighting, angle, atmosphere.
- Think: "product photography brief" — the client wants THAT EXACT item, just shot beautifully.

**MODE C — Reference + Transform (reference images provided, user explicitly asks to CHANGE something):**
The user uploaded a reference but their prompt explicitly requests changes (e.g., "make it cartoon style", "change background to beach", "make the bottle gold instead of silver"). You MUST:
- Still describe the reference subject accurately as a baseline.
- Apply ONLY the specific changes the user requested.
- Keep everything else faithful to the reference.

**MODE D — Template mode (template context provided):**
A creative template defines the art direction. Follow the template instructions as your PRIMARY guide. Reference images (if any) still follow Mode B/C rules within the template's creative framework.

## Step 2 — Detect the subject category and adapt:
- **Product** (perfume, shoes, food, packaging): Extreme precision on shape, label, branding, material. These are commercial — fidelity is non-negotiable.
- **Person/Portrait**: Preserve facial features, skin tone, hair, clothing, accessories. Enhance pose, lighting, background.
- **Scene/Landscape**: Preserve the overall composition and key landmarks. Enhance mood, time of day, atmosphere.
- **Art/Abstract**: More creative freedom allowed. Preserve the core concept and color palette.
- **Multiple references**: First image = main subject. Additional images = style/mood/environment reference unless user says otherwise.

## Step 3 — Output (strict JSON, nothing else):
{"prompt":"...", "negative_prompt":"..."}

## Hard Rules:
- Output ONLY valid JSON. No markdown, no explanation, no code blocks.
- Prompt in English. Under 300 words.
- Be specific: light direction, camera lens, color grading, texture, material, composition.
- MODE B/C: Start the prompt with a detailed description of the reference subject BEFORE describing the scene.
- negative_prompt MUST include:
  - Common defects: blurry, distorted, low quality, artifacts, deformed, watermark.
  - For MODE B/C: "different design, altered proportions, wrong shape, changed branding, modified subject".
  - Any user-specified exclusions.
- If the user prompt is in a non-English language, still output the prompt in English but faithfully translate the user's intent.
- When style is specified (e.g., anime, watercolor, oil painting): apply the style to the RENDERING TECHNIQUE, never change the subject's physical identity.
PROMPT;

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
     * @param string $userPrompt Prompt gốc từ user
     * @param string|null $style Phong cách ảnh (anime, photorealistic, ...)
     * @param string|null $negativePrompt Negative prompt gốc
     * @param string|null $templateSystemPrompt System prompt từ template (nếu dùng template)
     * @param array|null $referenceImages Ảnh tham chiếu (base64 data URL hoặc HTTP URL)
     * @param string|null $aspectRatio Tỉ lệ ảnh
     * @return array{prompt: string, negative_prompt: string|null, designed: bool}
     */
    public function design(
        string $userPrompt,
        ?string $style = null,
        ?string $negativePrompt = null,
        ?string $templateSystemPrompt = null,
        ?array $referenceImages = null,
        ?string $aspectRatio = null,
    ): array {
        // Fallback nếu tắt hoặc không có API key
        if (!$this->isEnabled() || empty(config('services.openrouter.api_key'))) {
            return $this->fallback($userPrompt, $negativePrompt);
        }

        try {
            return $this->callDesignerLLM(
                $userPrompt,
                $style,
                $negativePrompt,
                $templateSystemPrompt,
                $referenceImages,
                $aspectRatio,
            );
        } catch (\Throwable $e) {
            // Ghi log lỗi nhưng KHÔNG block user — fallback về prompt gốc
            Log::warning('PromptDesigner LLM call failed, using fallback', [
                'error' => $e->getMessage(),
                'prompt' => mb_substr($userPrompt, 0, 100),
            ]);

            return $this->fallback($userPrompt, $negativePrompt);
        }
    }

    /**
     * Gọi LLM text model (có vision) qua Laravel AI SDK để thiết kế prompt.
     */
    private function callDesignerLLM(
        string $userPrompt,
        ?string $style,
        ?string $negativePrompt,
        ?string $templateSystemPrompt,
        ?array $referenceImages,
        ?string $aspectRatio,
    ): array {
        $model = Setting::get('prompt_designer_model', 'google/gemini-2.5-flash');
        $systemPrompt = Setting::get('prompt_designer_system_prompt') ?: self::DEFAULT_SYSTEM_PROMPT;

        // Xây dựng user message text
        $userText = $this->buildUserText(
            $userPrompt,
            $style,
            $negativePrompt,
            $templateSystemPrompt,
            $referenceImages,
            $aspectRatio,
        );

        // Xây dựng attachments (ảnh tham chiếu) cho vision
        $attachments = $this->buildAttachments($referenceImages);

        // Tạo Agent instance và gọi prompt
        $agent = new PromptDesignerAgent(
            systemPrompt: $systemPrompt,
            model: $model,
        );

        $response = $agent->prompt(
            prompt: $userText,
            attachments: $attachments,
            provider: 'openrouter',
            model: $model,
        );

        $llmText = (string) $response;

        return $this->parseDesignResult($llmText, $userPrompt, $negativePrompt);
    }

    /**
     * Xây dựng text phần user message với context đầy đủ.
     */
    private function buildUserText(
        string $userPrompt,
        ?string $style,
        ?string $negativePrompt,
        ?string $templateSystemPrompt,
        ?array $referenceImages,
        ?string $aspectRatio,
    ): string {
        $hasRefs = !empty($referenceImages);
        $hasTemplate = !empty($templateSystemPrompt);

        // Xác định mode hint cho LLM
        if ($hasTemplate) {
            $modeHint = 'MODE D (Template)' . ($hasRefs ? ' + MODE B (Preserve reference subject)' : '');
        } elseif ($hasRefs) {
            $modeHint = 'MODE B (Reference + Enhance — preserve the subject exactly)';
        } else {
            $modeHint = 'MODE A (Text-only — be creative)';
        }

        $userText = "## Request [{$modeHint}]\n";
        $userText .= "User prompt: {$userPrompt}\n";

        if ($style && $style !== 'photorealistic') {
            $userText .= "Rendering style: {$style} (apply to rendering technique only, NOT to the subject's identity)\n";
        }

        if ($aspectRatio) {
            $userText .= "Aspect ratio: {$aspectRatio}\n";
        }

        if ($negativePrompt) {
            $userText .= "User wants to avoid: {$negativePrompt}\n";
        }

        if ($hasTemplate) {
            $userText .= "\n## Template Creative Direction\n{$templateSystemPrompt}\n";
        }

        if ($hasRefs) {
            $refCount = count($referenceImages);
            $userText .= "\n## Reference Images ({$refCount} attached)\n";
            if ($refCount === 1) {
                $userText .= "This is the MAIN SUBJECT. Describe it with extreme precision — every visual detail matters. Do NOT change or reimagine it.\n";
            } else {
                $userText .= "Image 1 = MAIN SUBJECT (preserve exactly). Additional images = style/mood reference.\n";
            }
        }

        return $userText;
    }

    /**
     * Xây dựng attachments array từ reference images.
     *
     * Chuyển đổi URL và base64 data URL thành RemoteImage/Base64Image
     * để Laravel AI SDK tự xử lý vision content.
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
                // URL ảnh từ MinIO/S3
                $attachments[] = new RemoteImage($imgRef);
            } elseif (str_starts_with($imgRef, 'data:image/')) {
                // Base64 data URL → tách mime và base64 data
                $parts = explode(',', $imgRef, 2);
                $base64Data = $parts[1] ?? $imgRef;
                // Trích mime từ "data:image/jpeg;base64"
                $mimeMatch = [];
                preg_match('/^data:(image\/[^;]+);/', $imgRef, $mimeMatch);
                $mime = $mimeMatch[1] ?? 'image/jpeg';

                $attachments[] = new Base64Image($base64Data, $mime);
            } else {
                // Raw base64 không có prefix → mặc định jpeg
                $attachments[] = new Base64Image($imgRef, 'image/jpeg');
            }

            $count++;
        }

        return $attachments;
    }

    /**
     * Parse JSON response từ LLM → trích xuất prompt + negative_prompt.
     * Có xử lý edge case khi LLM trả markdown hoặc format sai.
     */
    private function parseDesignResult(
        string $llmText,
        string $originalPrompt,
        ?string $originalNegative,
    ): array {
        // Loại bỏ markdown code block nếu LLM trả có bọc ```json ... ```
        $cleaned = preg_replace('/^```(?:json)?\s*|\s*```$/m', '', trim($llmText));

        $parsed = json_decode($cleaned, true);

        if (!is_array($parsed) || empty($parsed['prompt'])) {
            Log::warning('PromptDesigner: Failed to parse LLM JSON', [
                'raw' => mb_substr($llmText, 0, 500),
            ]);

            return $this->fallback($originalPrompt, $originalNegative);
        }

        return [
            'prompt' => trim($parsed['prompt']),
            'negative_prompt' => !empty($parsed['negative_prompt'])
                ? trim($parsed['negative_prompt'])
                : $originalNegative,
            'designed' => true,
        ];
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
