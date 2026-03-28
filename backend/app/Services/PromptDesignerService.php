<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * AI Prompt Designer — Workflow thông minh tối ưu prompt trước khi sinh ảnh.
 *
 * Flow: Nhận prompt thô + ảnh tham chiếu + context → Gọi LLM text (có vision)
 *       → Phân tích, hiểu, thiết kế → Trả về prompt chuyên nghiệp.
 *
 * Service này được dùng chung cho tất cả chức năng sinh ảnh:
 * GeneratePage, TemplateDetailPage, và bất kỳ flow nào trong tương lai.
 */
class PromptDesignerService
{
    private string $apiKey;
    private string $baseUrl;

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

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.api_key', '');
        $this->baseUrl = config('services.openrouter.base_url', 'https://openrouter.ai/api/v1');
    }

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
     * @return array{prompt: string, negative_prompt: string|null}
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
        if (!$this->isEnabled() || empty($this->apiKey)) {
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
     * Gọi LLM text model (có vision) để thiết kế prompt.
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

        // Xây dựng user message — cung cấp context rõ ràng để LLM classify đúng mode
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

        // Xây dựng content array — text + images (nếu có)
        if (!empty($referenceImages)) {
            $content = [
                ['type' => 'text', 'text' => $userText],
            ];

            $imageCount = 0;
            foreach ($referenceImages as $imgRef) {
                // Chỉ gửi tối đa 3 ảnh tham chiếu để tiết kiệm token
                if ($imageCount >= 3) {
                    break;
                }

                // Đảm bảo format data URL đúng
                if (!str_starts_with($imgRef, 'data:image/') && !str_starts_with($imgRef, 'http')) {
                    $imgRef = "data:image/jpeg;base64," . $imgRef;
                }

                $content[] = [
                    'type' => 'image_url',
                    'image_url' => ['url' => $imgRef],
                ];
                $imageCount++;
            }
        } else {
            $content = $userText;
        }

        // Gọi OpenRouter API — model text (có vision capability)
        $response = Http::timeout(30)
            ->withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
                'HTTP-Referer' => 'https://zdream.vn',
                'X-OpenRouter-Title' => 'ZDream - AI Image Generator',
            ])
            ->post("{$this->baseUrl}/chat/completions", [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $content],
                ],
                'temperature' => 0.7,
                'max_tokens' => 1024,
                'response_format' => ['type' => 'json_object'],
            ]);

        if ($response->failed()) {
            throw new \RuntimeException(
                "PromptDesigner API error: " . $response->status() . " - " . $response->body()
            );
        }

        $data = $response->json();

        // Kiểm tra lỗi trong response body
        if (isset($data['error'])) {
            throw new \RuntimeException(
                "PromptDesigner API returned error: " . ($data['error']['message'] ?? 'Unknown')
            );
        }

        // Parse LLM response
        $llmText = data_get($data, 'choices.0.message.content', '');

        return $this->parseDesignResult($llmText, $userPrompt, $negativePrompt);
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
            // Nếu parse fail → fallback
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
