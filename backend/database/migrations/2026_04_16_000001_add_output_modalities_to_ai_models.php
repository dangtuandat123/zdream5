<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_models', function (Blueprint $table): void {
            // Phân biệt loại output của model:
            // ["image", "text"] → Gemini (tạo ảnh + text)
            // ["image"]         → FLUX, Sourceful (chỉ tạo ảnh)
            $table->json('output_modalities')
                ->default('["image","text"]')
                ->after('provider')
                ->comment('Output modalities theo OpenRouter docs');
        });
    }

    public function down(): void
    {
        Schema::table('ai_models', function (Blueprint $table): void {
            $table->dropColumn('output_modalities');
        });
    }
};
