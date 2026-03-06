import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import axios from '../utils/axios';

interface CartItem {
  _id: string;
  productId: string;
  name?: string;
  price?: number;
  image?: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartProduct extends CartItem {
  name: string;
  price: number;
  images: string[];
}

const SHIPPING_COST = 50000;

export default function Cart() {
  const { getCart, removeFromCart, updateCartItem } = useCart();
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all products first
      let products: any[] = [];
      try {
        const productsRes = await axios.get('/products');
        if (productsRes.data.success && productsRes.data.data) {
          products = productsRes.data.data;
          setAllProducts(products);
          console.log('Fetched products:', products.length);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }

      // Fetch cart data
      const cart = await getCart();
      console.log('Cart data from API:', cart);

      if (!cart) {
        setCartItems([]);
        return;
      }

      // Handle different API response formats
      let items = [];
      if (Array.isArray(cart)) {
        items = cart;
      } else if (cart.items && Array.isArray(cart.items)) {
        items = cart.items;
      } else if (cart.data && Array.isArray(cart.data)) {
        items = cart.data;
      }

      console.log('Cart items:', items);

      if (!items || items.length === 0) {
        setCartItems([]);
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
            images: productInfo?.images || item.images || ['https://via.placeholder.com/80'],
            quantity: item.quantity || 1,
            size: item.size || '',
            color: item.color || '',
          };
        })
        .filter((item: any) => item.productId && item._id); // Only keep valid items

      console.log('Enriched items:', enrichedItems);
      setCartItems(enrichedItems);
    } catch (err: any) {
      console.error('Cart fetch error:', err);
      setError(err.response?.data?.message || 'Không thể tải giỏ hàng');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId);
      setCartItems(cartItems.filter(item => item._id !== cartItemId));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingId(cartItemId);
      await updateCartItem(cartItemId, newQuantity);
      setCartItems(cartItems.map(item =>
        item._id === cartItemId ? { ...item, quantity: newQuantity } : item
      ));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Failed to update quantity', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = cartItems.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 flex items-center justify-center">
        <div className="text-gray-600">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của tôi</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-600 mb-4">Giỏ hàng của bạn trống</p>
            <Link to="/products" className="inline-block px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="hidden sm:grid sm:grid-cols-6 gap-4 p-6 border-b border-gray-100 text-sm font-medium text-gray-500">
                  <div className="sm:col-span-3">Sản phẩm</div>
                  <div className="text-center">Giá</div>
                  <div className="text-center">Số lượng</div>
                  <div className="text-right">Tổng cộng</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item._id} className="p-6 flex flex-col sm:grid sm:grid-cols-6 gap-4 items-center">
                      <div className="sm:col-span-3 flex items-center w-full">
                        <button 
                          onClick={() => handleRemove(item._id)}
                          className="text-gray-400 hover:text-red-500 mr-4 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <img 
                          src={item.images?.[0] || 'https://via.placeholder.com/80'} 
                          alt={item.name} 
                          className="w-20 h-24 object-cover rounded-md mr-4"
                        />
                        <div>
                          <Link to={`/product/${item.productId}`} className="font-medium text-gray-900 hover:text-blue-600 block mb-1">
                            {item.name}
                          </Link>
                          {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                          {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                        </div>
                      </div>
                      
                      <div className="text-gray-900 font-medium sm:text-center w-full sm:w-auto flex justify-between sm:block">
                        <span className="sm:hidden text-gray-500">Giá:</span>
                        {item.price.toLocaleString('vi-VN')} VNĐ
                      </div>
                      
                      <div className="flex justify-center w-full sm:w-auto">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button 
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={updatingId === item._id}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={updatingId === item._id}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-gray-900 font-medium text-right w-full sm:w-auto flex justify-between sm:block">
                        <span className="sm:hidden text-gray-500">Tổng:</span>
                        {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-gray-50 flex justify-between items-center border-t border-gray-100 flex-col sm:flex-row gap-4">
                  <div className="flex space-x-4 w-full sm:w-auto">
                    <input 
                      type="text" 
                      placeholder="Mã giảm giá" 
                      className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 sm:flex-none"
                    />
                    <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                      Áp dụng
                    </button>
                  </div>
                  <button 
                    onClick={fetchCartData}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Làm mới
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Totals */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Tổng tiền</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Cộng tiền hàng</span>
                    <span className="font-medium text-gray-900">{subtotal.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Giao hàng</span>
                    <span className="font-medium text-gray-900">{shipping.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-lg font-bold text-gray-900">{total.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>

                <Link 
                  to="/checkout" 
                  className="w-full bg-gray-900 text-white flex items-center justify-center py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
                >
                  Tiếp tục thanh toán
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
