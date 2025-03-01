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
let selectedCategory = 'all';

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
        const accountLink = document.querySelector('nav a[href="/account"]');
        const usernameDisplay = document.getElementById('username-display');

        if (isLoggedIn) {
            logoutBtn.style.display = 'inline-block';
            ordersLink.style.display = 'inline-block';
            profileLink.style.display = 'inline-block';
            accountLink.style.display = 'none';
            usernameDisplay.style.display = 'inline-block';
            usernameDisplay.textContent = `Welcome, ${firstName}`;
        } else {
            logoutBtn.style.display = 'none';
            ordersLink.style.display = 'none';
            profileLink.style.display = 'none';
            accountLink.style.display = 'inline-block';
            usernameDisplay.style.display = 'none';
        }

        if (isAdmin) {
            adminLink.style.display = 'inline-block';
        } else {
            adminLink.style.display = 'none';
        }

        const currentPath = window.location.pathname;

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
            displayBooks(allBooks);

            // Add category button listeners
            const categoryButtons = document.querySelectorAll('.category-button');
            categoryButtons.forEach(button => {
                button.addEventListener('click', () => {
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    selectedCategory = button.getAttribute('data-category');
                    displayBooksByCategory();
                });
            });

            // Animate category list on load
            const categoryList = document.getElementById('category-list');
            setTimeout(() => categoryList.classList.add('loaded'), 100);
        }
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

function displayBooks(books) {
    const bookContainer = document.getElementById('book-container');
    if (!bookContainer) return;
    bookContainer.innerHTML = '';

    books.forEach((book, index) => {
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

        setTimeout(() => {
            bookCard.classList.add('fade-in');
        }, index * 100);
    });
}

function displayBooksByCategory() {
    const filteredBooks = selectedCategory === 'all' ? allBooks : allBooks.filter(book => book.category === selectedCategory);
    displayBooks(filteredBooks);
}

async function showBookModal(book) {
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
        <div class="review-section">
            <h3>Rate & Review</h3>
            <form id="review-form-${book._id}">
                <div class="star-rating">
                    <input type="radio" id="star5-${book._id}" name="rating" value="5"><label for="star5-${book._id}">★</label>
                    <input type="radio" id="star4-${book._id}" name="rating" value="4"><label for="star4-${book._id}">★</label>
                    <input type="radio" id="star3-${book._id}" name="rating" value="3"><label for="star3-${book._id}">★</label>
                    <input type="radio" id="star2-${book._id}" name="rating" value="2"><label for="star2-${book._id}">★</label>
                    <input type="radio" id="star1-${book._id}" name="rating" value="1"><label for="star1-${book._id}">★</label>
                </div>
                <textarea id="review-comment-${book._id}" placeholder="Write your review..." rows="3"></textarea>
                <button type="submit">Submit Review</button>
            </form>
            <p id="review-message-${book._id}" class="review-message"></p>
            <div class="reviews-list" id="reviews-list-${book._id}">
                <h3>Reviews</h3>
                <div class="reviews-container"></div>
            </div>
        </div>
    `;
    
    modal.classList.remove('modal-exit');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('modal-enter'), 10);

    try {
        const response = await fetch(`/api/reviews/${book._id}`);
        const reviews = await response.json();
        const reviewsContainer = document.querySelector(`#reviews-list-${book._id} .reviews-container`);
        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p>No reviews yet.</p>';
        } else {
            reviews.forEach(review => {
                const reviewDiv = document.createElement('div');
                reviewDiv.className = 'review-item';
                const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                reviewDiv.innerHTML = `
                    <p><strong>${review.userId.firstName} ${review.userId.lastName}</strong> - ${stars}</p>
                    <p>${review.comment || 'No comment'}</p>
                    <p class="review-date">${new Date(review.date).toLocaleDateString()}</p>
                `;
                reviewsContainer.appendChild(reviewDiv);
            });
        }
    } catch (error) {
        document.querySelector(`#reviews-list-${book._id} .reviews-container`).innerHTML = '<p>Error loading reviews.</p>';
    }

    document.getElementById(`review-form-${book._id}`).addEventListener('submit', async (e) => {
        e.preventDefault();
        const rating = document.querySelector(`input[name="rating"]:checked`)?.value;
        const comment = document.getElementById(`review-comment-${book._id}`).value;

        if (!rating) {
            showToast('Please select a rating.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId: book._id, rating: parseInt(rating), comment })
            });
            const data = await response.json();
            if (response.ok) {
                document.getElementById(`review-message-${book._id}`).textContent = 'Review submitted successfully!';
                document.getElementById(`review-message-${book._id}`).style.color = '#28a745';
                showToast('Review submitted successfully!');
                setTimeout(() => {
                    closeBookModal();
                    loadHeader();
                }, 1000);
            } else {
                document.getElementById(`review-message-${book._id}`).textContent = data.error || 'Failed to submit review.';
                document.getElementById(`review-message-${book._id}`).style.color = '#dc3545';
                showToast(data.error || 'Failed to submit review.', 'error');
            }
        } catch (error) {
            showToast('An error occurred.', 'error');
        }
    });
}

function closeBookModal() {
    const modal = document.getElementById('book-modal');
    modal.classList.remove('modal-enter');
    modal.classList.add('modal-exit');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('modal-exit');
    }, 300);
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