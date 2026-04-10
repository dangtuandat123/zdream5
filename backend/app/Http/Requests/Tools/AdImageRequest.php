<?php

declare(strict_types=1);

namespace App\Http\Requests\Tools;

use Illuminate\Foundation\Http\FormRequest;

class AdImageRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'image' => ['required', 'string', 'max:13500000'],
            'description' => ['required', 'string', 'max:1000'],
            'platform' => ['nullable', 'string', 'in:facebook,instagram,tiktok'],
            'aspect_ratio' => ['nullable', 'string', 'in:1:1,2:3,3:2,3:4,4:3,4:5,5:4,9:16,16:9'],
        ];
    }
}
