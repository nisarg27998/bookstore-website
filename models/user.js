const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    cart: [{ bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }, quantity: Number }],
    orders: [{
        books: [{ bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }, quantity: Number }],
        date: { type: Date, default: Date.now },
        total: Number
    }]
});

module.exports = mongoose.model('User', userSchema);