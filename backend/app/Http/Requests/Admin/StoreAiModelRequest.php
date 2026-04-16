<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreAiModelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'model_id' => ['required', 'string', 'max:255', 'unique:ai_models,model_id'],
            'provider' => ['nullable', 'string', 'max:50'],
            'output_modalities' => ['nullable', 'array'],
            'output_modalities.*' => ['string', 'in:image,text'],
            'gems_cost' => ['required', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'config' => ['nullable', 'array'],
        ];
    }
}
