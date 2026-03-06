import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, Share2, Star, Minus, Plus, ShoppingBag } from 'lucide-react';
import axios from '../utils/axios';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

export default function ProductDetail() {
  const { id } = useParams(); // id here is actually the slug
  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, getWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/products`);
        if (response.data.success) {
          // Find product by slug (id param from URL is actually slug)
          const found = response.data.data.find((p: any) => p.slug === id || p._id === id);
          if (found) {
            setProduct(found);
            setSelectedSize(found.sizes?.[0] || '');
            setSelectedColor(found.colors?.[0] || '');
            setMainImage(found.images?.[0] || '');
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
    checkWishlist();
  }, [id]);

  const checkWishlist = async () => {
    const wishlist = await getWishlist();
    if (wishlist && wishlist.items && Array.isArray(wishlist.items)) {
      // Check if product id is in wishlist - handle both populated and non-populated items
      const isInWishlist = wishlist.items.some((item: any) => {
        const itemId = typeof item === 'string' ? item : (item._id?.toString() || item.productId);
        return itemId === id;
      });
      setIsWishlisted(isInWishlist);
    }
  };

  const handleWishlist = async () => {
    if (isWishlisted) {
      const result = await removeFromWishlist(id!);
      if (result) {
        setIsWishlisted(false);
        setMessage({ type: 'success', text: 'Đã xóa khỏi yêu thích' });
      }
    } else {
      const result = await addToWishlist(id!);
      if (result.success) {
        setIsWishlisted(true);
        setMessage(result);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    }
    setTimeout(() => setMessage(null), 2000);
  };

  const handleAddToCart = async () => {
    const result = await addToCart(id!, quantity, selectedSize, selectedColor);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      window.dispatchEvent(new Event('cartUpdated'));
    }
    setTimeout(() => setMessage(null), 2000);
  };

  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sản phẩm không tìm thấy</p>
        <Link to="/products" className="text-blue-600 hover:underline mt-2 inline-block">Quay lại shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-900">Shop</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Images */}
          <div className="lg:w-1/2 flex flex-col-reverse sm:flex-row gap-4">
            <div className="flex sm:flex-col gap-4 overflow-x-auto sm:overflow-y-auto sm:w-24 shrink-0">
              {product.images?.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImage(img)}
                  className={`relative aspect-3/4 rounded-md overflow-hidden shrink-0 w-20 sm:w-full ${mainImage === img ? 'ring-2 ring-gray-900' : 'ring-1 ring-gray-200'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="relative aspect-3/4 w-full rounded-lg overflow-hidden bg-gray-100">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating || 0) ? 'fill-current' : ''}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2\">({product.numReviews || 0} nh\u1eadn x\u00e9t)</span>
            </div>

            <p className="text-2xl font-semibold text-gray-900 mb-2">{product.price?.toLocaleString('vi-VN')} VNĐ</p>
            {product.discount && (
              <p className="text-sm text-gray-500 mb-6">Giảm {product.discount}%</p>
            )}

            <p className="text-gray-600 mb-8">
              {product.description}
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Màu sắc</h3>
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  {product.colors.map((color: string, colorIdx: number) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        // Display image corresponding to color (color index 0 -> image index 1)
                        const imageIdx = colorIdx + 1;
                        if (product.images && product.images[imageIdx]) {
                          setMainImage(product.images[imageIdx]);
                        } else if (product.images && product.images[0]) {
                          setMainImage(product.images[0]);
                        }
                      }}
                      className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all ${selectedColor === color ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-900 hover:border-gray-900'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Kích cỡ</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border-2 rounded-md text-sm font-medium transition-colors ${selectedSize === size ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-900 hover:border-gray-900'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-md">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <button onClick={handleAddToCart} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-md flex items-center justify-center font-medium transition-colors">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Thêm vào giỏ
              </button>

              <button onClick={handleWishlist} className={`w-12 h-12 border rounded-md flex items-center justify-center transition-colors ${
                isWishlisted 
                  ? 'border-red-500 bg-red-50 text-red-500' 
                  : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-500'
              }`}>
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {message && (
              <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </p>
            )}

            {/* Meta */}
            <div className="border-t border-gray-100 pt-6 space-y-3">
              {product.sku && (
                <div className="flex text-sm">
                  <span className="text-gray-500 w-24">SKU:</span>
                  <span className="text-gray-900">{product.sku}</span>
                </div>
              )}
              {product.category && (
                <div className="flex text-sm">
                  <span className="text-gray-500 w-24">Loại:</span>
                  <span className="text-gray-900">{product.category}</span>
                </div>
              )}
              {product.stock !== undefined && (
                <div className="flex text-sm">
                  <span className="text-gray-500 w-24">Tồn kho:</span>
                  <span className="text-gray-900">{product.stock} sản phẩm</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
