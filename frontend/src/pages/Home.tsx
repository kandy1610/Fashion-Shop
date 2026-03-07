import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, HeadphonesIcon, CreditCard, Heart } from 'lucide-react';
import { useState, useEffect, MouseEvent } from 'react';
import axios from 'axios';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';

const categories = [
  { id: 1, name: 'Nam', query: 'Nam', image: 'https://channel.mediacdn.vn/428462621602512896/2022/5/11/vulcano-1-1652263546844522213228.jpg' },
  { id: 2, name: 'Nữ', query: 'Nữ', image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'Nam - Nữ', query: 'Nam - Nữ', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'Trẻ em', query: 'Trẻ em', image: 'https://tse1.mm.bing.net/th/id/OIP.g5MCF6VNZT-BLVnfDZ3lfAHaE7?pid=Api&P=0&h=180' },
];

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, getWishlist } = useWishlist();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/products/featured?limit=4');
        
        if (response.data.success) {
          setFeaturedProducts(response.data.data);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Fetch wishlist when user logs in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const wishlist = await getWishlist();
          if (wishlist && wishlist.items) {
            // Get product IDs from wishlist - items are populated Product objects
            const ids = wishlist.items.map((item: any) => {
              // Item can be either a string (ObjectId) or a populated Product object
              if (typeof item === 'string') return item;
              // If populated, item has _id property from Product
              if (item && item._id) return item._id.toString();
              return null;
            }).filter(Boolean);
            console.log('Wishlist IDs:', ids);
            setWishlistItems(ids);
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        }
      } else {
        setWishlistItems([]);
      }
    };

    fetchWishlist();
  }, [user, getWishlist]);

  const handleToggleWishlist = async (productId: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    const isInWishlist = wishlistItems.includes(productId);
    
    if (isInWishlist) {
      const result = await removeFromWishlist(productId);
      if (result) {
        setWishlistItems(prev => prev.filter(id => id !== productId));
      }
    } else {
      const result = await addToWishlist(productId);
      if (result.success) {
        setWishlistItems(prev => [...prev, productId]);
      }
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-100 min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Bộ sưu tập Thời trang <br />
              <span className="text-blue-600">Xu hướng Mới nhất</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Khám phá những xu hướng thời trang mới nhất. Mua sắm bộ sưu tập mới của chúng tôi và nâng cấp tủ quần áo của bạn.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
            >
              Mua sắm ngay
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link key={category.id} to={`/products?category=${encodeURIComponent(category.query)}`} className="group relative rounded-lg overflow-hidden block aspect-4/5">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm py-3 px-8 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
              <p className="text-gray-500 mt-2">Khám phá những sản phẩm được yêu thích nhất</p>
            </div>
            <Link to="/products" className="text-blue-600 font-medium hover:text-blue-700 flex items-center">
              Xem tất cả <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="aspect-3/4 rounded-lg bg-gray-300 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => {
                  const isWishlisted = wishlistItems.includes(product._id);
                  return (
                    <div key={product._id} className="group">
                      <Link to={`/product/${product.slug}`} className="block relative aspect-3/4 rounded-lg overflow-hidden mb-4 bg-gray-200">
                        <img 
                          src={product.images[0] || 'https://via.placeholder.com/300x400'} 
                          alt={product.name} 
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <button 
                          onClick={(e) => handleToggleWishlist(product._id, e)}
                          className={`absolute top-4 right-4 bg-white p-2 rounded-full transition-opacity shadow-sm hover:bg-red-50 ${isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                          <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                        </button>
                      </Link>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          <Link to={`/product/${product.slug}`} className="hover:text-blue-600 transition-colors">
                            {product.name}
                          </Link>
                        </h3>
                        <p className="text-sm font-semibold text-gray-900">{product.price.toLocaleString('vi-VN')} VNĐ</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-4 text-center py-10">
                  <p className="text-gray-500">Chưa có sản phẩm nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Giao hàng Miễn phí</h3>
              <p className="text-sm text-gray-500">Giao hàng miễn phí cho đơn hàng trên 500.000 VNĐ</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thanh Toán An Toàn</h3>
              <p className="text-sm text-gray-500">100% an toàn và bảo vệ thanh toán</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <HeadphonesIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hỗ trợ Trực tuyến</h3>
              <p className="text-sm text-gray-500">24/7 tất cả các ngày trong tuần</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thanh toán Linh hoạt</h3>
              <p className="text-sm text-gray-500">Chấp nhận nhiều phương thức thanh toán</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}