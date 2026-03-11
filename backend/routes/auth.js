const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, createSubAdmin, updateProfile } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/create-subadmin', protect, restrictTo('superadmin'), createSubAdmin);


module.exports = router;
