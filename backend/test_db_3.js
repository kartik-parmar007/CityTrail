const mongoose = require('mongoose');
const fs = require('fs');
const dns = require('dns');
require('dotenv').config();

// Force Google DNS to bypass potential local DNS issues for SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const logFile = 'my_log.txt';
function log(msg) {
  fs.appendFileSync(logFile, msg + '\n', 'utf8');
}

log('\n--- Retrying with Google DNS ---');
log('Connecting to: ' + process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    log('SUCCESS: Connected to MongoDB via 8.8.8.8');
    process.exit(0);
  })
  .catch(err => {
    log('ERROR: Failed to connect to MongoDB');
    log(err.message);
    log(err.stack);
    process.exit(1);
  });
