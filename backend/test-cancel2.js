const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');

async function testCancel() {
    try {
        await mongoose.connect('mongodb://localhost:27017/citytrail');
        const Booking = require('./models/Booking');
        const User = require('./models/User');
        
        const booking = await Booking.findOne({ status: { $ne: 'Cancelled' } });
        if (!booking) {
             console.log("No non-cancelled booking to test.");
             return process.exit(0);
        }
        console.log("Found booking:", booking._id);
        
        const user = await User.findById(booking.user);
        if (!user) {
             console.log("No user for booking.");
             return process.exit(0);
        }
        
        // Login
        const res1 = await axios.post('http://localhost:5000/api/auth/login', {
            email: user.email,
            password: 'password123'
        });
        
        const token = res1.data.token;
        console.log("Token obtained");
        
        // Cancel
        const res2 = await axios.post('http://localhost:5000/api/bookings/cancel', {
            id: booking._id
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Success:", res2.data);
    } catch (err) {
        console.error("Error Message:", err.response ? err.response.data : err.message);
    } finally {
        process.exit(0);
    }
}

testCancel();
