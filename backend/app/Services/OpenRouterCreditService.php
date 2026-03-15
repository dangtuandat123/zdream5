<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;

/**
 * Service lấy thông tin credit từ OpenRouter API.
 */
class OpenRouterCreditService
{
    /**
     * Lấy số dư credit từ OpenRouter.
     *
     * @return array{balance: float, usage: float, limit: float|null}
     * @throws \RuntimeException Nếu API lỗi
     */
    public function getCredits(): array
    {
        $apiKey = config('services.openrouter.api_key', '');
        $baseUrl = config('services.openrouter.base_url', 'https://openrouter.ai/api/v1');

        $response = Http::timeout(15)
            ->withoutVerifying()
            ->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
            ])
            ->get("{$baseUrl}/credits");

        if ($response->failed()) {
            throw new \RuntimeException(
                "Không thể lấy thông tin credit: " . $response->status()
            );
        }

        $data = $response->json('data', []);

        return [
            'balance' => (float) ($data['total_credits'] ?? 0) - (float) ($data['total_usage'] ?? 0),
            'usage' => (float) ($data['total_usage'] ?? 0),
            'limit' => $data['limit'] ?? null,
        ];
    }
}
