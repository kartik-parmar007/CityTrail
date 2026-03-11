const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log('Connecting to:', uri);

mongoose.connect(uri)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR: Failed to connect to MongoDB', err.message);
    process.exit(1);
  });
