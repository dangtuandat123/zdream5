# ZDream5 – CLAUDE.md

## Project Overview

**ZDream5** là nền tảng tạo ảnh AI full-stack. Người dùng tạo ảnh nghệ thuật bằng AI thông qua hệ thống tín dụng **gem** (viên đá quý). Ứng dụng gồm landing page công khai và phần app được bảo vệ (dashboard, generate, library, templates, topup).

---

## Tech Stack

### Frontend (`/src`)
- **React 18** + **TypeScript 5** – framework chính
- **Vite 5** – build tool, dev server port **5173**
- **React Router DOM 7** – nested routes
- **Tailwind CSS 3** + **shadcn/ui** (New York style, 45+ components dựa trên Radix UI)
- **Framer Motion 12** – animations
- **Lucide React** – icons
- **Sonner** – toast notifications
- **Zod 4** – runtime validation
- **Recharts** – charts
- **dnd-kit** – drag & drop
- Path alias: `@/*` → `./src/*` (tsconfig.json)

### Backend (`/backend`)
- **Laravel 12** (PHP 8.2+)
- **Laravel Sanctum 4** – token-based auth cho SPA
- **Eloquent ORM** + **MySQL** (dev: SQLite cũng được)
- **MinIO / AWS S3** – lưu trữ ảnh sinh ra
- **OpenRouter API** – dịch vụ sinh ảnh AI (model mặc định: `google/gemini-2.5-flash-image`)
- API port: **8000**

---

## Cấu Trúc Project

```
zdream5/
├── src/                          # React frontend
│   ├── App.tsx                  # Router config (routes tất cả)
│   ├── main.tsx                 # Entry point, bọc AuthProvider
│   ├── components/
│   │   ├── auth/                # Login, Register, ProtectedRoute, PublicRoute
│   │   ├── layout/              # AppShell, AppSidebar, Navbar, Footer
│   │   ├── dashboard/           # Dashboard (home feed, masonry gallery)
│   │   ├── generate/            # GeneratePage – tính năng chính (~2500 dòng)
│   │   ├── templates/           # TemplatesPage, TemplateDetailPage
│   │   ├── library/             # LibraryPage – gallery ảnh đã lưu
│   │   ├── topup/               # TopUpPage – mua gems
│   │   ├── studio/              # StudioWorkspace
│   │   └── ui/                  # shadcn/ui components (không sửa trực tiếp)
│   ├── contexts/
│   │   └── AuthContext.tsx      # Global auth state (isLoggedIn, user, gems)
│   ├── hooks/
│   │   ├── use-mobile.tsx       # Breakpoint 768px
│   │   └── use-toast.ts         # Toast hook (Sonner)
│   ├── lib/
│   │   ├── api.ts               # HTTP client + tất cả API modules có kiểu TypeScript
│   │   └── utils.ts             # cn() – merge Tailwind classes
│   └── pages/
│       └── LandingPage.tsx      # Landing page công khai
│
├── backend/                     # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/     # AuthController, ImageController, ProjectController, WalletController
│   │   │   └── Requests/        # LoginRequest, RegisterRequest, GenerateImageRequest
│   │   ├── Models/              # User, Image, Project, Transaction
│   │   └── Services/
│   │       ├── OpenRouterService.php  # Gọi OpenRouter, lưu ảnh lên MinIO
│   │       └── WalletService.php      # Quản lý gems (deduct/credit với lock)
│   ├── database/
│   │   ├── migrations/          # Schema DB
│   │   └── seeders/             # Seed data
│   └── routes/
│       └── api.php              # Tất cả API routes
│
├── package.json                 # Frontend deps
├── vite.config.ts               # Proxy /api → http://127.0.0.1:8000
├── tailwind.config.js           # Dark mode class, CSS variables
├── tsconfig.json                # Path alias @/*
└── components.json              # shadcn/ui config
```

---

## Dev Commands

```bash
# Frontend
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # Build production (tsc + vite build)
npm run lint         # ESLint

# Backend (chạy từ /backend)
composer dev         # Laravel serve + queue + pail cùng lúc
php artisan serve    # Chỉ API server → http://localhost:8000
php artisan migrate  # Chạy migrations
composer test        # PHPUnit tests
```

---

## API Routes

Base URL: `/api` (Vite proxies → `http://127.0.0.1:8000/api`)

### Public
| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/register` | Đăng ký (tặng 50 gems) |
| POST | `/api/login` | Đăng nhập, trả về token |

### Protected (`auth:sanctum`)
| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/logout` | Đăng xuất, hủy token |
| GET | `/api/user` | Lấy thông tin user hiện tại |
| POST | `/api/images/generate` | Tạo ảnh AI (trừ gems) |
| GET | `/api/images` | Danh sách ảnh (phân trang: `page`, `per_page`) |
| DELETE | `/api/images/{id}` | Xóa ảnh |
| GET | `/api/projects` | Danh sách projects |
| POST | `/api/projects` | Tạo project mới |
| DELETE | `/api/projects/{id}` | Xóa project |
| GET | `/api/wallet` | Số gems + lịch sử giao dịch |
| POST | `/api/wallet/topup` | Nạp gems (test endpoint) |

---

## Authentication Flow

1. User đăng nhập → backend trả về `token` + `user` object
2. Token lưu vào `localStorage.auth_token`, user vào `localStorage.auth_user`
3. `AuthContext` cung cấp toàn app: `isLoggedIn`, `user`, `gems`, `login()`, `logout()`, `refreshUser()`
4. `src/lib/api.ts` tự động đính kèm `Authorization: Bearer <token>` vào mọi request
5. Response 401 → tự động logout và redirect về `/login`
6. `ProtectedRoute` / `PublicRoute` kiểm tra `isLoggedIn` để điều hướng

---

## Database Schema

| Table | Cột chính |
|-------|-----------|
| `users` | id, name, email, password, gems (int), avatar, timestamps |
| `images` | id, user_id, project_id, prompt, negative_prompt, model, style, aspect_ratio, file_path, file_url, seed, gems_cost, timestamps |
| `projects` | id, user_id, name, timestamps |
| `transactions` | id, user_id, type (topup\|spend), amount, balance_after, description, metadata (JSON), timestamps |

---

## Image Generation Pipeline

1. Frontend gửi `POST /api/images/generate` với: `prompt`, `model`, `style`, `aspect_ratio`, `seed`, `count`, `reference_images`
2. `ImageController` validate qua `GenerateImageRequest`
3. Kiểm tra gems đủ không
4. `OpenRouterService::generateImage()` gọi OpenRouter API
5. OpenRouter trả về base64 data URL
6. Service decode và upload lên MinIO (`images/YYYY/MM/DD/{uuid}.ext`)
7. `WalletService::deduct()` trừ gems (pessimistic lock để tránh race condition)
8. Tạo bản ghi `Image` trong DB
9. Trả về `file_url` + `gems_remaining`

---

## Environment Variables

### Backend (`backend/.env`)
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=zdream5
DB_USERNAME=root
DB_PASSWORD=

FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=          # MinIO key
AWS_SECRET_ACCESS_KEY=      # MinIO secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=bucket-dangtuandat
AWS_ENDPOINT=https://minio1.webtui.vn:9000
AWS_USE_PATH_STYLE_ENDPOINT=true

OPENROUTER_API_KEY=         # OpenRouter key
OPENROUTER_DEFAULT_MODEL=google/gemini-2.5-flash-image
```

### Frontend
- Không cần `.env` – Vite proxy tự map `/api` → backend

---

## Frontend Routes

| Path | Component | Auth |
|------|-----------|------|
| `/` | LandingPage | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/app/home` | Dashboard | Protected |
| `/app/generate` | GeneratePage | Protected |
| `/app/templates` | TemplatesPage | Protected |
| `/app/templates/:id` | TemplateDetailPage | Protected |
| `/app/library` | LibraryPage | Protected |
| `/app/topup` | TopUpPage | Protected |

---

## Key Files

| File | Mục đích |
|------|---------|
| `src/App.tsx` | Router config, định nghĩa tất cả routes |
| `src/contexts/AuthContext.tsx` | Global auth state, token management |
| `src/lib/api.ts` | HTTP client + tất cả typed API functions |
| `src/components/generate/GeneratePage.tsx` | Tính năng tạo ảnh chính |
| `src/components/dashboard/Dashboard.tsx` | Trang chủ app |
| `backend/routes/api.php` | Định nghĩa tất cả API endpoints |
| `backend/app/Services/OpenRouterService.php` | Tích hợp OpenRouter AI |
| `backend/app/Services/WalletService.php` | Quản lý gem transactions |
| `backend/app/Http/Controllers/ImageController.php` | Điều phối luồng tạo ảnh |

---

## Code Conventions

- **Import paths**: Dùng `@/` alias (e.g. `@/components/ui/button`, `@/lib/api`)
- **Components UI**: Ưu tiên dùng shadcn/ui từ `@/components/ui/` thay vì tự viết
- **Styling**: Tailwind CSS classes + `cn()` từ `@/lib/utils` để merge classes
- **API calls**: Dùng các hàm có sẵn trong `src/lib/api.ts` (`imageApi`, `authApi`, etc.)
- **Thông báo**: Dùng `toast()` từ Sonner (import `{ toast } from 'sonner'`)
- **Icons**: Lucide React (`import { IconName } from 'lucide-react'`)
- **Dark mode**: Tailwind class-based (`dark:` prefix), HTML root có `class="dark"`
- **Backend**: Tạo Form Request riêng cho validation, dùng Service class cho business logic
