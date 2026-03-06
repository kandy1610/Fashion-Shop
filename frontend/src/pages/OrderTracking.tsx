import { Search, Receipt, Phone, Package, Truck, CheckCircle, CreditCard, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from '../utils/axios';

export default function OrderTracking() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    orderNumber: '',
    email: ''
  });
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchData.orderNumber) {
      setError('Vui lòng nhập mã đơn hàng');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await axios.get(`/orders/number/${searchData.orderNumber}`, {
        params: { email: searchData.email }
      });

      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
      cancelled: -1
    };
    return steps[status as keyof typeof steps] ?? 0;
  };

  const getPaymentStatusInfo = (paymentStatus: string) => {
    const statusMap: any = {
      pending: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700', icon: CreditCard },
      paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      failed: { label: 'Thất bại', color: 'bg-red-100 text-red-700', icon: XCircle },
      refunded: { label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-700', icon: Receipt }
    };
    return statusMap[paymentStatus] || statusMap.pending;
  };

  const statusLabels: any = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy'
  };

  const currentStep = order ? getStatusSteps(order.status) : 0;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Search Section */}
        <div className="flex flex-col items-center justify-center mb-16 text-center space-y-8">
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Theo dõi <span className="text-blue-600">đơn hàng</span>
            </h1>
            <p className="text-lg text-gray-600">
              Nhập mã đơn hàng và thông tin liên hệ để theo dõi trạng thái đơn hàng của bạn.
            </p>
          </div>
          <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <label className="flex flex-col w-full text-left">
                <span className="text-sm font-semibold text-gray-700 mb-2">Mã đơn hàng</span>
                <div className="relative">
                  <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="VD: KANDY-1234567890-001"
                    value={searchData.orderNumber}
                    onChange={(e) => setSearchData({ ...searchData, orderNumber: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                  />
                </div>
              </label>
              <label className="flex flex-col w-full text-left">
                <span className="text-sm font-semibold text-gray-700 mb-2">Email (tuỳ chọn)</span>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Email đặt hàng"
                    value={searchData.email}
                    onChange={(e) => setSearchData({ ...searchData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                  />
                </div>
              </label>
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-blue-600/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Tra cứu
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Tracking Result */}
        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Trạng thái đơn hàng</h2>
                  <p className="text-sm text-gray-500 mt-1">Mã đơn hàng: <span className="font-mono font-medium text-gray-700">{order.orderNumber}</span></p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {order.status === 'cancelled' ? <XCircle className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                  {statusLabels[order.status]}
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Thanh toán</h3>
                <div className="flex items-center gap-3">
                  {(() => {
                    const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
                    const Icon = paymentInfo.icon;
                    return (
                      <>
                        <div className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 ${paymentInfo.color}`}>
                          <Icon className="w-4 h-4" />
                          {paymentInfo.label}
                        </div>
                        {order.paymentMethod === 'bank_transfer' && order.paymentStatus !== 'paid' && (
                          <Link 
                            to="/order-success"
                            state={{ order, orderNumber: order.orderNumber }}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Xem thông tin thanh toán →
                          </Link>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Visual Steps */}
              {order.status !== 'cancelled' && (
                <div className="w-full py-6">
                  <div className="relative flex items-center justify-between w-full">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10" 
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    ></div>
                    
                    {[
                      { icon: Receipt, label: 'Đặt hàng', step: 0 },
                      { icon: Package, label: 'Xác nhận', step: 1 },
                      { icon: Truck, label: 'Đang giao', step: 2 },
                      { icon: CheckCircle, label: 'Hoàn thành', step: 3 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md ring-4 ring-gray-50 ${currentStep >= item.step ? 'bg-blue-600' : 'bg-gray-200'}`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <p className={`text-xs font-bold text-center hidden sm:block ${currentStep >= item.step ? 'text-blue-600' : 'text-gray-400'}`}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancelled Order Message */}
              {order.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 text-red-700">
                    <XCircle className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold">Đơn hàng đã bị hủy</h3>
                      <p className="text-sm mt-1">
                        {order.cancelledAt ? `Ngày hủy: ${new Date(order.cancelledAt).toLocaleDateString('vi-VN')}` : 'Đơn hàng này đã được hủy'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Timeline */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 text-gray-900">Chi tiết đơn hàng</h3>
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-2">
                  {order.createdAt && (
                    <div className="relative pl-8">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div>
                          <h4 className="text-base font-bold text-gray-900">Đơn hàng đã được tạo</h4>
                          <p className="text-sm text-gray-600 mt-1">Chờ xác nhận từ cửa hàng</p>
                        </div>
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                          {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  )}
                  {order.confirmedAt && (
                    <div className="relative pl-8">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div>
                          <h4 className="text-base font-bold text-gray-900">Đơn hàng đã được xác nhận</h4>
                          <p className="text-sm text-gray-600 mt-1">Cửa hàng đã tiếp nhận và đang chuẩn bị hàng</p>
                        </div>
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                          {new Date(order.confirmedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  )}
                  {order.shippedAt && (
                    <div className="relative pl-8">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div>
                          <h4 className="text-base font-bold text-gray-900">Đơn hàng đang được vận chuyển</h4>
                          <p className="text-sm text-gray-600 mt-1">Hàng đang trên đường đến với bạn</p>
                        </div>
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                          {new Date(order.shippedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="relative pl-8">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-600 border-4 border-white shadow-sm"></div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div>
                          <h4 className="text-base font-bold text-gray-900">Đơn hàng đã giao thành công</h4>
                          <p className="text-sm text-gray-600 mt-1">Cảm ơn bạn đã mua sắm!</p>
                        </div>
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                          {new Date(order.deliveredAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">Tóm tắt đơn hàng</h3>
                
                {/* Customer Info */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Người nhận</p>
                  <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress?.phone}</p>
                </div>
                
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Địa chỉ giao hàng</p>
                  <p className="text-sm text-gray-700">
                    {order.shippingAddress?.street}, {order.shippingAddress?.city}
                  </p>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 mb-4">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={item.image || item.images?.[0] || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{item.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                        </p>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">x{item.quantity}</span>
                          <span className="text-sm font-bold text-gray-900">{(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tạm tính</span>
                    <span className="font-medium text-gray-900">{order.subtotal?.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span className="font-medium text-gray-900">{order.shipping?.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Giảm giá</span>
                      <span className="font-medium text-green-600">-{order.discount?.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base pt-2 border-t border-dashed border-gray-200">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
                    <span className="font-bold text-xl text-blue-600">{order.total?.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>

                {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Dự kiến giao hàng:</strong> {new Date(order.estimatedDelivery).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Demo Order Info */}
        {!order && !loading && !error && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-8 max-w-lg mx-auto border border-gray-100 shadow-sm">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">Nhập mã đơn hàng để tra cứu</h3>
              <p className="text-gray-500 text-sm">
                Mã đơn hàng có dạng: <code className="bg-gray-100 px-2 py-1 rounded">KANDY-1234567890-001</code>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Bạn có thể tìm thấy mã đơn hàng trong email xác nhận hoặc trang chi tiết đơn hàng.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

