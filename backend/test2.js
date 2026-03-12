console.log("Starting test...");
const mongoose = require("mongoose");
console.log("Mongoose loaded.");

mongoose.connect("mongodb://localhost:27017/citytrail")
  .then(async () => {
    console.log("Connected to DB.");
    const User = require("./models/User");
    const u = await User.findOne();
    console.log(u ? "User exists" : "No user");
    
    const Booking = require("./models/Booking");
    const b = await Booking.findOne();
    console.log(b ? "Booking exists: " + b._id : "No booking");
    
    process.exit(0);
  })
  .catch(e => {
    console.log("Error:", e);
    process.exit(1);
  });
