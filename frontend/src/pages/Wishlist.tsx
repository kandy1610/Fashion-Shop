import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import axiosInstance from '../utils/axios';

interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
}

export default function Wishlist() {
  const { getWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWishlistData();
  }, []);

  const fetchWishlistData = async () => {
    try {
      setLoading(true);
      const wishlist = await getWishlist();
      
      if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      // wishlist.items may already be populated with full product objects or just IDs.
      const products: WishlistProduct[] = [];
      for (const item of wishlist.items) {
        if (!item) continue;
        if (typeof item === 'object' && item._id && item.name) {
          // already populated
          products.push(item as WishlistProduct);
        } else {
          // item is likely an ID string
          try {
            const res = await axiosInstance.get(`/products/${item}`);
            if (res.data.success) products.push(res.data.data);
          } catch {
            // ignore missing product
          }
        }
      }

      setWishlistProducts(products);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wishlist');
      setWishlistProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      setWishlistProducts(wishlistProducts.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist', err);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const result = await addToCart(productId, 1);
      if (result.success) {
        alert(result.message || 'Đã thêm vào giỏ hàng!');
      } else {
        alert(result.message || 'Không thể thêm giỏ hàng');
      }
    } catch (err: any) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 flex items-center justify-center">
        <div className="text-gray-600">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sản phẩm yêu thích</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-600 mb-4">Danh sách yêu thích của bạn trống</p>
            <Link to="/products" className="inline-block px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-6 border-b border-gray-100 text-sm font-medium text-gray-500">
              <div className="sm:col-span-6">Sản phẩm</div>
              <div className="sm:col-span-2 text-center">Giá</div>
              <div className="sm:col-span-2 text-center">Tồn kho</div>
              <div className="sm:col-span-2 text-right">Hành động</div>
            </div>

            <div className="divide-y divide-gray-100">
              {wishlistProducts.map((product) => (
                <div key={product._id} className="p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-6 flex items-center w-full">
                    <button 
                      onClick={() => handleRemove(product._id)}
                      className="text-gray-400 hover:text-red-500 mr-4 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <img 
                      src={product.images[0] || 'https://via.placeholder.com/80'} 
                      alt={product.name} 
                      className="w-20 h-24 object-cover rounded-md mr-4"
                    />
                    <Link to={`/product/${product.slug || product._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {product.name}
                    </Link>
                  </div>
                  
                  <div className="sm:col-span-2 text-gray-900 font-medium sm:text-center w-full sm:w-auto flex justify-between sm:block mt-4 sm:mt-0">
                    <span className="sm:hidden text-gray-500">Giá:</span>
{product.price.toLocaleString('vi-VN')} VNĐ
                  </div>
                  
                  <div className="sm:col-span-2 sm:text-center w-full sm:w-auto flex justify-between sm:block mt-2 sm:mt-0">
                    <span className="sm:hidden text-gray-500">Tồn kho:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.stock > 0 ? 'Có săn' : 'Hết hàng'}
                    </span>
                  </div>
                  
                  <div className="sm:col-span-2 text-right w-full sm:w-auto mt-4 sm:mt-0">
                    <button 
                      onClick={() => handleAddToCart(product._id)}
                      disabled={product.stock === 0}
                      className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${product.stock > 0 ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
