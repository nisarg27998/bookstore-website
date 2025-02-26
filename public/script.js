function getCurrencySymbol() {
    const testElement = document.createElement('span');
    testElement.innerHTML = '₹';
    document.body.appendChild(testElement);
    const isSupported = testElement.offsetWidth > 0 && testElement.textContent === '₹';
    document.body.removeChild(testElement);
    return isSupported ? '₹' : 'INR ';
}

const currencySymbol = getCurrencySymbol();

fetch('/api/books')
    .then(response => response.json())
    .then(books => {
        const bookList = document.getElementById('book-list');
        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <img src="${book.coverUrl}" alt="${book.title} cover" class="book-cover">
                <h3>${book.title}</h3>
                <p>by ${book.author}</p>
                <p>${currencySymbol}${book.price.toFixed(2)}</p>
                <button onclick="addToCart('${book._id}', '${book.title}')">Add to Cart</button>
            `;
            bookList.appendChild(bookCard);
        });
    });

async function addToCart(bookId, title) {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId })
        });
        if (response.ok) {
            alert(`${title} added to cart!`);
        } else {
            alert('Please log in to add items to your cart.');
        }
    } catch (error) {
        alert('An error occurred.');
    }
}