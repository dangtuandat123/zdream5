<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminStatsService;
use App\Services\OpenRouterCreditService;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function __construct(
        private AdminStatsService $statsService,
        private OpenRouterCreditService $creditService,
    ) {}

    /**
     * Thống kê tổng quan cho admin dashboard.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'overview' => $this->statsService->getOverview(),
            'users_over_time' => $this->statsService->getUsersOverTime(),
            'images_over_time' => $this->statsService->getImagesOverTime(),
            'recent_activity' => $this->statsService->getRecentActivity(),
        ]);
    }

    /**
     * Lấy credit OpenRouter real-time.
     */
    public function openrouterCredits(): JsonResponse
    {
        try {
            $credits = $this->creditService->getCredits();
            return response()->json($credits);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'balance' => null,
            ], 502);
        }
    }
}
