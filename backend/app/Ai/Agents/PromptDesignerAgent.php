<?php

declare(strict_types=1);

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

/**
 * Agent chuyên thiết kế prompt tối ưu cho AI image generation.
 *
 * Nhận prompt thô từ user + context (style, ảnh tham chiếu, template)
 * → Trả về prompt chuyên nghiệp dạng JSON.
 */
#[Provider('openrouter')]
#[Temperature(0.7)]
#[MaxTokens(1024)]
#[Timeout(30)]
class PromptDesignerAgent implements Agent
{
    use Promptable;

    public function __construct(
        private string $systemPrompt,
        private ?string $model = null,
    ) {}

    /**
     * System prompt hướng dẫn LLM cách thiết kế prompt.
     */
    public function instructions(): string
    {
        return $this->systemPrompt;
    }

    /**
     * Override model nếu admin cấu hình trong Settings.
     */
    public function model(): ?string
    {
        return $this->model;
    }
}
