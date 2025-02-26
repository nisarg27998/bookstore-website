# Bookstore Website

A simple bookstore website built with Node.js, Express, and MongoDB.

## Features

- User authentication (login, registration)
- Admin dashboard for managing books
- Shopping cart functionality
- Order history for users
- Responsive design

## Project Structure

models/ book.js user.js package.json public/ account.html account.js admin.html admin.js cart.html cart.js header.html include-header.js index.html orders.html orders.js script.js styles.css toast.js README.md server/ server.js

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/bookstore-website.git
    cd bookstore-website
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the MongoDB server:
    ```sh
    mongod
    ```

4. Start the application:
    ```sh
    npm start
    ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage

- Visit the homepage to browse books.
- Register or log in to add books to your cart.
- Admin users can access the admin dashboard to manage books.
- View your order history on the orders page.

## API Endpoints

- `GET /api/books` - Retrieve all books
- `POST /api/register` - Register a new user
- `POST /api/login` - Log in a user
- `GET /api/user-status` - Check user status
- `POST /api/logout` - Log out a user
- `POST /api/cart` - Add/update items in the cart
- `GET /api/cart` - Retrieve cart items
- `DELETE /api/cart/:bookId` - Remove an item from the cart
- `POST /api/checkout` - Checkout and place an order
- `GET /api/orders` - Retrieve user orders
- `POST /api/books` - Add a new book (admin only)
- `PUT /api/books/:id` - Edit a book (admin only)
- `DELETE /api/books/:id` - Delete a book (admin only)

## License

This project is licensed under the ISC License.

