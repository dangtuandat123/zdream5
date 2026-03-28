<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    /** Cache TTL: 5 phút — cân bằng giữa performance và độ tươi của data */
    private const CACHE_TTL = 300;

    // === Static Helpers ===

    /**
     * Lấy giá trị setting theo key (có cache 5 phút).
     * Giảm từ 5-6 DB queries/request xuống 0-1.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("settings.{$key}", self::CACHE_TTL, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting?->value ?? $default;
        });
    }

    /**
     * Cập nhật hoặc tạo mới setting — xoá cache tương ứng
     */
    public static function set(string $key, mixed $value, string $group = 'general'): static
    {
        Cache::forget("settings.{$key}");

        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group],
        );
    }
}
