import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
}

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  content: string;
  products?: Product[];
}

type ChatStep = 'gender' | 'category' | 'price' | 'result' | 'finished' | 'help' | 'search';

const genderOptions = [
  { value: 'nam', label: 'Nam' },
  { value: 'nữ', label: 'Nữ' },
  { value: 'nam-nữ', label: 'Nam - Nữ' },
  { value: 'trẻ em', label: 'Trẻ em' },
];

const categoryOptions = [
  { value: 'áo', label: 'Áo' },
  { value: 'quần', label: 'Quần' },
  { value: 'váy', label: 'Váy' },
  { value: 'jacket', label: 'Áo khoác' },
  { value: 'shorts', label: 'Quần short' },
];

const priceRanges = [
  { value: '0-200000', label: 'Dưới 200K' },
  { value: '200000-500000', label: '200K - 500K' },
  { value: '500000-1000000', label: '500K - 1 triệu' },
  { value: '1000000-99999999', label: 'Trên 1 triệu' },
];

const helpOptions = [
  { value: 'howtobuy', label: 'Cách mua hàng' },
  { value: 'payment', label: 'Thanh toán' },
  { value: 'shipping', label: 'Vận chuyển' },
  { value: 'return', label: 'Đổi trả' },
  { value: 'contact', label: 'Liên hệ' },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<ChatStep>('gender');
  const [preferences, setPreferences] = useState({
    gender: '',
    category: '',
    minPrice: 0,
    maxPrice: 99999999,
  });
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when opened for first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          role: 'bot',
          content: 'Xin chào! 👋 Tôi là trợ lý mua sắm của shop. Tôi có thể giúp bạn tìm sản phẩm phù hợp với nhu cầu.',
        },
        {
          id: 2,
          role: 'bot',
          content: 'Bạn muốn tìm sản phẩm cho ai?',
        },
      ]);
    }
  }, [isOpen]);

  const showHelpOptions = () => {
    setStep('help');
    addMessage('bot', 'Bạn cần hỗ trợ gì? Chọn một trong các mục dưới đây nhé!');
  };

  const addMessage = (role: 'user' | 'bot', content: string, products?: Product[]) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role, content, products },
    ]);
  };

  const searchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      // Use category as search term to find products by name/description
      // e.g., "áo" will search for products with "áo" in name/description
      if (preferences.category) {
        params.search = preferences.category;
      }
      
      // Filter by gender (Nam, Nữ, Trẻ em) if selected
      // For "nam-nữ", we don't filter by category (show all)
      if (preferences.gender && preferences.gender !== 'nam-nữ') {
        params.category = preferences.gender;
      }
      
      if (preferences.minPrice > 0) {
        params.minPrice = preferences.minPrice;
      }
      
      if (preferences.maxPrice < 99999999) {
        params.maxPrice = preferences.maxPrice;
      }

      console.log('Searching with params:', params);
      const response = await axios.get('/products', { params });
      console.log('Search response:', response.data);
      
      if (response.data.success && response.data.data?.length > 0) {
        addMessage('bot', `Tôi đã tìm thấy ${response.data.data.length} sản phẩm phù hợp cho bạn:`, response.data.data.slice(0, 4));
      } else {
        addMessage('bot', 'Xin lỗi, không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn. Bạn có muốn tìm kiếm sản phẩm khác không?');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      addMessage('bot', 'Đã xảy ra lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenderSelect = (gender: string) => {
    addMessage('user', gender === 'nam' ? 'Nam' : gender === 'nữ' ? 'Nữ' : gender === 'nam-nữ' ? 'Nam - Nữ' : 'Trẻ em');
    setPreferences((prev) => ({ ...prev, gender }));
    setStep('category');
    setTimeout(() => {
      addMessage('bot', 'Bạn đang tìm loại sản phẩm nào?');
    }, 300);
  };

  const handleCategorySelect = (category: string) => {
    addMessage('user', category === 'áo' ? 'Áo' : category === 'quần' ? 'Quần' : category === 'váy' ? 'Váy' : category === 'jacket' ? 'Áo khoác' : 'Quần short');
    setPreferences((prev) => ({ ...prev, category }));
    setStep('price');
    setTimeout(() => {
      addMessage('bot', 'Mức giá bạn mong muốn là bao nhiêu?');
    }, 300);
  };

  const handlePriceSelect = (range: string) => {
    const [min, max] = range.split('-').map(Number);
    addMessage('user', range === '0-200000' ? 'Dưới 200K' : range === '200000-500000' ? '200K - 500K' : range === '500000-1000000' ? '500K - 1 triệu' : 'Trên 1 triệu');
    setPreferences((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
    setStep('result');
    searchProducts();
  };

  const handleRestart = () => {
    setStep('gender');
    setShowOptions(true);
    setPreferences({ gender: '', category: '', minPrice: 0, maxPrice: 99999999 });
    setMessages([
      {
        id: Date.now(),
        role: 'bot',
        content: 'OK! Hãy bắt đầu lại nhé. Bạn muốn tìm sản phẩm cho ai?',
      },
    ]);
  };

  // Direct search function
  const handleDirectSearch = async (searchQuery: string) => {
    setStep('search');
    setLoading(true);
    try {
      const response = await axios.get('/products', { 
        params: { search: searchQuery } 
      });
      
      if (response.data.success && response.data.data?.length > 0) {
        addMessage('bot', `Tôi đã tìm thấy ${response.data.data.length} sản phẩm cho "${searchQuery}":`, response.data.data.slice(0, 4));
      } else {
        addMessage('bot', `Xin lỗi, không tìm thấy sản phẩm nào cho "${searchQuery}". Bạn thử từ khóa khác nhé!`);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      addMessage('bot', 'Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    setShowOptions(false);
    addMessage('bot', '🔍 Bạn muốn tìm sản phẩm gì? Hãy nhập từ khóa nhé!');
  };

  const handleHelpSelect = (helpType: string) => {
    // Hide options after selecting and change step to hide help options
    setShowOptions(false);
    setStep('gender'); // Change step to hide help options
    
    let content = '';
    switch (helpType) {
      case 'howtobuy':
        content = '**Cách mua hàng:**\n\n1. Tìm sản phẩm bạn muốn mua\n2. Nhấn "Thêm vào giỏ" để cho vào giỏ hàng\n3. Vào giỏ hàng kiểm tra sản phẩm\n4. Nhấn "Tiếp tục thanh toán"\n5. Điền thông tin giao hàng\n6. Chọn phương thức thanh toán\n7. Xác nhận đặt hàng';
        break;
      case 'payment':
        content = '**Phương thức thanh toán:**\n\n• **COD** - Thanh toán khi nhận hàng\n• **Chuyển khoản** - Chuyển khoản ngân hàng\n• **Ví điện tử** - Momo, ZaloPay\n\nShop chấp nhận các ngân hàng: VCB, MB, ACB và nhiều ngân hàng khác.';
        break;
      case 'shipping':
        content = '**Vận chuyển:**\n\n• Giao hàng nhanh 2-3 ngày\n• Phí vận chuyển: 30.000 VNĐ/đơn\n• Miễn phí vận chuyển cho đơn hàng từ 500.000 VNĐ\n\nShop giao hàng toàn quốc!';
        break;
      case 'return':
        content = '**Chính sách đổi trả:**\n\n• Đổi trả trong 7 ngày kể từ ngày nhận hàng\n• Sản phẩm còn nguyên tag, chưa qua sử dụng\n• Liên hệ hotline để được hướng dẫn đổi trả\n\nQuý khách vui lòng giữ hóa đơn mua hàng!';
        break;
      case 'contact':
        content = '**Liên hệ:**\n\n• Hotline: 1900 0000\n• Email: support@kandyfashion.com\n• Fanpage: KANDY Fashion\n\nGiờ mở cửa: 8h - 21h (T2 - CN)';
        break;
    }
    addMessage('user', helpOptions.find(h => h.value === helpType)?.label || '');
    setTimeout(() => {
      addMessage('bot', content);
    }, 300);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // If in search mode, do direct search
    if (step === 'search') {
      handleDirectSearch(input);
      setInput('');
      return;
    }
    
    addMessage('user', input);
    setInput('');
    
    // Simple keyword matching for natural language
    const text = input.toLowerCase();
    if (text.includes('cách mua') || text.includes('hướng dẫn') || text.includes('mua hàng')) {
      handleHelpSelect('howtobuy');
    } else if (text.includes('thanh toán') || text.includes('trả tiền')) {
      handleHelpSelect('payment');
    } else if (text.includes('vận chuyển') || text.includes('giao hàng') || text.includes('ship')) {
      handleHelpSelect('shipping');
    } else if (text.includes('đổi') || text.includes('trả')) {
      handleHelpSelect('return');
    } else if (text.includes('liên hệ') || text.includes('contact') || text.includes('hotline')) {
      handleHelpSelect('contact');
    } else if (text.includes('nam') && !text.includes('nữ')) {
      handleGenderSelect('nam');
    } else if (text.includes('nữ')) {
      handleGenderSelect('nữ');
    } else if (text.includes('trẻ') || text.includes('bé')) {
      handleGenderSelect('trẻ em');
    } else if (text.includes('tìm') || text.includes('kiếm') || text.includes('search')) {
      handleSearchClick();
    } else if (text.includes('áo')) {
      handleCategorySelect('áo');
    } else if (text.includes('quần')) {
      handleCategorySelect('quần');
    } else if (text.includes('váy')) {
      handleCategorySelect('váy');
    } else if (text.includes('khoác')) {
      handleCategorySelect('jacket');
    } else if (text.includes('200') || text.includes('rẻ')) {
      handlePriceSelect('0-200000');
    } else if (text.includes('500') || text.includes('1 triệu') || text.includes('1tr')) {
      handlePriceSelect('500000-1000000');
    } else if (text.includes('giúp') || text.includes('help') || text.includes('?') || text.includes('tư vấn')) {
      setStep('help');
      setTimeout(() => {
        addMessage('bot', 'Bạn cần hỗ trợ gì? Chọn một trong các mục dưới đây nhé!');
      }, 300);
    } else {
      setTimeout(() => {
        addMessage('bot', 'Tôi không hiểu ý bạn. Bạn có thể chọn từ các tùy chọn bên dưới hoặc nhập lại nhé!');
      }, 300);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all ${
          isOpen ? 'hidden' : 'animate-bounce'
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
          }`}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-xl cursor-pointer"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Trợ lý mua sắm</h3>
                <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <button className="text-white/80 hover:text-white">
              {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      
                      {/* Products Grid */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.products.map((product) => (
                            <Link
                              key={product._id}
                              to={`/product/${product.slug}`}
                              className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50"
                            >
                              <img
                                src={product.images[0] || 'https://via.placeholder.com/50'}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs font-semibold text-blue-600">
                                  {product.price.toLocaleString('vi-VN')} VNĐ
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 rounded-bl-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Toggle Options Button - Show when options are hidden */}
              {!showOptions && step !== 'result' && step !== 'finished' && (
                <div className="p-2 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setShowOptions(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Hiện các lựa chọn
                  </button>
                </div>
              )}

              {/* Options - Hide when showOptions is false */}
              {showOptions && step !== 'result' && step !== 'finished' && step !== 'help' && (
                <div className="p-3 border-t border-gray-100">
                  {step === 'gender' && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-1">Tìm sản phẩm:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {genderOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleGenderSelect(opt.value)}
                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {step === 'category' && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-1">Chọn loại sản phẩm:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleCategorySelect(opt.value)}
                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {step === 'price' && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-1">Chọn mức giá:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {priceRanges.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handlePriceSelect(opt.value)}
                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={showHelpOptions}
                    className="w-full mt-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    💬 Bạn cần hỗ trợ khác?
                  </button>
                </div>
              )}

              {/* Help Options */}
              {step === 'help' && (
                <div className="p-3 border-t border-gray-100">
                  <div className="space-y-2">
                    {helpOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleHelpSelect(opt.value)}
                        className="w-full px-3 py-2 text-sm text-left bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setStep('gender');
                      setShowOptions(true);
                      setMessages([
                        {
                          id: Date.now(),
                          role: 'bot',
                          content: 'OK! Hãy bắt đầu lại nhé. Bạn muốn tìm sản phẩm cho ai?',
                        },
                      ]);
                    }}
                    className="w-full mt-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ← Quay lại tìm sản phẩm
                  </button>
                </div>
              )}

              {/* Restart Button */}
              {step === 'result' && (
                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={handleRestart}
                    className="w-full px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Tìm kiếm khác
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-3 -left-3 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

