<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Image;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Service tổng hợp thống kê cho admin dashboard.
 */
class AdminStatsService
{
    /**
     * Lấy thống kê tổng quan.
     */
    public function getOverview(): array
    {
        return [
            'total_users' => User::count(),
            'total_images' => Image::where('type', 'ai')->count(),
            'total_gems_spent' => (int) Transaction::where('type', 'spend')->sum('amount'),
            'total_gems_topup' => (int) Transaction::where('type', 'topup')->sum('amount'),
        ];
    }

    /**
     * Thống kê user đăng ký theo ngày (30 ngày gần nhất).
     *
     * @return array<array{date: string, count: int}>
     */
    public function getUsersOverTime(int $days = 30): array
    {
        return User::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Thống kê ảnh tạo theo ngày (30 ngày gần nhất).
     *
     * @return array<array{date: string, count: int}>
     */
    public function getImagesOverTime(int $days = 30): array
    {
        return Image::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->where('type', 'ai')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Hoạt động gần nhất (20 ảnh mới nhất kèm user).
     */
    public function getRecentActivity(int $limit = 20): array
    {
        return Image::with('user:id,name,email,avatar')
            ->where('type', 'ai')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['id', 'user_id', 'prompt', 'file_url', 'model', 'gems_cost', 'created_at'])
            ->toArray();
    }
}
