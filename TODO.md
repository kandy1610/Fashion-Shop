# TODO - Admin Product Management

## Backend

- [x] 1. Đọc Product model để hiểu cấu trúc
- [x] 2. Thêm CRUD controllers (createProduct, updateProduct, deleteProduct)
- [x] 3. Cập nhật productRoutes.js với các route mới và middleware admin

## Frontend

- [x] 4. Tạo trang Admin Dashboard tại /admin
- [x] 5. Thêm form thêm/sửa sản phẩm
- [x] 6. Thêm route /admin trong App.tsx

## API Endpoints

- `GET /api/products/admin/all` - Lấy tất cả sản phẩm (admin)
- `POST /api/products` - Thêm sản phẩm (admin)
- `PUT /api/products/:id` - Sửa sản phẩm (admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (admin)

## Hướng dẫn sử dụng

1. Đăng nhập bằng tài khoản admin
2. Truy cập /admin để quản lý sản phẩm
