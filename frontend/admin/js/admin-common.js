// admin-common.js
// Depende de api.js (API_URL, userId, api, LOGIN_URL) já carregado antes deste script.
// Garante que só admins entrem nas páginas do painel.

const isAdmin = localStorage.getItem('isAdmin') === 'true';
if (!isAdmin) {
    window.location.href = '../menu/menu.html';
}

// Envia um arquivo (mp3 ou imagem) pro backend e devolve a URL absoluta salva.
// kind: 'audio' ou 'image'. Usa fetch direto (não a função api()) porque aqui
// o corpo é multipart/form-data, não JSON.
async function uploadFile(kind, file) {
    const formData = new FormData();
    formData.append('file', file);

    let response;
    try {
        response = await fetch(`${API_URL}/uploads/${kind}`, {
            method: 'POST',
            body: formData,
        });
    } catch {
        throw new Error(`Não foi possível conectar ao servidor para enviar o arquivo.`);
    }

    const text = await response.text();
    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = null;
        }
    }

    if (!response.ok) {
        throw new Error(messageFrom(data) || `Erro ${response.status} ao enviar o arquivo.`);
    }

    return new URL(data.url, API_URL).href;
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
