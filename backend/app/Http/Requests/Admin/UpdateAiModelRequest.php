<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAiModelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // AdminMiddleware đã kiểm tra
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'model_id' => ['sometimes', 'string', 'max:255', "unique:ai_models,model_id,{$id}"],
            'provider' => ['nullable', 'string', 'max:50'],
            'output_modalities' => ['nullable', 'array'],
            'output_modalities.*' => ['string', 'in:image,text'],
            'gems_cost' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'config' => ['nullable', 'array'],
        ];
    }
}
