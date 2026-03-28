<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Setting;
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

        $user = User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            // Tạo user mới — set gems, google_id, email_verified_at trực tiếp (không qua mass-assign)
            $user = new User();
            $user->name = $googleUser->getName();
            $user->email = $googleUser->getEmail();
            $user->password = bcrypt(\Illuminate\Support\Str::random(32));
            $user->avatar = $googleUser->getAvatar();
            $user->google_id = $googleUser->getId();
            $user->gems = (int) Setting::get('new_user_gems', 50);
            $user->email_verified_at = now();
            $user->save();
        } elseif (!$user->google_id) {
            // Cập nhật google_id nếu user đã tồn tại nhưng chưa liên kết
            $user->google_id = $googleUser->getId();
            $user->avatar = $googleUser->getAvatar();
            $user->save();
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $frontendUrl = config('app.frontend_url', 'https://zdream.vn');

        // Redirect về /login/google/success để tránh .htaccess gửi lại vào Laravel
        return redirect("{$frontendUrl}/login/google/success?token={$token}");
    }
}
