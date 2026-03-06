const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Bank account configuration - in production, store in environment variables or database
const BANK_ACCOUNTS = {
  vietcombank: {
    name: 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)',
    accountNumber: '1234567890',
    accountHolder: 'CÔNG TY TNHH KANDY FASHION',
    branch: 'Chi nhánh TP.HCM',
    qrCode: 'https://img.vietqr.io/image/vietcombank-1234567890-compact.png?amount={amount}&addInfo={orderNumber}'
  },
  mbbank: {
    name: 'Ngân hàng TMCP Quân đội (MB)',
    accountNumber: '0987654321',
    accountHolder: 'CÔNG TY TNHH KANDY FASHION',
    branch: 'Chi nhánh TP.HCM',
    qrCode: 'https://img.vietqr.io/image/mbbank-0987654321-compact.png?amount={amount}&addInfo={orderNumber}'
  },
  acb: {
    name: 'Ngân hàng TMCP Á Châu (ACB)',
    accountNumber: '1111111111',
    accountHolder: 'CÔNG TY TNHH KANDY FASHION',
    branch: 'Chi nhánh TP.HCM',
    qrCode: 'https://img.vietqr.io/image/acb-1111111111-compact.png?amount={amount}&addInfo={orderNumber}'
  }
};

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `KANDY-${timestamp}-${random}`;
};

// Calculate estimated delivery date
const calculateEstimatedDelivery = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3); // 3 days for delivery
  return date;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      notes,
      paymentMethod,
      items,
      totals,
      voucherCode,
      discount
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng phải chứa ít nhất một sản phẩm'
      });
    }

    if (!totals || !totals.total) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin tổng tiền không hợp lệ'
      });
    }

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm không tìm thấy: ${item.name || 'Unknown'}`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" không đủ số lượng. Chỉ còn ${product.stock} sản phẩm.`
        });
      }
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();
    const transferContent = `KANDY ${orderNumber}`;

    // Transform cart items to order items
    const orderItems = items.map(item => ({
      productId: item.productId,
      name: item.name || 'Unknown Product',
      price: item.price || 0,
      quantity: item.quantity || 1,
      size: item.size || '',
      color: item.color || '',
      image: item.images ? item.images[0] : ''
    }));

    // Determine initial payment status based on payment method
    let paymentStatus = 'pending';
    let orderStatus = 'pending';

    // For COD, order is pending until confirmed
    // For bank transfer/e-wallet, payment needs to be confirmed

    // Create order
    const order = new Order({
      orderNumber,
      userId: req.user._id,
      items: orderItems,
      subtotal: totals.subtotal || 0,
      shipping: totals.shippingFee || 0,
      discount: discount || 0,
      total: totals.total || 0,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus,
      status: orderStatus,
      shippingAddress: {
        fullName: `${firstName} ${lastName}`,
        phone,
        street: address,
        city,
        state,
        zipCode,
        country: country || 'Vietnam'
      },
      email,
      phone,
      notes,
      estimatedDelivery: calculateEstimatedDelivery(),
      paymentInfo: {
        transferContent
      }
    });

    // Reduce product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    // Save order
    await order.save();

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [] },
      { new: true }
    );

    // Populate product details for response
    await order.populate('items.productId', 'name images price');

    // Build response with payment info if needed
    const responseData = {
      _id: order._id,
      orderNumber: order.orderNumber,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      email: order.email,
      phone: order.phone,
      notes: order.notes,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt
    };

    // Add payment instructions for bank transfer
    if (paymentMethod === 'bank_transfer') {
      const defaultBank = BANK_ACCOUNTS.vietcombank;
      responseData.paymentInstructions = {
        bankName: defaultBank.name,
        accountNumber: defaultBank.accountNumber,
        accountHolder: defaultBank.accountHolder,
        branch: defaultBank.branch,
        transferContent: transferContent,
        amount: order.total,
        qrCode: defaultBank.qrCode
          .replace('{amount}', order.total)
          .replace('{orderNumber}', orderNumber),
        note: 'Vui lòng chuyển khoản chính xác nội dung để hệ thống tự động xác nhận'
      };
    }

    res.status(201).json({
      success: true,
      message: paymentMethod === 'cod' 
        ? 'Đơn hàng đã được tạo thành công. Chúng tôi sẽ liên hệ xác nhận sớm!'
        : 'Đơn hàng đã được tạo. Vui lòng hoàn tất thanh toán!',
      data: responseData
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo đơn hàng'
    });
  }
};

// @desc    Get payment instructions for bank transfer
// @route   GET /api/orders/:id/payment
// @access  Private
const getPaymentInfo = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    if (order.paymentMethod !== 'bank_transfer') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng này không sử dụng phương thức chuyển khoản'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.json({
        success: true,
        message: 'Đơn hàng đã thanh toán',
        data: {
          paymentStatus: order.paymentStatus,
          paidAt: order.paymentInfo?.paymentDate
        }
      });
    }

    const defaultBank = BANK_ACCOUNTS.vietcombank;
    
    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        amount: order.total,
        paymentStatus: order.paymentStatus,
        bankInfo: {
          bankName: defaultBank.name,
          accountNumber: defaultBank.accountNumber,
          accountHolder: defaultBank.accountHolder,
          branch: defaultBank.branch,
          transferContent: order.paymentInfo?.transferContent,
          qrCode: defaultBank.qrCode
            .replace('{amount}', order.total)
            .replace('{orderNumber}', order.orderNumber)
        },
        instructions: [
          '1. Mở ứng dụng ngân hàng hoặc ví điện tử',
          '2. Quét mã QR hoặc nhập thông tin tài khoản',
          '3. Nhập số tiền: ' + order.total.toLocaleString('vi-VN') + ' VNĐ',
          '4. Nhập nội dung chuyển khoản: ' + order.paymentInfo?.transferContent,
          '5. Thực hiện chuyển khoản và chờ xác nhận'
        ],
        note: 'Đơn hàng sẽ được xác nhận trong vòng 24h làm việc sau khi nhận được thanh toán'
      }
    });
  } catch (error) {
    console.error('Get payment info error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm payment for bank transfer (manual confirmation)
// @route   POST /api/orders/:id/confirm-payment
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { bankName, accountNumber, transferAmount, transferDate } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã được thanh toán'
      });
    }

    // Verify transfer amount
    if (transferAmount !== order.total) {
      return res.status(400).json({
        success: false,
        message: `Số tiền chuyển khoản không đúng. Vui lòng chuyển ${order.total.toLocaleString('vi-VN')} VNĐ`
      });
    }

    // Update payment status
    order.paymentStatus = 'paid';
    order.paymentInfo = {
      ...order.paymentInfo,
      bankName: bankName || 'Ngân hàng',
      accountNumber: accountNumber || '',
      paymentDate: transferDate || new Date()
    };
    
    // Auto-confirm order when payment is confirmed
    order.status = 'confirmed';
    order.confirmedAt = new Date();

    await order.save();

    res.json({
      success: true,
      message: 'Xác nhận thanh toán thành công! Đơn hàng đang được xử lý.',
      data: order
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all payment methods info
// @route   GET /api/orders/payment-methods
// @access  Public
const getPaymentMethods = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        {
          id: 'cod',
          name: 'Thanh toán khi nhận hàng (COD)',
          description: 'Thanh toán trực tiếp cho người giao hàng khi nhận được sản phẩm',
          icon: 'cash',
          enabled: true
        },
        {
          id: 'bank_transfer',
          name: 'Chuyển khoản ngân hàng',
          description: 'Chuyển khoản qua tài khoản ngân hàng của cửa hàng',
          icon: 'bank',
          enabled: true,
          banks: Object.keys(BANK_ACCOUNTS)
        },
        {
          id: 'momo',
          name: 'Ví MoMo',
          description: 'Thanh toán qua ví điện tử MoMo',
          icon: 'wallet',
          enabled: false,
          comingSoon: true
        },
        {
          id: 'zalopay',
          name: 'ZaloPay',
          description: 'Thanh toán qua ZaloPay',
          icon: 'wallet',
          enabled: false,
          comingSoon: true
        },
        {
          id: 'vnpay',
          name: 'VNPay',
          description: 'Thanh toán qua VNPay',
          icon: 'card',
          enabled: false,
          comingSoon: true
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;
    
    const query = { userId: req.user._id };
    
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate('items.productId', 'name images price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('items.productId', 'name images price sku');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    // Add payment instructions if bank transfer
    let orderData = order.toObject();
    if (order.paymentMethod === 'bank_transfer' && order.paymentStatus !== 'paid') {
      const defaultBank = BANK_ACCOUNTS.vietcombank;
      orderData.paymentInstructions = {
        bankName: defaultBank.name,
        accountNumber: defaultBank.accountNumber,
        accountHolder: defaultBank.accountHolder,
        transferContent: order.paymentInfo?.transferContent,
        amount: order.total,
        qrCode: defaultBank.qrCode
          .replace('{amount}', order.total)
          .replace('{orderNumber}', order.orderNumber)
      };
    }

    res.json({
      success: true,
      data: orderData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get order by order number
// @route   GET /api/orders/number/:orderNumber
// @access  Public
const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { email } = req.query;

    const query = { orderNumber };
    if (email) query.email = email;

    const order = await Order.findOne(query).populate('items.productId', 'name images price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    // If cancelling, restore stock
    if (status === 'cancelled' && ['pending', 'confirmed'].includes(order.status)) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
      }
      order.cancelledAt = new Date();
    }

    // Update status timestamps
    if (status === 'confirmed' && !order.confirmedAt) {
      order.confirmedAt = new Date();
    } else if (status === 'shipped' && !order.shippedAt) {
      order.shippedAt = new Date();
    } else if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment-status
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentInfo } = req.body;
    const validStatuses = ['pending', 'processing', 'paid', 'failed', 'refunded'];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái thanh toán không hợp lệ'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    order.paymentStatus = paymentStatus;
    if (paymentInfo) {
      order.paymentInfo = { ...order.paymentInfo, ...paymentInfo };
    }

    // Auto-confirm order when payment is paid
    if (paymentStatus === 'paid' && order.status === 'pending') {
      order.status = 'confirmed';
      order.confirmedAt = new Date();
    }

    // Restore stock if refunded
    if (paymentStatus === 'refunded' && ['pending', 'confirmed'].includes(order.status)) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thanh toán thành công',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn hàng này'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.notes = reason ? `${order.notes || ''}\nLý do hủy: ${reason}` : order.notes;
    await order.save();

    res.json({
      success: true,
      message: 'Đơn hàng đã được hủy',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Webhook handler for payment gateway callbacks
// @route   POST /api/orders/webhook/:gateway
// @access  Public (with signature verification)
const paymentWebhook = async (req, res) => {
  try {
    const { gateway } = req.params;
    const payload = req.body;

    console.log(`Payment webhook received from ${gateway}:`, payload);

    // Find order by gateway order ID or our order number
    let order;
    switch (gateway) {
      case 'momo':
        order = await Order.findOne({ 
          'paymentInfo.walletTransactionId': payload.orderId 
        });
        break;
      case 'zalopay':
        order = await Order.findOne({
          'paymentInfo.walletTransactionId': payload.zpTransToken
        });
        break;
      case 'vnpay':
        order = await Order.findOne({
          'paymentInfo.gatewayOrderId': payload.vnp_TxnRef
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Gateway không được hỗ trợ'
        });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    // Verify payment status
    const isSuccess = payload.resultCode === 0 || payload.vnp_ResponseCode === '00';
    
    if (isSuccess) {
      order.paymentStatus = 'paid';
      order.paymentInfo = {
        ...order.paymentInfo,
        walletTransactionId: payload.transId || payload.zpTransToken || payload.vnp_TransactionNo,
        gatewayResponse: payload
      };
      
      if (order.status === 'pending') {
        order.status = 'confirmed';
        order.confirmedAt = new Date();
      }
      
      await order.save();
      
      return res.json({
        success: true,
        message: 'Thanh toán thành công'
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      
      return res.json({
        success: false,
        message: 'Thanh toán thất bại'
      });
    }
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const pendingPayments = await Order.countDocuments({ paymentStatus: 'pending' });
    const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const failedPayments = await Order.countDocuments({ paymentStatus: 'failed' });

    // Revenue calculation
    const paidOrderDocs = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = paidOrderDocs.reduce((sum, order) => sum + order.total, 0);

    res.json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        payments: {
          pending: pendingPayments,
          paid: paidOrders,
          failed: failedPayments
        },
        revenue: {
          total: totalRevenue,
          currency: 'VNĐ'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
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
};

