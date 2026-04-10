<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\ToolController;
use App\Http\Controllers\Admin\AdminAiModelController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminSettingController;
use App\Http\Controllers\Admin\AdminTemplateController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Models\AiModel;
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
Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);

// Templates & Models public (cho frontend)
Route::get('/templates', [TemplateController::class, 'publicIndex']);
Route::get('/templates/{slug}', [TemplateController::class, 'publicShow']);
Route::get('/models', function () {
    return response()->json(['data' => AiModel::active()->get(['id', 'name', 'model_id', 'gems_cost'])]);
});

// ========================
// Protected Routes (Cần đăng nhập - Sanctum)
// ========================
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Image Generation & Upload
    // Rate limit: 5 lần/phút/user — chống spam, giảm tải server khi đông
    Route::post('/images/generate', [ImageController::class, 'generate'])
        ->middleware('throttle:5,1');
    Route::post('/images/upload', [ImageController::class, 'upload'])
        ->middleware('throttle:10,1'); // 10 lần/phút — chống spam upload
    Route::get('/images', [ImageController::class, 'index']);
    Route::delete('/images/{id}', [ImageController::class, 'destroy']);

    // Projects
    Route::get('/projects', [\App\Http\Controllers\ProjectController::class, 'index']);
    Route::post('/projects', [\App\Http\Controllers\ProjectController::class, 'store']);
    Route::delete('/projects/{id}', [\App\Http\Controllers\ProjectController::class, 'destroy']);

    // AI Tools
    Route::prefix('tools')->middleware('throttle:5,1')->group(function () {
        Route::post('/style-transfer', [ToolController::class, 'styleTransfer']);
        Route::post('/image-variation', [ToolController::class, 'imageVariation']);
        Route::post('/ad-image', [ToolController::class, 'adImage']);
        Route::post('/consistent-character', [ToolController::class, 'consistentCharacter']);
        Route::post('/upscale', [ToolController::class, 'upscale']);
        Route::post('/remove-bg', [ToolController::class, 'removeBg']);
        Route::post('/remove-object', [ToolController::class, 'removeObject']);
        Route::post('/inpainting', [ToolController::class, 'inpainting']);
        Route::post('/extend', [ToolController::class, 'extend']);
        Route::post('/image-to-prompt', [ToolController::class, 'imageToPrompt']);
    });

    // Wallet / Gems
    Route::get('/wallet', [WalletController::class, 'show']);
    Route::post('/wallet/topup', [WalletController::class, 'topup']);

    // ========================
    // Admin Routes (Cần đăng nhập + level >= 2)
    // ========================
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Dashboard & Thống kê
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/openrouter-credits', [AdminDashboardController::class, 'openrouterCredits']);

        // Quản lý Users
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::patch('/users/{id}/level', [AdminUserController::class, 'updateLevel']);
        Route::post('/users/{id}/gems', [AdminUserController::class, 'adjustGems']);

        // Quản lý Templates
        Route::post('/templates/upload-image', [AdminTemplateController::class, 'uploadImage']);
        Route::apiResource('templates', AdminTemplateController::class);
        Route::post('/templates/reorder', [AdminTemplateController::class, 'reorder']);

        // Quản lý AI Models
        Route::apiResource('models', AdminAiModelController::class);
        Route::patch('/models/{id}/toggle', [AdminAiModelController::class, 'toggle']);

        // Settings
        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::put('/settings', [AdminSettingController::class, 'update']);
    });
});
