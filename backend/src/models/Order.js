const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: String,
  color: String,
  image: String
});

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String
});

const paymentInfoSchema = new mongoose.Schema({
  // For bank transfer
  bankName: String,
  accountNumber: String,
  accountHolder: String,
  transferContent: String,
  paymentDate: Date,
  
  // For e-wallet
  walletType: String, // momo, zalopay
  walletTransactionId: String,
  
  // For payment gateway
  gatewayOrderId: String,
  gatewayTransactionId: String,
  gatewayResponse: mongoose.Schema.Types.Mixed
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shipping: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'bank_transfer', 'momo', 'zalopay', 'vnpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentInfo: paymentInfoSchema,
  shippingAddress: addressSchema,
  email: String,
  phone: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  notes: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date
}, {
  timestamps: true
});

// Index for efficient queries (orderNumber has unique: true which creates index automatically)
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
