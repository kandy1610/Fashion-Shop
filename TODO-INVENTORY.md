# Quản lý tồn kho khi Add to Cart

## Information Gathered

- Backend cartController.js#addToCart: **NO stock check**
- Frontend useCart.ts: Calls API nhưng chỉ frontend disable (Wishlist/ProductDetail)
- Need: Backend reject + frontend toast "Hết hàng"

## Plan

1. **Backend cartController.js**: Add stock check in addToCart:
   ```
   const product = await Product.findById(productId);
   if (product.stock < quantity) return res.status(400).json({success:false, message: `Hết hàng! Chỉ còn ${product.stock}`});
   ```
2. **Frontend useCart.ts**: Consistent error handling
3. **Pages**: Wishlist.tsx, ProductDetail.tsx, Products.tsx → toast error on click

## Dependent Files

- backend/src/controllers/cartController.js (primary)
- frontend/src/hooks/useCart.ts
- frontend/src/pages/Wishlist.tsx (current visible)

## Followup

- Test: set product stock=0 → Add to cart → "Hết hàng"

Approve to proceed?
