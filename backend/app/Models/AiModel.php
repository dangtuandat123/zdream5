<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class AiModel extends Model
{
    protected $table = 'ai_models';

    protected $fillable = [
        'name',
        'model_id',
        'provider',
        'gems_cost',
        'is_active',
        'sort_order',
        'config',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'config' => 'array',
            'is_active' => 'boolean',
            'gems_cost' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Chỉ lấy model đang bật, sắp xếp theo sort_order
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
