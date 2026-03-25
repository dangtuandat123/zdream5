<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Project; // Added this line

class Image extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'project_id',
        'prompt',
        'negative_prompt',
        'model',
        'style',
        'aspect_ratio',
        'file_path',
        'file_url',
        'seed',
        'gems_cost',
        'template_slug',
        'reference_images',
    ];

    protected function casts(): array
    {
        return [
            'seed' => 'integer',
            'gems_cost' => 'integer',
            'reference_images' => 'array',
        ];
    }

    /**
     * Người tạo ảnh
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Dự án chứa ảnh này
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
