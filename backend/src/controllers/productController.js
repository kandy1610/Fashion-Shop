const Product = require('../models/Product');

// @desc    Get featured products (lấy 4 sản phẩm đầu tiên)
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    
    // Lấy 4 sản phẩm đầu tiên (có thể sắp xếp theo ngày tạo mới nhất)
    const products = await Product.find({})
      .sort({ createdAt: -1 }) // Sắp xếp sản phẩm mới nhất lên đầu
      .limit(limit)
      .select('name price images slug');
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Export all product controllers
module.exports = {
  getFeaturedProducts
  // Thêm các controller khác ở đây nếu có
};