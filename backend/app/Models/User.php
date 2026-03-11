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

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'gems',
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
        ];
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
