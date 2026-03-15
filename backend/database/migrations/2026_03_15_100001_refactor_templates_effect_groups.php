<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table): void {
            $table->json('effect_groups')->nullable()->after('thumbnail');
        });

        // Migrate existing data: merge context_options + material_options → effect_groups
        $templates = DB::table('templates')
            ->whereNotNull('context_options')
            ->orWhereNotNull('material_options')
            ->get(['id', 'context_options', 'material_options']);

        foreach ($templates as $template) {
            $groups = [];

            $context = json_decode($template->context_options ?? '[]', true);
            if (!empty($context)) {
                $groups[] = [
                    'name' => 'Bối cảnh',
                    'options' => $context,
                ];
            }

            $material = json_decode($template->material_options ?? '[]', true);
            if (!empty($material)) {
                $groups[] = [
                    'name' => 'Chất liệu',
                    'options' => $material,
                ];
            }

            if (!empty($groups)) {
                DB::table('templates')
                    ->where('id', $template->id)
                    ->update(['effect_groups' => json_encode($groups)]);
            }
        }

        Schema::table('templates', function (Blueprint $table): void {
            $table->dropColumn(['context_options', 'material_options', 'sample_images']);
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table): void {
            $table->json('context_options')->nullable();
            $table->json('material_options')->nullable();
            $table->json('sample_images')->nullable();
        });

        Schema::table('templates', function (Blueprint $table): void {
            $table->dropColumn('effect_groups');
        });
    }
};
