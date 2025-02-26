const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const Book = require('../models/book');
const User = require('../models/user');

const app = express();

mongoose.connect('mongodb://localhost/bookstore', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key', // Change this in production!
    resave: false,
    saveUninitialized: false
}));

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.userId) return next();
    res.status(401).json({ error: 'Please log in.' });
}

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    User.findById(req.session.userId).then(user => {
        if (user && user.isAdmin) return next();
        res.status(403).json({ error: 'Admin access required.' });
    }).catch(() => res.status(500).json({ error: 'Server error' }));
}

// Create default admin user on startup
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

// Run initialization after MongoDB connection
mongoose.connection.once('open', () => {
    initializeAdminUser();
});

// Serve pages
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

// API to get all books
app.get('/api/books', async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

// API to register (regular users)
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields (first name, last name, email, password) are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ firstName, lastName, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered' });
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error (e.g., email already exists)
            res.status(400).json({ error: 'Email is already registered.' });
        } else {
            res.status(400).json({ error: 'Registration failed: ' + error.message });
        }
    }
});

// API to login (handles both regular users and admins)
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

// API to check user status
app.get('/api/user-status', async (req, res) => {
    if (!req.session.userId) {
        return res.json({ isLoggedIn: false, isAdmin: false, firstName: null });
    }
    const user = await User.findById(req.session.userId);
    res.json({ isLoggedIn: true, isAdmin: user.isAdmin, firstName: user.firstName });
});

// API to logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.json({ message: 'Logged out' });
    });
});

// API to add to cart
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

// API to get cart
app.get('/api/cart', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId).populate('cart.bookId');
    res.json(user.cart);
});

// API to remove from cart
app.delete('/api/cart/:bookId', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId);
    user.cart = user.cart.filter(item => item.bookId.toString() !== req.params.bookId);
    await user.save();
    res.json({ message: 'Removed from cart', cart: user.cart });
});

// API to checkout
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

// API to get orders
app.get('/api/orders', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId).populate('orders.books.bookId');
    res.json(user.orders);
});

// API to add a book (admin only)
app.post('/api/books', isAdmin, async (req, res) => {
    const { title, author, genre, price, stock, coverUrl } = req.body;
    try {
        const newBook = new Book({ title, author, genre, price, stock, coverUrl });
        await newBook.save();
        res.status(201).json({ message: 'Book added', book: newBook });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add book' });
    }
});

// API to edit a book (admin only)
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

// API to delete a book (admin only)
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

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});