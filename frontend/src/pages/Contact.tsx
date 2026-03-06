import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên hệ</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp và hỗ trợ bạn. 
            Vui lòng điền vào form bên dưới hoặc liên hệ trực tiếp qua các kênh.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Form liên hệ */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Mail className="text-blue-600 w-6 h-6" />
              Gửi tin nhắn
            </h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input type="text" placeholder="Nguyễn Văn A" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" placeholder="nguyenvana@email.com" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input type="tel" placeholder="090 123 4567" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <textarea rows={5} placeholder="Chúng tôi có thể giúp gì cho bạn?" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"></textarea>
              </div>
              <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
                Gửi tin nhắn
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Thông tin liên hệ */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Thông tin liên hệ</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Địa chỉ cửa hàng</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      123 Đường 30/4, Phường Xuân Khánh<br />Quận Ninh Kiều, TP. Cần Thơ
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Hotline hỗ trợ</h4>
                    <p className="text-sm text-gray-600">
                      <a href="tel:+842923456789" className="hover:text-blue-600 transition-colors">0292 3456 789</a> (8:00 - 22:00)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Email hỗ trợ</h4>
                    <p className="text-sm text-gray-600">
                      <a href="mailto:hotro@kandy.com" className="hover:text-blue-600 transition-colors">hotro@kandy.com</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 my-6"></div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4">Kết nối với chúng tôi</h4>
                <div className="flex gap-3">
                  <a href="#" className="bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 p-3 rounded-lg transition-all">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="bg-gray-50 hover:bg-pink-600 hover:text-white text-gray-700 p-3 rounded-lg transition-all">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="bg-gray-50 hover:bg-sky-500 hover:text-white text-gray-700 p-3 rounded-lg transition-all">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bản đồ Cần Thơ */}
            <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.841829903618!2d105.7803456!3d10.0451624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a08827ab1e8e69%3A0x96b5f085b42933a2!2zVHXhuqVuIFh1w6JuIEtow6FuaCwgTmluaCBLaeG7gXUsIEPhuqduIFRoxqEsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Bản đồ Cần Thơ"
              ></iframe>
              <a 
                href="https://maps.app.goo.gl/xyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-blue-50 transition-colors"
              >
                <MapPin className="text-blue-600 w-5 h-5" />
                <span className="text-xs font-bold text-gray-900">Xem trên Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}