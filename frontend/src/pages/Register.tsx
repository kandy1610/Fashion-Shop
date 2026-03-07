import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import axios from '../utils/axios';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firstName || !lastName || !email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!agreeTerms) {
      setError('Vui lòng đồng ý với điều khoản dịch vụ');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/auth/register', {
        firstName,
        lastName,
        email,
        password
      });

      if (response.data.success) {
        navigate('/login', { state: { message: 'Đăng kí thành công! Vui lòng đăng nhập.' } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng kí thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="text-2xl font-bold tracking-tight text-gray-900 mb-8 inline-block">
              KANDY
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h2>
            <p className="text-gray-500">Tham gia cùng chúng tôi và bắt đầu mua sắm ngay hôm nay.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                <input 
                  type="text" 
                  placeholder="Nhập họ" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ email</label>
              <input 
                type="email" 
                placeholder="Nhập email của bạn" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Tạo mật khẩu" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  required
                />
              </div>
              <div className="ml-2 text-sm">
                <label className="text-gray-600">
                  Tôi đồng ý với <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Điều khoản dịch vụ</a> và <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Chính sách bảo mật</a>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50">
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

      {/* Image Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-100 items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200" 
          alt="Register" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white px-12">
          <h1 className="text-5xl font-bold mb-6">Tham gia KANDY</h1>
          <p className="text-xl">Tiếp cận các ưu đãi độc quyền, sản phẩm mới và nhiều hơn nữa.</p>
        </div>
      </div>
    </div>
  );
}
