function openProfileTab(tabName) {
    const tabs = document.getElementsByClassName('tab-content');
    const buttons = document.getElementsByClassName('tab-button');
    
    for (let tab of tabs) {
        tab.classList.remove('active');
    }
    for (let button of buttons) {
        button.classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[data-tab="${tabName}"]`).classList.add('active');

    if (tabName === 'orders') loadOrders();
    if (tabName === 'wishlist') loadWishlist();
}

async function loadProfile() {
    try {
        const response = await fetch('/api/user');
        const user = await response.json();
        if (response.ok) {
            document.getElementById('firstName').value = user.firstName;
            document.getElementById('lastName').value = user.lastName;
            document.getElementById('email').value = user.email;
        } else {
            showToast('Failed to load profile.', 'error');
        }
    } catch (error) {
        showToast('An error occurred.', 'error');
    }
}

async function loadOrders() {
    const orderList = document.getElementById('order-list');
    const noOrdersMessage = document.getElementById('no-orders-message');
    orderList.innerHTML = '';

    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        if (!response.ok) throw new Error('Failed to load orders');
        
        if (orders.length === 0) {
            orderList.innerHTML = '';
            noOrdersMessage.style.display = 'block';
            return;
        }

        noOrdersMessage.style.display = 'none';
        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="toggle-order" data-order-id="${index}">▶</span></td>
                <td>${new Date(order.date).toLocaleString()}</td>
                <td>${window.currencySymbol}${order.total.toFixed(2)}</td>
            `;
            orderList.appendChild(row);

            const detailsRow = document.createElement('tr');
            detailsRow.className = 'order-details';
            detailsRow.id = `details-${index}`;
            detailsRow.style.display = 'none';
            let booksHtml = '<ul>';
            order.books.forEach(book => {
                booksHtml += `<li>${book.bookId.title} - ${window.currencySymbol}${book.bookId.price.toFixed(2)} x ${book.quantity}</li>`;
            });
            booksHtml += '</ul>';
            detailsRow.innerHTML = `
                <td colspan="3">
                    <div class="order-details-content">${booksHtml}</div>
                </td>
            `;
            orderList.appendChild(detailsRow);

            row.querySelector('.toggle-order').addEventListener('click', () => toggleOrderDetails(index));
        });
    } catch (error) {
        orderList.innerHTML = '<tr><td colspan="3">Error loading orders.</td></tr>';
        noOrdersMessage.style.display = 'none';
    }
}

async function loadWishlist() {
    const wishlistContainer = document.getElementById('wishlist-container');
    const noWishlistMessage = document.getElementById('no-wishlist-message');
    wishlistContainer.innerHTML = '';

    try {
        const response = await fetch('/api/wishlist');
        const wishlist = await response.json();
        if (!response.ok) throw new Error('Failed to load wishlist');

        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = '';
            noWishlistMessage.style.display = 'block';
            return;
        }

        noWishlistMessage.style.display = 'none';
        wishlist.forEach((book, index) => {
            const bookCard = document.createElement('div');
            bookCard.className = 'wishlist-item';
            bookCard.innerHTML = `
                <img src="${book.coverUrl}" alt="${book.title} cover" class="book-cover">
                <h3>${book.title}</h3>
                <p>by ${book.author}</p>
                <p>${window.currencySymbol}${book.price.toFixed(2)}</p>
                <button onclick="removeFromWishlist('${book._id}')">Remove</button>
            `;
            wishlistContainer.appendChild(bookCard);

            // Staggered load animation
            setTimeout(() => {
                bookCard.classList.add('fade-in');
            }, index * 100); // Delay each card by 100ms
        });
    } catch (error) {
        wishlistContainer.innerHTML = '<p>Error loading wishlist.</p>';
        noWishlistMessage.style.display = 'none';
    }
}

async function removeFromWishlist(bookId) {
    try {
        const response = await fetch(`/api/wishlist/${bookId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            showToast('Removed from wishlist!');
            loadWishlist();
        } else {
            showToast('Failed to remove from wishlist.', 'error');
        }
    } catch (error) {
        showToast('An error occurred.', 'error');
    }
}

function toggleOrderDetails(orderId) {
    const detailsRow = document.getElementById(`details-${orderId}`);
    const toggleIcon = document.querySelector(`.toggle-order[data-order-id="${orderId}"]`);
    const isExpanded = detailsRow.style.display === 'table-row';

    if (isExpanded) {
        detailsRow.style.display = 'none';
        toggleIcon.textContent = '▶';
    } else {
        detailsRow.style.display = 'table-row';
        toggleIcon.textContent = '▼';
        detailsRow.querySelector('.order-details-content').classList.add('expand-animation');
        setTimeout(() => detailsRow.querySelector('.order-details-content').classList.remove('expand-animation'), 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    openProfileTab('details');

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            openProfileTab(tabName);
        });
    });

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const password = document.getElementById('password').value || undefined;

        try {
            const response = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, password })
            });
            const data = await response.json();
            if (response.ok) {
                document.getElementById('profile-message').textContent = 'Profile updated successfully!';
                document.getElementById('profile-message').style.color = '#28a745';
                showToast('Profile updated successfully!');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                document.getElementById('profile-message').textContent = data.error || 'Failed to update profile.';
                document.getElementById('profile-message').style.color = '#dc3545';
                showToast(data.error || 'Failed to update profile.', 'error');
            }
        } catch (error) {
            document.getElementById('profile-message').textContent = 'An error occurred.';
            document.getElementById('profile-message').style.color = '#dc3545';
            showToast('An error occurred.', 'error');
        }
    });
});