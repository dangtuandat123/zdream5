<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Service gọi OpenRouter API để tạo ảnh AI.
 * 
 * Flow: Gửi prompt → OpenRouter trả base64 → Lưu thành file PNG → Trả URL.
 */
class OpenRouterService
{
    private string $apiKey;
    private string $baseUrl;
    private string $defaultModel;

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.api_key', '');
        $this->baseUrl = config('services.openrouter.base_url', 'https://openrouter.ai/api/v1');
        $this->defaultModel = Setting::get('default_model')
            ?? config('services.openrouter.default_model', 'google/gemini-2.5-flash-image');
    }

    /**
     * Tạo ảnh AI từ prompt thông qua OpenRouter API.
     *
     * @param string $prompt Prompt mô tả ảnh
     * @param string|null $negativePrompt Negative prompt (không bắt buộc)
     * @param string $aspectRatio Tỉ lệ ảnh theo OpenRouter (1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9)
     * @param string $imageSize Độ phân giải: 1K (mặc định), 2K, 4K
     * @param string|null $model Model AI (mặc định từ config)
     * @param string|null $style Phong cách ảnh — nhúng vào prompt text
     * @param array|null $referenceImages Mảng ảnh tham chiếu (base64 data URL)
     * @param array|null $modalities Output modalities theo OpenRouter docs:
     *                               ['image', 'text'] cho Gemini, ['image'] cho FLUX/Sourceful
     * @return array{file_path: string, file_url: string} Đường dẫn và URL ảnh
     *
     * @throws \RuntimeException Nếu API lỗi hoặc không trả ảnh
     */
    public function generateImage(
        string $prompt,
        ?string $negativePrompt = null,
        string $aspectRatio = '1:1',
        string $imageSize = '1K',
        ?string $model = null,
        ?string $style = null,
        ?array $referenceImages = null,
        ?array $modalities = null,
    ): array {
        $model = $model ?? $this->defaultModel;

        // Xây dựng nội dung message — nhúng style và negative prompt vào text
        $messageText = '';
        if ($style && $style !== 'photorealistic') {
            $messageText .= "Style: {$style}. ";
        }
        $messageText .= $prompt;
        if ($negativePrompt) {
            $messageText .= "\n\nAvoid: " . $negativePrompt;
        }

        // Mảng chứa cả Text và Image nếu có ảnh tham chiếu
        if (!empty($referenceImages)) {
            $finalContent = [
                [
                    'type' => 'text',
                    'text' => $messageText,
                ]
            ];

            foreach ($referenceImages as $imgData) {
                // URL trực tiếp (ảnh từ thư viện/MinIO) → gửi thẳng cho OpenRouter
                if (str_starts_with($imgData, 'http://') || str_starts_with($imgData, 'https://')) {
                    $finalContent[] = [
                        'type' => 'image_url',
                        'image_url' => [
                            'url' => $imgData,
                        ],
                    ];
                    continue;
                }

                // Base64 data URL → gửi trực tiếp
                if (!str_starts_with($imgData, 'data:image/')) {
                    $imgData = "data:image/jpeg;base64," . $imgData;
                }
                $finalContent[] = [
                    'type' => 'image_url',
                    'image_url' => [
                        'url' => $imgData,
                    ],
                ];
            }
        } else {
            $finalContent = $messageText;
        }

        // Xác định modalities theo loại model:
        // - Gemini: ['image', 'text'] — output cả ảnh và text
        // - FLUX, Sourceful: ['image'] — chỉ output ảnh
        $resolvedModalities = $modalities ?? ['image', 'text'];

        // Payload gửi đến OpenRouter — chuẩn theo API docs
        $payload = [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $finalContent,
                ],
            ],
            'modalities' => $resolvedModalities,
        ];

        // image_config — luôn gửi để đảm bảo OpenRouter xử lý đúng aspect ratio và size
        $payload['image_config'] = [
            'aspect_ratio' => $aspectRatio,
            'image_size' => $imageSize,
        ];

        // Gọi API OpenRouter
        $response = Http::timeout(120)
            ->withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
                'HTTP-Referer' => 'https://zdream.vn',
                'X-OpenRouter-Title' => 'ZDream - AI Image Generator',
                'X-OpenRouter-Categories' => 'image-gen',
            ])
            ->post("{$this->baseUrl}/chat/completions", $payload);

        if ($response->failed()) {
            Log::error('OpenRouter API lỗi', [
                'status' => $response->status(),
                'body' => mb_substr($response->body(), 0, 500),
            ]);
            throw new \RuntimeException(
                "OpenRouter API lỗi: HTTP " . $response->status()
            );
        }

        $data = $response->json();

        // Kiểm tra lỗi trong payload (OpenRouter đôi khi trả 200 nhưng body chứa error)
        if (isset($data['error'])) {
            $errMessage = $data['error']['message'] ?? 'Lỗi không xác định từ OpenRouter';
            $errCode = $data['error']['code'] ?? 500;
            throw new \RuntimeException(
                "OpenRouter API trả về lỗi ($errCode): $errMessage"
            );
        }

        // Trích xuất ảnh từ response — robust cho nhiều loại model
        $imageDataUrl = $this->extractImageFromResponse($data);

        if (empty($imageDataUrl)) {
            Log::error('OpenRouter Response missing images', [
                'model' => $model,
                'modalities' => $resolvedModalities,
                'response_keys' => array_keys($data),
                'message_keys' => array_keys(data_get($data, 'choices.0.message', [])),
            ]);
            throw new \RuntimeException(
                "OpenRouter không trả về ảnh. Có thể model này chưa hỗ trợ tạo ảnh trực tiếp."
            );
        }

        // Xử lý cả Base64 Data URL và HTTP URL
        return $this->processImageResponse($imageDataUrl);
    }

    /**
     * Phân tích ảnh bằng AI, trả về text (không tạo ảnh).
     */
    public function analyzeImage(string $systemPrompt, array $referenceImages): string
    {
        $content = [];
        foreach ($referenceImages as $imgBase64) {
            if (!str_starts_with($imgBase64, 'data:image/')) {
                $imgBase64 = "data:image/jpeg;base64," . $imgBase64;
            }
            $content[] = [
                'type' => 'image_url',
                'image_url' => ['url' => $imgBase64],
            ];
        }
        $content[] = ['type' => 'text', 'text' => 'Analyze this image and write a detailed prompt.'];

        $textModel = Setting::get('prompt_designer_model', 'google/gemini-2.5-flash');

        $response = Http::timeout(60)
            ->withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
                'HTTP-Referer' => 'https://zdream.vn',
                'X-OpenRouter-Title' => 'ZDream - AI Image Generator',
            ])
            ->post("{$this->baseUrl}/chat/completions", [
                'model' => $textModel,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $content],
                ],
            ]);

        if ($response->failed()) {
            throw new \RuntimeException("OpenRouter API lỗi: HTTP " . $response->status());
        }

        $data = $response->json();
        if (isset($data['error'])) {
            throw new \RuntimeException("OpenRouter: " . ($data['error']['message'] ?? 'Unknown error'));
        }

        return data_get($data, 'choices.0.message.content', '');
    }

    /**
     * Trích xuất image URL/base64 từ response OpenRouter.
     *
     * Thử nhiều vị trí vì các model khác nhau trả response format khác nhau:
     * 1. choices.0.message.images.0.image_url.url — Chuẩn theo docs (Gemini, v.v.)
     * 2. choices.0.message.content (inline base64) — Một số model trả trực tiếp
     */
    private function extractImageFromResponse(array $data): ?string
    {
        // Strategy 1: Chuẩn OpenRouter — images array trong message
        $images = data_get($data, 'choices.0.message.images', []);
        if (!empty($images)) {
            $url = data_get($images, '0.image_url.url', '');
            if (!empty($url)) {
                return $url;
            }
        }

        // Strategy 2: Check content nếu nó là base64 data URL
        $content = data_get($data, 'choices.0.message.content', '');
        if (is_string($content) && str_starts_with($content, 'data:image/')) {
            return $content;
        }

        // Strategy 3: Check content nếu là array (multimodal response)
        if (is_array($content)) {
            foreach ($content as $part) {
                if (($part['type'] ?? '') === 'image_url') {
                    $url = $part['image_url']['url'] ?? '';
                    if (!empty($url)) {
                        return $url;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Tải hoặc decode ảnh và lưu vào storage (MinIO).
     *
     * @param string $imageUrl Data URL hoặc HTTP URL
     * @return array{file_path: string, file_url: string}
     */
    private function processImageResponse(string $imageUrl): array
    {
        $imageData = null;
        $extension = 'png';

        if (str_starts_with($imageUrl, 'http://') || str_starts_with($imageUrl, 'https://')) {
            // Chống SSRF: chỉ cho phép HTTPS
            if (!str_starts_with($imageUrl, 'https://')) {
                throw new \RuntimeException("Chỉ chấp nhận HTTPS URL cho ảnh.");
            }

            // Tải ảnh từ HTTPS URL
            $imageResponse = Http::timeout(30)->get($imageUrl);
            if ($imageResponse->failed()) {
                throw new \RuntimeException("Không thể tải ảnh từ URL.");
            }
            $imageData = $imageResponse->body();

            // Xác định extension từ header hoặc URL — null-safe cho content-type
            $contentType = $imageResponse->header('Content-Type') ?? '';
            if (str_contains($contentType, 'jpeg') || str_contains($contentType, 'jpg')) $extension = 'jpg';
            elseif (str_contains($contentType, 'webp')) $extension = 'webp';
            elseif (str_contains(strtolower($imageUrl), '.jpg')) $extension = 'jpg';
            elseif (str_contains(strtolower($imageUrl), '.webp')) $extension = 'webp';
        } else {
            // Xử lý Base64 Data URL
            $parts = explode(',', $imageUrl, 2);
            if (count($parts) !== 2) {
                throw new \RuntimeException("Định dạng data URL không hợp lệ.");
            }

            $base64Data = $parts[1];
            $imageData = base64_decode($base64Data, true);

            if ($imageData === false) {
                throw new \RuntimeException("Không thể decode base64 image.");
            }

            // Xác định extension từ MIME type
            if (str_contains($parts[0], 'image/jpeg') || str_contains($parts[0], 'image/jpg')) {
                $extension = 'jpg';
            } elseif (str_contains($parts[0], 'image/webp')) {
                $extension = 'webp';
            }
        }

        // Tạo tên file unique
        $filename = 'images/' . date('Y/m/d') . '/' . Str::uuid() . '.' . $extension;

        // Lưu vào storage (S3/MinIO) với quyền public
        $disk = config('filesystems.default');
        Storage::disk($disk)->put($filename, $imageData, 'public');

        return [
            'file_path' => $filename,
            'file_url' => Storage::disk($disk)->url($filename),
        ];
    }
}
