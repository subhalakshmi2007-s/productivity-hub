// frontend/auth.js
const API_BASE = 'http://localhost:5000/api';

// Helper to show messages
function showMessage(elementId, message, isError = false) {
    const msgDiv = document.getElementById(elementId);
    if (msgDiv) {
        msgDiv.textContent = message;
        msgDiv.style.background = isError ? '#fee2e2' : '#dcfce7';
        msgDiv.style.color = isError ? '#b91c1c' : '#166534';
        setTimeout(() => {
            msgDiv.textContent = '';
            msgDiv.style.background = '';
        }, 3000);
    }
}

// Handle Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!username || !password) {
        showMessage('auth-message', 'Please fill all fields', true);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            window.location.href = 'index.html';
        } else {
            showMessage('auth-message', data.error || 'Login failed', true);
        }
    } catch (err) {
        showMessage('auth-message', 'Server error. Make sure backend is running.', true);
    }
});

// Handle Register
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    
    if (!username || !password) {
        showMessage('auth-message', 'Please fill all fields', true);
        return;
    }
    if (password.length < 3) {
        showMessage('auth-message', 'Password must be at least 3 characters', true);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage('auth-message', 'Registration successful! Please login.', false);
            setTimeout(() => {
                document.getElementById('register-form').style.display = 'none';
                document.getElementById('login-form').style.display = 'block';
                document.getElementById('show-register').style.display = 'inline';
            }, 1500);
        } else {
            showMessage('auth-message', data.error || 'Registration failed', true);
        }
    } catch (err) {
        showMessage('auth-message', 'Cannot connect to server', true);
    }
});

// Toggle between Login / Register forms
const showRegisterLink = document.getElementById('show-register');
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        showRegisterLink.style.display = 'none';
    });
}