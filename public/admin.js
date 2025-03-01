async function loadBooks() {
    const bookListDiv = document.getElementById('manage-books');
    bookListDiv.innerHTML = '<h3>Manage Books</h3>';

    try {
        const response = await fetch('/api/books');
        const books = await response.json();

        books.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book-item';
            bookDiv.innerHTML = `
                <span>${book.title} by ${book.author} (${book.category}) - ${window.currencySymbol}${book.price.toFixed(2)} (Stock: ${book.stock})</span>
                <div>
                    <button onclick="showEditModal('${book._id}', '${book.title}', '${book.author}', ${book.price}, ${book.stock}, '${book.coverUrl || ''}', '${book.description || ''}', '${book.authorBio || ''}', '${book.category}')">Edit</button>
                    <button onclick="deleteBook('${book._id}')">Delete</button>
                </div>
            `;
            bookListDiv.appendChild(bookDiv);
        });
    } catch (error) {
        bookListDiv.innerHTML += '<p>Error loading books.</p>';
    }
}

document.getElementById('add-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        category: document.getElementById('category').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        coverUrl: document.getElementById('coverUrl').value || undefined,
        description: document.getElementById('description').value,
        authorBio: document.getElementById('authorBio').value
    };

    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });

        if (response.ok) {
            document.getElementById('message').textContent = `Book added successfully! Price: ${window.currencySymbol}${bookData.price.toFixed(2)}`;
            e.target.reset();
            loadBooks();
        } else {
            const data = await response.json();
            document.getElementById('message').textContent = data.error || 'Failed to add book.';
            document.getElementById('message').style.color = '#dc3545';
        }
    } catch (error) {
        document.getElementById('message').textContent = 'An error occurred: ' + error.message;
        document.getElementById('message').style.color = '#dc3545';
    }
});

function showEditModal(bookId, title, author, price, stock, coverUrl, description, authorBio, category) {
    const modal = document.getElementById('edit-modal');
    const form = document.getElementById('edit-book-form');
    
    form.innerHTML = `
        <div class="form-group">
            <label for="edit-title">Title</label>
            <input type="text" id="edit-title" value="${title}" required>
        </div>
        <div class="form-group">
            <label for="edit-author">Author</label>
            <input type="text" id="edit-author" value="${author}" required>
        </div>
        <div class="form-group">
            <label for="edit-category">Category</label>
            <select id="edit-category" required>
                <option value="Fiction" ${category === 'Fiction' ? 'selected' : ''}>Fiction</option>
                <option value="Non-Fiction" ${category === 'Non-Fiction' ? 'selected' : ''}>Non-Fiction</option>
                <option value="Mystery" ${category === 'Mystery' ? 'selected' : ''}>Mystery</option>
                <option value="Science Fiction" ${category === 'Science Fiction' ? 'selected' : ''}>Science Fiction</option>
                <option value="Fantasy" ${category === 'Fantasy' ? 'selected' : ''}>Fantasy</option>
                <option value="Biography" ${category === 'Biography' ? 'selected' : ''}>Biography</option>
            </select>
        </div>
        <div class="form-group">
            <label for="edit-price">Price (${window.currencySymbol})</label>
            <input type="number" id="edit-price" value="${price}" step="0.01" required>
        </div>
        <div class="form-group">
            <label for="edit-stock">Stock</label>
            <input type="number" id="edit-stock" value="${stock}" required>
        </div>
        <div class="form-group">
            <label for="edit-coverUrl">Cover URL</label>
            <input type="url" id="edit-coverUrl" value="${coverUrl || ''}" placeholder="https://example.com/cover.jpg">
        </div>
        <div class="form-group">
            <label for="edit-description">Description</label>
            <textarea id="edit-description" rows="4" placeholder="Enter book description">${description || ''}</textarea>
        </div>
        <div class="form-group">
            <label for="edit-authorBio">Author Bio</label>
            <textarea id="edit-authorBio" rows="4" placeholder="Enter author biography">${authorBio || ''}</textarea>
        </div>
        <div class="modal-actions">
            <button type="submit" class="save-button">Save Changes</button>
            <button type="button" class="cancel-button" onclick="hideEditModal()">Cancel</button>
        </div>
    `;

    modal.classList.remove('modal-exit');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('modal-enter'), 10); // Trigger animation

    form.onsubmit = async (e) => {
        e.preventDefault();

        const updatedBook = {
            title: document.getElementById('edit-title').value,
            author: document.getElementById('edit-author').value,
            category: document.getElementById('edit-category').value,
            price: parseFloat(document.getElementById('edit-price').value),
            stock: parseInt(document.getElementById('edit-stock').value),
            coverUrl: document.getElementById('edit-coverUrl').value || undefined,
            description: document.getElementById('edit-description').value,
            authorBio: document.getElementById('edit-authorBio').value
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
    modal.classList.remove('modal-enter');
    modal.classList.add('modal-exit');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('modal-exit');
    }, 300);
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

loadBooks();