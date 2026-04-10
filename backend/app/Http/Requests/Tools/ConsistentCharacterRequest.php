<?php

declare(strict_types=1);

namespace App\Http\Requests\Tools;

use Illuminate\Foundation\Http\FormRequest;

class ConsistentCharacterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'images' => ['required', 'array', 'min:1', 'max:3'],
            'images.*' => ['required', 'string', 'max:13500000'],
            'scene_description' => ['required', 'string', 'max:2000'],
        ];
    }
}
