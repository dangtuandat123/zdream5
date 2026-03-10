<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'prompt' => ['required', 'string', 'max:2000'],
            'negative_prompt' => ['nullable', 'string', 'max:1000'],
            'model' => ['nullable', 'string', 'max:100'],
            'style' => ['nullable', 'string', 'max:50'],
            'aspect_ratio' => ['nullable', 'string', 'in:1:1,16:9,9:16,4:3,3:4,2:3,3:2'],
            'seed' => ['nullable', 'integer', 'min:0'],
            'count' => ['nullable', 'integer', 'min:1', 'max:4'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'prompt.required' => 'Vui lòng nhập mô tả ảnh.',
            'prompt.max' => 'Mô tả ảnh tối đa 2000 ký tự.',
            'aspect_ratio.in' => 'Tỉ lệ ảnh không hợp lệ.',
            'count.max' => 'Tối đa tạo 4 ảnh mỗi lần.',
        ];
    }
}
