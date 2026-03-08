import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Thông tin thương hiệu */}
          <div>
            <Link to="/" className="text-2xl font-bold tracking-tight text-white mb-6 block">
              Kandy
            </Link>
            <div className="space-y-4 text-gray-400 text-sm">
              <p className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <span>123 Đường 30/4, Phường Xuân Khánh<br />Quận Ninh Kiều, TP. Cần Thơ</span>
              </p>
              <p className="flex items-center">
                <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>+84 363 407 907</span>
              </p>
              <p className="flex items-center">
                <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>hotro@kandy.com</span>
              </p>
            </div>
          </div>

          {/* Thông tin */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Thông tin</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Điều khoản & Điều kiện</Link></li>
            </ul>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Liên kết nhanh</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/products?category=men" className="hover:text-white transition-colors">Thời trang Nam</Link></li>
              <li><Link to="/products?category=women" className="hover:text-white transition-colors">Thời trang Nữ</Link></li>
              <li><Link to="/products?category=kids" className="hover:text-white transition-colors">Thời trang Trẻ em</Link></li>
            </ul>
          </div>

          {/* Bản tin */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Bản tin</h3>
            <p className="text-sm text-gray-400 mb-4">Đăng ký nhận bản tin để nhận ưu đãi 10% cho đơn hàng đầu tiên.</p>
            <form className="flex mb-6">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="bg-gray-800 text-white px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-l-md border border-gray-700"
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors font-medium"
              >
                Đăng ký
              </button>
            </form>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Kandy. Đã đăng ký bản quyền.
          </p>
          <div className="flex space-x-4">
            {/* Biểu tượng thanh toán */}
            <div className="h-8 w-12 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500">Visa</div>
            <div className="h-8 w-12 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500">MC</div>
            <div className="h-8 w-12 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500">Amex</div>
            <div className="h-8 w-12 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500">PayPal</div>
          </div>
        </div>
      </div>
    </footer>
  );
}