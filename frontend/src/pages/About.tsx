import { Link } from 'react-router-dom';
import { Shield, Heart, Target, Users, Award, Truck, RefreshCw, HeadphonesIcon } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-100 h-[500px] flex items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" 
            alt="Về chúng tôi" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 max-w-3xl px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Về Kandy</h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Chúng tôi tin vào thời trang giúp bạn tự tin, truyền cảm hứng và thể hiện cá tính mỗi ngày.
          </p>
        </div>
      </section>

      {/* Câu chuyện thương hiệu */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <img 
                src="https://tracuuthansohoc.com/wp-content/uploads/2021/07/ten-shop-quan-ao-hay-3_compressed.jpg" 
                alt="Câu chuyện của chúng tôi" 
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Được thành lập vào năm 2010 tại TP. Hồ Chí Minh, Kandy khởi đầu với một ý tưởng đơn giản: 
                tạo ra những sản phẩm thời trang chất lượng cao, phong cách và phù hợp với mọi người. 
                Từ một cửa hàng nhỏ tại Quận 1, chúng tôi đã phát triển thành thương hiệu thời trang được 
                yêu thích trên toàn quốc.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Hành trình của chúng tôi được thúc đẩy bởi niềm đam mê thiết kế, cam kết về tính bền vững 
                và sự tận tâm với khách hàng. Chúng tôi cẩn thận lựa chọn nguyên vật liệu và hợp tác với 
                các nhà sản xuất có đạo đức để đảm bảo mỗi sản phẩm không chỉ đẹp mà còn có giá trị nhân văn.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Hơn 1 triệu khách hàng đã tin chọn Kandy cho phong cách của mình. Chúng tôi tự hào là 
                thương hiệu thời trang Việt Nam vươn tầm quốc tế.
              </p>
              <Link to="/products" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Khám phá bộ sưu tập
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sứ mệnh & Tầm nhìn */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Sứ mệnh</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Truyền cảm hứng tự tin và thể hiện cá tính thông qua thời trang chất lượng cao, dễ tiếp cận. 
                Chúng tôi nỗ lực để mỗi khách hàng cảm thấy đẹp và tự tin trong làn da của mình.
              </p>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Tầm nhìn</h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Trở thành thương hiệu thời trang bền vững hàng đầu Đông Nam Á, thiết lập tiêu chuẩn mới 
                về sản xuất có đạo đức và thiết kế sáng tạo trong ngành bán lẻ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Giá trị cốt lõi</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Những giá trị định hình mọi hoạt động và phát triển của Kandy
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: <Shield className="w-8 h-8 text-blue-600" />, 
                title: 'Chất lượng', 
                desc: 'Cam kết về chất lượng vượt trội trong từng sản phẩm' 
              },
              { 
                icon: <Heart className="w-8 h-8 text-red-500" />, 
                title: 'Tận tâm', 
                desc: 'Đặt khách hàng làm trung tâm của mọi quyết định' 
              },
              { 
                icon: <RefreshCw className="w-8 h-8 text-green-600" />, 
                title: 'Sáng tạo', 
                desc: 'Không ngừng đổi mới và cập nhật xu hướng mới' 
              },
              { 
                icon: <Users className="w-8 h-8 text-purple-600" />, 
                title: 'Cộng đồng', 
                desc: 'Xây dựng cộng đồng yêu thời trang vững mạnh' 
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Thành tựu */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">13+</div>
              <p className="text-blue-100">Năm kinh nghiệm</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <p className="text-blue-100">Khách hàng</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <p className="text-blue-100">Cửa hàng</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <p className="text-blue-100">Đối tác</p>
            </div>
          </div>
        </div>
      </section>

      {/* Đội ngũ */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Đội ngũ của chúng tôi</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Những con người tâm huyết tạo nên thành công của Kandy
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Nguyễn Thị Hương', role: 'Nhà sáng lập & CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400' },
              { name: 'Trần Minh Tuấn', role: 'Giám đốc Thiết kế', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
              { name: 'Lê Thị Mai', role: 'Giám đốc Marketing', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400' },
              { name: 'Phạm Văn Đức', role: 'Giám đốc Vận hành', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
            ].map((member, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                    <p className="text-white text-sm">{member.role}</p>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-gray-500 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cam kết */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Cam kết của chúng tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Giao hàng nhanh chóng</h3>
              <p className="text-gray-500">Miễn phí vận chuyển cho đơn hàng từ 500.000 VNĐ</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Đổi trả dễ dàng</h3>
              <p className="text-gray-500">Đổi trả trong vòng 30 ngày nếu sản phẩm có lỗi</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hỗ trợ 24/7</h3>
              <p className="text-gray-500">Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}