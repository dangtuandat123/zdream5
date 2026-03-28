<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdjustGemsRequest;
use App\Http\Requests\Admin\UpdateUserLevelRequest;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function __construct(
        private WalletService $walletService,
    ) {}

    /**
     * Danh sách users (phân trang, search, filter).
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->withCount('images')
            ->orderByDesc('created_at');

        // Tìm kiếm theo name hoặc email
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Lọc theo level
        if ($request->has('level')) {
            $query->where('level', (int) $request->input('level'));
        }

        $perPage = min((int) $request->input('per_page', 20), 50);

        return response()->json($query->paginate($perPage));
    }

    /**
     * Chi tiết user kèm ảnh gần nhất + transactions.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::withCount('images')
            ->findOrFail($id);

        $recentImages = $user->images()
            ->orderByDesc('created_at')
            ->limit(20)
            ->get(['id', 'prompt', 'file_url', 'model', 'gems_cost', 'created_at']);

        $transactions = $user->transactions()
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        return response()->json([
            'user' => $user,
            'recent_images' => $recentImages,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Cập nhật level user.
     */
    public function updateLevel(UpdateUserLevelRequest $request, int $id): JsonResponse
    {
        /** @var User $admin */
        $admin = $request->user();
        $user = User::findOrFail($id);

        // Không cho phép thay đổi chính mình
        if ($admin->id === $user->id) {
            return response()->json([
                'message' => 'Không thể thay đổi level của chính mình.',
            ], 422);
        }

        // Chỉ super admin mới set được level super
        $newLevel = (int) $request->validated('level');
        if ($newLevel === User::LEVEL_SUPER && !$admin->isSuper()) {
            return response()->json([
                'message' => 'Chỉ Super Admin mới có thể chỉ định Super Admin.',
            ], 403);
        }

        // Không cho phép hạ cấp super admin trừ khi là super
        if ($user->isSuper() && !$admin->isSuper()) {
            return response()->json([
                'message' => 'Không thể thay đổi level của Super Admin.',
            ], 403);
        }

        $user->level = $newLevel;
        $user->save();

        return response()->json([
            'message' => 'Cập nhật level thành công.',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Điều chỉnh gems (cộng hoặc trừ).
     */
    public function adjustGems(AdjustGemsRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $amount = (int) $request->validated('amount');
        $reason = $request->validated('reason');

        /** @var User $admin */
        $admin = $request->user();
        $description = "[Admin: {$admin->name}] {$reason}";

        if ($amount > 0) {
            $this->walletService->credit(
                user: $user,
                amount: $amount,
                description: $description,
                metadata: ['admin_id' => $admin->id],
            );
        } else {
            // Kiểm tra đủ gems để trừ
            if ($user->gems < abs($amount)) {
                return response()->json([
                    'message' => "User chỉ còn {$user->gems} 💎, không thể trừ " . abs($amount) . " 💎.",
                ], 422);
            }
            $this->walletService->deduct(
                user: $user,
                amount: abs($amount),
                description: $description,
                metadata: ['admin_id' => $admin->id],
            );
        }

        return response()->json([
            'message' => "Đã điều chỉnh {$amount} gems.",
            'user' => $user->fresh(),
        ]);
    }
}
