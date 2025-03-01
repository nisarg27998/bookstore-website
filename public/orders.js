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
            detailsRow.style.display = 'none'; // Hidden by default
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

displayOrders();