import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, User, MapPin, CreditCard, Clock, ArrowRight, Truck, Receipt, Printer, Copy, Check } from 'lucide-react';
import { useRef, useState } from 'react';
import axios from '../utils/axios';

export default function OrderSuccess() {
  const location = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  
  const order = location.state?.order || {};
  const paymentInstructions = location.state?.paymentInstructions;
  const requiresPayment = location.state?.requiresPayment;
  const orderNumber = order.orderNumber || order._id || location.state?.orderNumber || '#ORDER12345';

  // Sample order data if not provided
  const displayOrder = {
    _id: orderNumber,
    firstName: order.firstName || order.shippingAddress?.fullName?.split(' ')[0] || 'Khách hàng',
    lastName: order.lastName || order.shippingAddress?.fullName?.split(' ').slice(1).join(' ') || '',
    email: order.email || 'customer@example.com',
    phone: order.phone || order.shippingAddress?.phone || '+84 123 456 789',
    address: order.address || order.shippingAddress?.street || '123 Đường Thời Trang',
    city: order.city || order.shippingAddress?.city || 'Hà Nội',
    state: order.state || order.shippingAddress?.state || 'Hà Nội',
    country: order.country || order.shippingAddress?.country || 'Việt Nam',
    notes: order.notes || '',
    paymentMethod: order.paymentMethod || 'cod',
    items: order.items || [
      { name: 'Áo Khoác Denim', size: 'L', quantity: 1, price: 890000, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=100' },
      { name: 'Áo Phông Trắng', size: 'M', quantity: 2, price: 299500, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=100' }
    ],
    totals: order.totals || {
      subtotal: order.subtotal || 0,
      shippingFee: order.shipping || 0,
      total: order.total || 0
    },
    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow && printRef.current) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Hóa đơn đơn hàng - ${displayOrder._id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .invoice { max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; }
              .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .info-section { border: 1px solid #ddd; padding: 15px; }
              .info-section h3 { margin: 0 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
              .info-section p { margin: 5px 0; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              tr:hover { background-color: #f9f9f9; }
              .totals { float: right; width: 300px; }
              .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
              .total-amount { font-size: 18px; font-weight: bold; color: #0066cc; }
              .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${printRef.current?.innerHTML || ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const paymentMethodLabel = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank: 'Chuyển khoản ngân hàng',
    bank_transfer: 'Chuyển khoản ngân hàng',
    wallet: 'Ví điện tử',
    momo: 'Ví MoMo',
    zalopay: 'ZaloPay',
    vnpay: 'VNPay'
  } as any;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const transferAmount = paymentInstructions?.amount || displayOrder.totals?.total;
      await axios.post(`/orders/${order._id}/confirm-payment`, {
        transferAmount,
        transferDate: new Date().toISOString()
      });
      alert('Xác nhận thanh toán thành công! Cảm ơn bạn.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Hidden Print Section */}
        <div ref={printRef} style={{ display: 'none' }}>
          <div className="invoice">
            <div className="header">
              <div className="logo">KANDY Fashion Store</div>
              <p style={{ margin: '10px 0 0 0' }}>Cửa hàng thời trang chuyên nghiệp</p>
            </div>

            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <h2>HÓA ĐƠN ĐƠN HÀNG</h2>
              <p>Mã đơn hàng: <strong>{displayOrder._id}</strong></p>
              <p>Ngày đặt hàng: {displayOrder.createdAt}</p>
            </div>

            <div className="order-info">
              <div className="info-section">
                <h3>Thông tin khách hàng</h3>
                <p><strong>Tên:</strong> {displayOrder.firstName} {displayOrder.lastName}</p>
                <p><strong>Email:</strong> {displayOrder.email}</p>
                <p><strong>Điện thoại:</strong> {displayOrder.phone}</p>
              </div>
              <div className="info-section">
                <h3>Địa chỉ giao hàng</h3>
                <p>{displayOrder.address}</p>
                <p>{displayOrder.city}, {displayOrder.state}</p>
                <p>{displayOrder.country}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th style={{ width: '80px' }}>Số lượng</th>
                  <th style={{ width: '100px' }}>Đơn giá</th>
                  <th style={{ width: '100px' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${displayOrder.items.map((item: any) => `
                  <tr>
                    <td>${item.name}${item.size ? ` (Size: ${item.size})` : ''}</td>
                    <td>${item.quantity}</td>
                    <td>${(item.price || 0).toLocaleString('vi-VN')} VNĐ</td>
                    <td>${((item.quantity || 0) * (item.price || 0)).toLocaleString('vi-VN')} VNĐ</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div className="totals">
              <div className="totals-row">
                <span>Tạm tính:</span>
                <span>${displayOrder.totals.subtotal.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="totals-row">
                <span>Phí vận chuyển:</span>
                <span>${displayOrder.totals.shippingFee.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="totals-row" style={{ fontSize: '16px', fontWeight: 'bold', borderTop: '2px solid #333', paddingTop: '10px', marginTop: '10px' }}>
                <span>Tổng cộng:</span>
                <span className="total-amount">${displayOrder.totals.total.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            <div className="info-section" style={{ clear: 'both', marginTop: '30px' }}>
              <h3>Phương thức thanh toán</h3>
              <p>${paymentMethodLabel[displayOrder.paymentMethod]}</p>
            </div>

            <div className="footer">
              <p>Cảm ơn bạn đã tin tưởng và mua sắm tại KANDY Fashion Store!</p>
              <p>Liên hệ: support@kandyfashion.com | Hotline: 1900 0000</p>
            </div>
          </div>
        </div>

        {/* Main Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          {/* Left Side - Success Message */}
          <div className="md:w-5/12 bg-green-50 p-8 md:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Đơn hàng thành công!</h1>
            <p className="text-gray-600 mb-8">
              Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được tiếp nhận và đang được xử lí.
            </p>
            
            <div className="bg-white w-full rounded-xl p-4 mb-8 border border-green-100">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Mã đơn hàng</p>
              <p className="text-xl font-bold text-green-600">{displayOrder._id}</p>
            </div>

            <div className="space-y-3 w-full">
              <Link to="/order-tracking" className="w-full flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors shadow-sm">
                <Truck className="w-5 h-5 mr-2" />
                Theo dõi đơn hàng
              </Link>
              <button 
                onClick={handlePrint}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                <Printer className="w-5 h-5 mr-2" />
                In hóa đơn
              </button>
              <Link to="/products" className="w-full flex items-center justify-center px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors">
                Tiếp tục mua sắm
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* Right Side - Order Details */}
          <div className="md:w-7/12 p-8 md:p-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Receipt className="w-6 h-6 mr-2 text-green-500" />
              Chi tiết đơn hàng
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <div className="flex items-center text-green-600 mb-2">
                  <User className="w-4 h-4 mr-2" />
                  <h3 className="font-medium">Người nhận</h3>
                </div>
                <p className="font-medium text-gray-900">{displayOrder.firstName} {displayOrder.lastName}</p>
                <p className="text-sm text-gray-500">{displayOrder.email}</p>
                <p className="text-sm text-gray-500">{displayOrder.phone}</p>
              </div>
              <div>
                <div className="flex items-center text-green-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <h3 className="font-medium">Địa chỉ giao hàng</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {displayOrder.address}<br />
                  {displayOrder.city}, {displayOrder.state}<br />
                  {displayOrder.country}
                </p>
              </div>
              <div>
                <div className="flex items-center text-green-600 mb-2">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <h3 className="font-medium">Phương thức thanh toán</h3>
                </div>
                <p className="text-sm text-gray-600">{paymentMethodLabel[displayOrder.paymentMethod]}</p>
              </div>
              <div>
                <div className="flex items-center text-green-600 mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <h3 className="font-medium">Dự kiến giao hàng</h3>
                </div>
                <p className="text-sm text-gray-600">2 - 3 ngày làm việc</p>
                <p className="text-xs text-gray-400">{displayOrder.createdAt}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-4">
              {displayOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4">
                  <img src={item.image || item.images?.[0]} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.size ? `Size: ${item.size} | ` : ''}Số lượng: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">{(item.quantity * item.price).toLocaleString('vi-VN')} VNĐ</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-6 pt-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span className="font-medium">{displayOrder.totals.subtotal.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium">{displayOrder.totals.shippingFee.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-gray-600">Tổng cộng</span>
                <span className="text-2xl font-bold text-green-600">{displayOrder.totals.total.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            {displayOrder.notes && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm"><strong>Ghi chú:</strong> {displayOrder.notes}</p>
              </div>
            )}

            {/* Payment Instructions for Bank Transfer */}
            {requiresPayment && paymentInstructions && (
              <div className="mt-6 p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <div className="flex items-center mb-4">
                  <CreditCard className="w-6 h-6 text-yellow-600 mr-2" />
                  <h3 className="text-lg font-bold text-yellow-800">Thanh toán chuyển khoản</h3>
                </div>
                
                <p className="text-sm text-yellow-700 mb-4">
                  Vui lòng chuyển khoản đúng số tiền và nội dung bên dưới để đơn hàng được xác nhận nhanh chóng.
                </p>

                <div className="bg-white rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-medium text-gray-900">{paymentInstructions.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Số tài khoản:</span>
                    <div className="flex items-center">
                      <span className="font-mono font-bold text-lg text-blue-600">{paymentInstructions.accountNumber}</span>
                      <button 
                        onClick={() => copyToClipboard(paymentInstructions.accountNumber)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chủ tài khoản:</span>
                    <span className="font-medium text-gray-900">{paymentInstructions.accountHolder}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nội dung CK:</span>
                    <div className="flex items-center">
                      <span className="font-mono font-bold text-green-600">{paymentInstructions.transferContent}</span>
                      <button 
                        onClick={() => copyToClipboard(paymentInstructions.transferContent)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="text-gray-600 font-medium">Số tiền:</span>
                    <span className="font-bold text-xl text-red-600">{paymentInstructions.amount?.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>

                {paymentInstructions.qrCode && (
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-2">Quét mã QR để thanh toán</p>
                    <img src={paymentInstructions.qrCode} alt="QR Code" className="w-48 h-48 mx-auto rounded-lg" />
                  </div>
                )}

                <div className="bg-yellow-100 rounded-lg p-3 text-sm text-yellow-800">
                  <p className="font-medium">Lưu ý:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Vui lòng chuyển khoản chính xác số tiền và nội dung</li>
                    <li>Đơn hàng sẽ được xác nhận trong 24h làm việc</li>
                    <li>Kiểm tra email để xác nhận thanh toán</li>
                  </ul>
                </div>

                <button 
                  onClick={handleConfirmPayment}
                  className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Tôi đã chuyển khoản
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
