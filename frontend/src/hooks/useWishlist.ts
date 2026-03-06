import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export const useWishlist = () => {
  const { user } = useAuth();

  const addToWishlist = async (productId: string) => {
    try {
      if (!user) {
        return { success: false, message: 'Vui lòng đăng nhập trước' };
      }

      const response = await axios.post('/wishlist/add', { productId });

      return {
        success: true,
        message: 'Đã thêm vào yêu thích',
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể thêm vào yêu thích'
      };
    }
  };

  const getWishlist = async () => {
    try {
      const response = await axios.get('/wishlist');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      return null;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await axios.delete(`/wishlist/remove/${productId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      return null;
    }
  };

  const clearWishlist = async () => {
    try {
      const response = await axios.delete('/wishlist/clear');
      return response.data.data;
    } catch (error: any) {
      console.error('Error clearing wishlist:', error);
      return null;
    }
  };

  const isInWishlist = (wishlist: any, productId: string) => {
    if (!wishlist || !wishlist.items || !Array.isArray(wishlist.items)) {
      return false;
    }
    return wishlist.items.some((item: any) => {
      const itemId = typeof item === 'string' ? item : item._id || item.productId?._id;
      return itemId === productId;
    });
  };

  return {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist
  };
};
