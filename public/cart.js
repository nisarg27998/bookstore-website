function getCurrencySymbol() {
    const testElement = document.createElement('span');
    testElement.innerHTML = '₹';
    document.body.appendChild(testElement);
    const isSupported = testElement.offsetWidth > 0 && testElement.textContent === '₹';
    document.body.removeChild(testElement);
    return isSupported ? '₹' : 'INR ';
}

const currencySymbol = getCurrencySymbol();

async function displayCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    const totalAmountSpan = document.getElementById('total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    cartItemsDiv.innerHTML = '';

    try {
        const response = await fetch('/api/cart');
        if (!response.ok) {
            cartItemsDiv.innerHTML = '<p>Please log in to view your cart.</p>';
            totalAmountSpan.textContent = `${currencySymbol}0.00`;
            checkoutBtn.style.display = 'none';
            return;
        }
        const cart = await response.json();

        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
            totalAmountSpan.textContent = `${currencySymbol}0.00`;
            checkoutBtn.style.display = 'none';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.bookId.price * item.quantity;
            total += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <p>${item.bookId.title} - ${currencySymbol}${item.bookId.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item.bookId._id}', ${item.quantity - 1})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.bookId._id}', ${item.quantity + 1})">+</button>
                </div>
                <p>= ${currencySymbol}${itemTotal.toFixed(2)}</p>
                <button onclick="removeFromCart('${item.bookId._id}')">Remove</button>
            `;
            cartItemsDiv.appendChild(itemDiv);
        });

        totalAmountSpan.textContent = `${currencySymbol}${total.toFixed(2)}`;
        checkoutBtn.style.display = 'block';
    } catch (error) {
        cartItemsDiv.innerHTML = '<p>Error loading cart.</p>';
        totalAmountSpan.textContent = `${currencySymbol}0.00`;
        checkoutBtn.style.display = 'none';
    }
}

async function updateQuantity(bookId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(bookId); // Remove item if quantity drops to 0
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
            displayCart(); // Refresh cart display
        } else {
            alert(data.error || 'Failed to update quantity.');
        }
    } catch (error) {
        alert('An error occurred while updating quantity.');
    }
}

async function removeFromCart(bookId) {
    try {
        const response = await fetch(`/api/cart/${bookId}`, { method: 'DELETE' });
        if (response.ok) {
            displayCart();
        } else {
            alert('Failed to remove item.');
        }
    } catch (error) {
        alert('An error occurred.');
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
            alert('Checkout successful! Your order has been placed.');
            window.location.href = '/';
        } else {
            if (data.details) {
                alert(`Checkout failed due to insufficient stock:\n${data.details.join('\n')}`);
            } else {
                alert(data.error || 'Checkout failed.');
            }
        }
    } catch (error) {
        alert('An error occurred during checkout.');
    }
});

// Display cart on page load
displayCart();