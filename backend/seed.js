const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const connectDB = require('./src/config/database');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    
    console.log('Cleared existing data');

    // Create categories
    const categories = [
      { name: 'Nam', slug: 'nam', image: 'nam-image-url' },
      { name: 'Nữ', slug: 'nu', image: 'nu-image-url' },
      { name: 'Trẻ em', slug: 'tre-em', image: 'tre-em-image-url' }
    ];
    
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories seeded');

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'KANDY',
      email: 'admin@kandy.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create sample products
    const products = [
      {
    name: 'Set áo thun bóng rổ thời trang KICIFA',
    slug: 'set-ao-thun-bong-ro-kicifa',
    description: 'Set áo thun bóng rổ phong cách, thấm hút mồ hôi, chất liệu mềm mịn. Hình in trẻ trung, năng động, thoải mái vận động.',
    price: 299000,
    originalPrice: 440000,
    category: 'Nam',
    images: ['http://localhost:5000/uploads/image-kicifa-1.jpg', 'http://localhost:5000/uploads/image-kicifa-2.jpg'],
    colors: ['Đen', 'Trắng', 'Xanh Than', 'Ngẫu Nhiên'],
    sizes: ['S', 'M', 'L', 'XL'],
    sku: 'KC001',
    stock: 100,
    isBestseller: true,
    isFeatured: true,
    discount: 32,
    rating: 4.6,
    numReviews: 7
  },
  // Sản phẩm 4: Set áo thun bóng rổ JAVU (từ ảnh 2 - có bán riêng lẻ)
  {
    name: '[Ảnh Thật] Set áo thun bóng rổ JAVU BD-01',
    slug: 'set-ao-thun-bong-ro-javu-bd01',
    description: 'Set áo thun bóng rổ thời trang thấm hút JAVU mềm mịn. Hình In trẻ trung, năng động, thoải mái. Có bán lẻ áo hoặc set.',
    price: 139000,
    category: 'Nam',
    images: ['http://localhost:5000/uploads/image-javu-1.jpg', 'http://localhost:5000/uploads/image-javu-2.jpg'],
    colors: ['SET BỘ BD01Q1', 'SET BỘ BD02Q1', 'ÁO BD01', 'ÁO BD02'],
    sizes: ['M (50-63kg)', 'L (63-70kg)', 'XL (70-78kg)'],
    sku: 'JV001',
    stock: 200,
    isBestseller: true,
    isFeatured: true,
    discount: 0,
    rating: 4.6,
    numReviews: 1100
  },
  // Sản phẩm 5: Set quần áo nam cổ lớn Waffle (từ ảnh 3)
  {
    name: 'Set Quần áo nam ngắn tay mùa hè Waffle M003',
    slug: 'set-quan-ao-nam-waffle-m003',
    description: 'Set quần áo mùa hè rộng rãi, cổ lớn, chất liệu Waffle thoáng mát. Phong cách thường ngày cho nam.',
    price: 345600,
    originalPrice: 480000,
    category: 'Nam',
    images: ['http://localhost:5000/uploads/image-waffle-1.jpg', 'http://localhost:5000/uploads/image-waffle-2.jpg'],
    colors: ['XANH', 'Đen', 'Trắng'],
    sizes: ['S (40-50kg)', 'M (50-60kg)', 'L (60-70kg)', 'XL (70-85kg)', '2XL (85-100kg)'],
    sku: 'WF003',
    stock: 150,
    isBestseller: false,
    isFeatured: true,
    discount: 28,
    rating: 4.8,
    numReviews: 239
  },{
        name: 'Áo Thun Nữ Ngắn Tay, Áo Phông Chất Cotton Kẻ Sọc Đơn Gian Thời Trang Hè',
        slug: 'ao-thun-nu-cotton-ke-soc',
        description: 'Áo thun nữ ngắn tay chất cotton cao cấp, kiểu dáng kẻ sọc đơn giản, thời trang hè. Cam kết chất lượng 100% chính hãng. Giao hàng miễn phí. Sản phẩm được 656 lượt yêu thích. Đánh giá 4.6/5 với 614 đánh giá. FASH SALE bắt đầu sau 15:00. Miễn phí trả hàng 15 ngày, có bảo hiểm thời trang.',
        price: 58999,
        originalPrice: 118000,
        category: 'Nữ',
        images: [
          'http://localhost:5000/uploads/ao-thun-nu-soc-1.jpg',
          'http://localhost:5000/uploads/ao-thun-nu-soc-2.jpg'
        ],
        colors: ['Đen', 'Be', 'Đen + be'],
        sizes: ['M (<45kg, trên 1m45)', 'L (46-52kg, 1m5-1m6)', 'XL (53-59kg, 1m61-1m65)', '2XL (60-65kg, 1m66-1m7)'],
        tags: ['fashion', 'summer', 'cotton', 'sale'],
        sku: 'ATN001',
        stock: 150,
        rating: 4.6,
        numReviews: 614,
        isBestseller: true,
        isFeatured: true,
        discount: 50,
        freeShipping: true,
        returnDays: 15,
        voucher: 15000
      },
      
      // Product 2: Áo Thun Nam Nữ APT (from second screenshot)
      {
        name: 'Áo Thun Nam Nữ Thêu Hình APT Unisex Áo Polo Form Rộng Tay Lửng Mùa Hè 2024 Chất Liệu Cotton Tăm Mềm Mịn',
        slug: 'ao-thun-unisex-apt-form-rong',
        description: 'Áo thun unisex thêu hình APT, kiểu áo polo form rộng tay lửng mùa hè 2024. Chất liệu cotton tăm mềm mịn, thoáng mát. Đánh giá 4.7/5 với 1.6k đánh giá. Miễn phí vận chuyển, tặng voucher 15.000đ nếu giao chậm. Chính hãng 100%, trả hàng miễn phí 15 ngày. Đã có 2.5k lượt thích.',
        price: 136220,
        originalPrice: 180000,
        category: 'Trẻ em',
        images: [
          'http://localhost:5000/uploads/ao-thun-apt-1.jpg',
          'http://localhost:5000/uploads/ao-thun-apt-2.jpg'
        ],
        colors: ['Be', 'Nâu', 'Xanh'],
        sizes: ['M', 'L', 'XL'],
        tags: ['unisex', 'polo', 'summer', '2024'],
        sku: 'APT001',
        stock: 200,
        rating: 4.7,
        numReviews: 1600,
        isBestseller: true,
        isFeatured: true,
        discount: 24,
        freeShipping: true,
        returnDays: 15,
        voucher: 15000
      },
      
      // Product 3: Quần shorts kaki jean (from fourth screenshot)
      {
        name: 'Quần shorts kaki jean cạp cao, quần shorts nữ ống rộng sẵn gấu_C40',
        slug: 'quan-shorts-nu-kaki-c40',
        description: 'Quần shorts nữ chất liệu kaki jean, cạp cao, ống rộng sẵn gấu. Thiết kế thời trang, thoải mái. Đánh giá 4.9/5 với 156 đánh giá. Miễn phí vận chuyển, tặng voucher 15.000đ nếu giao chậm. Trả hàng miễn phí 15 ngày, có bảo hiểm thời trang. Đã có 1.8k lượt thích.',
        price: 129000,
        originalPrice: 149000,
        category: 'Nữ',
        images: [
          'http://localhost:5000/uploads/quan-shorts-c40-1.jpg',
          'http://localhost:5000/uploads/quan-shorts-c40-2.jpg'
        ],
        colors: ['Trắng', 'Xanh Nhạt', 'Đen', 'Nâu', 'Be'],
        sizes: ['S', 'M', 'L', 'XL'],
        tags: ['shorts', 'kaki', 'jean', 'summer'],
        sku: 'QN040',
        stock: 120,
        rating: 4.9,
        numReviews: 156,
        isBestseller: false,
        isFeatured: true,
        discount: 13,
        freeShipping: true,
        returnDays: 15,
        voucher: 15000
      },
      
      // Product 4: Bộ Quần Áo Nam Mùa Hè (from fifth screenshot)
      {
        name: 'Bộ Quần Áo Nam Mùa Hè Phối Sọc Chéo - Set Đồ Nữ Cotton Tổ Ong - Đồ Bộ Thể Thao Unisex Form Rộng Nam Nữ Đều Mặc Được',
        slug: 'bo-quan-ao-unisex-cotton-to-ong',
        description: 'Bộ quần áo mùa hè phối sọc chéo, chất liệu cotton tổ ong thoáng mát. Đồ bộ thể thao unisex form rộng phù hợp cả nam và nữ. Đánh giá 4.4/5 với 28 đánh giá. Miễn phí vận chuyển, tặng voucher 15.000đ nếu giao chậm. Trả hàng miễn phí 15 ngày, bảo hiểm thời trang. Đã có 133 lượt thích.',
        price: 175000,
        originalPrice: 210000,
        category: 'Trẻ em',
        images: [
          'http://localhost:5000/uploads/bo-do-unisex-1.jpg',
          'http://localhost:5000/uploads/bo-do-unisex-2.jpg'
        ],
        colors: ['Đen', 'Trắng', 'Be'],
        sizes: ['M', 'L', 'XL'],
        tags: ['set', 'sportswear', 'unisex', 'summer'],
        sku: 'BD001',
        stock: 80,
        rating: 4.4,
        numReviews: 447,
        isBestseller: false,
        isFeatured: false,
        discount: 17,
        freeShipping: true,
        returnDays: 15,
        voucher: 15000
      },
      
      // Product 5: Áo Khoác Kaki Cổ Đứng (from sixth screenshot)
      {
        name: 'Áo Khoác Kaki Cổ Đứng Nam Áo khoác công sở thường ngày dễ phối đồ dáng rộng mùa thu cho nam và nữ',
        slug: 'ao-khoac-kaki-co-dung-unisex',
        description: 'Áo khoác chất liệu kaki cổ đứng, phong cách công sở và thường ngày. Dáng rộng dễ phối đồ, phù hợp mùa thu cho cả nam và nữ. Đánh giá 4.4/5 với 28 đánh giá. FASH SALE bắt đầu sau 15:00. Nhiều mã giảm giá: giảm 30k, 20k, 16k, 14k, 12k. Trả hàng miễn phí 15 ngày. Đã có 169 lượt thích.',
        price: 484120,
        originalPrice: 0, // No original price shown
        category: 'Trẻ em',
        images: [
          'http://localhost:5000/uploads/ao-khoac-kaki-1.jpg',
          'http://localhost:5000/uploads/ao-khoac-kaki-2.jpg'
        ],
        colors: ['Đen', 'Kaki'],
        sizes: ['M', 'L', 'XL', 'XXL'],
        tags: ['jacket', 'kaki', 'autumn', 'office'],
        sku: 'AK001',
        stock: 50,
        rating: 4.4,
        numReviews: 28,
        isBestseller: false,
        isFeatured: true,
        discount: 0,
        freeShipping: false,
        returnDays: 15,
        voucher: 30000,
        coupons: [
          { code: 'GIAM30K', value: 30000 },
          { code: 'GIAM20K', value: 20000 },
          { code: 'GIAM16K', value: 16000 }
        ]
      },
      
      // Product 6: Set áo thun bóng rổ KICIFA (from image.png)
      {
        name: 'Set áo thun bóng rổ thời trang KICIFA Unisex Form Rộng Chất Liệu Cotton Thoáng Mát Thấm Hút Mồ Hôi',
        slug: 'set-ao-thun-bong-ro-kicifa',
        description: 'Set áo thun bóng rổ phong cách KICIFA, form rộng unisex. Chất liệu cotton cao cấp, thấm hút mồ hôi tốt, mềm mịn, thoải mái vận động. Cam kết chính hãng 100%. Miễn phí vận chuyển toàn quốc. Đánh giá 4.6/5 với 7 đánh giá. Hàng bán chạy, được yêu thích.',
        price: 299000,
        originalPrice: 440000,
        category: 'Trẻ em',
        images: [
          'http://localhost:5000/uploads/image-kicifa-1.jpg',
          'http://localhost:5000/uploads/image-kicifa-2.jpg'
        ],
        colors: ['Đen', 'Trắng', 'Xanh Thanh', 'Ngẫu Nhiên'],
        sizes: ['S', 'M', 'L', 'XL'],
        tags: ['basketball', 'sportswear', 'unisex', 'kicifa'],
        sku: 'KC001',
        stock: 100,
        rating: 4.6,
        numReviews: 7,
        isBestseller: true,
        isFeatured: true,
        discount: 32,
        freeShipping: true,
        returnDays: 15,
        voucher: 15000
      }
    ];

    await Product.insertMany(products);
    console.log('Products seeded');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();