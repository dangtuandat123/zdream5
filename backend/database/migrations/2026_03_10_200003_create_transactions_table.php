<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['topup', 'spend']); // Nạp hoặc Tiêu
            $table->unsignedInteger('amount');          // Số gems thay đổi
            $table->unsignedInteger('balance_after');    // Số dư sau giao dịch
            $table->string('description');               // Mô tả giao dịch
            $table->json('metadata')->nullable();        // Metadata phụ (bank ref, package id...)
            $table->timestamps();

            // Index cho truy vấn lịch sử nhanh
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
