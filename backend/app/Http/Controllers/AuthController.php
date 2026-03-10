<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Controller xử lý Đăng ký, Đăng nhập, Đăng xuất, Lấy thông tin user.
 * 
 * Sử dụng Sanctum token-based auth cho SPA.
 * Thin Controller: chỉ orchestrate request → response.
 */
class AuthController extends Controller
{
    /**
     * Đăng ký tài khoản mới.
     * 
     * POST /api/register
     * Body: { name, email, password, password_confirmation }
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'gems' => 50, // Tặng 50 💎 miễn phí khi đăng ký
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công! Bạn được tặng 50 💎.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'gems' => $user->gems,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Đăng nhập.
     * 
     * POST /api/login
     * Body: { email, password }
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không đúng.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        // Xoá token cũ (chỉ cho phép 1 phiên đăng nhập)
        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'gems' => $user->gems,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Đăng xuất (revoke token hiện tại).
     * 
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công.',
        ]);
    }

    /**
     * Lấy thông tin user đang đăng nhập.
     * 
     * GET /api/user
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'gems' => $user->gems,
                'avatar' => $user->avatar,
                'created_at' => $user->created_at,
            ],
        ]);
    }
}
