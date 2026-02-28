// ============================================
// RealEstate Connect — App Core
// Router, Auth State, API Helpers
// ============================================

const API_BASE = '/api';
const appContainer = document.getElementById('app');

// --- Auth State ---
const Auth = {
    getToken() { return localStorage.getItem('rc_token'); },
    getUser() {
        const u = localStorage.getItem('rc_user');
        return u ? JSON.parse(u) : null;
    },
    setAuth(token, user) {
        localStorage.setItem('rc_token', token);
        localStorage.setItem('rc_user', JSON.stringify(user));
    },
    clear() {
        localStorage.removeItem('rc_token');
        localStorage.removeItem('rc_user');
    },
    isLoggedIn() { return !!this.getToken(); }
};

// --- API Helper ---
async function api(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options
    };
    const token = Auth.getToken();
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    return data;
}

// --- Toast Notifications ---
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- Format Price ---
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

// --- Update Nav UI ---
function updateNavUI() {
    const user = Auth.getUser();
    const guestEls = document.querySelectorAll('.guest-only');
    const authEls = document.querySelectorAll('.auth-only');

    if (user) {
        guestEls.forEach(el => el.style.display = 'none');
        authEls.forEach(el => el.style.display = '');
        document.getElementById('avatar-letter').textContent = user.name.charAt(0).toUpperCase();
        document.getElementById('dropdown-name').textContent = user.name;
        document.getElementById('dropdown-role').textContent = user.role;
    } else {
        guestEls.forEach(el => el.style.display = '');
        authEls.forEach(el => el.style.display = 'none');
    }
}

// --- Active Nav Link ---
function setActiveNav(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
}

// --- Router ---
const routes = {};

function registerPage(hash, renderFn) {
    routes[hash] = renderFn;
}

function navigate(hash) {
    window.location.hash = hash;
}

async function handleRoute() {
    const hash = window.location.hash || '#/';
    const [path, ...rest] = hash.slice(2).split('/');
    const params = rest.join('/');

    // Determine page name for nav highlighting
    const pageName = path || 'home';
    setActiveNav(pageName);

    // Close mobile menu
    document.getElementById('nav-links')?.classList.remove('open');
    // Close user dropdown
    document.getElementById('user-dropdown')?.classList.remove('open');

    // Find matching route
    let rendered = false;
    for (const [routeHash, renderFn] of Object.entries(routes)) {
        const routePath = routeHash.slice(2).split('/')[0];
        if (routePath === path || (routePath === '' && path === '')) {
            appContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;"><div class="skeleton" style="width:60px;height:60px;border-radius:50%;"></div></div>';
            await renderFn(params);
            rendered = true;
            break;
        }
    }

    if (!rendered) {
        appContainer.innerHTML = `
      <div class="empty-state" style="min-height:80vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div class="empty-icon">🔍</div>
        <h3>Page Not Found</h3>
        <p>The page you're looking for doesn't exist.</p>
        <a href="#/" class="btn btn-primary mt-3">Go Home</a>
      </div>`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Event Listeners ---
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
    updateNavUI();
    handleRoute();
});

// Hamburger menu
document.getElementById('nav-hamburger')?.addEventListener('click', () => {
    document.getElementById('nav-links')?.classList.toggle('open');
});

// User dropdown
document.getElementById('user-avatar-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('user-dropdown')?.classList.toggle('open');
});
document.addEventListener('click', () => {
    document.getElementById('user-dropdown')?.classList.remove('open');
});

// Logout
document.getElementById('btn-logout')?.addEventListener('click', () => {
    Auth.clear();
    updateNavUI();
    showToast('Signed out successfully', 'info');
    navigate('#/');
});
