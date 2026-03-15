<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AiModel;
use App\Models\Setting;
use App\Models\Template;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeder khởi tạo dữ liệu admin: templates, AI models, settings.
 */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedTemplates();
        $this->seedAiModels();
        $this->seedSettings();
    }

    private function seedTemplates(): void
    {
        // Context & Material options mặc định cho tất cả templates
        $defaultContext = [
            ['value' => 'default', 'label' => 'Mặc định', 'prompt' => '', 'image' => ''],
            ['value' => 'showcase', 'label' => 'Hộp Trưng Bày', 'prompt' => 'in a showcase display box', 'image' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop'],
            ['value' => 'studio', 'label' => 'Studio', 'prompt' => 'professional studio lighting', 'image' => 'https://images.unsplash.com/photo-1604754742629-3e5728249d73?q=80&w=300&auto=format&fit=crop'],
            ['value' => 'outdoor', 'label' => 'Ngoài trời', 'prompt' => 'natural outdoor setting', 'image' => 'https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=300&auto=format&fit=crop'],
            ['value' => 'abstract', 'label' => 'Trừu tượng', 'prompt' => 'abstract colorful background', 'image' => 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=300&auto=format&fit=crop'],
            ['value' => 'gradient', 'label' => 'Gradient', 'prompt' => 'smooth gradient background', 'image' => 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=300&auto=format&fit=crop'],
        ];

        $defaultMaterial = [
            ['value' => 'default', 'label' => 'Mặc định', 'prompt' => '', 'image' => ''],
            ['value' => 'flocked', 'label' => 'Chất liệu Nhung', 'prompt' => 'flocked velvet texture', 'image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=300&auto=format&fit=crop'],
            ['value' => 'translucent', 'label' => 'Nhựa Trong Suốt', 'prompt' => 'translucent plastic material', 'image' => 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=300&auto=format&fit=crop'],
            ['value' => 'metallic', 'label' => 'Kim loại', 'prompt' => 'metallic chrome finish', 'image' => 'https://images.unsplash.com/photo-1589254065878-42c6bf5e6878?q=80&w=300&auto=format&fit=crop'],
            ['value' => 'wood', 'label' => 'Gỗ tự nhiên', 'prompt' => 'natural wood texture', 'image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=300&auto=format&fit=crop'],
            ['value' => 'glass', 'label' => 'Thuỷ tinh', 'prompt' => 'transparent glass material', 'image' => 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=300&auto=format&fit=crop'],
        ];

        $templates = [
            ['name' => 'Chân dung Cyberpunk', 'category' => 'Chân dung', 'description' => 'Biến đổi ảnh thành phong cách Cyberpunk với ánh neon rực rỡ', 'system_prompt' => 'cyberpunk portrait, neon lights, cinematic', 'thumbnail' => 'https://images.unsplash.com/photo-1542442828-287217bfb21f?q=80&w=400&auto=format&fit=crop', 'sample_images' => ['https://images.unsplash.com/photo-1542442828-287217bfb21f?q=80&w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop']],
            ['name' => 'Phong cảnh Ghibli', 'category' => 'Anime', 'description' => 'Chuyển đổi ảnh phong cảnh thành phong cách Studio Ghibli', 'system_prompt' => 'studio ghibli style landscape, watercolor', 'thumbnail' => 'https://images.unsplash.com/photo-1498453488252-0974dcabe0cb?q=80&w=400&auto=format&fit=crop', 'sample_images' => ['https://images.unsplash.com/photo-1498453488252-0974dcabe0cb?q=80&w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1506744626753-1fa44dfbb7c4?q=80&w=600&auto=format&fit=crop']],
            ['name' => 'Render sản phẩm 3D', 'category' => '3D', 'description' => 'Tạo ảnh render 3D siêu thực cho sản phẩm', 'system_prompt' => '3D product render, studio lighting, white background', 'thumbnail' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop', 'sample_images' => ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop']],
            ['name' => 'Logo Minimalist', 'category' => 'Logo', 'description' => 'Thiết kế lại logo theo phong cách tối giản', 'system_prompt' => 'minimalist logo, clean lines, vector', 'thumbnail' => 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400&auto=format&fit=crop', 'sample_images' => []],
            ['name' => 'Sơn dầu cổ điển', 'category' => 'Phong cảnh', 'description' => 'Mang vẻ đẹp cổ điển Baroque cho ảnh', 'system_prompt' => 'baroque oil painting, classical, dramatic', 'thumbnail' => 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop', 'sample_images' => []],
            ['name' => 'Anime Waifu', 'category' => 'Anime', 'description' => 'Tạo nhân vật anime từ ảnh chân dung', 'system_prompt' => 'anime character, waifu, cute style', 'thumbnail' => 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop', 'sample_images' => []],
            ['name' => 'Ảnh thời trang', 'category' => 'Chân dung', 'description' => 'Ảnh chân dung thời trang cao cấp', 'system_prompt' => 'high fashion portrait, editorial, vogue style', 'thumbnail' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop', 'sample_images' => []],
            ['name' => 'Concept Art', 'category' => 'Phong cảnh', 'description' => 'Concept art game/phim', 'system_prompt' => 'concept art, epic landscape, cinematic lighting', 'thumbnail' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop', 'sample_images' => []],
            ['name' => 'Mockup sản phẩm', 'category' => 'Sản phẩm', 'description' => 'Ảnh mockup sản phẩm chuyên nghiệp', 'system_prompt' => 'product mockup, professional photography, clean', 'thumbnail' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop', 'sample_images' => []],
            ['name' => 'Chibi Avatar', 'category' => 'Anime', 'description' => 'Avatar chibi dễ thương', 'system_prompt' => 'chibi avatar, cute, kawaii, colorful', 'thumbnail' => 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?q=80&w=400&auto=format&fit=crop', 'sample_images' => []],
            ['name' => 'Pixel Art', 'category' => '3D', 'description' => 'Pixel art retro game', 'system_prompt' => 'pixel art, 8-bit retro game style', 'thumbnail' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop', 'sample_images' => []],
            ['name' => 'Watercolor Portrait', 'category' => 'Chân dung', 'description' => 'Chân dung phong cách màu nước', 'system_prompt' => 'watercolor portrait, soft colors, artistic', 'thumbnail' => 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=400&auto=format&fit=crop', 'sample_images' => []],
        ];

        foreach ($templates as $i => $t) {
            Template::updateOrCreate(
                ['slug' => Str::slug($t['name'])],
                array_merge($t, [
                    'slug' => Str::slug($t['name']),
                    'model' => 'google/gemini-2.5-flash-image',
                    'context_options' => $defaultContext,
                    'material_options' => $defaultMaterial,
                    'sort_order' => $i,
                    'is_active' => true,
                ]),
            );
        }
    }

    private function seedAiModels(): void
    {
        $models = [
            ['name' => 'Gemini 2.5 Flash', 'model_id' => 'google/gemini-2.5-flash-image', 'gems_cost' => 1, 'sort_order' => 0],
            ['name' => 'Gemini 3.1 Flash', 'model_id' => 'google/gemini-3.1-flash-image-preview', 'gems_cost' => 2, 'sort_order' => 1],
        ];

        foreach ($models as $m) {
            AiModel::updateOrCreate(
                ['model_id' => $m['model_id']],
                array_merge($m, ['provider' => 'openrouter', 'is_active' => true]),
            );
        }
    }

    private function seedSettings(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'ZDream', 'group' => 'general'],
            ['key' => 'default_model', 'value' => 'google/gemini-2.5-flash-image', 'group' => 'generation'],
            ['key' => 'default_gems_per_image', 'value' => '1', 'group' => 'generation'],
            ['key' => 'max_images_per_request', 'value' => '4', 'group' => 'generation'],
            ['key' => 'new_user_gems', 'value' => '50', 'group' => 'general'],
        ];

        foreach ($settings as $s) {
            Setting::updateOrCreate(['key' => $s['key']], $s);
        }
    }
}
