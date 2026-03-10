<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

/**
 * Service quản lý ví Kim Cương (Gems).
 *
 * Chịu trách nhiệm cộng/trừ gems và ghi log giao dịch.
 * Sử dụng DB transaction để đảm bảo tính nhất quán.
 */
class WalletService
{
    /**
     * Trừ gems khỏi ví user (khi tiêu xài: tạo ảnh, v.v.)
     *
     * @throws \RuntimeException Nếu không đủ số dư
     */
    public function deduct(User $user, int $amount, string $description, ?array $metadata = null): Transaction
    {
        return DB::transaction(function () use ($user, $amount, $description, $metadata) {
            // Lock row để tránh race condition
            $user = User::lockForUpdate()->find($user->id);

            if ($user->gems < $amount) {
                throw new \RuntimeException(
                    "Không đủ Kim Cương. Cần {$amount}, hiện có {$user->gems}."
                );
            }

            $user->gems -= $amount;
            $user->save();

            return Transaction::create([
                'user_id' => $user->id,
                'type' => 'spend',
                'amount' => $amount,
                'balance_after' => $user->gems,
                'description' => $description,
                'metadata' => $metadata,
            ]);
        });
    }

    /**
     * Cộng gems vào ví user (khi nạp tiền, bonus, v.v.)
     */
    public function credit(User $user, int $amount, string $description, ?array $metadata = null): Transaction
    {
        return DB::transaction(function () use ($user, $amount, $description, $metadata) {
            $user = User::lockForUpdate()->find($user->id);

            $user->gems += $amount;
            $user->save();

            return Transaction::create([
                'user_id' => $user->id,
                'type' => 'topup',
                'amount' => $amount,
                'balance_after' => $user->gems,
                'description' => $description,
                'metadata' => $metadata,
            ]);
        });
    }
}
