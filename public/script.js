function getCurrencySymbol() {
    const testElement = document.createElement('span');
    testElement.innerHTML = '₹';
    document.body.appendChild(testElement);
    const isSupported = testElement.offsetWidth > 0 && testElement.textContent === '₹';
    document.body.removeChild(testElement);
    return isSupported ? '₹' : 'INR ';
}

const currencySymbol = getCurrencySymbol();

let allBooks = []; // Store all books for filtering

async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        allBooks = await response.json();
        populateGenreFilter();
        displayBooks(allBooks);
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

function populateGenreFilter() {
    const genreFilter = document.getElementById('genre-filter');
    const genres = [...new Set(allBooks.map(book => book.genre))]; // Unique genres
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

function displayBooks(books) {
    const bookContainer = document.getElementById('book-container');
    bookContainer.innerHTML = '';

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
        bookContainer.appendChild(bookCard);
    });
}

function filterBooks() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const selectedGenre = document.getElementById('genre-filter').value;

    let filteredBooks = allBooks;

    if (searchTerm) {
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm)
        );
    }

    if (selectedGenre) {
        filteredBooks = filteredBooks.filter(book => 
            book.genre === selectedGenre
        );
    }

    displayBooks(filteredBooks);
}

async function addToCart(bookId, title) {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId })
        });
        if (response.ok) {
            showToast(`${title} added to cart!`);
        } else {
            showToast('Please log in to add items to your cart.', 'error');
        }
    } catch (error) {
        showToast('An error occurred.', 'error');
    }
}

// Event listeners for search and filter
document.getElementById('search-input').addEventListener('input', filterBooks);
document.getElementById('genre-filter').addEventListener('change', filterBooks);

// Fetch books on page load
fetchBooks();