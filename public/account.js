function toggleForm(formType) {
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');

    if (formType === 'login') {
        loginContainer.classList.add('active');
        registerContainer.classList.remove('active');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginContainer.classList.remove('active');
        registerContainer.classList.add('active');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

document.getElementById('login-tab').addEventListener('click', () => toggleForm('login'));
document.getElementById('register-tab').addEventListener('click', () => toggleForm('register'));

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('login-message').textContent = 'Logged in successfully!';
            document.getElementById('login-message').style.color = '#28a745';
            showToast('Logged in successfully!');
            if (data.isAdmin) {
                setTimeout(() => window.location.href = '/admin', 1000);
            } else {
                setTimeout(() => window.location.href = '/', 1000);
            }
        } else {
            document.getElementById('login-message').textContent = data.error || 'Login failed.';
            document.getElementById('login-message').style.color = '#dc3545';
            showToast(data.error || 'Login failed.', 'error');
        }
    } catch (error) {
        document.getElementById('login-message').textContent = 'An error occurred.';
        document.getElementById('login-message').style.color = '#dc3545';
        showToast('An error occurred.', 'error');
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('register-firstName').value;
    const lastName = document.getElementById('register-lastName').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('register-message').textContent = 'Registered successfully! Please log in.';
            document.getElementById('register-message').style.color = '#28a745';
            showToast('Registered successfully!');
        } else {
            document.getElementById('register-message').textContent = data.error || 'Registration failed.';
            document.getElementById('register-message').style.color = '#dc3545';
            showToast(data.error || 'Registration failed.', 'error');
        }
    } catch (error) {
        document.getElementById('register-message').textContent = 'An error occurred.';
        document.getElementById('register-message').style.color = '#dc3545';
        showToast('An error occurred.', 'error');
    }
});

// Set initial state
toggleForm('login');