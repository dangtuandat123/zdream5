<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller xử lý Ví Kim Cương: Xem số dư, Lịch sử, Nạp tiền.
 */
class WalletController extends Controller
{
    public function __construct(
        private WalletService $walletService,
    ) {}

    /**
     * Xem số dư + lịch sử giao dịch.
     * 
     * GET /api/wallet
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $transactions = $user->transactions()
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return response()->json([
            'gems' => $user->gems,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Nạp tiền (Xác nhận top-up — giả lập hoặc webhook).
     * 
     * POST /api/wallet/topup
     * Body: { amount (gems), package_name? }
     * 
     * Lưu ý: Trong production, endpoint này sẽ được gọi bởi webhook
     * từ payment gateway (VietQR), không phải từ frontend trực tiếp.
     * Hiện tại giả lập để test.
     */
    public function topup(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'package_name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();
        $amount = (int) $request->input('amount');
        $packageName = $request->input('package_name', 'Nạp thủ công');

        $transaction = $this->walletService->credit(
            user: $user,
            amount: $amount,
            description: "Nạp {$amount} 💎 ({$packageName})",
            metadata: [
                'package_name' => $packageName,
                'source' => 'manual_topup',
            ],
        );

        $user->refresh();

        return response()->json([
            'message' => "Nạp {$amount} 💎 thành công!",
            'gems' => $user->gems,
            'transaction' => $transaction,
        ]);
    }
}
