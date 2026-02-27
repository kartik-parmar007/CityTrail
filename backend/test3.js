require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const client = new MongoClient(process.env.MONGO_URL);
client.connect()
    .then(() => {
        fs.writeFileSync('error.log', 'Connected successfully');
        process.exit(0);
    })
    .catch(err => {
        fs.writeFileSync('error.log', err.stack || err.toString());
        process.exit(1);
    });
