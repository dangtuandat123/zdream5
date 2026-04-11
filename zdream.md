# ZDream5 — Tài Liệu Vệ Dự Án AI (Phỏng Vấn)

> Tài liệu này giải thích TOÀN BỘ kiến trúc AI của ZDream5 — từ kiến trúc hệ thống, pipeline sinh ảnh, hệ thống AI Agent, đến cơ chế an toàn tài chính. Đọc xong là hiểu dự án làm gì và làm như thế nào.

---

## 1. Tổng Quan Dự Án

**ZDream5** là nền tảng tạo ảnh AI full-stack, cho phép người dùng tạo ảnh nghệ thuật bằng AI thông qua hệ thống kinh tế **gem** (Kim Cương).

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite + Tailwind + shadcn/ui |
| Backend | Laravel 12 + PHP 8.2 + MySQL |
| AI Provider | OpenRouter API (proxy tới Gemini, FLUX, Stable Diffusion...) |
| AI Framework | Laravel AI (Structured Output, Agent pattern) |
| Storage | MinIO (S3-compatible) |
| Auth | Laravel Sanctum (token-based SPA) |

**Tại sao dùng OpenRouter thay vì gọi thẳng Gemini/FLUX?**
→ OpenRouter là **AI gateway** — 1 API key, 1 endpoint, truy cập 200+ model. Khi muốn đổi model (ví dụ Gemini → FLUX → DALL-E), chỉ cần đổi `model_id` trong DB, không cần đổi code. Đây là quyết định kiến trúc quan trọng giúp hệ thống **model-agnostic**.

---

## 2. Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│  GeneratePage / ToolPages / TemplateDetailPage           │
│  → Gửi: prompt, style, aspect_ratio, reference_images   │
└──────────────────────┬──────────────────────────────────┘
                       │ POST /api/images/generate
                       │ POST /api/tools/{tool-name}
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Laravel)                       │
│                                                         │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │ ImageController│  │ToolController│   │WalletService │ │
│  │ (orchestrator)│  │(10 AI tools) │   │(gems economy)│ │
│  └──────┬───────┘   └──────┬───────┘   └──────────────┘ │
│         │                  │                             │
│         ▼                  ▼                             │
│  ┌─────────────────────────────────────┐                │
│  │      PromptDesignerService          │                │
│  │  (AI Orchestrator — chọn Agent)     │                │
│  │                                     │                │
│  │  ┌─────────────────────────────┐    │                │
│  │  │  5 Specialized AI Agents    │    │                │
│  │  │  ├─ GenerateDesigner        │    │                │
│  │  │  ├─ StyleTransferDesigner   │    │                │
│  │  │  ├─ VariationDesigner       │    │                │
│  │  │  ├─ AdImageDesigner         │    │                │
│  │  │  └─ CharacterDesigner       │    │                │
│  │  └─────────────────────────────┘    │                │
│  └──────────────┬──────────────────────┘                │
│                 │ Optimized prompt                       │
│                 ▼                                        │
│  ┌─────────────────────────────────────┐                │
│  │       OpenRouterService             │                │
│  │  → Gọi /chat/completions           │                │
│  │  → modalities: [image, text]        │                │
│  │  → Nhận base64/URL ảnh             │                │
│  │  → Decode + Upload MinIO            │                │
│  └─────────────────────────────────────┘                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Pipeline Tạo Ảnh AI (Chi Tiết Từng Bước)

Đây là flow hoàn chỉnh khi user nhấn **"Generate"**:

### Bước 1: Validate + Tính Cost

```
Frontend gửi: { prompt, model, style, aspect_ratio, count, seed, reference_images, template_slug }
                    ↓
GenerateImageRequest validate:
  - prompt: required, max 2000 ký tự
  - model: phải có trong bảng ai_models (is_active = true)
  - aspect_ratio: enum [1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9]
  - count: 1-4 (cap bởi Setting.max_images_per_request)
  - reference_images: max 6 ảnh, mỗi ảnh max 13.5MB base64
  - project_id: phải thuộc user hiện tại
                    ↓
Tính cost: AiModel.gems_cost × count
  Ví dụ: Gemini Flash (2 gems) × 3 ảnh = 6 gems
```

### Bước 2: Trừ Gems TRƯỚC (Pessimistic Locking)

**Đây là điểm kiến trúc quan trọng nhất về mặt an toàn tài chính.**

```php
DB::transaction(function () {
    // SELECT ... FOR UPDATE — lock row, các request khác phải chờ
    $user = User::lockForUpdate()->find($user->id);

    if ($user->gems < $amount) {
        throw new RuntimeException("Không đủ gems");
    }

    $user->gems -= $amount;
    $user->save();

    Transaction::create([...]); // Ghi ledger
});
```

**Tại sao trừ TRƯỚC chứ không trừ SAU?**

| Trừ SAU (naive) | Trừ TRƯỚC (ZDream5) |
|---|---|
| User có 5 gems, gửi 3 request cùng lúc | User có 5 gems, gửi 3 request cùng lúc |
| Cả 3 đều kiểm tra: 5 >= 2 → OK | Request 1 lock row → trừ → còn 3 |
| Cả 3 đều tạo ảnh | Request 2 chờ lock → trừ → còn 1 |
| Trừ: 5 - 6 = **-1 gems** (lỗ) | Request 3 chờ lock → 1 < 2 → **reject** |
| **Race condition** | **An toàn** |

Dùng `SELECT ... FOR UPDATE` (pessimistic lock) thay vì optimistic lock vì:
- Giao dịch tài chính cần **consistency** tuyệt đối
- Thời gian lock rất ngắn (< 50ms)
- Không cần retry logic phức tạp

### Bước 3: Upload Reference Images

```
reference_images (base64 từ frontend)
        ↓
Decode base64 → binary image data
        ↓
Upload lên MinIO: references/2026/04/10/{uuid}.jpeg
        ↓
Lấy public URL → dùng cho PromptDesigner + OpenRouter
```

Tại sao upload trước? → Giảm payload khi gửi cho PromptDesigner (URL nhẹ hơn base64).

### Bước 4: AI Prompt Designer (Tối Ưu Prompt)

**Đây là tầng AI trung gian — biến prompt thô của user thành prompt chuyên nghiệp.**

```
User viết: "con mèo đang ngồi"
        ↓
PromptDesignerService.design()
        ↓
Chọn Agent: GenerateDesigner (vì taskType = 'generate')
        ↓
Xây dựng context message:
  "## Task: TEXT-ONLY generation
   User prompt: con mèo đang ngồi
   Rendering style: anime
   Aspect ratio: 1:1"
        ↓
Gọi LLM (Gemini Flash) với Structured Output
        ↓
Agent trả về JSON:
{
  "prompt": "A domestic shorthair cat sitting gracefully on a wooden windowsill,
   soft golden hour sunlight streaming through lace curtains, anime cel-shading
   style with bold outlines, warm amber and cream color palette, shallow depth
   of field with bokeh background of a cozy Japanese room, Studio Ghibli-inspired
   aesthetic, 85mm portrait lens perspective, rim lighting highlighting fur details",
  "negative_prompt": "blurry, distorted, low quality, artifacts, deformed,
   watermark, realistic rendering, 3D render, photographic"
}
```

**Structured Output** là gì?
→ Thay vì LLM trả text tự do (có thể thiếu field, sai format), ta **ép schema JSON cứng**:

```php
// BasePromptDesigner.php
public function schema(): array
{
    return [
        'prompt' => [
            'type' => 'string',
            'description' => 'Optimized English prompt, under 300 words...',
        ],
        'negative_prompt' => [
            'type' => 'string',
            'description' => 'What to exclude...',
        ],
    ];
}
```

LLM **bắt buộc** trả đúng `{ prompt, negative_prompt }` — không bao giờ trả sai format.

### Bước 5: Gọi OpenRouter Sinh Ảnh

```php
$payload = [
    'model'     => 'google/gemini-2.5-flash-image',
    'messages'  => [
        [
            'role'    => 'user',
            'content' => [
                ['type' => 'text', 'text' => $designedPrompt],
                // + reference images nếu có
                ['type' => 'image_url', 'image_url' => ['url' => 'data:image/jpeg;base64,...']],
            ],
        ],
    ],
    'modalities'   => ['image', 'text'],  // Yêu cầu trả ảnh
    'image_config' => [
        'aspect_ratio' => '1:1',
        'image_size'   => '1K',
    ],
];

// Gọi API với timeout 120s
$response = Http::timeout(120)
    ->withHeaders([
        'Authorization' => 'Bearer {api_key}',
        'HTTP-Referer'  => 'https://zdream.vn',
    ])
    ->post('https://openrouter.ai/api/v1/chat/completions', $payload);
```

**Response chứa ảnh ở đâu?**

```json
{
  "choices": [{
    "message": {
      "images": [{
        "image_url": {
          "url": "data:image/png;base64,iVBORw0KGgoAAAANS..."
        }
      }]
    }
  }]
}
```

→ Extract `choices[0].message.images[0].image_url.url`

### Bước 6: Xử Lý Ảnh + Lưu MinIO

```
base64 data URL hoặc HTTPS URL
        ↓
Nếu base64: decode → binary
Nếu HTTPS: Http::get() → binary (chỉ chấp nhận HTTPS, chống SSRF)
        ↓
Xác định extension từ MIME (png/jpg/webp)
        ↓
Upload MinIO: images/2026/04/10/{uuid}.png
        ↓
Trả về: { file_path, file_url }
```

### Bước 7: Lưu DB + Xử Lý Partial Failure

```
Vòng lặp: for i = 0 → count
  ├─ Thành công → Image::create() + successCount++
  └─ Thất bại → Log error + cleanup orphaned file
      └─ Nếu ảnh đầu tiên fail → break (không thử tiếp)
        ↓
failedCount = count - successCount
refundAmount = failedCount × gemsCostPerImage
        ↓
Nếu refundAmount > 0 → WalletService::credit() (hoàn gems)
        ↓
Nếu successCount == 0 → cleanup reference images + return 500
Nếu partial success → return 201 + thông báo "2/3 ảnh thành công, 1 lỗi, gems đã hoàn"
```

**Tại sao break khi ảnh đầu tiên fail?**
→ Nếu OpenRouter đang gặp sự cố, thử tiếp chỉ tốn thời gian user chờ. Fail fast, refund ngay.

### Bước 8: Response

```json
{
  "message": "Tạo 3 ảnh thành công!",
  "images": [
    {
      "id": 142,
      "prompt": "con mèo đang ngồi",
      "designed_prompt": "A domestic shorthair cat sitting gracefully...",
      "file_url": "https://minio1.webtui.vn:9000/bucket/images/2026/04/10/abc.png",
      "gems_cost": 2,
      "model": "google/gemini-2.5-flash-image",
      "style": "anime",
      "seed": 847291034
    }
  ],
  "gems_remaining": 44
}
```

---

## 4. Hệ Thống AI Agent (Multi-Agent Prompt Optimization)

### 4.1 Kiến Trúc Agent

Tôi thiết kế hệ thống **Multi-Agent** với pattern: **1 Orchestrator + 5 Specialized Agents**.

```
PromptDesignerService (Orchestrator)
│
├─ Nhận input: userPrompt, style, referenceImages, taskType
├─ resolveAgent(taskType) → chọn Agent phù hợp
├─ buildUserText() → xây dựng context message
├─ buildAttachments() → convert ảnh thành AI attachments
│
└─ agent.prompt(text, attachments) → Structured Output
       │
       ├─ GenerateDesigner      ← taskType: generate, template
       ├─ StyleTransferDesigner ← taskType: style-transfer
       ├─ VariationDesigner     ← taskType: variation
       ├─ AdImageDesigner       ← taskType: ad-image
       └─ CharacterDesigner     ← taskType: character
```

**Tại sao Multi-Agent thay vì 1 Agent duy nhất?**

| 1 Agent (monolithic) | Multi-Agent (ZDream5) |
|---|---|
| System prompt dài 5000+ từ | Mỗi agent ~500-800 từ, tập trung |
| Dễ bị "quên" instruction | Agent chỉ biết đúng domain của mình |
| Khó debug khi prompt sai | Biết chính xác agent nào gây lỗi |
| Không tối ưu cho từng task | Mỗi agent có strategy riêng |

### 4.2 Base Agent (Abstract Class)

Tất cả agent kế thừa `BasePromptDesigner`:

```php
#[Provider('openrouter')]       // Dùng OpenRouter làm LLM provider
#[Temperature(0.7)]             // Đủ sáng tạo nhưng không quá random
#[MaxTokens(2048)]              // Đủ cho prompt dài
#[Timeout(30)]                  // 30s timeout cho prompt design
```

- **Temperature 0.7**: Cân bằng giữa sáng tạo (cần cho art) và nhất quán (không hallucinate)
- **MaxTokens 2048**: Prompt dưới 300 từ + negative prompt → 2048 tokens là dư
- **Timeout 30s**: Prompt design chỉ là text generation, không cần lâu

### 4.3 Chi Tiết Từng Agent

#### Agent 1: GenerateDesigner (Xử lý 90% traffic)

**Nhiệm vụ**: Tạo prompt cho tính năng Generate chính.

**Analysis Framework** — phân loại request trước khi viết prompt:

| Loại | Điều kiện | Chiến lược |
|------|-----------|-----------|
| TEXT-ONLY | Không có reference image | Tự do sáng tạo, thêm chi tiết vivid |
| REFERENCE + PRESERVE | Có ảnh + muốn giữ nguyên subject | Mô tả subject cực chính xác, thiết kế scene xung quanh |
| REFERENCE + TRANSFORM | Có ảnh + muốn thay đổi | Mô tả ảnh gốc chính xác, chỉ thay đổi phần được yêu cầu |
| TEMPLATE-GUIDED | Có template system_prompt | Template là kim chỉ nam cho style, user prompt quyết định subject |

**Subject-Specific Rules:**

- **SẢN PHẨM** (nước hoa, giày, mỹ phẩm): Extreme precision — shape, label, branding, material, finish. Commercial fidelity là NON-NEGOTIABLE
- **NGƯỜI/CHÂN DUNG**: Preserve facial features, skin tone, body proportions. Enhance lighting, depth of field
- **PHONG CẢNH**: Preserve composition, landmarks. Enhance atmosphere, volumetric lighting
- **ABSTRACT**: Nhiều creative freedom hơn, giữ core concept và color palette

**Prompt Engineering Rules:**
- Cấu trúc: `[Subject] + [Setting] + [Lighting & Mood] + [Technical details] + [Style]`
- Tối thiểu 3 technical details: camera lens, lighting setup, color grading
- Style chỉ áp dụng cho rendering technique, KHÔNG thay đổi identity của subject
- Dưới 300 từ, mỗi từ phải "earn its place"

#### Agent 2: StyleTransferDesigner

**Nguyên tắc cốt lõi: "Content stays. Style changes."**

Có hướng dẫn riêng cho 6 art style:

| Style | Kỹ thuật rendering |
|-------|-------------------|
| Anime/Manga | Cel-shading, bold outlines, vibrant flat colors |
| Oil Painting | Visible brushstrokes, impasto texture, canvas texture |
| Watercolor | Wet-on-wet bleeding, transparent washes, paper showing through |
| Cyberpunk | Neon lighting (pink/cyan/purple), rain-slicked surfaces, chromatic aberration |
| Pixel Art | Strict pixel grid, 16-32 colors, dithering, no anti-aliasing |
| 3D Render | Ray-traced reflections, subsurface scattering, PBR materials |

**Ẩn dụ**: "Như thuê một họa sĩ khác vẽ lại cùng một bức ảnh."

#### Agent 3: VariationDesigner

**Nguyên tắc: "Same concept, fresh execution."**

Chiến lược:
- Giữ: identity, art style, mood, color palette
- Thay đổi 2-3 biến: camera angle (±15-45°), lighting, background, pose, time of day
- Kết quả phải thuộc "cùng series" — không giống hệt, không khác hoàn toàn

**Ẩn dụ**: "Như một B-take từ cùng buổi chụp ảnh."

#### Agent 4: AdImageDesigner

**Nguyên tắc: "Product is the hero. Everything else serves the sale."**

Hướng dẫn theo platform:
- **Facebook/Instagram Feed**: 1:1 hoặc 4:5, eye-catching khi scroll
- **Stories/Reels/TikTok**: 9:16, product nổi bật ở giữa
- **E-commerce (Shopee/Lazada)**: Nền trắng hoặc gradient, product chiếm full frame

Mood theo ngành hàng:
- Premium → dark moody, gold/silver accents
- Food → fresh, appetizing, droplets/steam
- Beauty → soft glow, pastel tones
- Tech → sleek, futuristic, blue/cool tones

#### Agent 5: CharacterDesigner

**Nguyên tắc: "The character's identity is SACRED."**

Trích xuất **Character Identity Blueprint** từ reference:
1. **Face** (highest priority): shape, eyes, nose, mouth, skin tone, facial hair
2. **Hair**: style, color, texture, parting
3. **Body**: build, height, proportions
4. **Clothing**: signature outfit, accessories
5. **Distinguishing features**: tattoos, scars, birthmarks

Rules:
- Character description chiếm 40-60% prompt
- Dùng reinforcement phrases: "the same person", "maintaining exact facial features"
- Nếu user muốn đổi outfit: chỉ mô tả phần thay đổi, giữ nguyên phần còn lại

**Ẩn dụ**: "Ai biết nhân vật này phải nhận ra ngay — ở bất kỳ scene, pose, lighting nào."

### 4.4 Context Building (Orchestrator Logic)

`PromptDesignerService.buildUserText()` xây dựng message cho agent:

```
## Task: REFERENCE-BASED generation          ← Phân loại task
User prompt: con mèo đang ngồi trên bàn      ← Prompt gốc
Rendering style: anime                        ← Style
Aspect ratio: 16:9                            ← Tỉ lệ
User wants to AVOID: dark, scary              ← Negative từ user

## Reference Images (2 attached)              ← Context ảnh
→ Image 1 = MAIN SUBJECT (preserve exactly)
→ Image 2 = style/mood/environment reference
```

**Tại sao build context riêng?**
- Agent nhận được structured information, không phải raw user input
- Consistent format giúp agent "hiểu" ngay lập tức
- Giảm ambiguity → ít hallucination

### 4.5 Graceful Fallback

```
PromptDesigner.design()
├─ isEnabled() → false? → return original prompt (designed: false)
├─ Missing API key?      → return original prompt
├─ Agent throws error?   → log warning + return original prompt
└─ Agent returns empty?  → return original prompt
```

**Thiết kế "never-fail"**: Nếu PromptDesigner gặp vấn đề, user vẫn tạo được ảnh bằng prompt gốc. Không bao giờ block user vì AI optimization fail.

---

## 5. Hệ Thống 10 AI Tools

Ngoài tính năng Generate chính, ZDream5 có 10 AI tools chuyên biệt:

### Phân nhóm

**Group 1: Image Generation Tools** (dùng PromptDesigner)

| Tool | Input | Agent | Mô tả |
|------|-------|-------|-------|
| Style Transfer | image + target_style | StyleTransferDesigner | Chuyển đổi phong cách nghệ thuật |
| Image Variation | image + strength (0-1) | VariationDesigner | Tạo biến thể ảnh |
| Ad Image | image + description + platform | AdImageDesigner | Tạo ảnh quảng cáo sản phẩm |
| Consistent Character | images[] + scene_description | CharacterDesigner | Giữ nhất quán nhân vật qua các scene |

**Group 2: Image Editing Tools** (gọi thẳng OpenRouter, không cần PromptDesigner)

| Tool | Input | Mô tả |
|------|-------|-------|
| Upscale | image + scale_factor (2x/4x) | Phóng to ảnh giữ chất lượng |
| Remove Background | image | Xóa nền, giữ subject |
| Remove Object | image + description | Xóa object cụ thể khỏi ảnh |
| Inpainting | image + mask + description | Thay nội dung vùng mask |
| Extend | image + directions[] + description | Mở rộng ảnh theo hướng |

**Group 3: Analysis Tool** (trả text, không trả ảnh)

| Tool | Input | Mô tả |
|------|-------|-------|
| Image to Prompt | image | Phân tích ảnh → viết prompt tái tạo |

### Shared Processing Flow (`processImageTool`)

Tất cả image tools chia sẻ 1 helper method:

```
1. Deduct gems (với pessimistic lock)
2. Upload reference images → MinIO
3. [Optional] PromptDesigner optimization (nếu có taskType)
4. OpenRouter.generateImage()
5. Save Image record to DB
6. Return result + gems_remaining

Nếu fail ở bất kỳ bước nào → refund gems + log error + return 500
```

**Tại sao Group 2 không dùng PromptDesigner?**
→ Các editing tools (upscale, remove-bg...) cần prompt **chính xác, cố định** — không cần AI optimize. Thêm PromptDesigner chỉ tăng latency + chi phí mà không thêm giá trị.

---

## 6. Template System (Template-Guided Generation)

Templates cho phép tạo trải nghiệm **one-click generation** với style được chuẩn bị sẵn.

### Flow

```
User chọn template "Ghibli Art Style"
        ↓
Template có:
  - system_prompt: "Transform any image into Studio Ghibli animation style.
    Use watercolor-inspired soft edges, warm color palette, detailed natural
    backgrounds with lush vegetation..."
  - effect_groups: JSON chứa các tùy chọn preset
        ↓
Frontend gửi: { prompt: "a girl in a garden", template_slug: "ghibli-art" }
        ↓
Backend: lookup template → lấy system_prompt
        ↓
PromptDesignerService.design(
  userPrompt: "a girl in a garden",
  templateSystemPrompt: "Transform any image into Studio Ghibli...",
  taskType: 'generate'   // → GenerateDesigner
)
        ↓
GenerateDesigner nhận được context:
  "## Task: TEMPLATE-GUIDED generation
   User prompt: a girl in a garden

   ## Template Creative Direction
   Transform any image into Studio Ghibli animation style..."
        ↓
Agent viết prompt theo template direction, user chỉ cung cấp subject
```

**Rule xử lý conflict**: Template quyết định **style**, user quyết định **subject**.

---

## 7. Image Analysis (Image to Prompt)

Tool này đặc biệt vì **trả text, không trả ảnh**.

```
User upload ảnh
        ↓
OpenRouterService.analyzeImage(
  systemPrompt: "You are an expert AI image prompt engineer. Analyze the
  given image and write a detailed, precise prompt that could recreate
  this image using an AI image generator...",
  referenceImages: [base64]
)
        ↓
Gọi LLM (Gemini Flash — text model, không phải image model)
        ↓
Trả về: "A domestic shorthair orange tabby cat sitting on a marble
counter in a modern kitchen, natural window light from the left,
shallow depth of field, warm tones, 50mm lens..."
```

**Dùng text model** (Gemini Flash) thay vì image model vì chỉ cần phân tích, không cần sinh ảnh → nhanh hơn + rẻ hơn.

---

## 8. Kinh Tế Gem (Wallet System)

### Mô hình

```
1 gem = 500 VND
Đăng ký mới → tặng 50 gems (Setting: new_user_gems)
Tạo ảnh → trừ gems (tuỳ model: 1-5 gems/ảnh)
Dùng tool → trừ gems (tuỳ tool: 1-3 gems/lần)
```

### Cấu trúc giá linh hoạt

Gems cost lấy từ 2 nguồn (fallback chain):

```
AiModel.gems_cost (bảng ai_models)
    ↓ nếu null
Setting.default_gems_per_image (bảng settings)
    ↓ nếu null
Hardcode: 1 gem
```

Tool cost: `Setting.tool_{tool-name}_gems_cost` (có thể config từ Admin panel)

### Transaction Ledger

Mọi thay đổi gems đều ghi vào bảng `transactions`:

```json
{
  "user_id": 5,
  "type": "spend",
  "amount": 6,
  "balance_after": 44,
  "description": "Đặt tạo 3 ảnh AI: con mèo đang ngồi...",
  "metadata": { "type": "reserve", "count": 3 }
}
```

→ Có thể audit trail đầy đủ, biết user tiêu bao nhiêu, khi nào, cho cái gì.

---

## 9. Xử Lý Ảnh & Storage (MinIO)

### Tổ chức file

```
MinIO Bucket: bucket-dangtuandat
├── images/2026/04/10/{uuid}.png       ← Ảnh AI đã sinh
├── references/2026/04/10/{uuid}.jpeg  ← Ảnh tham chiếu (temp)
├── uploads/2026/04/10/{uuid}.jpg      ← Ảnh user upload
└── templates/2026/04/10/{uuid}.png    ← Thumbnail template
```

### Security

- **SSRF Protection**: Chỉ chấp nhận HTTPS URL khi download ảnh từ OpenRouter. HTTP bị reject.
- **File naming**: UUID v4 → không thể đoán path ảnh người khác
- **Ownership check**: Delete chỉ cho phép nếu `image.user_id == auth.user.id`

### Cleanup Strategy

```
Thành công:
  - reference images: giữ lại (vì image record tham chiếu đến chúng)
  - generated images: giữ lại

Thất bại hoàn toàn (0 ảnh thành công):
  - reference images: xóa (best-effort cleanup)
  - orphaned files: xóa nếu upload nhưng DB fail

Partial failure:
  - reference images: giữ (vì ảnh thành công cần chúng)
  - failed image files: xóa ngay
```

---

## 10. Authentication & Security

### Flow đăng nhập

```
POST /api/login { email, password }
        ↓
Backend verify → Sanctum tạo token
        ↓
Response: { token: "abc...", user: { id, name, email, gems, level } }
        ↓
Frontend lưu localStorage:
  - auth_token: "abc..."
  - auth_user: { id, name, email, gems }
        ↓
Mọi API request tự động đính kèm: Authorization: Bearer abc...
        ↓
Response 401 → auto logout + redirect /login
```

### Google OAuth

```
Frontend → /api/auth/google/redirect → Google consent
        ↓
Google callback → Backend nhận profile
        ↓
Tìm user theo google_id hoặc email:
  - Có: update google_id + login
  - Chưa có: tạo user mới + tặng gems
        ↓
Redirect frontend: /login/google/success?token=abc...
        ↓
Frontend: loginWithToken(token) → lưu localStorage
```

### Phân quyền Admin

```
Level 0: User thường
Level 1: Moderator
Level 2: Admin → truy cập /app/admin/*
Level 99: Super Admin → quản lý admin khác
```

**Anti-escalation**: Super admin mới có thể tạo admin. Admin không thể tự nâng level.

---

## 11. Những Quyết Định Thiết Kế Quan Trọng

### Tại sao dùng OpenRouter thay vì trực tiếp Gemini API?

- **Model-agnostic**: Đổi model bằng cách thay `model_id` trong DB, không cần deploy lại
- **Fallback**: Nếu Gemini down, chuyển sang FLUX trong vài giây
- **Cost management**: So sánh giá model real-time qua OpenRouter dashboard
- **Unified API**: 1 codebase xử lý 200+ model

### Tại sao Prompt Designer là service riêng, không nhúng vào Controller?

- **Single Responsibility**: Controller chỉ orchestrate, không chứa AI logic
- **Testability**: Mock PromptDesignerService khi test Controller
- **Feature flag**: Bật/tắt qua Setting mà không cần deploy
- **Graceful degradation**: Fail → fallback to original prompt, user không bị block

### Tại sao dùng Structured Output thay vì parse text?

| Parse text | Structured Output |
|---|---|
| Regex/string matching → fragile | JSON schema → guaranteed format |
| LLM có thể thêm explanation | LLM chỉ trả đúng fields được yêu cầu |
| Cần error handling cho format lạ | Parse lỗi = LLM provider lỗi (hiếm) |

### Tại sao trừ gems trước, hoàn sau (deduct-then-refund)?

- **Consistency**: Không bao giờ tạo ảnh mà chưa trừ tiền
- **Race condition safe**: Lock + deduct là atomic
- **Partial success**: Hoàn chính xác số ảnh fail
- **Audit trail**: Cả deduct lẫn refund đều có transaction record

### Tại sao dùng MinIO thay vì local storage?

- **Scalable**: Horizontal scaling, không phụ thuộc single server
- **S3-compatible**: Migrate sang AWS S3 bất cứ lúc nào, chỉ đổi .env
- **CDN-ready**: MinIO URL có thể đặt sau CloudFront/Cloudflare
- **Backup**: MinIO hỗ trợ replication

---

## 12. Tóm Tắt Kiến Trúc AI (1 Trang)

```
USER → Frontend → POST /api/images/generate
                         │
                    ┌────┴─────┐
                    │ VALIDATE │ prompt, model, style, aspect_ratio, count
                    └────┬─────┘
                         │
                    ┌────┴──────┐
                    │ DEDUCT    │ Pessimistic lock → gems -= cost
                    │ GEMS      │ Race condition safe
                    └────┬──────┘
                         │
                    ┌────┴──────────┐
                    │ UPLOAD REFS   │ base64 → MinIO URLs
                    └────┬──────────┘
                         │
                    ┌────┴──────────────────────┐
                    │ PROMPT DESIGNER            │
                    │ (AI Layer 1 — text LLM)    │
                    │                            │
                    │ Orchestrator chọn Agent:    │
                    │ ├─ GenerateDesigner         │
                    │ ├─ StyleTransferDesigner    │
                    │ ├─ VariationDesigner        │
                    │ ├─ AdImageDesigner          │
                    │ └─ CharacterDesigner        │
                    │                            │
                    │ Input: raw prompt + context │
                    │ Output: optimized prompt    │
                    │ (Structured Output JSON)    │
                    └────┬──────────────────────┘
                         │
                    ┌────┴──────────────────────┐
                    │ OPENROUTER API             │
                    │ (AI Layer 2 — image LLM)   │
                    │                            │
                    │ Input: designed prompt      │
                    │ + reference images          │
                    │ Output: base64 image        │
                    └────┬──────────────────────┘
                         │
                    ┌────┴──────┐
                    │ SAVE      │ Decode → MinIO → DB record
                    └────┬──────┘
                         │
                    ┌────┴──────┐
                    │ REFUND?   │ failedCount × cost → credit back
                    └────┬──────┘
                         │
                    ┌────┴──────┐
                    │ RESPONSE  │ images[] + gems_remaining
                    └───────────┘
```

**Hai tầng AI**:
1. **AI Layer 1** (PromptDesigner): Text LLM tối ưu prompt — biến "con mèo" thành mô tả chuyên nghiệp 200 từ
2. **AI Layer 2** (OpenRouter): Image LLM sinh ảnh từ prompt đã tối ưu

Tầng 1 là "Art Director", tầng 2 là "Artist". Art Director hiểu user muốn gì, viết brief chi tiết, Artist thực thi.

---

## 13. Câu Hỏi Phỏng Vấn Thường Gặp & Trả Lời

### Q: Tại sao cần PromptDesigner? User viết prompt rồi gửi thẳng cho AI tạo ảnh không được sao?

**A**: Được, nhưng chất lượng ảnh phụ thuộc rất lớn vào chất lượng prompt. User thường viết prompt ngắn, mơ hồ ("con mèo cute"). AI image model cần prompt chi tiết về lighting, composition, camera angle, color palette mới tạo ảnh đẹp. PromptDesigner đóng vai trò "Art Director" — biến ý tưởng thô thành brief chuyên nghiệp. Kết quả: ảnh đẹp hơn rõ rệt, user experience tốt hơn, tỷ lệ retry giảm (tiết kiệm API cost).

### Q: Làm sao xử lý khi 2 user cùng tạo ảnh lúc gems chỉ đủ 1 người?

**A**: Dùng pessimistic locking (SELECT ... FOR UPDATE). Request đầu tiên lock row user → trừ gems → unlock. Request thứ hai chờ lock → kiểm tra → không đủ → reject 422. Toàn bộ trong DB transaction, đảm bảo ACID. Chọn pessimistic thay vì optimistic vì financial transaction cần consistency tuyệt đối.

### Q: Nếu OpenRouter API bị timeout giữa chừng, gems bị trừ rồi sao?

**A**: Gems đã trừ trước (bước 2). Nếu sinh ảnh fail (bước 5), hệ thống tự động refund gems cho số ảnh không thành công (bước 7). Transaction ledger ghi cả deduct lẫn refund → audit trail đầy đủ.

### Q: Tại sao chọn kiến trúc Multi-Agent thay vì 1 prompt duy nhất?

**A**: Separation of Concerns. Style Transfer cần preserve content + change rendering. Character Consistency cần preserve identity + change scene. Hai tasks này cần instruction set hoàn toàn khác nhau. Gộp vào 1 prompt → quá dài, dễ conflict, khó maintain. Multi-Agent → mỗi agent nhỏ gọn, dễ test, dễ improve riêng.

### Q: Structured Output hoạt động thế nào?

**A**: Khai báo JSON schema với fields `prompt` (string) và `negative_prompt` (string). Laravel AI framework gửi schema cùng request. LLM provider (OpenRouter) đảm bảo response khớp schema. Nếu LLM không trả đúng format → provider retry nội bộ. Kết quả: luôn nhận được JSON valid, không cần parse text phức tạp.

### Q: Hệ thống có thể scale không?

**A**: Có.
- **Backend**: Stateless Laravel (Sanctum token) → scale horizontally
- **Storage**: MinIO cluster → scale independently
- **AI**: OpenRouter load balance giữa nhiều provider
- **DB**: Pessimistic lock chỉ lock 1 row/user → concurrent users không block nhau
- **Queue**: Laravel queue cho background processing (đã setup, có thể move generation sang queue)

### Q: Bạn dùng framework AI nào ở backend?

**A**: Laravel AI — framework chính thức của Laravel cho AI integration. Hỗ trợ:
- Agent pattern với system prompt
- Structured Output (JSON schema)
- Multi-modal (text + image attachments)
- Provider abstraction (dễ swap OpenRouter → OpenAI → Anthropic)
Các agent kế thừa `Agent` interface, dùng `HasStructuredOutput` trait.
