# TODO: Thêm tính năng đổi mật khẩu tài khoản an toàn

## Các bước thực hiện:

1. ✅ [Hoàn thành] Tạo kế hoạch chỉnh sửa
2. ✅ Cập nhật backend/src/controllers/authController.js - Thêm logic đổi mật khẩu an toàn trong updateUserProfile
3. ✅ Cập nhật frontend/src/pages/Profile.tsx - Thêm form đổi mật khẩu (UI + logic + eye toggle hoàn chỉnh)
4. ⏳ Test toàn bộ flow: Đổi mật khẩu → đăng xuất → đăng nhập bằng mật khẩu mới
5. ⏳ Hoàn thành task

**Ghi chú:**

- Backend: verify currentPassword trước khi đổi newPassword
- Frontend: form riêng với current/new/confirm password + validation
