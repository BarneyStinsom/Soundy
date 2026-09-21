// api.js — conexão com o backend, compartilhada pelas páginas.
// Inclua antes do JS da página:  <script src="../api.js"></script>

const API_URL = 'https://soundy-utye.onrender.com';

// O Login.html fica uma pasta acima deste arquivo (js/), então o caminho
// funciona de qualquer pasta que a página esteja.
const LOGIN_URL = new URL('../Login.html', document.currentScript.src).href;

const userId = localStorage.getItem('userId');
if (!userId) {
    window.location.href = LOGIN_URL;
}

function messageFrom(data) {
    if (!data || !data.message) return '';
    return Array.isArray(data.message) ? data.message.join(' ') : String(data.message);
}

// Faz a requisição e devolve o JSON (ou null se a resposta vier vazia).
// Em caso de erro, lança um Error com a propriedade `status`.
async function api(path, options = {}) {
    const headers = options.body ? { 'Content-Type': 'application/json' } : {};

    let response;
    try {
        response = await fetch(`${API_URL}${path}`, { ...options, headers });
    } catch {
        throw new Error(`Não foi possível conectar ao servidor. Confira se o backend está rodando em ${API_URL}.`);
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
        const error = new Error(messageFrom(data) || `Erro ${response.status} ao falar com o servidor.`);
        error.status = response.status;
        throw error;
    }

    return data;
}

// duration vem em segundos
function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}
