<?php

declare(strict_types=1);

namespace App\Http\Requests\Tools;

use Illuminate\Foundation\Http\FormRequest;

class ImageVariationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'image' => ['required', 'string', 'max:13500000'],
            'strength' => ['nullable', 'numeric', 'min:0.1', 'max:1.0'],
        ];
    }
}
