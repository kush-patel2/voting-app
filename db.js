const mongoose = require('mongoose');
require('dotenv').config();
const mongoURL = process.env.DB_URL_LOCAL;
// const mongoURL = process.env.DB_URL;

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});



//Get default connection
//Mongoose maintains default connection object representing  the MongoDb connection

const db= mongoose.connection;

//Define event listeners for database connection

db.on('connected', () => {
    console.log('Connected to MongoDB server.');
});

db.on('error', (err) => {
    console.log('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected.');
});

module.exports = db;
