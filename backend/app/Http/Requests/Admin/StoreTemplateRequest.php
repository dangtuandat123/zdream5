<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // AdminMiddleware đã kiểm tra
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'system_prompt' => ['required', 'string', 'max:5000'],
            'model' => ['nullable', 'string', 'max:255'],
            'thumbnail' => ['nullable', 'string', 'max:500'],
            'effect_groups' => ['nullable', 'array'],
            'effect_groups.*.name' => ['required', 'string', 'max:100'],
            'effect_groups.*.options' => ['required', 'array'],
            'effect_groups.*.options.*.value' => ['required', 'string', 'max:100'],
            'effect_groups.*.options.*.label' => ['required', 'string', 'max:100'],
            'effect_groups.*.options.*.prompt' => ['nullable', 'string', 'max:500'],
            'effect_groups.*.options.*.image' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
