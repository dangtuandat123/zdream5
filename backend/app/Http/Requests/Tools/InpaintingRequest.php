<?php

declare(strict_types=1);

namespace App\Http\Requests\Tools;

use Illuminate\Foundation\Http\FormRequest;

class InpaintingRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'image' => ['required', 'string', 'max:13500000'],
            'mask' => ['required', 'string', 'max:13500000'],
            'description' => ['required', 'string', 'max:1000'],
        ];
    }
}
