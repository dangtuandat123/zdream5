<?php

declare(strict_types=1);

namespace App\Http\Requests\Tools;

use Illuminate\Foundation\Http\FormRequest;

class UpscaleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'image' => ['required', 'string', 'max:13500000'],
            'scale_factor' => ['nullable', 'string', 'in:1x,2x,4x'],
            'enhance_mode' => ['nullable', 'string', 'in:sharp,soft,detail'],
            'denoise' => ['nullable', 'boolean'],
            'face_enhance' => ['nullable', 'boolean'],
            'creative_detail' => ['nullable', 'boolean'],
            'color_enhance' => ['nullable', 'boolean'],
        ];
    }
}
