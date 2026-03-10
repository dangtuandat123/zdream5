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
    ): array {
        $model = $model ?? $this->defaultModel;

        // Xây dựng nội dung message
        $messageContent = $prompt;
        if ($negativePrompt) {
            $messageContent .= "\n\nAvoid: " . $negativePrompt;
        }

        // Payload gửi đến OpenRouter
        $payload = [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $messageContent,
                ],
            ],
            'modalities' => ['image', 'text'],
            'image_config' => [
                'aspect_ratio' => $aspectRatio,
            ],
        ];

        // Gọi API OpenRouter
        $response = Http::timeout(120)
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

        // Decode base64 và lưu thành file
        return $this->saveBase64Image($imageDataUrl);
    }

    /**
     * Lưu ảnh base64 vào storage và trả về đường dẫn.
     *
     * @param string $dataUrl Data URL dạng "data:image/png;base64,..."
     * @return array{file_path: string, file_url: string}
     */
    private function saveBase64Image(string $dataUrl): array
    {
        // Tách phần base64 khỏi data URL prefix
        $parts = explode(',', $dataUrl, 2);
        if (count($parts) !== 2) {
            throw new \RuntimeException("Định dạng data URL không hợp lệ.");
        }

        $base64Data = $parts[1];
        $imageData = base64_decode($base64Data, true);

        if ($imageData === false) {
            throw new \RuntimeException("Không thể decode base64 image.");
        }

        // Xác định extension từ MIME type
        $extension = 'png';
        if (str_contains($parts[0], 'image/jpeg') || str_contains($parts[0], 'image/jpg')) {
            $extension = 'jpg';
        } elseif (str_contains($parts[0], 'image/webp')) {
            $extension = 'webp';
        }

        // Tạo tên file unique
        $filename = 'images/' . date('Y/m/d') . '/' . Str::uuid() . '.' . $extension;

        // Lưu vào storage (S3/MinIO)
        $disk = config('filesystems.default');
        Storage::disk($disk)->put($filename, $imageData);

        return [
            'file_path' => $filename,
            'file_url' => Storage::disk($disk)->url($filename),
        ];
    }
}
