const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  pickupCity: {
    type: String,
    required: true
  },
  dropCity: {
    type: String,
    required: true
  },
  rideType: {
    type: String,
    enum: ['One Way', 'Two Way', 'Local'],
    required: true
  },
  carType: {
    type: String,
    enum: ['Sedan', 'SUV', 'Innova'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Payment_Verified_OTP_Sent', 'OTP_Verified', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  calculatedPrice: {
    type: Number,
    required: true
  },
  estimatedPrice: {
    type: Number
  },
  actualPrice: {
    type: Number
  },
  distanceEstimateKM: {
    type: Number
  },
  rideDate: {
    type: Date,
    required: true
  },
  rideTime: {
    type: String, // HH:MM format
    required: true
  },
  otp: {
    type: String
  },
  otpExpiresAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
