// frontend/script.js
// Render backend URL - உங்க Render URL-க்கு மாத்துங்க
const API_BASE = 'https://productivity-hub-pwie.onrender.com/api';

// Get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Redirect to login if not authenticated
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    });
}

// Display welcome
function showWelcome() {
    const username = localStorage.getItem('username');
    const welcomeDiv = document.getElementById('user-welcome');
    if (welcomeDiv && username) {
        welcomeDiv.innerHTML = `👋 Welcome back, <strong>${username}</strong>! Stay productive.`;
    }
}

// Dark mode toggle
const darkToggle = document.getElementById('dark-mode-toggle');
if (darkToggle) {
    darkToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        darkToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('darkMode', isDark);
    });
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkToggle.textContent = '☀️ Light Mode';
    }
}

// ---------- TASKS CRUD ----------
let allTasks = [];

const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const addBtn = document.getElementById('add-task-btn');
const taskListDiv = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const totalSpan = document.getElementById('total-count');
const completedSpan = document.getElementById('completed-count');
const pendingSpan = document.getElementById('pending-count');

// Fetch tasks from backend
async function fetchTasks() {
    if (!checkAuth()) return;
    try {
        console.log('Fetching tasks from:', `${API_BASE}/tasks`);
        const response = await fetch(`${API_BASE}/tasks`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }
        const tasks = await response.json();
        allTasks = tasks;
        renderTasks();
    } catch (err) {
        console.error('Fetch tasks error:', err);
        if (taskListDiv) {
            taskListDiv.innerHTML = '<div class="empty-state">⚠️ Could not load tasks. Make sure backend is running.</div>';
        }
    }
}

// Add new task
async function addTask() {
    const title = taskInput.value.trim();
    if (!title) {
        alert('Please enter a task');
        return;
    }
    
    const category = categorySelect.value;
    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ title, category, completed: false })
        });
        if (response.ok) {
            taskInput.value = '';
            fetchTasks();
        } else {
            const err = await response.json();
            alert('Error: ' + (err.error || 'Could not add task'));
        }
    } catch (err) {
        console.error('Add task error:', err);
        alert('Network error. Is backend running?');
    }
}

// Toggle task completion
async function toggleTask(taskId, completed) {
    try {
        await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ completed })
        });
        fetchTasks();
    } catch (err) {
        console.error('Toggle error:', err);
    }
}

// Delete task
async function deleteTask(taskId) {
    if (confirm('Delete this task?')) {
        try {
            await fetch(`${API_BASE}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            fetchTasks();
        } catch (err) {
            alert('Delete failed');
        }
    }
}

// Filter & Render tasks
function renderTasks() {
    let filtered = [...allTasks];
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm));
    }
    
    // Update stats
    const total = filtered.length;
    const completed = filtered.filter(t => t.completed).length;
    const pending = total - completed;
    if (totalSpan) totalSpan.innerText = total;
    if (completedSpan) completedSpan.innerText = completed;
    if (pendingSpan) pendingSpan.innerText = pending;
    
    if (filtered.length === 0) {
        if (taskListDiv) {
            taskListDiv.innerHTML = '<div class="empty-state">📭 No tasks match. Add a new task!</div>';
        }
        return;
    }
    
    if (taskListDiv) {
        taskListDiv.innerHTML = filtered.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-check">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id}, this.checked)">
                    <span class="task-title">${escapeHtml(task.title)}</span>
                    <span class="task-category">${escapeHtml(task.category)}</span>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Make functions global for inline onclick handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// Event listeners
if (addBtn) {
    addBtn.addEventListener('click', addTask);
}
if (taskInput) {
    taskInput.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') addTask(); 
    });
}
if (searchInput) {
    searchInput.addEventListener('input', renderTasks);
}

// Initialize
if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    if (checkAuth()) {
        showWelcome();
        fetchTasks();
    }
}