async function displayCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    const totalAmountSpan = document.getElementById('total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    cartItemsDiv.innerHTML = '';

    try {
        const response = await fetch('/api/cart');
        if (!response.ok) {
            cartItemsDiv.innerHTML = '<p>Please log in to view your cart.</p>';
            totalAmountSpan.textContent = `${window.currencySymbol}0.00`;
            checkoutBtn.style.display = 'none';
            return;
        }
        const cart = await response.json();

        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
            totalAmountSpan.textContent = `${window.currencySymbol}0.00`;
            checkoutBtn.style.display = 'none';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            const quantity = item.quantity || 1; // Fallback to 1 if undefined
            const itemTotal = item.bookId.price * quantity;
            total += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <p>${item.bookId.title} - ${window.currencySymbol}${item.bookId.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item.bookId._id}', ${quantity - 1})">−</button>
                    <span>${quantity}</span>
                    <button onclick="updateQuantity('${item.bookId._id}', ${quantity + 1})">+</button>
                </div>
                <p>= ${window.currencySymbol}${itemTotal.toFixed(2)}</p>
                <button onclick="removeFromCart('${item.bookId._id}')">Remove</button>
            `;
            cartItemsDiv.appendChild(itemDiv);
        });

        totalAmountSpan.textContent = `${window.currencySymbol}${total.toFixed(2)}`;
        checkoutBtn.style.display = 'block';
    } catch (error) {
        cartItemsDiv.innerHTML = '<p>Error loading cart.</p>';
        totalAmountSpan.textContent = `${window.currencySymbol}0.00`;
        checkoutBtn.style.display = 'none';
    }
}

async function updateQuantity(bookId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(bookId);
        return;
    }

    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId, quantity: newQuantity })
        });
        const data = await response.json();
        if (response.ok) {
            displayCart();
        } else {
            showToast(data.error || 'Failed to update quantity.', 'error');
        }
    } catch (error) {
        showToast('An error occurred while updating quantity.', 'error');
    }
}

async function removeFromCart(bookId) {
    try {
        const response = await fetch(`/api/cart/${bookId}`, { method: 'DELETE' });
        if (response.ok) {
            displayCart();
        } else {
            showToast('Failed to remove item.', 'error');
        }
    } catch (error) {
        showToast('An error occurred.', 'error');
    }
}

document.getElementById('checkout-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (response.ok) {
            showToast('Checkout successful! Your order has been placed.');
            window.location.href = '/';
        } else {
            if (data.details) {
                showToast(`Checkout failed due to insufficient stock:\n${data.details.join('\n')}`, 'error');
            } else {
                showToast(data.error || 'Checkout failed.', 'error');
            }
        }
    } catch (error) {
        showToast('An error occurred during checkout.', 'error');
    }
});

displayCart();