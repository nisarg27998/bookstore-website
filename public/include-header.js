function getCurrencySymbol() {
    const testElement = document.createElement('span');
    testElement.innerHTML = '₹';
    document.body.appendChild(testElement);
    const isSupported = testElement.offsetWidth > 0 && testElement.textContent === '₹';
    document.body.removeChild(testElement);
    return isSupported ? '₹' : 'INR ';
}

window.currencySymbol = getCurrencySymbol();

let allBooks = [];

async function loadHeader() {
    try {
        const response = await fetch('/header.html');
        const headerHtml = await response.text();
        document.body.insertAdjacentHTML('afterbegin', headerHtml);

        const statusResponse = await fetch('/api/user-status');
        const { isLoggedIn, isAdmin, firstName } = await statusResponse.json();
        const logoutBtn = document.getElementById('logout-btn');
        const adminLink = document.querySelector('nav a[href="/admin"]');
        const ordersLink = document.querySelector('nav a[href="/orders"]');
        const profileLink = document.querySelector('nav a[href="/profile"]');
        const usernameDisplay = document.getElementById('username-display');
        const searchFilter = document.querySelector('.search-filter');

        if (isLoggedIn) {
            logoutBtn.style.display = 'inline-block';
            ordersLink.style.display = 'inline-block';
            profileLink.style.display = 'inline-block';
            usernameDisplay.style.display = 'inline-block';
            usernameDisplay.textContent = `Welcome, ${firstName}`;
        } else {
            logoutBtn.style.display = 'none';
            ordersLink.style.display = 'none';
            profileLink.style.display = 'none';
            usernameDisplay.style.display = 'none';
        }

        if (isAdmin) {
            adminLink.style.display = 'inline-block';
        } else {
            adminLink.style.display = 'none';
        }

        const currentPath = window.location.pathname;
        if (currentPath === '/') {
            searchFilter.style.display = 'flex';
        } else {
            searchFilter.style.display = 'none';
        }

        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/logout', { method: 'POST' });
                if (response.ok) {
                    showToast('Logged out successfully!');
                    setTimeout(() => window.location.href = '/', 1000);
                } else {
                    showToast('Failed to log out.', 'error');
                }
            } catch (error) {
                showToast('An error occurred.', 'error');
            }
        });

        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });

        if (currentPath === '/') {
            const booksResponse = await fetch('/api/books');
            allBooks = await booksResponse.json();
            const genreFilter = document.getElementById('genre-filter');
            const genres = [...new Set(allBooks.map(book => book.genre))];
            genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre;
                option.textContent = genre;
                genreFilter.appendChild(option);
            });

            document.getElementById('search-input').addEventListener('input', filterBooks);
            document.getElementById('genre-filter').addEventListener('change', filterBooks);

            displayBooks(allBooks);
        }
    } catch (error) {
        console.error('Error loading header:', error);
    }
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

function displayBooks(books) {
    const bookContainer = document.getElementById('book-container');
    if (!bookContainer) return;
    bookContainer.innerHTML = '';

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.coverUrl}" alt="${book.title} cover" class="book-cover">
            <h3>${book.title}</h3>
            <p>by ${book.author}</p>
            <p>${window.currencySymbol}${book.price.toFixed(2)}</p>
            <p>Rating: ${book.ratings?.average || 'Not rated'} (${book.ratings?.count || 0} reviews)</p>
        `;
        bookCard.addEventListener('click', () => showBookModal(book));
        bookContainer.appendChild(bookCard);
    });
}

function showBookModal(book) {
    const modal = document.getElementById('book-modal');
    const details = document.getElementById('book-details');
    
    details.innerHTML = `
        <img src="${book.coverUrl}" alt="${book.title} cover" class="modal-book-cover">
        <h2>${book.title}</h2>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Description:</strong> ${book.description || 'No description available'}</p>
        <p><strong>Price:</strong> ${window.currencySymbol}${book.price.toFixed(2)}</p>
        <p><strong>Rating:</strong> ${book.ratings?.average || 'Not rated'} (${book.ratings?.count || 0} reviews)</p>
        <p><strong>Author Bio:</strong> ${book.authorBio || 'No author bio available'}</p>
        <div class="modal-buttons">
            <button onclick="addToCart('${book._id}', '${book.title}')">Add to Cart</button>
            <button onclick="addToWishlist('${book._id}', '${book.title}')">Add to Wishlist</button>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeBookModal() {
    document.getElementById('book-modal').style.display = 'none';
}

async function addToCart(bookId, title) {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId, quantity: 1 })
        });
        if (response.ok) {
            showToast(`${title} added to cart!`);
            closeBookModal();
        } else {
            showToast('Please log in to add items to your cart.', 'error');
        }
    } catch (error) {
        showToast('An error occurred.', 'error');
    }
}

async function addToWishlist(bookId, title) {
    try {
        const response = await fetch(`/api/wishlist/${bookId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            showToast(`${title} added to wishlist!`);
            closeBookModal();
        } else {
            showToast('Please log in to add items to your wishlist.', 'error');
        }
    } catch (error) {
        showToast('An error occurred.', 'error');
    }
}

loadHeader();