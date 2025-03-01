const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true }, // 1-5 stars
    comment: { type: String, default: '' }, // Optional review text
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);