const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    
    const products = await Product.find({})
      .sort({ createdAt: -1 })
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

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      category,
      subCategory,
      images,
      colors,
      sizes,
      tags,
      sku,
      stock,
      isBestseller,
      isFeatured,
      discount
    } = req.body;

    // Check if product with same slug exists
    const productExists = await Product.findOne({ slug });
    if (productExists) {
      return res.status(400).json({
        success: false,
        message: 'Product with this slug already exists'
      });
    }

    // Check if SKU exists
    if (sku) {
      const skuExists = await Product.findOne({ sku });
      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      subCategory,
      images: images || [],
      colors: colors || [],
      sizes: sizes || [],
      tags: tags || [],
      sku,
      stock: stock || 0,
      isBestseller: isBestseller || false,
      isFeatured: isFeatured || false,
      discount: discount || 0
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      slug,
      description,
      price,
      category,
      subCategory,
      images,
      colors,
      sizes,
      tags,
      sku,
      stock,
      isBestseller,
      isFeatured,
      discount
    } = req.body;

    // Check if new slug conflicts with another product
    if (slug && slug !== product.slug) {
      const slugExists = await Product.findOne({ slug });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'Product with this slug already exists'
        });
      }
    }

    // Check if new SKU conflicts with another product
    if (sku && sku !== product.sku) {
      const skuExists = await Product.findOne({ sku });
      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    product.name = name || product.name;
    product.slug = slug || product.slug;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.category = category || product.category;
    product.subCategory = subCategory !== undefined ? subCategory : product.subCategory;
    product.images = images || product.images;
    product.colors = colors || product.colors;
    product.sizes = sizes || product.sizes;
    product.tags = tags || product.tags;
    product.sku = sku !== undefined ? sku : product.sku;
    product.stock = stock !== undefined ? stock : product.stock;
    product.isBestseller = isBestseller !== undefined ? isBestseller : product.isBestseller;
    product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.discount = discount !== undefined ? discount : product.discount;

    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all products (admin)
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });

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
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin
};
