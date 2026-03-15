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
                'level' => $user->level,
                'created_at' => $user->created_at,
            ],
        ]);
    }
}
