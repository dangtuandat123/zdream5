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
            'scale_factor' => ['nullable', 'string', 'in:2x,4x'],
        ];
    }
}
