async function displayOrders() {
    const orderList = document.getElementById('order-list');
    const noOrdersMessage = document.getElementById('no-orders-message');
    orderList.innerHTML = '';

    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
            orderList.innerHTML = '<tr><td colspan="3">Please log in to view your orders.</td></tr>';
            noOrdersMessage.style.display = 'none';
            return;
        }
        const orders = await response.json();

        if (orders.length === 0) {
            orderList.innerHTML = '';
            noOrdersMessage.style.display = 'block';
            return;
        }

        noOrdersMessage.style.display = 'none';
        orders.forEach(order => {
            const row = document.createElement('tr');
            let booksHtml = '<ul>';
            order.books.forEach(book => {
                booksHtml += `<li>${book.bookId.title} - ${window.currencySymbol}${book.bookId.price.toFixed(2)} x ${book.quantity}</li>`;
            });
            booksHtml += '</ul>';
            row.innerHTML = `
                <td>${new Date(order.date).toLocaleString()}</td>
                <td>${booksHtml}</td>
                <td>${window.currencySymbol}${order.total.toFixed(2)}</td>
            `;
            orderList.appendChild(row);
        });
    } catch (error) {
        orderList.innerHTML = '<tr><td colspan="3">Error loading orders.</td></tr>';
        noOrdersMessage.style.display = 'none';
    }
}

displayOrders();