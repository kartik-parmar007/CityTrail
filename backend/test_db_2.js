const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const logFile = 'my_log.txt';
function log(msg) {
  fs.appendFileSync(logFile, msg + '\n', 'utf8');
}

log('Connecting to: ' + process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    log('SUCCESS: Connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    log('ERROR: Failed to connect to MongoDB');
    log(err.message);
    log(err.stack);
    process.exit(1);
  });
