<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | OpenRouter AI API Configuration
    |--------------------------------------------------------------------------
    |
    | Cấu hình kết nối đến OpenRouter API cho chức năng tạo ảnh AI.
    |
    */

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'openrouter' => [
        'api_key' => env('OPENROUTER_API_KEY', ''),
        'base_url' => env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
        'default_model' => env('OPENROUTER_DEFAULT_MODEL', 'google/gemini-2.5-flash-image'),
    ],

];
