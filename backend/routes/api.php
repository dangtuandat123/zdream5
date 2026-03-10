<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ImageController;
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

// ========================
// Protected Routes (Cần đăng nhập - Sanctum)
// ========================
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Image Generation
    Route::post('/images/generate', [ImageController::class, 'generate']);
    Route::get('/images', [ImageController::class, 'index']);
    Route::delete('/images/{id}', [ImageController::class, 'destroy']);

    // Wallet / Gems
    Route::get('/wallet', [WalletController::class, 'show']);
    Route::post('/wallet/topup', [WalletController::class, 'topup']);
});
