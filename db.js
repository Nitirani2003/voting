const mongoose = require('mongoose');
require('dotenv').config();
//const mongoURL = 'mongodb://127.0.0.1:27017/restaurants';
//const mongoURL = 'mongodb+srv://HemloNiti:niti@cluster0.9qpvk1h.mongodb.net/';
const mongoURL = process.env.MONGODB_URL_LOCAL;
//const mongoURL = process.env.MONGODB_URL;
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000
})
const db = mongoose.connection;
db.on('connected', () => {
    console.log('connected to MongoDB server');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
db.on('disconnected', () => {
    console.error('MongoDB disconnected:');
});
//Export the database connection
module.exports = db;