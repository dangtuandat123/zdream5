<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->string('tool_name')->nullable()->after('template_slug');
            $table->index(['user_id', 'tool_name']);
        });
    }

    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'tool_name']);
            $table->dropColumn('tool_name');
        });
    }
};
