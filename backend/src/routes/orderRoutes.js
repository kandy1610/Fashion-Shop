const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createOrder,
  getPaymentInfo,
  confirmPayment,
  getPaymentMethods,
  getOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  paymentWebhook,
  getOrderStats
} = require('../controllers/orderController');

// Public routes
router.get('/payment-methods', getPaymentMethods);
router.get('/number/:orderNumber', getOrderByNumber);

// Webhook routes (public - with gateway signature verification)
router.post('/webhook/momo', paymentWebhook.bind(null, 'momo'));
router.post('/webhook/zalopay', paymentWebhook.bind(null, 'zalopay'));
router.post('/webhook/vnpay', paymentWebhook.bind(null, 'vnpay'));

// Protected routes - require authentication
router.use(protect);

// Order management
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.get('/:id/payment', getPaymentInfo);
router.post('/:id/confirm-payment', confirmPayment);

// Cancel order (user)
router.delete('/:id', cancelOrder);

// Admin routes
router.put('/:id/status', admin, updateOrderStatus);
router.put('/:id/payment-status', admin, updatePaymentStatus);

// Admin statistics
router.get('/admin/stats', admin, getOrderStats);

module.exports = router;
