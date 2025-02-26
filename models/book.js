const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    genre: String,
    price: Number,
    stock: Number,
    coverUrl: { type: String, default: 'https://via.placeholder.com/150' } // Default placeholder image
});

module.exports = mongoose.model('Book', bookSchema);