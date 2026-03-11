const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');

async function testCancel() {
    try {
        await mongoose.connect('mongodb://localhost:27017/citytrail');
        const Booking = require('./models/Booking');
        const User = require('./models/User');
        
        const booking = await Booking.findOne();
        if (!booking) {
            fs.writeFileSync('err.txt', 'No booking');
            return;
        }
        
        const user = await User.findById(booking.user);
        if (!user) {
            fs.writeFileSync('err.txt', 'No user');
            return;
        }
        
        // Login as the user
        const res1 = await axios.post('http://localhost:5000/api/auth/login', {
            email: user.email,
            password: 'password123' // assuming standard password
        }).catch(err => {
            fs.writeFileSync('err.txt', 'Login failed: ' + err.message);
            throw err;
        });
        
        const token = res1.data.token;
        
        // Cancel the booking
        const res2 = await axios.post('http://localhost:5000/api/bookings/cancel', {
            id: booking._id
        }, {
            headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
            fs.writeFileSync('err.txt', 'Cancel Failed: ' + (err.response ? JSON.stringify(err.response.data) : err.message));
            throw err;
        });
        
        fs.writeFileSync('err.txt', 'Cancel Success: ' + JSON.stringify(res2.data));
    } catch (err) {
        fs.writeFileSync('err.txt', 'Exception: ' + err.toString());
    } finally {
        process.exit(0);
    }
}

testCancel();
