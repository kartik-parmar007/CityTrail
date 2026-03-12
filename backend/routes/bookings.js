const express = require('express');
const router = express.Router();
const { 
    calculatePrice, 
    createBooking, 
    verifyOtp, 
    getMyBookings, 
    updateBookingStatus, 
    getAllBookings,
    cancelBooking,
    resendOtp,
    sendOtpToUser,
    updateBookingPrice
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/calculate', calculatePrice);
router.post('/create', protect, restrictTo('user', 'superadmin', 'subadmin'), createBooking);
router.post('/verify-otp', protect, restrictTo('user', 'superadmin', 'subadmin'), verifyOtp);
router.post('/cancel', protect, restrictTo('user', 'superadmin', 'subadmin'), cancelBooking);
router.post('/resend-otp', protect, restrictTo('user', 'superadmin', 'subadmin'), resendOtp);
router.post('/send-user-otp', protect, restrictTo('superadmin', 'subadmin'), sendOtpToUser);

router.get('/my-bookings', protect, restrictTo('user', 'superadmin', 'subadmin'), getMyBookings);

// Assuming admins can update status anytime
// This is a simplified permission config
router.put('/:id/status', protect, restrictTo('superadmin', 'subadmin'), updateBookingStatus);
router.put('/:id/price', protect, restrictTo('superadmin', 'subadmin'), updateBookingPrice);
router.get('/', protect, restrictTo('superadmin', 'subadmin'), getAllBookings);

module.exports = router;
