<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('prompt');
            $table->text('negative_prompt')->nullable();
            $table->string('model')->default('gemini-2.5-flash');
            $table->string('style')->default('photorealistic');
            $table->string('aspect_ratio')->default('1:1');
            $table->string('file_path'); // Đường dẫn file trong storage
            $table->string('file_url');  // URL public để frontend hiển thị
            $table->unsignedInteger('seed')->default(0);
            $table->unsignedInteger('gems_cost')->default(1);
            $table->timestamps();

            // Index cho truy vấn nhanh theo user
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('images');
    }
};
