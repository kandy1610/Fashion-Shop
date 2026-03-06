import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, CreditCard, Heart, LogOut, Camera, Search, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

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
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } else {
      setMessage({ type: 'error', text: result.message || 'Update failed' });
    }
  };

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
                    alt="Profile" 
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
                  <span>Personal Information</span>
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span>My Orders</span>
                </button>
                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'wishlist' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Heart className="w-5 h-5" />
                  <span>My Wishlist</span>
                </button>
                <button 
                  onClick={() => setActiveTab('address')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'address' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <MapPin className="w-5 h-5" />
                  <span>Manage Addresses</span>
                </button>
                <button 
                  onClick={() => setActiveTab('payment')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'payment' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Saved Cards</span>
                </button>
                <Link 
                  to="/login"
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 transition-colors mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-8">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                  {message && (
                    <p className={`mb-4 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>
                  )}
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
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
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">My Orders</h2>
                  <p className="text-sm text-gray-500 mb-6">Manage and track your orders.</p>

                  {/* Filters */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-end lg:items-center">
                      <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
                        <button className="whitespace-nowrap px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium">All</button>
                        <button className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 text-sm font-medium">Processing</button>
                        <button className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 text-sm font-medium">Shipping</button>
                        <button className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 text-sm font-medium">Delivered</button>
                        <button className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 text-sm font-medium">Cancelled</button>
                      </div>
                      <div className="relative w-full lg:w-64">
                        <input type="text" placeholder="Search by order number" className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-600 focus:ring-0 text-sm outline-none" />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Order List */}
                  <div className="space-y-4">
                    {/* Order Item 1 */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 gap-4">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Order Number</p>
                            <p className="font-bold text-gray-900">#ORD-2023-8902</p>
                          </div>
                          <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Order Date</p>
                            <p className="font-medium text-gray-900">Oct 15, 2023</p>
                          </div>
                          <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Total Amount</p>
                            <p className="font-bold text-blue-600">$89.99</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                          <RefreshCw className="w-4 h-4" />
                          Processing
                        </div>
                      </div>
                      <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=200" alt="Product" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Denim Jacket</p>
                            <p className="text-sm text-gray-500 mt-1">Variant: Size L, Blue</p>
                            <p className="text-sm text-gray-500 mt-1">Quantity: 1</p>
                          </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors">Contact Support</button>
                          <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors">View Details</button>
                        </div>
                      </div>
                    </div>

                    {/* Order Item 2 */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 gap-4">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Order Number</p>
                            <p className="font-bold text-gray-900">#ORD-2023-8100</p>
                          </div>
                          <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Order Date</p>
                            <p className="font-medium text-gray-900">Oct 05, 2023</p>
                          </div>
                          <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Total Amount</p>
                            <p className="font-bold text-blue-600">$59.98</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Delivered
                        </div>
                      </div>
                      <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200" alt="Product" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Classic White T-Shirt</p>
                            <p className="text-sm text-gray-500 mt-1">Variant: Size M, White</p>
                            <p className="text-sm text-gray-500 mt-1">Quantity: 2</p>
                          </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors">Buy Again</button>
                          <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors">Review</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== 'profile' && activeTab !== 'orders' && (
                <div className="text-center py-12">
                  <p className="text-gray-500">This section is under construction.</p>
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
