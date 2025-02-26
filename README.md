# Bookstore Website

This is a simple bookstore website built with Node.js, Express, and MongoDB. It allows users to browse books, add them to a cart, and manage their accounts.

## Project Structure

bookstore-website/
├── public/          # Static files
│   ├── index.html   # Homepage
│   ├── styles.css   # Styling
│   └── script.js    # Client-side logic
├── server/          # Server-side code
│   └── server.js    # Express server
├── models/          # MongoDB schemas
│   ├── book.js      # Book model
│   └── user.js      # User model
├── node_modules/    # NPM dependencies
├── package.json     # Project metadata and scripts
└── README.md        # This file

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

3. Start the MongoDB server (make sure MongoDB is installed and running on your machine):
    ```sh
    mongod
    ```

4. Start the application:
    ```sh
    npm start
    ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage

- Browse books on the homepage.
- Add books to your cart.
- Manage your account and view your orders.

## API Endpoints

- `GET /api/books` - Retrieve a list of all books.

## Technologies Used

- Node.js
- Express
- MongoDB
- HTML/CSS
- JavaScript

## License

This project is licensed under the ISC License.

