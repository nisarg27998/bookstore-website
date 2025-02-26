const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String, // In production, hash this!
    isAdmin: { type: Boolean, default: false },
    cart: [{ bookId: mongoose.Schema.Types.ObjectId, quantity: Number }],
    orders: [{ books: [{ bookId: mongoose.Schema.Types.ObjectId, quantity: Number }], date: Date }]
});

module.exports = mongoose.model('User', userSchema);