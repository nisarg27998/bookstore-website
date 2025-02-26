const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Book = require('../models/book');

const app = express();

mongoose.connect('mongodb://localhost/bookstore', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// API to get all books
app.get('/api/books', async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});