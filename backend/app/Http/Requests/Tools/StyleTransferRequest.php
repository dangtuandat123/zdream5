<?php

declare(strict_types=1);

namespace App\Http\Requests\Tools;

use Illuminate\Foundation\Http\FormRequest;

class StyleTransferRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'image' => ['required', 'string', 'max:13500000'],
            'target_style' => ['required', 'string', 'in:anime,oil-painting,watercolor,cyberpunk,pixel-art,3d-render'],
            'intensity' => ['nullable', 'string', 'in:light,medium,strong'],
        ];
    }
}
