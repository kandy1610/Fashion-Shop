import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, LogOut, ChevronDown, X } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import axios from '../utils/axios';

const navItems = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Cửa hàng', path: '/products' },
  { label: 'Giới thiệu', path: '/about' },
  { label: 'Liên hệ', path: '/contact' },
];

interface SearchProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  category: string;
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { getCart } = useCart();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch cart count on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const cartData = await getCart();
      if (cartData) {
        const items = Array.isArray(cartData) 
          ? cartData 
          : cartData.items || [];
        setCartCount(items.length);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  // Refresh cart count when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchCartCount();
      }
    };

    const handleFocus = () => {
      if (user) {
        fetchCartCount();
      }
    };

    const handleCartUpdated = () => {
      if (user) {
        fetchCartCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('cartUpdated', handleCartUpdated);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, [user]);

  // Đóng search khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(`/products/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.data.success) {
        setSearchResults(response.data.data);
        setIsSearchOpen(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileMenuOpen(false);
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="shrink-0">
            <Link to="/" className="text-2xl font-bold tracking-tight text-gray-900 hover:text-blue-600 transition-colors duration-200">
              Kandy
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-2">
            {navItems.map((item) => {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-4 py-2 text-[20px] font-medium text-gray-700 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            {/* Search Bar */}
            <div className="relative hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setIsSearchOpen(true)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </form>

              {/* Search Results Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {searchResults.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleProductClick(product.slug || product._id)}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                        <img 
                          src={product.images[0] || 'https://via.placeholder.com/48'} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">${product.price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
                    >
                      View all results
                    </button>
                  </div>
                </div>
              )}

              {isSearchOpen && searchQuery && searchResults.length === 0 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center z-50">
                  <p className="text-sm text-gray-500">No products found</p>
                </div>
              )}
            </div>

            {/* Mobile Search Button */}
            <button className="md:hidden text-gray-500 hover:text-blue-600 transition-colors duration-200 hover:bg-gray-100 p-2 rounded-lg">
              <Search className="w-5 h-5" />
            </button>
            
            <Link to="/wishlist" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 hover:bg-gray-100 p-2 rounded-lg">
              <Heart className="w-5 h-5" />
            </Link>
            
            <Link to="/cart" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 hover:bg-gray-100 p-2 rounded-lg relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-max">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors duration-200 hover:bg-gray-100 p-2 rounded-lg"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {getInitials()}
                      </span>
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 inline mr-2" />
                        Hồ sơ của tôi
                      </Link>
                      
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 font-medium"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <span className="w-4 h-4 inline mr-2">⚙️</span>
                          Quản lý sản phẩm
                        </Link>
                      )}
                      
                      <Link
                        to="/profile?tab=orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4 inline mr-2" />
                        Đơn hàng của tôi
                      </Link>
                      
                      <Link
                        to="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4 inline mr-2" />
                        Danh sách yêu thích
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200 hover:bg-gray-100 p-2 rounded-lg"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}