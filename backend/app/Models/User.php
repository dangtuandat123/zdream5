<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Hằng số phân quyền
    public const LEVEL_USER = 0;
    public const LEVEL_MOD = 1;
    public const LEVEL_ADMIN = 2;
    public const LEVEL_SUPER = 99;

    /**
     * @var list<string>
     */
    /**
     * Chỉ cho phép mass-assign các trường an toàn.
     * gems, level, google_id, email_verified_at phải set trực tiếp để chống escalation.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'gems' => 'integer',
            'level' => 'integer',
        ];
    }

    // === Authorization Helpers ===

    public function isSuper(): bool
    {
        return $this->level === self::LEVEL_SUPER;
    }

    public function isAdmin(): bool
    {
        return $this->level >= self::LEVEL_ADMIN;
    }

    public function isMod(): bool
    {
        return $this->level >= self::LEVEL_MOD;
    }

    // === Relationships ===

    /**
     * Ảnh đã tạo bởi user
     */
    public function images(): HasMany
    {
        return $this->hasMany(Image::class);
    }

    /**
     * Lịch sử giao dịch gems
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
