<?php

declare(strict_types=1);

namespace App\Http\Requests\Tools;

use Illuminate\Foundation\Http\FormRequest;

class ExtendRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'image' => ['required', 'string', 'max:13500000'],
            'directions' => ['required', 'array', 'min:1'],
            'directions.*' => ['string', 'in:top,bottom,left,right'],
            'extend_ratio' => ['nullable', 'string', 'in:25,50,100'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
