<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Template extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'category',
        'description',
        'system_prompt',
        'model',
        'thumbnail',
        'sample_images',
        'context_options',
        'material_options',
        'is_active',
        'sort_order',
        'created_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sample_images' => 'array',
            'context_options' => 'array',
            'material_options' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    // === Relationships ===

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // === Scopes ===

    /**
     * Chỉ lấy template đang hoạt động, sắp xếp theo sort_order
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
