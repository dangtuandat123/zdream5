<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect sang Google consent screen.
     * GET /api/auth/google/redirect
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Google callback — tìm/tạo user, tạo token, redirect về frontend.
     * GET /auth/google/callback
     */
    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception) {
            return redirect(config('app.frontend_url') . '/login?error=google_failed');
        }

        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name'              => $googleUser->getName(),
                'google_id'         => $googleUser->getId(),
                'avatar'            => $googleUser->getAvatar(),
                'password'          => bcrypt(\Illuminate\Support\Str::random(32)),
                'gems'              => 50,
                'email_verified_at' => now(),
            ]
        );

        // Cập nhật google_id nếu user đã tồn tại nhưng chưa liên kết
        if (!$user->google_id) {
            $user->update([
                'google_id' => $googleUser->getId(),
                'avatar'    => $googleUser->getAvatar(),
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $frontendUrl = config('app.frontend_url', 'https://zdream.vn');

        // Redirect về /login/google/success để tránh .htaccess gửi lại vào Laravel
        return redirect("{$frontendUrl}/login/google/success?token={$token}");
    }
}
