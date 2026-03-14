# 🚀 HƯỚNG DẪN TRIỂN KHAI (DEPLOYMENT GUIDE) - ZDREAM.VN

Tài liệu này ghi lại chi tiết cấu trúc thư mục và quy trình cập nhật code chuẩn 100% cho dự án **ReactJS + Laravel** trên hosting cPanel.

---

## 📂 1. CẤU TRÚC THƯ MỤC TRÊN HOSTING

| Thư mục | Vai trò | Đường dẫn tuyệt đối |
| :--- | :--- | :--- |
| **Khu vực mã nguồn (Git)** | Nơi chứa Core Laravel (Vendor, Controller, .env) | `/home/zdream/repositories/zdream5` |
| **Khu vực phục vụ Web** | Nơi Apache đọc file hiện lên trình duyệt | `/home/zdream/public_html` |

> [!IMPORTANT]
> Vì Host của bạn khoá thư mục gốc vào `public_html`, chúng ta dùng chiến thuật **"Cầu nối"**: File `public_html/index.php` được sửa code để móc ngược vào lõi Backend bên trong `repositories`.

---

## 🔄 2. QUY TRÌNH CẬP NHẬT CODE (WORKFLOW)

### Bước A: Tại máy tính Local (Windows)
1. Build React: `npm run build`
2. Copy toàn bộ file trong `dist/` (gồm thư mục `assets` và file `index.html`) dán vào `backend/public/`.
3. Git Push: `git add .` -> `git commit -m "build deploy"` -> `git push`.

### Bước B: Tại Terminal cPanel (Hosting)
Copy và dán cụm lệnh này để tự động cập nhật mọi thứ (Sửa lỗi 404, xoá Cache, Pull code):

```bash
# 1. Vào repo, bỏ qua thay đổi file .htaccess cũ và kéo code mới
cd /home/zdream/repositories/zdream5 && git checkout . && git pull

# 2. Xóa các file cũ trong public_html và đồng bộ file mới từ public của Laravel
cd /home/zdream && rm -rf public_html/* && cp -r repositories/zdream5/backend/public/* public_html/ && cp repositories/zdream5/backend/public/.htaccess public_html/

# 3. Sửa file index.php để kết nối đúng với Vendor và Bootstrap
sed -i 's|__DIR__.\x27/../|__DIR__.\x27/../repositories/zdream5/backend/|g' public_html/index.php

# 4. Tạo đường dẫn ảnh (Storage Link)
rm -rf public_html/storage && ln -s /home/zdream/repositories/zdream5/backend/storage/app/public public_html/storage

# 5. Xoá Cache Laravel
cd repositories/zdream5/backend && php artisan optimize:clear && php artisan optimize && php artisan migrate --force
```

---

## 🛰️ 3. CƠ CHẾ ĐIỀU HƯỚNG MƯỢT MÀ (UI/UX)

Để đảm bảo người dùng luôn thấy giao diện **React** thay vì trang mặc định của **Laravel**, hệ thống đã được cài đặt 2 lớp bảo vệ:

1. **Lớp 1 (.htaccess)**: Thêm dòng `DirectoryIndex index.html index.php` để ưu tiên file HTML.
2. **Lớp 2 (Laravel Route)**: Trong file `backend/routes/web.php`, route `/` đã được sửa để trả về nội dung của file `index.html`.

---

## 🛠️ 4. CẤU HÌNH QUAN TRỌNG (.ENV)
File lưu tại: `/home/zdream/repositories/zdream5/backend/.env`.

**Các giá trị bắt buộc:**
- `APP_URL=https://zdream.vn`
- `FILESYSTEM_DISK=s3` (Lưu ảnh lên MinIO)
- `OPENROUTER_API_KEY=...` (Key tạo ảnh AI)

---
*Tài liệu được soạn bởi Antigravity AI - 2026*
