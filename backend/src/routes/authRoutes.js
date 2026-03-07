const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.fields([{ name: 'avatar', maxCount: 1 }]), (req, res, next) => {
    // Debug: log what multer parsed
    console.log('Multer parsed - req.body:', req.body);
    console.log('Multer parsed - req.files:', req.files);
    
    // If there was a file, it will be in req.files
    // Move to req.file for controller compatibility
    if (req.files && req.files['avatar'] && req.files['avatar'].length > 0) {
      req.file = req.files['avatar'][0];
    }
    next();
  }, updateUserProfile);

module.exports = router;
