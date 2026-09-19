// pPlaylists.js — lista, cria, edita e exclui as playlists do usuário logado
// Depende de ../api.js (API_URL, userId, api)

const playlistForm = document.querySelector('#playlistForm');
const formTitle = document.querySelector('#formTitle');
const nameInput = document.querySelector('#nameInput');
const publicInput = document.querySelector('#publicInput');
const coverInput = document.querySelector('#coverInput');
const createOnlyFields = document.querySelector('#createOnlyFields');
const formSubmit = document.querySelector('#formSubmit');
const formCancel = document.querySelector('#formCancel');
const message = document.querySelector('#message');
const playlistList = document.querySelector('#playlistList');

let editingId = null; // null = criando; id = editando

// ---------- LISTAR ----------

// `notice` é um aviso (ex.: "Playlist criada.") mostrado junto com a lista
async function loadPlaylists(notice = '') {
    if (!notice) message.textContent = 'Carregando playlists...';

    try {
        const playlists = await api(`/users/${userId}/playlists`);
        message.textContent = notice;
        renderPlaylists(playlists, notice);
    } catch (error) {
        playlistList.replaceChildren();
        message.textContent = error.message;
    }
}

function renderPlaylists(playlists, notice) {
    playlistList.replaceChildren();

    if (playlists.length === 0) {
        const empty = 'Você ainda não tem playlists. Crie a primeira no formulário acima.';
        message.textContent = notice ? `${notice} ${empty}` : empty;
        return;
    }

    playlists.forEach((playlist) => {
        const li = document.createElement('li');

        // entra na playlist: a pgMusicas.html decide o que mostrar pelo "tipo"
        const link = document.createElement('a');
        link.href = `../pgMusicas.html?tipo=playlist&id=${encodeURIComponent(playlist.id)}`;
        link.textContent = playlist.name;

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', () => startEditing(playlist));

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.textContent = 'Excluir';
        deleteBtn.addEventListener('click', () => deletePlaylist(playlist));

        li.append(link, ' ', editBtn, ' ', deleteBtn);
        playlistList.appendChild(li);
    });
}

// ---------- CRIAR / EDITAR ----------

function startEditing(playlist) {
    editingId = playlist.id;
    formTitle.textContent = 'Editar playlist';
    formSubmit.textContent = 'Salvar alterações';
    formCancel.hidden = false;
    createOnlyFields.hidden = true;
    nameInput.value = playlist.name;
    message.textContent = '';
    nameInput.focus();
}

function resetForm() {
    editingId = null;
    formTitle.textContent = 'Nova playlist';
    formSubmit.textContent = 'Criar playlist';
    formCancel.hidden = true;
    createOnlyFields.hidden = false;
    playlistForm.reset();
}

formCancel.addEventListener('click', () => {
    resetForm();
    message.textContent = '';
});

playlistForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    if (!name) {
        message.textContent = 'Digite um nome para a playlist.';
        nameInput.focus();
        return;
    }

    formSubmit.disabled = true;
    let notice;

    try {
        if (editingId) {
            await api(`/playlists/${editingId}`, {
                method: 'PATCH',
                body: JSON.stringify({ name }),
            });
            notice = 'Playlist atualizada.';
        } else {
            const body = { name, userId, isPublic: publicInput.checked };
            const coverUrl = coverInput.value.trim();
            if (coverUrl) body.coverUrl = coverUrl; // a API rejeita coverUrl vazio

            await api('/playlists', {
                method: 'POST',
                body: JSON.stringify(body),
            });
            notice = 'Playlist criada.';
        }
    } catch (error) {
        message.textContent = error.message;
        formSubmit.disabled = false;
        return;
    }

    formSubmit.disabled = false;
    resetForm();
    await loadPlaylists(notice);
});

// ---------- EXCLUIR ----------

async function deletePlaylist(playlist) {
    const confirmed = window.confirm(
        `Excluir a playlist "${playlist.name}"? As músicas continuam no Soundy, só saem da playlist.`
    );
    if (!confirmed) return;

    try {
        // remove primeiro as músicas da playlist, pra não esbarrar em chave estrangeira
        let items = [];
        try {
            items = await api(`/playlists/${playlist.id}/songs`);
        } catch (error) {
            if (error.status !== 404) throw error; // 404 = playlist sem músicas
        }

        await Promise.all(items.map((item) => api(`/playlistsongs/${item.id}`, { method: 'DELETE' })));
        await api(`/playlists/${playlist.id}`, { method: 'DELETE' });
    } catch (error) {
        message.textContent = error.message;
        return;
    }

    if (editingId === playlist.id) resetForm();
    await loadPlaylists('Playlist excluída.');
}

// ---------- INICIALIZAÇÃO ----------

if (userId) {
    loadPlaylists();
}
