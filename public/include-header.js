async function loadHeader() {
    try {
        const response = await fetch('/header.html');
        const headerHtml = await response.text();
        document.body.insertAdjacentHTML('afterbegin', headerHtml);

        // Check user status
        const statusResponse = await fetch('/api/user-status');
        const { isLoggedIn, isAdmin, firstName } = await statusResponse.json();
        const logoutBtn = document.getElementById('logout-btn');
        const adminLink = document.querySelector('nav a[href="/admin"]');
        const ordersLink = document.querySelector('nav a[href="/orders"]');
        const usernameDisplay = document.getElementById('username-display');

        if (isLoggedIn) {
            logoutBtn.style.display = 'inline-block';
            ordersLink.style.display = 'inline-block';
            usernameDisplay.style.display = 'inline-block';
            usernameDisplay.textContent = `Welcome, ${firstName}`;
        } else {
            logoutBtn.style.display = 'none';
            ordersLink.style.display = 'none';
            usernameDisplay.style.display = 'none';
        }

        if (isAdmin) {
            adminLink.style.display = 'inline-block';
        } else {
            adminLink.style.display = 'none';
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
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// Load header on page load
loadHeader();