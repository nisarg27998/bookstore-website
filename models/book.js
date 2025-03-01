const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    genre: String, // Not marked as required, but could still cause issues if expected
    price: Number,
    stock: Number,
    coverUrl: String,
    description: String,
    authorBio: String,
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    category: { type: String, required: true }
});

module.exports = mongoose.model('Book', bookSchema);