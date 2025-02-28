const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    genre: String,
    price: Number,
    stock: Number,
    coverUrl: String,
    description: String, // Detailed book description
    authorBio: String,   // Author biography
    ratings: {          // Average rating and count
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model('Book', bookSchema);