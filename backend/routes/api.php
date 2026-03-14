<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — ZDream5
|--------------------------------------------------------------------------
|
| Tất cả route đều có prefix /api.
| Sử dụng Sanctum token-based authentication.
|
*/

// ========================
// Public Routes (Không cần đăng nhập)
// ========================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);

// ========================
// Protected Routes (Cần đăng nhập - Sanctum)
// ========================
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Image Generation & Upload
    Route::post('/images/generate', [ImageController::class, 'generate']);
    Route::post('/images/upload', [ImageController::class, 'upload']);
    Route::get('/images', [ImageController::class, 'index']);
    Route::delete('/images/{id}', [ImageController::class, 'destroy']);

    // Projects
    Route::get('/projects', [\App\Http\Controllers\ProjectController::class, 'index']);
    Route::post('/projects', [\App\Http\Controllers\ProjectController::class, 'store']);
    Route::delete('/projects/{id}', [\App\Http\Controllers\ProjectController::class, 'destroy']);

    // Wallet / Gems
    Route::get('/wallet', [WalletController::class, 'show']);
    Route::post('/wallet/topup', [WalletController::class, 'topup']);
});
