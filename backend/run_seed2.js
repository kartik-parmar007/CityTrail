require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']); // Custom DNS to fix local issues
const mongoose = require('mongoose');
const seedSuperAdmin = require('./utils/seedAdmin');
const fs = require('fs');

const logFile = 'seed_log.txt';
function log(msg) {
  fs.appendFileSync(logFile, msg + '\n', 'utf8');
}

log('Starting seeder...');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    log('Connected to MongoDB');
    try {
      await seedSuperAdmin();
      log('Seeding complete. Exiting.');
    } catch (e) {
      log('Error during seeding: ' + e.message);
    }
    process.exit(0);
  })
  .catch((err) => {
    log('Failed to connect to MongoDB: ' + err.message);
    process.exit(1);
  });
