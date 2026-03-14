# 🚀 HƯỚNG DẪN TRIỂN KHAI (DEPLOYMENT GUIDE) - ZDREAM.VN

Tài liệu này ghi lại chi tiết cấu trúc thư mục và quy trình cập nhật code cho dự án **ReactJS + Laravel** trên hosting cPanel hiện tại.

---

## 📂 1. CẤU TRÚC THƯ MỤC TRÊN HOSTING

Trên cPanel của bạn, mã nguồn được chia làm 2 khu vực quan trọng:

| Thư mục | Vai trò | Đường dẫn tuyệt đối |
| :--- | :--- | :--- |
| **Khu vực mã nguồn (Git)** | Nơi Git kéo code về (Chứa Vendor, Controller, Model) | `/home/zdream/repositories/zdream5` |
| **Khu vực phục vụ Web** | Nơi Apache đọc file để hiện lên trình duyệt | `/home/zdream/public_html` |

> [!IMPORTANT]
> Vì Host của bạn khoá thư mục gốc vào `public_html` và cấm dùng Symlink, chúng ta sử dụng chiến thuật **"Cầu nối index.php"**: File `public_html/index.php` sẽ được sửa code để móc ngược vào lõi Backend bên trong `repositories`.

---

## 🔄 2. QUY TRÌNH CẬP NHẬT CODE (WORKFLOW)

Mỗi khi bạn có code mới ở máy tính cá nhân (Local), hãy làm theo 2 bước sau:

### Bước A: Tại máy tính Local (Windows)
1. Build React: `npm run build`
2. Copy toàn bộ file trong `dist/` dán vào `backend/public/`
3. Git Push: `git add .` -> `git commit` -> `git push`

### Bước B: Tại Terminal cPanel (Hosting)
Copy và dán duy nhất cụm lệnh "Siêu cấp" này để tự động cập nhật mọi thứ:

```bash
# Vào thư mục repo -> Kéo code mới -> Copy file ra public_html -> Sửa index.php -> Xoá Cache
cd /home/zdream/repositories/zdream5 && git pull && cd /home/zdream && cp -r repositories/zdream5/backend/public/* public_html/ && cp repositories/zdream5/backend/public/.htaccess public_html/ && sed -i 's|__DIR__.\x27/../|__DIR__.\x27/../repositories/zdream5/backend/|g' public_html/index.php && cd repositories/zdream5/backend && php artisan optimize:clear && php artisan optimize && php artisan migrate --force
```

---

## 🛠️ 3. CẤU HÌNH QUAN TRỌNG (.ENV)

Các Key API và cấu hình Database được lưu tại: `/home/zdream/repositories/zdream5/backend/.env`.

**Các giá trị bắt buộc cho Production:**
- `APP_URL=https://zdream.vn`
- `DB_DATABASE=zdream_jssajjssww`
- `FILESYSTEM_DISK=s3` (Dùng MinIO để lưu ảnh)
- `OPENROUTER_API_KEY=...` (Key tạo ảnh AI)

---

## ⚠️ 4. CÁC LƯU Ý KỸ THUẬT
- **Migration**: Nếu có lỗi "Duplicate column", hãy kiểm tra xem có file Migration nào bị Git tải lại làm trùng tên hay không và xóa nó đi.
- **Storage**: Thư mục ảnh được link bằng lệnh `ln -s repositories/zdream5/backend/storage/app/public public_html/storage`.
- **.htaccess**: File này điều hướng toàn bộ `/api` về Laravel và các link còn lại về React `index.html`. Không được xoá dòng `RewriteEngine On`.

---
*Tài liệu được soạn bởi Antigravity AI - 2026*
