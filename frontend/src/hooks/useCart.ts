import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export const useCart = () => {
  const { user } = useAuth();

  const addToCart = async (productId: string, quantity: number, size?: string, color?: string) => {
    try {
      if (!user) {
        return { success: false, message: 'Vui lòng đăng nhập trước' };
      }

      const token = localStorage.getItem('token');
      console.log('Adding to cart - Token exists:', !!token);
      console.log('Adding to cart - User:', user.email);
      console.log('Adding to cart - Product:', productId);

      const response = await axios.post('/cart/add', {
        productId,
        quantity,
        size,
        color
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      console.log('Add to cart response:', response.data);

      return {
        success: true,
        message: 'Đã thêm vào giỏ hàng',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Add to cart error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể thêm vào giỏ hàng'
      };
    }
  };

  const getCart = async () => {
    try {
      const response = await axios.get('/cart');
      console.log('Cart API response:', response.data);
      // Handle different response formats
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching cart:', error.response?.data || error.message);
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
