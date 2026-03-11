require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']); // Custom DNS to fix local issues
const mongoose = require('mongoose');
const seedSuperAdmin = require('./utils/seedAdmin');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedSuperAdmin();
    console.log('Seeding complete. Exiting.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
