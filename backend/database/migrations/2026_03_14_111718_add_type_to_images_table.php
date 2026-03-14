<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('images', 'type')) {
            Schema::table('images', function (Blueprint $table) {
                $table->string('type', 20)->default('ai')->after('user_id');
                $table->index(['user_id', 'type']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            //
        });
    }
};
