# Bookstore Website

A simple bookstore website built with Node.js, Express, and MongoDB.

## Features

- User authentication (login, registration)
- Admin dashboard for managing books
- Shopping cart functionality
- Order history for users
- Responsive design

## Project Structure

```
models/
  ├── book.js
  └── user.js
public/
  ├── account.html
  ├── account.js
  ├── admin.html
  ├── admin.js
  ├── cart.html
  ├── cart.js
  ├── header.html
  ├── include-header.js
  ├── index.html
  ├── orders.html
  ├── orders.js
  ├── script.js
  ├── styles.css
  └── toast.js
server/
  └── server.js
package.json
package-lock.json
README.md
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/nisarg27998/bookstore-website.git
   cd bookstore-website
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the MongoDB server:

   ```bash
   mongod
   ```

4. Start the application:

   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage

- Visit the homepage to browse books.
- Register or log in to add books to your cart.
- Admin users can access the admin dashboard to manage books.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. 