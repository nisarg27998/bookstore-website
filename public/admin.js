function getCurrencySymbol() {
    const testElement = document.createElement('span');
    testElement.innerHTML = '₹';
    document.body.appendChild(testElement);
    const isSupported = testElement.offsetWidth > 0 && testElement.textContent === '₹';
    document.body.removeChild(testElement);
    return isSupported ? '₹' : 'INR ';
}

const currencySymbol = getCurrencySymbol();

document.getElementById('add-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        genre: document.getElementById('genre').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        coverUrl: document.getElementById('coverUrl').value || undefined
    };

    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });

        if (response.ok) {
            document.getElementById('message').textContent = `Book added successfully! Price: ${currencySymbol}${bookData.price.toFixed(2)}`;
            e.target.reset();
            loadBooks();
        } else {
            document.getElementById('message').textContent = 'Failed to add book.';
            document.getElementById('message').style.color = '#dc3545';
        }
    } catch (error) {
        document.getElementById('message').textContent = 'An error occurred.';
        document.getElementById('message').style.color = '#dc3545';
    }
});

async function loadBooks() {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';

    try {
        const response = await fetch('/api/books');
        const books = await response.json();

        books.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book-item';
            bookDiv.innerHTML = `
                <p>${book.title} - ${currencySymbol}${book.price.toFixed(2)}</p>
                <button onclick="showEditModal('${book._id}', '${book.title}', '${book.author}', '${book.genre}', ${book.price}, ${book.stock}, '${book.coverUrl}')">Edit</button>
                <button onclick="deleteBook('${book._id}')">Delete</button>
            `;
            bookList.appendChild(bookDiv);
        });
    } catch (error) {
        bookList.innerHTML = '<p>Error loading books.</p>';
    }
}

function showEditModal(bookId, title, author, genre, price, stock, coverUrl) {
    const modal = document.getElementById('edit-modal');
    const form = document.getElementById('edit-book-form');
    
    form.innerHTML = `
        <label for="edit-title">Title:</label>
        <input type="text" id="edit-title" value="${title}" required><br>
        <label for="edit-author">Author:</label>
        <input type="text" id="edit-author" value="${author}" required><br>
        <label for="edit-genre">Genre:</label>
        <input type="text" id="edit-genre" value="${genre}" required><br>
        <label for="edit-price">Price (₹):</label>
        <input type="number" id="edit-price" value="${price}" step="0.01" required><br>
        <label for="edit-stock">Stock:</label>
        <input type="number" id="edit-stock" value="${stock}" required><br>
        <label for="edit-coverUrl">Cover URL:</label>
        <input type="url" id="edit-coverUrl" value="${coverUrl}" placeholder="https://example.com/cover.jpg"><br>
        <button type="submit">Save Changes</button>
        <button type="button" onclick="hideEditModal()">Cancel</button>
    `;

    modal.style.display = 'block';

    form.onsubmit = async (e) => {
        e.preventDefault();

        const updatedBook = {
            title: document.getElementById('edit-title').value,
            author: document.getElementById('edit-author').value,
            genre: document.getElementById('edit-genre').value,
            price: parseFloat(document.getElementById('edit-price').value),
            stock: parseInt(document.getElementById('edit-stock').value),
            coverUrl: document.getElementById('edit-coverUrl').value || undefined
        };

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBook)
            });

            if (response.ok) {
                hideEditModal();
                loadBooks();
            } else {
                alert('Failed to edit book.');
            }
        } catch (error) {
            alert('An error occurred.');
        }
    };
}

function hideEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'none';
}

async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadBooks();
        } else {
            alert('Failed to delete book.');
        }
    } catch (error) {
        alert('An error occurred.');
    }
}

// Load books on page load
loadBooks();