// admin-common.js
// Depende de api.js (API_URL, userId, api, LOGIN_URL) já carregado antes deste script.
// Garante que só admins entrem nas páginas do painel.

const isAdmin = localStorage.getItem('isAdmin') === 'true';
if (!isAdmin) {
    window.location.href = '../menu/menu.html';
}

function adminLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    window.location.href = LOGIN_URL;
}

// Marca o link ativo na nav do painel com base no atributo data-page do <body>.
function highlightActiveNav() {
    const current = document.body.dataset.page;
    if (!current) return;
    document.querySelectorAll('.admin-nav a[data-page]').forEach((link) => {
        if (link.dataset.page === current) {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', highlightActiveNav);

const logoutBtnEl = document.querySelector('#adminLogoutBtn');
if (logoutBtnEl) {
    logoutBtnEl.addEventListener('click', adminLogout);
}
