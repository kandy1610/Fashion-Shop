import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export const useCart = () => {
  const { user } = useAuth();

  const addToCart = async (productId: string, quantity: number, size?: string, color?: string) => {
    try {
      if (!user) {
        return { success: false, message: 'Vui lòng đăng nhập trước' };
      }

      const response = await axios.post('/cart/add', {
        productId,
        quantity,
        size,
        color
      });

      return {
        success: true,
        message: 'Đã thêm vào giỏ hàng',
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể thêm vào giỏ hàng'
      };
    }
  };

  const getCart = async () => {
    try {
      const response = await axios.get('/cart');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      return null;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await axios.delete(`/cart/remove/${itemId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      return null;
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      const response = await axios.put(`/cart/update/${itemId}`, { quantity });
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating cart:', error);
      return null;
    }
  };

  const clearCart = async () => {
    try {
      const response = await axios.delete('/cart/clear');
      return response.data.data;
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      return null;
    }
  };

  return {
    addToCart,
    getCart,
    removeFromCart,
    updateCartItem,
    clearCart
  };
};
