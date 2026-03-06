import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Printer } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCart, clearCart } = useCart();
  const printRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Vietnam',
    notes: '',
    paymentMethod: 'cod',
  });

  // Payment info state for bank transfer
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchCart();
  }, [user, navigate]);

  const fetchCart = async () => {
    try {
      // Fetch all products first
      let products: any[] = [];
      try {
        const productsRes = await axios.get('/products');
        if (productsRes.data.success && productsRes.data.data) {
          products = productsRes.data.data;
          console.log('Fetched products:', products.length);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }

      // Fetch cart data
      const cartData = await getCart();
      console.log('Cart data from API:', cartData);

      if (!cartData) {
        setCart([]);
        return;
      }

      // Handle different API response formats
      let items = [];
      if (Array.isArray(cartData)) {
        items = cartData;
      } else if (cartData.items && Array.isArray(cartData.items)) {
        items = cartData.items;
      } else if (cartData.data && Array.isArray(cartData.data)) {
        items = cartData.data;
      }

      console.log('Cart items:', items);

      if (!items || items.length === 0) {
        setCart([]);
        return;
      }

      // Enrich cart items with product details
      const enrichedItems = items
        .map((item: any) => {
          // Check if productId is already populated (object with details)
          let productInfo: any;
          if (item.productId && typeof item.productId === 'object' && item.productId.name) {
            productInfo = item.productId;
          } else if (products.length > 0) {
            productInfo = products.find((p: any) => p._id === (item.productId?._id || item.productId));
          }

          return {
            _id: item._id || '',
            productId: typeof item.productId === 'string' ? item.productId : item.productId?._id || '',
            name: productInfo?.name || item.name || 'Unknown Product',
            price: productInfo?.price || item.price || 0,
            images: productInfo?.images || item.images || [],
            quantity: item.quantity || 1,
            size: item.size || '',
            color: item.color || '',
          };
        })
        .filter((item: any) => item.productId && item._id); // Only keep valid items

      console.log('Enriched items:', enrichedItems);
      setCart(enrichedItems);
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-lg mb-4">Giỏ hàng của bạn trống</p>
          <Link to="/products" className="text-blue-600 hover:underline">Quay lại cửa hàng</Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotals = () => {
    const subtotal = (cart || []).reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal > 0 ? 30000 : 0;
    return {
      subtotal,
      shippingFee,
      total: subtotal + shippingFee
    };
  };

  const handlePrintInvoice = () => {
    const totals = calculateTotals();
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      const paymentMethods: any = {
        cod: 'Thanh toán khi nhận hàng (COD)',
        bank: 'Chuyển khoản ngân hàng',
        wallet: 'Ví điện tử'
      };

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Hóa đơn đơn hàng</title>
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
              .status { text-align: center; margin-bottom: 20px; padding: 10px; background: #fff3cd; border: 1px solid #ffecb5; border-radius: 4px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="invoice">
              <div class="header">
                <div class="logo">KANDY Fashion Store</div>
                <p style="margin: 10px 0 0 0;">Cửa hàng thời trang chuyên nghiệp</p>
              </div>

              <div class="status">
                <p><strong>⏳ ĐƠN HÀNG CHỜ XÁC NHẬN (Chưa hoàn tất)</strong></p>
              </div>

              <div style="margin-bottom: 20px; text-align: center;">
                <h2>HÓA ĐƠN PHIẾU ĐẶT HÀNG</h2>
                <p>Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}</p>
              </div>

              <div class="order-info">
                <div class="info-section">
                  <h3>Thông tin khách hàng</h3>
                  <p><strong>Tên:</strong> ${formData.firstName} ${formData.lastName}</p>
                  <p><strong>Email:</strong> ${formData.email}</p>
                  <p><strong>Điện thoại:</strong> ${formData.phone}</p>
                </div>
                <div class="info-section">
                  <h3>Địa chỉ giao hàng</h3>
                  <p>${formData.address}</p>
                  <p>${formData.city}, ${formData.state}</p>
                  <p>${formData.country} - ${formData.zipCode}</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style="width: 80px;">Số lượng</th>
                    <th style="width: 100px;">Đơn giá</th>
                    <th style="width: 100px;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${cart.map((item: any) => `
                    <tr>
                      <td>${item.name}${item.size ? ` (Size: ${item.size}${item.color ? ', Color: ' + item.color : ''})` : ''}</td>
                      <td>${item.quantity}</td>
                      <td>${item.price.toLocaleString('vi-VN')} VNĐ</td>
                      <td>${(item.quantity * item.price).toLocaleString('vi-VN')} VNĐ</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="totals">
                <div class="totals-row">
                  <span>Tạm tính:</span>
                  <span>${totals.subtotal.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div class="totals-row">
                  <span>Phí vận chuyển:</span>
                  <span>${totals.shippingFee.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div class="totals-row" style="font-size: 16px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px;">
                  <span>Tổng cộng:</span>
                  <span class="total-amount">${totals.total.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              <div class="info-section" style="clear: both; margin-top: 30px;">
                <h3>Phương thức thanh toán</h3>
                <p>${paymentMethods[formData.paymentMethod]}</p>
              </div>

              ${formData.notes ? `
                <div class="info-section" style="margin-top: 20px;">
                  <h3>Ghi chú đơn hàng</h3>
                  <p>${formData.notes}</p>
                </div>
              ` : ''}

              <div class="footer">
                <p>Cảm ơn bạn đã tin tưởng và mua sắm tại KANDY Fashion Store!</p>
                <p>Liên hệ: support@kandyfashion.com | Hotline: 1900 0000</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handlePlaceOrder = async () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }
      setError('');
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(3);
      return;
    }

    // Step 3 - Submit order
    if (currentStep === 3) {
      setSubmitLoading(true);
      setError('');
      try {
        const orderData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          notes: formData.notes,
          paymentMethod: formData.paymentMethod === 'bank' ? 'bank_transfer' : formData.paymentMethod,
          items: cart,
          totals: calculateTotals(),
        };

        const response = await axios.post('/orders', orderData);
        
        if (response.data.success) {
          await clearCart();
          window.dispatchEvent(new Event('cartUpdated'));
          
          // If bank transfer, show payment instructions
          if (formData.paymentMethod === 'bank' && response.data.data.paymentInstructions) {
            setPaymentInfo(response.data.data.paymentInstructions);
            // Navigate to a payment page or show modal
            navigate('/order-success', { 
              state: { 
                order: response.data.data,
                orderNumber: response.data.data.orderNumber,
                paymentInstructions: response.data.data.paymentInstructions,
                requiresPayment: true
              } 
            });
          } else {
            navigate('/order-success', { 
              state: { 
                order: response.data.data,
                orderNumber: response.data.data._id 
              } 
            });
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  if (!user || !cart || cart.length === 0) {
    return null;
  }

  const { subtotal, shippingFee, total } = calculateTotals();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

        {/* Steps */}
        <div className="flex justify-between mb-12">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex-1 flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'}`}>
                {step}
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <span className={`text-sm font-medium ${currentStep >= step ? 'text-blue-600' : 'text-gray-500'}`}>
                {step === 1 ? 'Thông tin' : step === 2 ? 'Vận chuyển' : 'Thanh toán'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-8">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Step 1 - Billing Details */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin giao hàng</h2>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
                        <input 
                          type="text" 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ *</label>
                        <input 
                          type="text" 
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Số nhà và tên đường"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố *</label>
                        <input 
                          type="text" 
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành</label>
                        <input 
                          type="text" 
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã bưu điện</label>
                        <input 
                          type="text" 
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tuỳ chọn)</label>
                      <textarea 
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Ghi chú về đơn hàng của bạn"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      ></textarea>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2 - Shipping */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Phương thức vận chuyển</h2>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
                      <label className="flex items-start">
                        <input type="radio" name="shipping" defaultChecked className="mt-1" />
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">Giao hàng nhanh (2-3 ngày)</p>
                          <p className="text-sm text-gray-500">30,000 VNĐ</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-4">Thông tin giao hàng</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-1">
                      <p><strong>Người nhận:</strong> {formData.firstName} {formData.lastName}</p>
                      <p><strong>Địa chỉ:</strong> {formData.address}, {formData.city}, {formData.state}</p>
                      <p><strong>Số điện thoại:</strong> {formData.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 - Payment */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>
                  
                  <div className="space-y-4">
                    <label className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors flex items-start">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-sm text-gray-500">Thanh toán trực tiếp cho người giao hàng</p>
                      </div>
                    </label>

                    <label className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors flex items-start">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="bank"
                        checked={formData.paymentMethod === 'bank'}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Chuyển khoản ngân hàng</p>
                        <p className="text-sm text-gray-500">Thực hiện chuyển khoản vào tài khoản của cửa hàng</p>
                      </div>
                    </label>

                    <label className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors flex items-start">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="wallet"
                        checked={formData.paymentMethod === 'wallet'}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Ví điện tử</p>
                        <p className="text-sm text-gray-500">Thanh toán bằng Momo hoặc ZaloPay</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart?.map((item: any) => (
                  <div key={item._id} className="flex gap-3 pb-4 border-b border-gray-100">
                    <img src={item.images?.[0]} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">{(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-900">{subtotal.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-gray-900">{shippingFee.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3">
                  <span className="text-gray-900">Tổng cộng</span>
                  <span className="text-blue-600">{total.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={submitLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors mt-6"
              >
                {submitLoading ? 'Đang xử lí...' : currentStep === 3 ? 'Hoàn tất đơn hàng' : 'Tiếp tục'}
              </button>

              <button 
                onClick={handlePrintInvoice}
                className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors mt-3 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                In hóa đơn
              </button>

              {currentStep > 1 && (
                <button 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-medium transition-colors mt-3"
                >
                  Quay lại
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
