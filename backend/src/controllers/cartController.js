const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    
    if (!cart) {
      cart = { userId: req.user._id, items: [] };
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // **NEW: Check stock before adding**
    const totalQuantity = quantity;
    if (product.stock < totalQuantity) {
      return res.status(400).json({
        success: false,
        message: `Hết hàng! Chỉ còn ${product.stock} sản phẩm trong kho`
      });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      item => 
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItem) {
      // Increment quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        size,
        color
      });
    }

    await cart.save();
    
    // Populate product details before sending response
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Product added to cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found in cart' 
      });
    }

    if (quantity <= 0) {
      item.remove();
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    
    // Populate product details before sending response
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Cart item updated',
      data: cart
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }

    // Remove the item
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    await cart.save();
    
    // Populate product details before sending response
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
