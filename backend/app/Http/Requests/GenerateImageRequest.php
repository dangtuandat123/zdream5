<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\AiModel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            // project_id phải thuộc user hiện tại — chống gắn ảnh vào project người khác
            'project_id' => [
                'nullable', 'integer',
                Rule::exists('projects', 'id')->where('user_id', $this->user()->id),
            ],
            'prompt' => ['required', 'string', 'max:2000'],
            'negative_prompt' => ['nullable', 'string', 'max:1000'],
            // model phải nằm trong danh sách active — chống gọi model trái phép
            'model' => ['nullable', 'string', Rule::in(AiModel::active()->pluck('model_id'))],
            'style' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z0-9\-_ ]+$/'],
            'aspect_ratio' => ['nullable', 'string', 'in:1:1,2:3,3:2,3:4,4:3,4:5,5:4,9:16,16:9,21:9'],
            'image_size' => ['nullable', 'string', 'in:1K,2K,4K'],
            'seed' => ['nullable', 'integer', 'min:0'],
            'count' => ['nullable', 'integer', 'min:1', 'max:4'],
            'reference_images' => ['nullable', 'array', 'max:6'],
            // Giới hạn mỗi ảnh tham chiếu tối đa ~10MB base64 — chống memory exhaustion
            'reference_images.*' => ['string', 'max:13500000'],
            'template_slug' => ['nullable', 'string', 'max:255'],
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
            'reference_images.max' => 'Tối đa 6 ảnh tham chiếu.',
        ];
    }
}
