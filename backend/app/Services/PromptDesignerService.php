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
You are an expert AI image prompt designer. Your job is to transform user requests into highly detailed, optimized prompts that produce the best possible AI-generated images.

## Your Tasks:
1. **Analyze reference images** (if provided): Describe composition, colors, lighting, style, mood, and key visual elements. Understand what the user wants to keep, transform, or combine from these references.
2. **Understand user intent**: What exactly does the user want to create? Consider the style, mood, and purpose.
3. **Design the optimal prompt**: Create a detailed, structured prompt that maximizes image quality with professional photography/art direction knowledge.

## Output Format (strict JSON only):
{"prompt":"The optimized detailed prompt for image generation","negative_prompt":"Things to avoid in the generated image"}

## Rules:
- Output ONLY valid JSON. No markdown, no code blocks, no explanation.
- Prompt should be in English for best model compatibility.
- Include specific details: lighting, composition, camera angle, color palette, mood, atmosphere.
- Keep prompt concise but detailed (under 300 words).
- If reference images are provided, incorporate their key visual elements into the prompt design.
- If a template/style context is given, ensure the prompt aligns with that creative direction.
- Preserve the user's core intent while enhancing with professional art direction.
- negative_prompt should list common defects to avoid (blur, distortion, artifacts, etc.) plus any user-specified exclusions.
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

        // Xây dựng user message text — cung cấp đầy đủ context cho LLM
        $userText = "## User Request\n";
        $userText .= "Prompt: {$userPrompt}\n";

        if ($style && $style !== 'photorealistic') {
            $userText .= "Style: {$style}\n";
        }

        if ($aspectRatio) {
            $userText .= "Aspect Ratio: {$aspectRatio}\n";
        }

        if ($negativePrompt) {
            $userText .= "User wants to avoid: {$negativePrompt}\n";
        }

        if ($templateSystemPrompt) {
            $userText .= "\n## Template Context\n{$templateSystemPrompt}\n";
        }

        if (!empty($referenceImages)) {
            $userText .= "\n## Reference Images\n";
            $userText .= count($referenceImages) . " reference image(s) attached. ";
            $userText .= "Analyze them carefully and incorporate their visual elements into the prompt design.\n";
        }

        // Xây dựng content array — text + images (nếu có)
        if (!empty($referenceImages)) {
            $content = [
                ['type' => 'text', 'text' => $userText],
            ];

            foreach ($referenceImages as $imgRef) {
                // Chỉ gửi tối đa 3 ảnh tham chiếu để tiết kiệm token
                if (count($content) > 3) {
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
            }
        } else {
            $content = $userText;
        }

        // Gọi OpenRouter API — model text (có vision capability)
        $response = Http::timeout(30)
            ->withoutVerifying()
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
        ];
    }
}
