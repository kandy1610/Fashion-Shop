import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { User, MapPin, CreditCard, Heart, LogOut, Camera, Search, RefreshCw, CheckCircle, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import axios from '../utils/axios';
import type { Address, PaymentMethod } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, fetchProfile, loading } = useAuth();
  const { getWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);
  const [searchParams] = useSearchParams();
  const validTabs = ['profile', 'orders', 'wishlist', 'address', 'payment'];
  const tabFromUrl = (() => {
    const t = searchParams.get('tab') || 'profile';
    return validTabs.includes(t) ? t : 'profile';
  })();
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Orders tab
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('');
  const [orderSearch, setOrderSearch] = useState('');

  // Wishlist tab
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Address tab - use user.addresses (fetch profile when tab active)
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<Partial<Address> & { _editIndex?: number }>({});
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Payment tab
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cardForm, setCardForm] = useState<Partial<PaymentMethod> & { _editIndex?: number }>({});
  const [showCardForm, setShowCardForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // initialize form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setGender(user.gender || '');
      setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
      setPreviewUrl(user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [avatarFile]);

  // Fetch orders when Orders tab is active
  useEffect(() => {
    if (activeTab !== 'orders') return;
    let cancelled = false;
    setOrdersLoading(true);
    const params: any = { limit: 20 };
    if (orderFilter) params.status = orderFilter;
    axios.get('/orders', { params })
      .then((res) => {
        if (!cancelled && res.data?.success && Array.isArray(res.data.data)) setOrders(res.data.data);
      })
      .catch(() => { if (!cancelled) setOrders([]); })
      .finally(() => { if (!cancelled) setOrdersLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, orderFilter]);

  // Fetch wishlist when Wishlist tab is active
  useEffect(() => {
    if (activeTab !== 'wishlist') return;
    let cancelled = false;
    setWishlistLoading(true);
    getWishlist().then((wishlist) => {
      if (cancelled) return;
      if (!wishlist?.items?.length) {
        setWishlistProducts([]);
        setWishlistLoading(false);
        return;
      }
      const items = wishlist.items;
      const products: any[] = [];
      const promises = items.map((item: any) => {
        if (typeof item === 'object' && item?._id && item?.name) {
          products.push(item);
          return Promise.resolve();
        }
        return axios.get(`/products/${item}`).then((r) => {
          if (r.data?.success && r.data?.data) products.push(r.data.data);
        }).catch(() => {});
      });
      Promise.all(promises).then(() => {
        if (!cancelled) {
          setWishlistProducts(products);
        }
      }).finally(() => { if (!cancelled) setWishlistLoading(false); });
    }).catch(() => { if (!cancelled) setWishlistLoading(false); setWishlistProducts([]); });
    return () => { cancelled = true; };
  }, [activeTab]);

  // Sync addresses & paymentMethods from user; fetch full profile when opening address/payment tab
  useEffect(() => {
    setAddresses(user?.addresses ?? []);
    setPaymentMethods(user?.paymentMethods ?? []);
  }, [user?.addresses, user?.paymentMethods]);

  useEffect(() => {
    if ((activeTab === 'address' || activeTab === 'payment') && user?._id) {
      fetchProfile();
    }
  }, [activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('gender', gender);
    formData.append('dateOfBirth', dateOfBirth);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const result = await updateProfile(formData);
    if (result.success) {
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công' });
    } else {
      setMessage({ type: 'error', text: result.message || 'Cập nhật thất bại' });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  <img 
                    src={previewUrl || 'https://via.placeholder.com/150'} 
                    alt="Ảnh đại diện" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <User className="w-5 h-5" />
                  <span>Thông tin cá nhân</span>
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span>Đơn hàng của tôi</span>
                </button>
                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'wishlist' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Danh sách yêu thích</span>
                </button>
                <button 
                  onClick={() => setActiveTab('address')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'address' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <MapPin className="w-5 h-5" />
                  <span>Quản lý địa chỉ</span>
                </button>
                <button 
                  onClick={() => setActiveTab('payment')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'payment' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Thẻ đã lưu</span>
                </button>
                <Link 
                  to="/login"
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 transition-colors mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-8">
              {message && (activeTab === 'address' || activeTab === 'payment') && (
                <p className={`mb-4 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>
              )}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>
                  {message && (
                    <p className={`mb-4 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>
                  )}
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Chọn</option>
                          <option value="Male">Nam</option>
                          <option value="Female">Nữ</option>
                          <option value="Other">Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors">
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Đơn hàng của tôi</h2>
                  <p className="text-sm text-gray-500 mb-6">Quản lý và theo dõi đơn hàng của bạn.</p>

                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-end lg:items-center">
                      <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
                        {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                          <button
                            key={s || 'all'}
                            onClick={() => setOrderFilter(s)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${orderFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600'}`}
                          >
                            {s === '' ? 'Tất cả' : s === 'pending' ? 'Chờ xác nhận' : s === 'confirmed' ? 'Đã xác nhận' : s === 'processing' ? 'Đang xử lý' : s === 'shipped' ? 'Đang giao' : s === 'delivered' ? 'Đã giao' : 'Đã hủy'}
                          </button>
                        ))}
                      </div>
                      <div className="relative w-full lg:w-64">
                        <input
                          type="text"
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          placeholder="Tìm theo mã đơn hàng"
                          className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-600 focus:ring-0 text-sm outline-none"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {ordersLoading ? (
                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
                  ) : (
                    <div className="space-y-4">
                      {orders
                        .filter((o: any) => !orderSearch || (o.orderNumber || '').toLowerCase().includes(orderSearch.toLowerCase()))
                        .map((order: any) => {
                          const statusLabel: Record<string, string> = { pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', processing: 'Đang xử lý', shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };
                          const firstItem = order.items?.[0];
                          const product = firstItem?.productId || firstItem;
                          return (
                            <div key={order._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                              <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 gap-4">
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Mã đơn hàng</p>
                                    <p className="font-bold text-gray-900">{order.orderNumber || order._id}</p>
                                  </div>
                                  <div className="w-px h-10 bg-gray-200 hidden sm:block" />
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Ngày đặt hàng</p>
                                    <p className="font-medium text-gray-900">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}</p>
                                  </div>
                                  <div className="w-px h-10 bg-gray-200 hidden sm:block" />
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Tổng tiền</p>
                                    <p className="font-bold text-blue-600">{(order.total || 0).toLocaleString('vi-VN')} VNĐ</p>
                                  </div>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {order.status === 'delivered' ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                                  {statusLabel[order.status] || order.status}
                                </div>
                              </div>
                              <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                    <img src={product?.images?.[0] || product?.image || 'https://via.placeholder.com/80'} alt="Sản phẩm" className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{product?.name || firstItem?.name || 'Sản phẩm'}</p>
                                    <p className="text-sm text-gray-500 mt-1">Số lượng: {order.items?.length || 0} sản phẩm</p>
                                  </div>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                  <Link
                                    to={`/order-tracking`}
                                    state={{ orderNumber: order.orderNumber, email: user?.email }}
                                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors text-center"
                                  >
                                    Xem chi tiết
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {orders.filter((o: any) => !orderSearch || (o.orderNumber || '').toLowerCase().includes(orderSearch.toLowerCase())).length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                          Chưa có đơn hàng nào.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Danh sách yêu thích</h2>
                  <p className="text-sm text-gray-500 mb-6">Các sản phẩm bạn đã lưu.</p>
                  {wishlistLoading ? (
                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
                  ) : wishlistProducts.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                      <p className="text-gray-500 mb-4">Danh sách yêu thích trống.</p>
                      <Link to="/products" className="inline-block px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">Tiếp tục mua sắm</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wishlistProducts.map((p: any) => (
                        <div key={p._id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                          <img src={p.images?.[0]} alt={p.name} className="w-20 h-24 object-cover rounded-lg" />
                          <div className="flex-1">
                            <Link to={`/product/${p._id}`} className="font-medium text-gray-900 hover:text-blue-600">{p.name}</Link>
                            <p className="text-sm text-gray-500 mt-1">{(p.price || 0).toLocaleString('vi-VN')} VNĐ</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => { await addToCart(p._id, 1); }}
                              disabled={p.stock === 0}
                              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-50"
                            >
                              <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
                            </button>
                            <button
                              onClick={async () => { await removeFromWishlist(p._id); setWishlistProducts((prev) => prev.filter((x) => x._id !== p._id)); }}
                              className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'address' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Quản lý địa chỉ</h2>
                  <p className="text-sm text-gray-500 mb-6">Thêm hoặc chỉnh sửa địa chỉ giao hàng.</p>
                  <div className="space-y-4">
                    {addresses.map((addr, idx) => (
                      <div key={idx} className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">{addr.fullName || '—'} {addr.phone ? ` • ${addr.phone}` : ''}</p>
                          <p className="text-sm text-gray-500 mt-1">{[addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ') || 'Chưa điền địa chỉ'}</p>
                          {addr.isDefault && <span className="inline-block mt-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Mặc định</span>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setAddressForm({ ...addr, _editIndex: idx }); setShowAddressForm(true); }}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={async () => {
                              const next = addresses.filter((_, i) => i !== idx);
                              setAddresses(next);
                              const res = await updateProfile({ addresses: next });
                              if (res?.success) setMessage({ type: 'success', text: 'Đã xóa địa chỉ' });
                            }}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                    {showAddressForm ? (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                        <h3 className="font-medium text-gray-900">{addressForm._editIndex !== undefined ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}</h3>
                        <input placeholder="Họ tên" value={addressForm.fullName || ''} onChange={(e) => setAddressForm((f) => ({ ...f, fullName: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        <input placeholder="Số điện thoại" value={addressForm.phone || ''} onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        <input placeholder="Đường / Số nhà" value={addressForm.street || ''} onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        <div className="flex gap-2">
                          <input placeholder="Thành phố" value={addressForm.city || ''} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
                          <input placeholder="Quận/Huyện" value={addressForm.state || ''} onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                        <div className="flex gap-2">
                          <input placeholder="Mã bưu điện" value={addressForm.zipCode || ''} onChange={(e) => setAddressForm((f) => ({ ...f, zipCode: e.target.value }))} className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm" />
                          <input placeholder="Quốc gia" value={addressForm.country || 'Việt Nam'} onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={!!addressForm.isDefault} onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))} />
                          Đặt làm mặc định
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              const { _editIndex, ...newAddr } = addressForm;
                              let next: Address[];
                              if (_editIndex !== undefined) {
                                next = addresses.map((a, i) => (i === _editIndex ? newAddr : a));
                              } else {
                                next = [...addresses, newAddr];
                              }
                              if (newAddr.isDefault) next = next.map((a, i) => ({ ...a, isDefault: i === (_editIndex !== undefined ? _editIndex : next.length - 1) }));
                              setAddresses(next);
                              setShowAddressForm(false);
                              setAddressForm({});
                              const res = await updateProfile({ addresses: next });
                              setMessage(res?.success ? { type: 'success', text: 'Đã lưu địa chỉ' } : { type: 'error', text: res?.message || 'Lỗi' });
                            }}
                            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
                          >
                            Lưu
                          </button>
                          <button onClick={() => { setShowAddressForm(false); setAddressForm({}); }} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600">
                        <Plus className="w-5 h-5" /> Thêm địa chỉ
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Thẻ đã lưu</h2>
                  <p className="text-sm text-gray-500 mb-6">Quản lý thẻ thanh toán (chỉ lưu 4 số cuối, không lưu thông tin đầy đủ).</p>
                  <div className="space-y-4">
                    {paymentMethods.map((card, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{card.cardType || 'Thẻ'} ****{card.lastFour || '****'}</p>
                            <p className="text-sm text-gray-500">Hết hạn: {card.expiryDate || '—'}</p>
                            {card.isDefault && <span className="text-xs text-blue-600 font-medium">Mặc định</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              const next = paymentMethods.map((c, i) => ({ ...c, isDefault: i === idx }));
                              setPaymentMethods(next);
                              await updateProfile({ paymentMethods: next });
                              setMessage({ type: 'success', text: 'Đã đặt làm mặc định' });
                            }}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Mặc định
                          </button>
                          <button
                            onClick={async () => {
                              const next = paymentMethods.filter((_, i) => i !== idx);
                              setPaymentMethods(next);
                              await updateProfile({ paymentMethods: next });
                              setMessage({ type: 'success', text: 'Đã xóa thẻ' });
                            }}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                    {showCardForm ? (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                        <h3 className="font-medium text-gray-900">Thêm thẻ</h3>
                        <p className="text-xs text-gray-500">Chỉ nhập 4 số cuối và thông tin hiển thị (mô phỏng, không lưu số thật).</p>
                        <input placeholder="Loại thẻ (VD: Visa)" value={cardForm.cardType || ''} onChange={(e) => setCardForm((f) => ({ ...f, cardType: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        <input placeholder="4 số cuối" value={cardForm.lastFour || ''} onChange={(e) => setCardForm((f) => ({ ...f, lastFour: e.target.value.slice(-4) }))} maxLength={4} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        <input placeholder="Hết hạn (MM/YY)" value={cardForm.expiryDate || ''} onChange={(e) => setCardForm((f) => ({ ...f, expiryDate: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              const newCard = { cardType: cardForm.cardType, lastFour: cardForm.lastFour, expiryDate: cardForm.expiryDate, isDefault: paymentMethods.length === 0 };
                              const next = [...paymentMethods, newCard];
                              setPaymentMethods(next);
                              setShowCardForm(false);
                              setCardForm({});
                              await updateProfile({ paymentMethods: next });
                              setMessage({ type: 'success', text: 'Đã thêm thẻ' });
                            }}
                            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
                          >
                            Lưu
                          </button>
                          <button onClick={() => { setShowCardForm(false); setCardForm({}); }} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowCardForm(true)} className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600">
                        <Plus className="w-5 h-5" /> Thêm thẻ
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple icon component since ShoppingBag is already used in Header
function ShoppingBagIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
