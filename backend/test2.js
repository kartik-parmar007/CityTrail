const fs = require('fs');
require('dotenv').config();
fs.writeFileSync('env.log', `URL: ${process.env.MONGO_URL}
DB: ${process.env.DB_NAME}`);
