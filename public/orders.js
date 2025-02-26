function getCurrencySymbol() {
    const testElement = document.createElement('span');
    testElement.innerHTML = '₹';
    document.body.appendChild(testElement);
    const isSupported = testElement.offsetWidth > 0 && testElement.textContent === '₹';
    document.body.removeChild(testElement);
    return isSupported ? '₹' : 'INR ';
}

const currencySymbol = getCurrencySymbol();

async function displayOrders() {
    const orderListDiv = document.getElementById('order-list');
    orderListDiv.innerHTML = '';

    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
            orderListDiv.innerHTML = '<p>Please log in to view your orders.</p>';
            return;
        }
        const orders = await response.json();

        if (orders.length === 0) {
            orderListDiv.innerHTML = '<p>You have no past orders.</p>';
            return;
        }

        orders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.className = 'order-item';
            let booksHtml = '<ul>';
            order.books.forEach(book => {
                booksHtml += `<li>${book.bookId.title} - ${currencySymbol}${book.bookId.price.toFixed(2)} x ${book.quantity}</li>`;
            });
            booksHtml += '</ul>';
            orderDiv.innerHTML = `
                <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                ${booksHtml}
                <p><strong>Total:</strong> ${currencySymbol}${order.total.toFixed(2)}</p>
            `;
            orderListDiv.appendChild(orderDiv);
        });
    } catch (error) {
        orderListDiv.innerHTML = '<p>Error loading orders.</p>';
    }
}

// Display orders on page load
displayOrders();