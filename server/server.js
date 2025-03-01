const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const Book = require('../models/book');
const User = require('../models/user');
const Review = require('../models/review'); // New import

const app = express();

mongoose.connect('mongodb://localhost/bookstore', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.userId) return next();
    res.status(401).json({ error: 'Please log in.' });
}

function isAdmin(req, res, next) {
    User.findById(req.session.userId).then(user => {
        if (user && user.isAdmin) return next();
        res.status(403).json({ error: 'Admin access required.' });
    }).catch(() => res.status(500).json({ error: 'Server error' }));
}

async function initializeAdminUser() {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'AdminPass123';

    try {
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const adminUser = new User({
                firstName: 'Admin',
                lastName: 'User',
                email: adminEmail,
                password: hashedPassword,
                isAdmin: true
            });
            await adminUser.save();
            console.log('Default admin user created: admin@example.com / AdminPass123');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

mongoose.connection.once('open', () => {
    initializeAdminUser();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/cart.html'));
});

app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/account.html'));
});

app.get('/admin', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/orders', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/orders.html'));
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/profile.html'));
});

app.get('/api/books', async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

app.post('/api/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ firstName, lastName, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Email is already registered.' });
        } else {
            res.status(400).json({ error: 'Registration failed: ' + error.message });
        }
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        res.json({ message: 'Logged in', isAdmin: user.isAdmin });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
});

app.get('/api/user-status', async (req, res) => {
    if (!req.session.userId) {
        return res.json({ isLoggedIn: false, isAdmin: false, firstName: null });
    }
    const user = await User.findById(req.session.userId);
    res.json({ isLoggedIn: true, isAdmin: user.isAdmin, firstName: user.firstName });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.json({ message: 'Logged out' });
    });
});

app.post('/api/cart', isAuthenticated, async (req, res) => {
    const { bookId, quantity } = req.body;
    const user = await User.findById(req.session.userId);
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.stock < quantity) {
        return res.status(400).json({ error: `Not enough stock for ${book.title}. Available: ${book.stock}` });
    }

    const cartItem = user.cart.find(item => item.bookId.toString() === bookId);
    if (cartItem) {
        cartItem.quantity = quantity;
    } else {
        user.cart.push({ bookId, quantity });
    }
    await user.save();
    res.json({ message: 'Cart updated', cart: user.cart });
});

app.get('/api/cart', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId).populate('cart.bookId');
    res.json(user.cart);
});

app.delete('/api/cart/:bookId', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId);
    user.cart = user.cart.filter(item => item.bookId.toString() !== req.params.bookId);
    await user.save();
    res.json({ message: 'Removed from cart', cart: user.cart });
});

app.post('/api/checkout', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId).populate('cart.bookId');
    if (!user.cart.length) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    const stockIssues = [];
    for (const item of user.cart) {
        const book = await Book.findById(item.bookId._id);
        if (book.stock < item.quantity) {
            stockIssues.push(`${book.title}: Requested ${item.quantity}, Available ${book.stock}`);
        }
    }

    if (stockIssues.length > 0) {
        return res.status(400).json({ error: 'Insufficient stock', details: stockIssues });
    }

    const total = user.cart.reduce((sum, item) => sum + item.bookId.price * item.quantity, 0);
    const order = {
        books: user.cart.map(item => ({ bookId: item.bookId._id, quantity: item.quantity })),
        total
    };

    for (const item of user.cart) {
        const book = await Book.findById(item.bookId._id);
        book.stock -= item.quantity;
        await book.save();
    }

    user.orders.push(order);
    user.cart = [];
    await user.save();

    res.json({ message: 'Checkout successful' });
});

app.get('/api/orders', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId).populate('orders.books.bookId');
    res.json(user.orders);
});

app.post('/api/books', isAdmin, async (req, res) => {
    const { title, author, category, price, stock, coverUrl, description, authorBio } = req.body;

    // Validate required fields
    if (!title || !author || !category || !price || !stock) {
        return res.status(400).json({ error: 'Missing required fields: title, author, category, price, stock are required' });
    }

    try {
        const newBook = new Book({
            title,
            author,
            category,
            price,
            stock,
            coverUrl: coverUrl || undefined,
            description: description || undefined,
            authorBio: authorBio || undefined
        });
        await newBook.save();
        res.status(201).json({ message: 'Book added', book: newBook });
    } catch (error) {
        console.error('Error adding book:', error); // Log the error for debugging
        res.status(500).json({ error: 'Failed to add book: ' + error.message });
    }
});

app.put('/api/books/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const book = await Book.findByIdAndUpdate(id, updates, { new: true });
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json({ message: 'Book updated', book });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update book' });
    }
});

app.delete('/api/books/:id', isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Book.findByIdAndDelete(id);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json({ message: 'Book deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

app.get('/api/user', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId);
    res.json({ firstName: user.firstName, lastName: user.lastName, email: user.email });
});

app.put('/api/user', isAuthenticated, async (req, res) => {
    const { firstName, lastName, password } = req.body;
    const user = await User.findById(req.session.userId);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.json({ message: 'Profile updated' });
});

app.get('/api/wishlist', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId).populate('wishlist');
    res.json(user.wishlist);
});

app.post('/api/wishlist/:bookId', isAuthenticated, async (req, res) => {
    const { bookId } = req.params;
    const user = await User.findById(req.session.userId);
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (!user.wishlist.includes(bookId)) {
        user.wishlist.push(bookId);
        await user.save();
    }
    res.json({ message: 'Added to wishlist' });
});

app.delete('/api/wishlist/:bookId', isAuthenticated, async (req, res) => {
    const { bookId } = req.params;
    const user = await User.findById(req.session.userId);
    user.wishlist = user.wishlist.filter(id => id.toString() !== bookId);
    await user.save();
    res.json({ message: 'Removed from wishlist' });
});

// New review endpoints
app.post('/api/reviews', isAuthenticated, async (req, res) => {
    const { bookId, rating, comment } = req.body;
    const userId = req.session.userId;

    if (!bookId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Book ID and valid rating (1-5) are required.' });
    }

    try {
        // Check if user already reviewed this book
        const existingReview = await Review.findOne({ bookId, userId });
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this book.' });
        }

        const review = new Review({ bookId, userId, rating, comment });
        await review.save();

        // Update book's average rating
        const reviews = await Review.find({ bookId });
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const book = await Book.findById(bookId);
        book.ratings.average = totalRating / reviews.length;
        book.ratings.count = reviews.length;
        await book.save();

        res.status(201).json({ message: 'Review submitted', review });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit review: ' + error.message });
    }
});

app.get('/api/reviews/:bookId', async (req, res) => {
    const { bookId } = req.params;
    try {
        const reviews = await Review.find({ bookId }).populate('userId', 'firstName lastName');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});