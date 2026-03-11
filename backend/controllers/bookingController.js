const Booking = require('../models/Booking');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const prices = {
    'Sedan': 11,
    'SUV': 12,
    'Innova': 18
};

const calculatePrice = async (req, res) => {
    const { distanceEstimateKM, carType, rideType } = req.body;
    let multiplier = 1;
    if (rideType === 'Two Way') multiplier = 2; // Rough estimate logic
    
    const rate = prices[carType] || 11;
    const price = distanceEstimateKM * rate * multiplier;

    res.json({ price });
};

const createBooking = async (req, res) => {
    try {
        const { pickupCity, dropCity, rideType, carType, distanceEstimateKM, rideDate, rideTime, price } = req.body;
        
        const booking = await Booking.create({
            user: req.user._id,
            pickupCity,
            dropCity,
            rideType,
            carType,
            calculatedPrice: price,
            distanceEstimateKM,
            rideDate,
            rideTime,
            status: 'Pending'
        });

        // Send OTP via Email to Sub Admins
        const admins = await User.find({ role: { $in: ['subadmin', 'superadmin'] } });
        const adminEmails = admins.map(a => a.email).filter(Boolean);

        if (adminEmails.length > 0) {
            const emailContent = `New Booking Request from ${req.user.name} (${req.user.phone}). Route: ${pickupCity} to ${dropCity}. Please contact the user for manual payment, then send the OTP from your dashboard.`;
            await sendEmail({
                email: adminEmails.join(','),
                subject: 'CityTrail Action Required: New Booking Request',
                text: emailContent,
                html: `<p><strong>New Booking Request Alert!</strong></p>
                <p>User: ${req.user.name} (${req.user.phone})</p>
                <p>Email: ${req.user.email}</p>
                <p>Route: ${pickupCity} to ${dropCity}</p>
                <p>Date & Time: ${rideDate} at ${rideTime}</p>
                <p>Vehicle: ${carType} (${rideType})</p>
                <br/>
                <p>Please contact the user to arrange manual payment. Once payment is confirmed, you can send the Security OTP from your Admin Dashboard.</p>`
            });
        }

        res.status(201).json({ bookingId: booking._id, message: 'Booking pending, Admins notified for payment verification' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { bookingId, otp } = req.body;
        const booking = await Booking.findById(bookingId);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        if (booking.otp !== otp || new Date() > booking.otpExpiresAt) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        booking.status = 'OTP_Verified'; // Admin/SubAdmin will later move this to Confirmed and Assigned
        booking.otp = undefined;
        booking.otpExpiresAt = undefined;
        await booking.save();

        // Send Confirmation Email
        await sendEmail({
            email: req.user.email,
            subject: 'CityTrail Booking Confirmed',
            text: 'Your booking has been verified successfully. Our team will contact you shortly.',
            html: `<p>Your booking has been verified successfully. Our team will contact you shortly.</p>`
        });

        res.json({ message: 'Booking verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (status) booking.status = status;

        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllBookings = async (req, res) => {
     try {
        const bookings = await Booking.find()
                                      .populate('user', 'name phone email')
                                      .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.body;
        const booking = await Booking.findById(id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        if (!booking.user || (booking.user.toString() !== req.user._id.toString() && !['subadmin', 'superadmin'].includes(req.user.role))) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        booking.status = 'Cancelled';
        booking.otp = undefined;
        booking.otpExpiresAt = undefined;
        await booking.save();
        
        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        if (!booking.user || booking.user.toString() !== req.user._id.toString()) {
             return res.status(403).json({ message: 'Not authorized' });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        booking.otp = otp;
        booking.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await booking.save();

        const admins = await User.find({ role: { $in: ['subadmin', 'superadmin'] } });
        const adminEmails = admins.map(a => a.email).filter(Boolean);

        if (adminEmails.length > 0) {
            await sendEmail({
                email: adminEmails.join(','),
                subject: 'CityTrail - OTP Resend Request',
                text: `User ${req.user.name} has requested the OTP again for booking ${bookingId}. New OTP is: ${otp}`,
                html: `<p>User ${req.user.name} has requested the OTP again. Route: ${booking.pickupCity} to ${booking.dropCity}. New OTP is: <strong style="font-size:20px; color:blue;">${otp}</strong></p>`
            });
        }

        res.json({ message: 'OTP sent to user successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const sendOtpToUser = async (req, res) => {
    try {
        const { id } = req.body;
        const booking = await Booking.findById(id).populate('user', 'name email phone');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        booking.otp = otp;
        booking.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        
        if (booking.user && booking.user.email) {
            const emailSent = await sendEmail({
                email: booking.user.email,
                subject: 'CityTrail - Your Ride Security OTP',
                text: `Dear ${booking.user.name}, your payment is verified. Your ride OTP is: ${otp}. Please enter this in your dashboard to confirm your booking.`,
                html: `<p>Dear ${booking.user.name},</p>
                <p>Your payment has been verified. To confirm your booking, please use the following OTP in your dashboard:</p>
                <p><strong style="font-size:24px; color:green;">${otp}</strong></p>
                <p>This OTP is valid for 15 minutes.</p>`
            });
            
            if (!emailSent) {
                console.error(`Failed to send OTP email to ${booking.user.email}. OTP: ${otp}`);
                // We still save the OTP so admin can provide it manually
            }
        }

        booking.status = 'Payment_Verified_OTP_Sent'; 
        await booking.save();

        res.json({ message: 'OTP generated and sent to user successfully', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
    } catch (error) {
        console.error('Error in sendOtpToUser:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    calculatePrice,
    createBooking,
    verifyOtp,
    getMyBookings,
    updateBookingStatus,
    getAllBookings,
    cancelBooking,
    resendOtp,
    sendOtpToUser
};
