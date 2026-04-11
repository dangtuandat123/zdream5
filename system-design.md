# ZDream5 — System Design

> Phân tích kiến trúc hệ thống end-to-end: từ user click → ảnh AI trả về.

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                            │
│                                                                      │
│  React 18 + TypeScript + Vite 5 + Tailwind + shadcn/ui              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│  │ Landing  │ │Dashboard │ │ Generate │ │ Library  │ │  TopUp    │ │
│  │  Page    │ │  (Feed)  │ │  Page    │ │  Page    │ │  Page     │ │
│  └──────────┘ └──────────┘ └────┬─────┘ └──────────┘ └───────────┘ │
│                                 │                                    │
│  AuthContext (global state) ────┤── token, user, gems               │
│  api.ts (HTTP client) ─────────┤── auto Bearer token, 401 redirect │
│                                 │                                    │
└─────────────────────────────────┼────────────────────────────────────┘
                                  │ Vite Proxy: /api → localhost:8000
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Laravel 12)                          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Sanctum Auth Middleware                    │    │
│  │              token verify → user resolve → inject            │    │
│  └──────────────────────────┬──────────────────────────────────┘    │
│                              │                                       │
│  ┌───────────┐ ┌────────────┤──────────────┐ ┌──────────────────┐  │
│  │   Auth    │ │   Image    │  Tool        │ │   Wallet / Admin │  │
│  │Controller │ │ Controller │ Controller   │ │   Controllers    │  │
│  └───────────┘ └─────┬──────┴──────┬───────┘ └──────────────────┘  │
│                      │             │                                 │
│           ┌──────────┴─────────────┴──────────┐                     │
│           │         SERVICE LAYER              │                     │
│           │                                    │                     │
│           │  ┌─────────────────────────────┐   │                     │
│           │  │   PromptDesignerService     │   │                     │
│           │  │   (AI Orchestrator)         │   │                     │
│           │  └────────────┬────────────────┘   │                     │
│           │               │                    │                     │
│           │  ┌────────────┴────────────────┐   │                     │
│           │  │    OpenRouterService        │   │                     │
│           │  │    (AI Gateway Client)      │   │                     │
│           │  └────────────┬────────────────┘   │                     │
│           │               │                    │                     │
│           │  ┌────────────┴────────────────┐   │                     │
│           │  │    WalletService            │   │                     │
│           │  │    (Gem Economy Engine)     │   │                     │
│           │  └─────────────────────────────┘   │                     │
│           └────────────────────────────────────┘                     │
│                              │                                       │
│  ┌───────────────────────────┼───────────────────────────────────┐  │
│  │                     DATA LAYER                                │  │
│  │   MySQL (users, images, projects, transactions, settings)     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────┬───────────────────────────┬───────────────────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│   OpenRouter API     │    │   MinIO (S3-compatible)       │
│                      │    │                              │
│ ┌──────────────────┐ │    │  /images/YYYY/MM/DD/uuid.png │
│ │ Gemini Flash     │ │    │  /references/...             │
│ │ FLUX             │ │    │  /uploads/...                │
│ │ Stable Diffusion │ │    │  /templates/...              │
│ │ DALL-E           │ │    │                              │
│ │ ...200+ models   │ │    └──────────────────────────────┘
│ └──────────────────┘ │
└──────────────────────┘
```

---

## 2. Request Lifecycle — Tạo Ảnh AI

```
Browser                    Laravel                     External
  │                          │                           │
  │  POST /api/images/       │                           │
  │  generate                │                           │
  │ ─────────────────────►   │                           │
  │  {prompt, model,         │                           │
  │   style, count: 3,       │                           │
  │   reference_images}      │                           │
  │                          │                           │
  │                    ┌─────┴─────┐                     │
  │                    │ VALIDATE  │                     │
  │                    │ FormRequest│                     │
  │                    └─────┬─────┘                     │
  │                          │                           │
  │                    ┌─────┴──────────┐                │
  │                    │ CALCULATE COST │                │
  │                    │ AiModel.gems   │                │
  │                    │ × count = 6    │                │
  │                    └─────┬──────────┘                │
  │                          │                           │
  │                    ┌─────┴──────────────┐            │
  │                    │ DEDUCT GEMS        │            │
  │                    │ BEGIN TRANSACTION   │            │
  │                    │ SELECT FOR UPDATE   │◄── Lock row
  │                    │ gems -= 6          │            │
  │                    │ INSERT transaction  │            │
  │                    │ COMMIT              │            │
  │                    └─────┬──────────────┘            │
  │                          │                           │
  │                    ┌─────┴──────────────┐            │
  │                    │ UPLOAD REFERENCES  │            │
  │                    │ base64 → decode    │            │
  │                    │ → MinIO upload     ├───────────►│ MinIO PUT
  │                    │ → get public URLs  │◄───────────│ URL returned
  │                    └─────┬──────────────┘            │
  │                          │                           │
  │                    ┌─────┴──────────────┐            │
  │                    │ PROMPT DESIGNER    │            │
  │                    │ (AI Layer 1)       │            │
  │                    │                    ├───────────►│ OpenRouter
  │                    │ Select Agent       │            │ /chat/completions
  │                    │ Build context      │            │ (text model)
  │                    │ Structured Output  │◄───────────│
  │                    │                    │            │ {prompt, negative}
  │                    └─────┬──────────────┘            │
  │                          │                           │
  │                    ┌─────┴──────────────┐            │
  │                    │ GENERATE IMAGE     │            │
  │                    │ (AI Layer 2)       │            │
  │                    │ Loop: i = 0→2      │            │
  │                    │                    │            │
  │                    │ ┌─ Iteration 0 ──┐ │            │
  │                    │ │ POST OpenRouter ├─┼───────────►│ /chat/completions
  │                    │ │ modalities:     │ │            │ (image model)
  │                    │ │  [image, text]  │ │            │ timeout: 120s
  │                    │ │                 │◄┼───────────│
  │                    │ │ Extract base64  │ │            │ base64 image
  │                    │ │ Decode → binary │ │            │
  │                    │ │ Upload MinIO    ├─┼───────────►│ MinIO PUT
  │                    │ │ Image::create() │ │            │
  │                    │ │ successCount++  │ │            │
  │                    │ └─────────────────┘ │            │
  │                    │                    │            │
  │                    │ ┌─ Iteration 1 ──┐ │            │
  │                    │ │ (same flow)     │ │            │
  │                    │ └─────────────────┘ │            │
  │                    │                    │            │
  │                    │ ┌─ Iteration 2 ──┐ │            │
  │                    │ │ ✗ API timeout  │ │            │
  │                    │ │ Log error      │ │            │
  │                    │ │ Delete orphan  │ │            │
  │                    │ └─────────────────┘ │            │
  │                    └─────┬──────────────┘            │
  │                          │                           │
  │                    ┌─────┴──────────────┐            │
  │                    │ REFUND FAILED      │            │
  │                    │ 1 failed × 2 gems  │            │
  │                    │ = refund 2 gems    │            │
  │                    │ INSERT transaction  │            │
  │                    └─────┬──────────────┘            │
  │                          │                           │
  │  ◄───────────────────────┤                           │
  │  201 Created             │                           │
  │  {                       │                           │
  │    message: "2/3 OK",    │                           │
  │    images: [...],        │                           │
  │    gems_remaining: 46    │                           │
  │  }                       │                           │
  │                          │                           │
```

---

## 3. Authentication Flow

```
┌──── ĐĂNG KÝ / ĐĂNG NHẬP ────┐     ┌──── GOOGLE OAUTH ────────────────┐
│                               │     │                                   │
│ POST /api/register            │     │ GET /api/auth/google/redirect     │
│ {name, email, password}       │     │         │                         │
│         │                     │     │         ▼                         │
│         ▼                     │     │ Redirect → Google Consent Screen  │
│ Hash password                 │     │         │                         │
│ Create user (gems = 50)      │     │         ▼                         │
│ Create Sanctum token          │     │ Google callback → Laravel         │
│         │                     │     │         │                         │
│         ▼                     │     │         ▼                         │
│ POST /api/login               │     │ Find user by google_id or email   │
│ {email, password}             │     │ ├─ Found → update google_id       │
│         │                     │     │ └─ Not found → create new user    │
│         ▼                     │     │         │                         │
│ Verify credentials            │     │         ▼                         │
│ Create Sanctum token          │     │ Create Sanctum token              │
│         │                     │     │         │                         │
│         ▼                     │     │         ▼                         │
│ Response: {token, user}       │     │ Redirect: /login/google/success   │
│                               │     │   ?token=abc123                   │
└───────────┬───────────────────┘     └───────────┬───────────────────────┘
            │                                     │
            ▼                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND TOKEN MANAGEMENT                         │
│                                                                          │
│  localStorage.auth_token = "abc123"                                     │
│  localStorage.auth_user  = { id, name, email, gems, level }             │
│                                                                          │
│  AuthContext provides:                                                   │
│    isLoggedIn, user, gems, login(), logout(), refreshUser()              │
│                                                                          │
│  api.ts interceptor:                                                    │
│    Every request → Authorization: Bearer {token}                        │
│    Response 401  → auto logout() → redirect /login                      │
│                                                                          │
│  Route guards:                                                          │
│    ProtectedRoute: !isLoggedIn → redirect /login                        │
│    PublicRoute:     isLoggedIn → redirect /app/home                     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Wallet System — Gem Economy

```
┌────────────────────────────────────────────────────────────────────┐
│                     GEM TRANSACTION FLOW                           │
│                                                                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │  TOPUP   │    │ GENERATE │    │  REFUND  │    │  BONUS   │   │
│  │  +100    │    │  -6      │    │  +2      │    │  +50     │   │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘   │
│       │               │               │               │          │
│       ▼               ▼               ▼               ▼          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   WalletService                            │  │
│  │                                                            │  │
│  │  deduct(user, amount, desc, metadata)                      │  │
│  │  ┌────────────────────────────────────────────────────┐    │  │
│  │  │ DB::transaction {                                  │    │  │
│  │  │   $user = User::lockForUpdate()->find(id)          │    │  │
│  │  │   if ($user->gems < amount) throw RuntimeException │    │  │
│  │  │   $user->gems -= amount                            │    │  │
│  │  │   $user->save()                                    │    │  │
│  │  │   Transaction::create({                            │    │  │
│  │  │     type: 'spend', amount, balance_after,          │    │  │
│  │  │     description, metadata                          │    │  │
│  │  │   })                                               │    │  │
│  │  │ }                                                  │    │  │
│  │  └────────────────────────────────────────────────────┘    │  │
│  │                                                            │  │
│  │  credit(user, amount, desc, metadata)                      │  │
│  │  ┌────────────────────────────────────────────────────┐    │  │
│  │  │ DB::transaction {                                  │    │  │
│  │  │   $user = User::lockForUpdate()->find(id)          │    │  │
│  │  │   $user->gems += amount                            │    │  │
│  │  │   $user->save()                                    │    │  │
│  │  │   Transaction::create({                            │    │  │
│  │  │     type: 'topup', amount, balance_after,          │    │  │
│  │  │     description, metadata                          │    │  │
│  │  │   })                                               │    │  │
│  │  │ }                                                  │    │  │
│  │  └────────────────────────────────────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│               RACE CONDITION PREVENTION                            │
│                                                                    │
│  User gems = 5, Request A (cost=3), Request B (cost=3)            │
│                                                                    │
│  Timeline:                                                        │
│  ─────────────────────────────────────────────────────────────     │
│  t1: Request A → BEGIN TX → SELECT FOR UPDATE (gets lock)         │
│  t2: Request B → BEGIN TX → SELECT FOR UPDATE (WAITS...)          │
│  t3: Request A → gems=5, 5≥3 ✓ → gems=2 → COMMIT (releases lock)│
│  t4: Request B → (gets lock) → gems=2, 2<3 ✗ → ROLLBACK → 422   │
│  ─────────────────────────────────────────────────────────────     │
│                                                                    │
│  Result: A succeeds (gems=2), B rejected. No overdraft.           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5. Cost Calculation Chain

```
Request: { model: "google/gemini-2.5-flash-image", count: 3 }
                │
                ▼
┌───────────────────────────────────────┐
│ 1. Lookup AiModel table              │
│    WHERE model_id = 'google/gemini..' │
│    AND is_active = true               │
│    → gems_cost = 2                    │
│                                       │
│ 2. Fallback: Setting table           │
│    key = 'default_gems_per_image'     │
│    → value = 1                        │
│                                       │
│ 3. Fallback: Hardcode                │
│    → 1 gem                            │
└───────────────┬───────────────────────┘
                │
                ▼
        gems_cost_per_image = 2
        total_cost = 2 × 3 = 6 gems

┌───────────────────────────────────────┐
│ Tool cost (separate lookup):          │
│                                       │
│ Setting: tool_{name}_gems_cost        │
│ e.g. tool_style-transfer_gems_cost=2  │
│      tool_image-to-prompt_gems_cost=1 │
│      tool_upscale_gems_cost=3         │
└───────────────────────────────────────┘
```

---

## 6. Data Model (ERD)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │       │     images       │       │   projects   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id        PK │◄──┐   │ id            PK │   ┌──►│ id        PK │
│ name         │   │   │ user_id       FK │───┘   │ user_id   FK │───┐
│ email     UQ │   │   │ project_id    FK │───────│ name         │   │
│ password     │   ├───│ type (ai/upload) │       │ timestamps   │   │
│ gems      INT│   │   │ prompt           │       └──────────────┘   │
│ level     INT│   │   │ designed_prompt  │                          │
│ google_id    │   │   │ negative_prompt  │       ┌──────────────┐   │
│ avatar       │   │   │ model            │       │ transactions │   │
│ timestamps   │   │   │ style            │       ├──────────────┤   │
└──────────────┘   │   │ aspect_ratio     │       │ id        PK │   │
                   │   │ file_path        │       │ user_id   FK │───┘
                   │   │ file_url         │       │ type         │
                   │   │ seed          INT│       │  (topup|spend│
                   │   │ gems_cost     INT│       │   |refund)   │
                   │   │ reference_images │       │ amount    INT│
                   │   │  (JSON array)    │       │ balance_after│
                   │   │ template_slug    │       │ description  │
                   │   │ tool_name        │       │ metadata JSON│
                   │   │ timestamps       │       │ timestamps   │
                   │   └──────────────────┘       └──────────────┘
                   │
                   │   ┌──────────────────┐       ┌──────────────┐
                   │   │   ai_models      │       │   settings   │
                   │   ├──────────────────┤       ├──────────────┤
                   │   │ id            PK │       │ id        PK │
                   │   │ model_id      UQ │       │ key       UQ │
                   │   │ name             │       │ value        │
                   │   │ provider         │       │ timestamps   │
                   │   │ gems_cost     INT│       └──────────────┘
                   │   │ is_active   BOOL │
                   │   │ capabilities JSON│       ┌──────────────┐
                   │   │ timestamps       │       │  templates   │
                   │   └──────────────────┘       ├──────────────┤
                   │                              │ id        PK │
                   └──────────────────────────────│ user_id   FK │
                                                  │ name         │
                                                  │ slug      UQ │
                                                  │ system_prompt│
                                                  │ effect_groups│
                                                  │  (JSON)      │
                                                  │ thumbnail    │
                                                  │ is_active    │
                                                  │ timestamps   │
                                                  └──────────────┘
```

---

## 7. Storage Architecture (MinIO)

```
MinIO Cluster (S3-compatible)
│
├── bucket-dangtuandat/
│   │
│   ├── images/                    ← AI-generated images
│   │   └── 2026/04/10/
│   │       ├── a1b2c3d4.png       ← UUID v4 naming (unpredictable)
│   │       ├── e5f6g7h8.jpg
│   │       └── ...
│   │
│   ├── references/                ← User reference images (temp)
│   │   └── 2026/04/10/
│   │       └── i9j0k1l2.jpeg
│   │
│   ├── uploads/                   ← User uploaded images
│   │   └── 2026/04/10/
│   │       └── m3n4o5p6.png
│   │
│   └── templates/                 ← Template thumbnails
│       └── 2026/04/10/
│           └── q7r8s9t0.png
│
│  Access: public-read via URL
│  Naming: UUID v4 → cannot guess other users' files
│  Date partitioning: YYYY/MM/DD → manageable directories
│  Extension: derived from MIME type, not user input
```

---

## 8. API Route Map

```
/api
├── PUBLIC
│   ├── POST /register                 → AuthController@register
│   ├── POST /login                    → AuthController@login
│   └── GET  /auth/google/redirect     → AuthController@googleRedirect
│
├── AUTH (Sanctum middleware)
│   ├── POST /logout                   → AuthController@logout
│   ├── GET  /user                     → AuthController@user
│   │
│   ├── IMAGES
│   │   ├── POST /images/generate      → ImageController@generate
│   │   ├── POST /images/upload        → ImageController@upload
│   │   ├── GET  /images               → ImageController@index
│   │   └── DEL  /images/{id}          → ImageController@destroy
│   │
│   ├── TOOLS
│   │   ├── POST /tools/style-transfer        → ToolController@styleTransfer
│   │   ├── POST /tools/image-variation       → ToolController@imageVariation
│   │   ├── POST /tools/ad-image              → ToolController@adImage
│   │   ├── POST /tools/consistent-character  → ToolController@consistentCharacter
│   │   ├── POST /tools/upscale               → ToolController@upscale
│   │   ├── POST /tools/remove-bg             → ToolController@removeBg
│   │   ├── POST /tools/remove-object         → ToolController@removeObject
│   │   ├── POST /tools/inpainting            → ToolController@inpainting
│   │   ├── POST /tools/extend                → ToolController@extend
│   │   └── POST /tools/image-to-prompt       → ToolController@imageToPrompt
│   │
│   ├── PROJECTS
│   │   ├── GET  /projects             → ProjectController@index
│   │   ├── POST /projects             → ProjectController@store
│   │   └── DEL  /projects/{id}        → ProjectController@destroy
│   │
│   ├── WALLET
│   │   ├── GET  /wallet               → WalletController@index
│   │   └── POST /wallet/topup         → WalletController@topup
│   │
│   └── ADMIN (level >= 2)
│       ├── GET    /admin/settings     → AdminController@settings
│       ├── PUT    /admin/settings     → AdminController@updateSettings
│       ├── CRUD   /admin/ai-models    → AdminController
│       ├── CRUD   /admin/templates    → AdminController
│       └── CRUD   /admin/tools        → AdminController
│
└── Vite proxy: localhost:5173/api/* → localhost:8000/api/*
```

---

## 9. Error Handling & Resilience

```
┌─────────────────────────────────────────────────────────────────┐
│                    FAILURE SCENARIOS                              │
│                                                                  │
│  Scenario 1: Insufficient gems                                  │
│  ─────────────────────────────────────                          │
│  WalletService.deduct() → RuntimeException                      │
│  → Response 422: "Không đủ Kim Cương. Cần X, bạn còn Y"        │
│  → No API call made, no cost incurred                           │
│                                                                  │
│  Scenario 2: PromptDesigner fails                               │
│  ─────────────────────────────────                              │
│  Agent throws / returns empty / timeout                         │
│  → Fallback: use original user prompt (designed: false)         │
│  → Generation continues with raw prompt                         │
│  → User never blocked by optimizer failure                      │
│                                                                  │
│  Scenario 3: OpenRouter API error (all images fail)             │
│  ───────────────────────────────────────────────                │
│  First image fails → break loop (fail fast)                     │
│  → Refund 100% gems                                            │
│  → Cleanup reference images from MinIO                          │
│  → Response 500: "Lỗi tạo ảnh. Gems đã được hoàn lại."        │
│                                                                  │
│  Scenario 4: Partial failure (2/3 succeed)                      │
│  ──────────────────────────────────────                         │
│  Images 0,1 succeed, image 2 fails                              │
│  → Refund: 1 × gems_cost                                       │
│  → Return 2 successful images                                   │
│  → Response 201: "2/3 thành công, 1 lỗi, gems đã hoàn"        │
│                                                                  │
│  Scenario 5: MinIO upload fails after API success               │
│  ─────────────────────────────────────────────                  │
│  Image generated but storage fails                              │
│  → Catch → delete orphaned file (best effort)                   │
│  → Count as failed → gems refunded                              │
│                                                                  │
│  Scenario 6: DB insert fails after MinIO upload                 │
│  ──────────────────────────────────────────                     │
│  File on MinIO but Image::create() fails                        │
│  → Catch → delete file from MinIO                               │
│  → Count as failed → gems refunded                              │
│  → Orphan cleanup via scheduled job (safety net)                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                       SECURITY MODEL                             │
│                                                                  │
│  Layer 1: Authentication                                        │
│  ─────────────────────                                          │
│  • Sanctum token-based (no session/cookie for API)              │
│  • Token stored in localStorage                                 │
│  • Auto-injected via Authorization header                       │
│  • 401 → auto-logout + redirect                                │
│                                                                  │
│  Layer 2: Authorization                                         │
│  ──────────────────────                                         │
│  • user.level checks for admin routes                           │
│  • Ownership checks: image.user_id == auth.user.id              │
│  • project.user_id == auth.user.id                              │
│  • Super admin (99) required to manage other admins             │
│                                                                  │
│  Layer 3: Input Validation                                      │
│  ─────────────────────────                                      │
│  • Laravel Form Requests (typed, per-endpoint)                  │
│  • model_id must exist in ai_models AND is_active              │
│  • reference_images: max 6, max 13.5MB each                    │
│  • aspect_ratio: enum whitelist                                 │
│  • count: capped by Setting.max_images_per_request             │
│                                                                  │
│  Layer 4: Financial Safety                                      │
│  ─────────────────────────                                      │
│  • Pessimistic locking (SELECT FOR UPDATE)                      │
│  • Deduct BEFORE action, refund on failure                      │
│  • Transaction ledger for full audit trail                      │
│  • Cannot go negative (check before deduct)                     │
│                                                                  │
│  Layer 5: Storage Security                                      │
│  ─────────────────────────                                      │
│  • UUID v4 filenames (no path traversal, no guessing)           │
│  • SSRF protection: only HTTPS URLs accepted for images         │
│  • File extension derived from MIME, not user input             │
│  • Ownership-gated deletion                                     │
│                                                                  │
│  Layer 6: API Security                                          │
│  ──────────────────────                                         │
│  • OpenRouter API key server-side only (never exposed)          │
│  • CORS: only FRONTEND_URL allowed                              │
│  • Rate limiting via Laravel throttle middleware                 │
│  • Error messages: generic to client, detailed to logs          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Scaling Strategy

```
┌────────────────────────────────────────────────────────────────┐
│                   HORIZONTAL SCALING                            │
│                                                                │
│  Frontend: Static files → CDN (Cloudflare/CloudFront)          │
│  ──────────────────────────────────────────────                │
│  Vite build → dist/ → S3 + CDN                                │
│  Zero server needed for frontend                               │
│                                                                │
│  Backend: Stateless Laravel → N instances                      │
│  ────────────────────────────────────────                      │
│  Sanctum token auth (no session state)                         │
│  → Load balancer → multiple PHP-FPM instances                  │
│  Pessimistic lock scoped to user row → no cross-user blocking  │
│                                                                │
│  Database: MySQL read replicas                                 │
│  ────────────────────────────────────                          │
│  Writes: master (wallet transactions, image records)           │
│  Reads: replicas (image listing, dashboard feed)               │
│                                                                │
│  Storage: MinIO cluster                                        │
│  ──────────────────────────────                                │
│  Scale independently, replication built-in                     │
│  Migrate to AWS S3 by changing .env only                       │
│                                                                │
│  AI: OpenRouter handles scaling                                │
│  ──────────────────────────────────                            │
│  Load balances across multiple AI providers                    │
│  Auto-failover between models                                  │
│  Rate limits managed by OpenRouter dashboard                   │
│                                                                │
│  Queue: Laravel Queue (future)                                 │
│  ──────────────────────────────                                │
│  Move image generation to background jobs                      │
│  Webhook/polling for completion notification                   │
│  Benefits: faster response, retry, priority queues             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
