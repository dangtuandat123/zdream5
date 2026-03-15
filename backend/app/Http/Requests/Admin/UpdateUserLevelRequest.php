<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserLevelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'level' => ['required', 'integer', Rule::in([
                User::LEVEL_USER,
                User::LEVEL_MOD,
                User::LEVEL_ADMIN,
                User::LEVEL_SUPER,
            ])],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'level.in' => 'Level không hợp lệ. Chỉ chấp nhận: 0 (user), 1 (mod), 2 (admin), 99 (super).',
        ];
    }
}
