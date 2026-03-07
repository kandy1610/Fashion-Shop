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

type ChatStep = 'gender' | 'category' | 'price' | 'result' | 'finished';

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
    setPreferences({ gender: '', category: '', minPrice: 0, maxPrice: 99999999 });
    setMessages([
      {
        id: Date.now(),
        role: 'bot',
        content: 'OK! Hãy bắt đầu lại nhé. Bạn muốn tìm sản phẩm cho ai?',
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    addMessage('user', input);
    setInput('');
    
    // Simple keyword matching for natural language
    const text = input.toLowerCase();
    if (text.includes('nam') && !text.includes('nữ')) {
      handleGenderSelect('nam');
    } else if (text.includes('nữ')) {
      handleGenderSelect('nữ');
    } else if (text.includes('trẻ') || text.includes('bé')) {
      handleGenderSelect('trẻ em');
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

              {/* Options */}
              {step !== 'result' && step !== 'finished' && (
                <div className="p-3 border-t border-gray-100">
                  {step === 'gender' && (
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
                  )}
                  {step === 'category' && (
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
                  )}
                  {step === 'price' && (
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
                  )}
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

