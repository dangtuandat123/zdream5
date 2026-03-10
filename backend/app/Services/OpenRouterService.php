<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
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
        $this->defaultModel = config('services.openrouter.default_model', 'google/gemini-2.5-flash-image-preview');
    }

    /**
     * Tạo ảnh AI từ prompt.
     *
     * @param string $prompt Prompt mô tả ảnh
     * @param string|null $negativePrompt Negative prompt (không bắt buộc)
     * @param string $aspectRatio Tỉ lệ ảnh (1:1, 16:9, 9:16, 4:3)
     * @param string|null $model Model AI (mặc định từ config)
     * @return array{file_path: string, file_url: string} Đường dẫn và URL ảnh
     *
     * @throws \RuntimeException Nếu API lỗi hoặc không trả ảnh
     */
    public function generateImage(
        string $prompt,
        ?string $negativePrompt = null,
        string $aspectRatio = '1:1',
        ?string $model = null,
        ?array $referenceImages = null,
    ): array {
        $model = $model ?? $this->defaultModel;

        // Xây dựng nội dung message
        $messageText = $prompt;
        if ($negativePrompt) {
            $messageText .= "\n\nAvoid: " . $negativePrompt;
        }

        // Thêm hướng dẫn tỉ lệ ảnh vào prompt vì 1 số model không hỗ trợ image_config
        $messageText .= "\n\nPlease ensure the aspect ratio is {$aspectRatio}.";

        // Mảng chứa cả Text và Image nếu có ảnh tham chiếu
        if (!empty($referenceImages)) {
            $finalContent = [
                [
                    'type' => 'text',
                    'text' => $messageText,
                ]
            ];
            
            foreach ($referenceImages as $imgBase64) {
                // Thêm tiền tố data:image nếu có lỗi thiếu từ Frontend
                if (!str_starts_with($imgBase64, 'data:image/')) {
                    $imgBase64 = "data:image/jpeg;base64," . $imgBase64;
                }
                $finalContent[] = [
                    'type' => 'image_url',
                    'image_url' => [
                        'url' => $imgBase64,
                    ],
                ];
            }
        } else {
            $finalContent = $messageText;
        }

        // Payload gửi đến OpenRouter
        $payload = [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $finalContent,
                ],
            ],
            'modalities' => ['image', 'text'],
        ];

        // Gọi API OpenRouter
        $response = Http::timeout(120)
            ->withoutVerifying()
            ->withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
                'HTTP-Referer' => config('app.url'),
                'X-Title' => config('app.name'),
            ])
            ->post("{$this->baseUrl}/chat/completions", $payload);

        if ($response->failed()) {
            throw new \RuntimeException(
                "OpenRouter API lỗi: " . $response->status() . " - " . $response->body()
            );
        }

        $data = $response->json();

        // Trích xuất ảnh từ response
        $images = data_get($data, 'choices.0.message.images', []);

        if (empty($images)) {
            throw new \RuntimeException(
                "OpenRouter không trả về ảnh. Response: " . json_encode($data)
            );
        }

        // Lấy base64 data URL từ ảnh đầu tiên
        $imageDataUrl = data_get($images, '0.image_url.url', '');

        if (empty($imageDataUrl)) {
            throw new \RuntimeException("Không tìm thấy URL ảnh trong response.");
        }

        // Xử lý cả Base64 Data URL và HTTP URL
        return $this->processImageResponse($imageDataUrl);
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
            // Tải ảnh từ HTTP URL
            $imageResponse = Http::timeout(30)->withoutVerifying()->get($imageUrl);
            if ($imageResponse->failed()) {
                throw new \RuntimeException("Không thể tải ảnh từ URL: " . $imageUrl);
            }
            $imageData = $imageResponse->body();
            
            // Thử xác định extension từ header hoặc URL
            $contentType = $imageResponse->header('Content-Type');
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
