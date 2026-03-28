<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Thêm cột designed_prompt — lưu prompt đã được AI Prompt Designer tối ưu.
 * Cột prompt gốc vẫn giữ nguyên (prompt user nhập).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->text('designed_prompt')->nullable()->after('prompt');
        });
    }

    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->dropColumn('designed_prompt');
        });
    }
};
