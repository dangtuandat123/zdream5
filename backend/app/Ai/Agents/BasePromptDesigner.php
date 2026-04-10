<?php

declare(strict_types=1);

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

/**
 * Base class cho tất cả Prompt Designer agents.
 *
 * Cung cấp:
 * - Provider config (OpenRouter)
 * - Structured output schema (prompt + negative_prompt)
 * - Model override từ Settings
 *
 * Mỗi child class chỉ cần implement instructions() với system prompt riêng.
 */
#[Provider('openrouter')]
#[Temperature(0.7)]
#[MaxTokens(2048)]
#[Timeout(30)]
abstract class BasePromptDesigner implements Agent, HasStructuredOutput
{
    use Promptable;

    protected ?string $modelOverride = null;

    /**
     * System prompt hướng dẫn LLM — mỗi designer có prompt riêng.
     */
    abstract public function instructions(): string;

    /**
     * Schema output chung: prompt + negative_prompt.
     *
     * Giữ đơn giản vì downstream (ImageController, OpenRouterService)
     * chỉ cần 2 fields này. Intelligence nằm trong system prompt.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'prompt' => $schema->string()
                ->description('Optimized English prompt for AI image generation, under 300 words. Be specific about lighting, composition, materials, textures, camera angle, color grading.')
                ->required(),
            'negative_prompt' => $schema->string()
                ->description('What to exclude: common defects (blurry, distorted, low quality, artifacts, deformed, watermark), context-specific exclusions, and any user-specified exclusions.')
                ->required(),
        ];
    }

    /**
     * Override model (từ Settings hoặc per-request).
     */
    public function model(): ?string
    {
        return $this->modelOverride;
    }

    /**
     * Fluent setter cho model override.
     */
    public function withModel(string $model): static
    {
        $this->modelOverride = $model;

        return $this;
    }
}
