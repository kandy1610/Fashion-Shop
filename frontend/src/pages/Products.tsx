import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Filter, ChevronDown } from 'lucide-react';
import axios from '../utils/axios';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  slug: string;
}

export default function Products() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [wishlist, setWishlist] = useState<any>(null);
  
  // Filter states
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [categories, setCategories] = useState<string[]>([]);
  
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, getWishlist, isInWishlist } = useWishlist();

  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Update filter category when URL param changes
  useEffect(() => {
    setFilterCategory(categoryParam);
  }, [categoryParam]);

  const fetchWishlist = async () => {
    const data = await getWishlist();
    if (data) setWishlist(data);
  };

  useEffect(() => {
    fetchProducts();
    setCurrentPage(1);
  }, [searchQuery, categoryParam]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build URL with search and category params
      let url = '/products';
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (categoryParam) {
        params.append('category', categoryParam);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      if (response.data.success) {
        setProducts(response.data.data);
        setTotal(response.data.total);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.data.map((p: Product) => p.category))].filter(Boolean);
        setCategories(uniqueCategories);
        
        // Set initial max price
        const prices = response.data.data.map((p: Product) => p.price);
        if (prices.length > 0) {
          setMaxPrice(Math.max(...prices));
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    const result = await addToCart(productId, 1);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      window.dispatchEvent(new Event('cartUpdated'));
    }
    setTimeout(() => setMessage(null), 2000);
  };

  const handleWishlist = async (productId: string) => {
    try {
      if (isInWishlist(wishlist, productId)) {
        const result = await removeFromWishlist(productId);
        if (result) {
          const updated = await getWishlist();
          setWishlist(updated);
          setMessage({ type: 'success', text: 'Removed from wishlist' });
          setTimeout(() => setMessage(null), 2000);
        }
      } else {
        const result = await addToWishlist(productId);
        if (result?.success !== false) {
          const updated = await getWishlist();
          setWishlist(updated);
          setMessage({ type: 'success', text: 'Added to wishlist' });
          setTimeout(() => setMessage(null), 2000);
        } else {
          setMessage({ type: 'error', text: result.message });
          setTimeout(() => setMessage(null), 2000);
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      setMessage({ type: 'error', text: 'Failed to update wishlist' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const getCategoryDisplay = (category: string) => {
    const displayMap: { [key: string]: { icon: string; name: string } } = {
      'Nam': { icon: '👔', name: 'Quần áo Nam' },
      'Nữ': { icon: '👗', name: 'Quần áo Nữ' },
      'Trẻ em': { icon: '👶', name: 'Quần áo Trẻ em' }
    };
    return displayMap[category] || { icon: '📦', name: category };
  };

  // Sorting logic
  const sortProducts = (items: Product[]) => {
    const sorted = [...items];
    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  };

  // Filter logic
  const filterProducts = (items: Product[]) => {
    return items.filter(product => {
      const matchName = product.name.toLowerCase().includes(filterName.toLowerCase());
      const matchCategory = !filterCategory || product.category === filterCategory;
      const matchPrice = product.price >= minPrice && product.price <= maxPrice;
      return matchName && matchCategory && matchPrice;
    });
  };

  // Apply filters and sorting
  const filteredProducts = filterProducts(products);
  const sortedProducts = sortProducts(filteredProducts);
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) || 1;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(start, end);

  return (
    <div className="bg-white">
      {/* Page Header */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Cửa hàng'}
          </h1>
          {message && (
            <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-900">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-900">Cửa hàng</span>
            {searchQuery && (
              <>
                <span>/</span>
                <span className="text-gray-900">Tìm kiếm</span>
              </>
            )}
          </div>
          {searchQuery && (
            <p className="mt-4 text-gray-600">
              Tìm thấy {filteredProducts.length} / {total} sản phẩm
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Bộ lọc</h2>
              
              {/* Filter by Name */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tên sản phẩm</h3>
                <input
                  type="text"
                  placeholder="Tìm kiếm tên..."
                  value={filterName}
                  onChange={(e) => {
                    setFilterName(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter by Category */}
              {categories.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Loại sản phẩm</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setFilterCategory('');
                        setCurrentPage(1);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filterCategory === '' 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Tất cả
                    </button>
                    {categories.map(cat => {
                      const { name } = getCategoryDisplay(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterCategory(cat);
                            setCurrentPage(1);
                          }}
                          className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            filterCategory === cat 
                              ? 'bg-blue-50 text-blue-600 font-medium' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter by Price */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Khoảng giá</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Giá tối thiểu (VNĐ)</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(Math.max(0, Number(e.target.value)));
                        setCurrentPage(1);
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Giá tối đa (VNĐ)</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={maxPrice.toLocaleString('vi-VN')}
                    />
                  </div>

                  <div className="pt-2 text-xs text-gray-600">
                    <strong>Giá:</strong> {minPrice.toLocaleString('vi-VN')} VNĐ - {maxPrice.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              {(filterName || filterCategory || minPrice > 0) && (
                <button
                  onClick={() => {
                    setFilterName('');
                    setFilterCategory('');
                    setMinPrice(0);
                    if (products.length > 0) {
                      const prices = products.map((p: Product) => p.price);
                      setMaxPrice(Math.max(...prices));
                    }
                    setCurrentPage(1);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-100 gap-4">
              <button 
                className="lg:hidden flex items-center text-gray-600 hover:text-gray-900"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="w-5 h-5 mr-2" />
                Bộ lọc
              </button>
              <p className="text-sm text-gray-500">
                Hiển thị {sortedProducts.length} / {total} sản phẩm
              </p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-3">Sắp xếp:</span>
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white border border-gray-200 rounded-md py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="default">Sắp xếp mặc định</option>
                    <option value="name_asc">Tên A→Z</option>
                    <option value="name_desc">Tên Z→A</option>
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao đến Thấp</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {products.length === 0 ? 'Không tìm thấy sản phẩm' : 'Không có sản phẩm phù hợp với bộ lọc này'}
                </p>
                {searchQuery ? (
                  <Link to="/products" className="text-blue-600 hover:underline mt-2 inline-block">
                    Xem tất cả sản phẩm
                  </Link>
                ) : (
                  <button 
                    onClick={() => {
                      setFilterName('');
                      setFilterCategory('');
                      setMinPrice(0);
                      if (products.length > 0) {
                        const prices = products.map((p: Product) => p.price);
                        setMaxPrice(Math.max(...prices));
                      }
                      setCurrentPage(1);
                    }}
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              /* Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map((product) => (
                  <div key={product._id} className="group">
                    <Link to={`/product/${product.slug || product._id}`} className="block relative aspect-3/4 rounded-lg overflow-hidden mb-4 bg-gray-100">
                      <img 
                        src={product.images[0] || 'https://via.placeholder.com/800'} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer">
                        <Heart 
                          className={`w-5 h-5 transition-colors ${isInWishlist(wishlist, product._id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleWishlist(product._id);
                          }}
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
                        <button onClick={() => handleAddToCart(product._id)} className="text-sm font-medium text-gray-900 hover:text-blue-600">Thêm vào giỏ</button>
                      </div>
                    </Link>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        <Link to={`/product/${product.slug || product._id}`} className="hover:text-blue-600 transition-colors">
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-sm font-semibold text-gray-900">{product.price.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-md ${
                        currentPage === page
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}