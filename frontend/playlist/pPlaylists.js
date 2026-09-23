// pPlaylists.js — mostra as playlists do usuário logado como cards e cria playlists por um modal.
// Cada card abre a pgMusicas.html com tipo=playlist; ela cuida de mostrar as músicas.
// Depende de ../js/api.js (userId, api)

const grid = document.querySelector('#playlistGrid');
const message = document.querySelector('#message');

const createBtn = document.querySelector('#openCreateBtn');
const dialog = document.querySelector('#createDialog');
const createForm = document.querySelector('#createForm');
const nameInput = document.querySelector('#nameInput');
const coverInput = document.querySelector('#coverInput');
const publicInput = document.querySelector('#publicInput');
const formMessage = document.querySelector('#formMessage');
const submitBtn = document.querySelector('#submitBtn');
const cancelBtn = document.querySelector('#cancelBtn');

const DEFAULT_COVER = '../imagens/Logo.png';

// ---------- LISTAR ----------

function openPlaylist(playlist) {
    window.location.href = `../pgMusicas.html?tipo=playlist&id=${encodeURIComponent(playlist.id)}`;
}

function createCard(playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.tabIndex = 0; // dá pra focar e abrir com Enter
    card.setAttribute('role', 'link');

    const cover = document.createElement('img');
    cover.className = 'playlist-capa';
    cover.src = playlist.coverUrl || DEFAULT_COVER;
    cover.alt = `Capa da playlist ${playlist.name}`;
    cover.addEventListener('error', () => { cover.src = DEFAULT_COVER; }, { once: true });

    const name = document.createElement('h2');
    name.textContent = playlist.name;

    card.append(cover, name);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'playlist-excluir';
    deleteBtn.textContent = '🗑';
    deleteBtn.title = 'Excluir playlist';
    deleteBtn.setAttribute('aria-label', `Excluir a playlist ${playlist.name}`);
    deleteBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // sem isso o clique também abriria a playlist
        deletePlaylist(playlist);
    });
    deleteBtn.addEventListener('keydown', (event) => {
        event.stopPropagation(); // Enter no botão não deve abrir a playlist
    });
    card.appendChild(deleteBtn);

    if (playlist.description) {
        const description = document.createElement('p');
        description.textContent = playlist.description;
        card.appendChild(description);
    }

    card.addEventListener('click', () => openPlaylist(playlist));
    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') openPlaylist(playlist);
    });

    return card;
}

// `notice` é um aviso (ex.: "Playlist criada.") mostrado junto com a lista
async function loadPlaylists(notice = '') {
    if (!notice) message.textContent = 'Carregando playlists...';

    try {
        const playlists = await api(`/users/${userId}/playlists`);
        grid.replaceChildren(...playlists.map(createCard));

        const empty = playlists.length === 0 ? 'Você ainda não tem playlists.' : '';
        message.textContent = [notice, empty].filter(Boolean).join(' ');
    } catch (error) {
        grid.replaceChildren();
        message.textContent = error.message;
    }
}

// ---------- EXCLUIR ----------

async function deletePlaylist(playlist) {
    if (!confirm(`Excluir a playlist "${playlist.name}"? Essa ação não pode ser desfeita.`)) {
        return;
    }

    try {
        await api(`/playlists/${playlist.id}`, { method: 'DELETE' });
        await loadPlaylists('Playlist excluída.');
    } catch (error) {
        message.textContent = error.message || 'Não foi possível excluir a playlist.';
    }
}

// ---------- MODAL: CRIAR PLAYLIST ----------

createBtn.addEventListener('click', () => {
    dialog.showModal(); // o <dialog> já cuida do Esc, do fundo escuro e de prender o foco
    nameInput.focus();
});

cancelBtn.addEventListener('click', () => dialog.close());

// clicar no fundo escuro (fora do quadro branco) também fecha
dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
});

// qualquer forma de fechar limpa o formulário
dialog.addEventListener('close', () => {
    createForm.reset();
    formMessage.textContent = '';
    submitBtn.disabled = false;
});

createForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    if (!name) {
        formMessage.textContent = 'Digite um nome para a playlist.';
        nameInput.focus();
        return;
    }

   const coverFile = coverInput.files[0];
if (coverFile && coverFile.size > 5 * 1024 * 1024) { // mesmo limite do backend
    formMessage.textContent = 'A imagem deve ter no máximo 5MB.';
    return;
}

submitBtn.disabled = true;
formMessage.textContent = '';

try {
    const body = { name, userId, isPublic: publicInput.checked };

    if (coverFile) {
        const formData = new FormData();
        formData.append('file', coverFile); // igual ao FileInterceptor('file')

        const upload = await api('/uploads/image', {
            method: 'POST',
            body: formData,
        });
        body.coverUrl = upload.url;
    }

    await api('/playlists', {
        method: 'POST',
        body: JSON.stringify(body),
    });
} catch (error) {
    formMessage.textContent = error.message;
    submitBtn.disabled = false;
    return; // deixa o modal aberto pra pessoa corrigir
}

    dialog.close();
    await loadPlaylists('Playlist criada.');
});

// ---------- INICIALIZAÇÃO ----------

if (userId) {
    loadPlaylists();
}
