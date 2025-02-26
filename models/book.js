const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    genre: String,
    price: Number,
    stock: Number
});

module.exports = mongoose.model('Book', bookSchema);