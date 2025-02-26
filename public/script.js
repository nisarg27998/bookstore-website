fetch('/api/books')
    .then(response => response.json())
    .then(books => {
        const bookList = document.getElementById('book-list');
        books.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.innerHTML = `
                <h3>${book.title}</h3>
                <p>by ${book.author}</p>
                <p>$${book.price}</p>
                <button onclick="addToCart('${book._id}')">Add to Cart</button>
            `;
            bookList.appendChild(bookDiv);
        });
    });

function addToCart(bookId) {
    console.log(`Added book ${bookId} to cart`);
    // Add cart logic later
}