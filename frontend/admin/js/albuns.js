// albuns.js — CRUD de álbuns no painel admin
// Depende de api.js (API_URL, api) carregado antes deste script.

const albumForm = document.querySelector('#albumForm');
const albumIdInput = document.querySelector('#albumId');
const albumTitleInput = document.querySelector('#albumTitle');
const albumTypeInput = document.querySelector('#albumType');
const albumArtistSelect = document.querySelector('#albumArtistId');
const albumCoverFileInput = document.querySelector('#albumCoverFile');
const albumCoverUrlInput = document.querySelector('#albumCoverUrl');
const albumCoverHint = document.querySelector('#albumCoverHint');
const albumFormMessage = document.querySelector('#albumFormMessage');
const albumFormTitle = document.querySelector('#formTitle');
const albumSubmitBtn = document.querySelector('#albumSubmitBtn');
const albumCancelBtn = document.querySelector('#albumCancelBtn');
const albumsTableBody = document.querySelector('#albumsTableBody');
const pageError = document.querySelector('#pageError');

let albums = [];
let artists = [];

function resetForm() {
    albumForm.reset();
    albumIdInput.value = '';
    albumCoverUrlInput.value = '';
    albumCoverHint.textContent = '';
    albumFormTitle.textContent = 'Novo álbum';
    albumSubmitBtn.textContent = 'Adicionar álbum';
    albumCancelBtn.hidden = true;
    albumFormMessage.textContent = '';
    albumFormMessage.className = 'form-message';
}

function startEdit(album) {
    albumIdInput.value = album.id;
    albumTitleInput.value = album.title;
    albumTypeInput.value = album.type;
    albumArtistSelect.value = album.artistId || album.artist?.id || '';
    albumCoverUrlInput.value = album.coverUrl || '';
    albumCoverFileInput.value = '';
    albumCoverHint.textContent = album.coverUrl
        ? 'Já tem uma capa. Escolha um arquivo só se quiser trocar.'
        : '';
    albumFormTitle.textContent = `Editando: ${album.title}`;
    albumSubmitBtn.textContent = 'Salvar alterações';
    albumCancelBtn.hidden = false;
    albumFormMessage.textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function populateArtistSelect() {
    albumArtistSelect.innerHTML = '<option value="">Selecione...</option>';
    artists.forEach((artist) => {
        const option = document.createElement('option');
        option.value = artist.id;
        option.textContent = artist.name;
        albumArtistSelect.appendChild(option);
    });
}

function renderAlbums() {
    albumsTableBody.innerHTML = '';

    if (albums.length === 0) {
        albumsTableBody.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhum álbum cadastrado ainda</td></tr>';
        return;
    }

    albums.forEach((album) => {
        const tr = document.createElement('tr');

        const tdCover = document.createElement('td');
        if (album.coverUrl) {
            const img = document.createElement('img');
            img.className = 'thumb';
            img.src = album.coverUrl;
            img.alt = '';
            tdCover.appendChild(img);
        }

        const tdTitle = document.createElement('td');
        tdTitle.textContent = album.title;

        const tdType = document.createElement('td');
        tdType.textContent = album.type;

        const tdArtist = document.createElement('td');
        tdArtist.textContent = album.artist?.name ?? '—';

        const tdActions = document.createElement('td');
        tdActions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn btn-outline btn-small';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', () => startEdit(album));

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger btn-small';
        deleteBtn.textContent = 'Excluir';
        deleteBtn.addEventListener('click', () => deleteAlbum(album));

        tdActions.append(editBtn, deleteBtn);
        tr.append(tdCover, tdTitle, tdType, tdArtist, tdActions);
        albumsTableBody.appendChild(tr);
    });
}

async function loadArtists() {
    artists = await api('/artists');
    populateArtistSelect();
}

async function loadAlbums() {
    albums = await api('/albums');
    renderAlbums();
}

async function deleteAlbum(album) {
    if (!confirm(`Excluir o álbum "${album.title}"? Essa ação não pode ser desfeita.`)) {
        return;
    }
    try {
        await api(`/albums/${album.id}`, { method: 'DELETE' });
        await loadAlbums();
    } catch (error) {
        pageError.textContent = error.message || 'Não foi possível excluir o álbum.';
    }
}

albumForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    albumFormMessage.textContent = '';
    albumFormMessage.className = 'form-message';

    if (!albumArtistSelect.value) {
        albumFormMessage.textContent = 'Selecione um artista.';
        albumFormMessage.className = 'form-message error';
        return;
    }

    const editingId = albumIdInput.value;
    let coverUrl = albumCoverUrlInput.value.trim() || undefined;

    try {
        const chosenFile = albumCoverFileInput.files[0];
        if (chosenFile) {
            albumFormMessage.textContent = 'Enviando imagem...';
            coverUrl = await uploadFile('image', chosenFile);
        }
    } catch (error) {
        albumFormMessage.textContent = error.message || 'Não foi possível enviar a imagem.';
        albumFormMessage.className = 'form-message error';
        return;
    }

    const payload = {
        title: albumTitleInput.value.trim(),
        type: albumTypeInput.value,
        artistId: albumArtistSelect.value,
        coverUrl,
    };

    try {
        if (editingId) {
            await api(`/albums/${editingId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
            albumFormMessage.textContent = 'Álbum atualizado com sucesso.';
        } else {
            await api('/albums', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            albumFormMessage.textContent = 'Álbum adicionado com sucesso.';
        }
        albumFormMessage.className = 'form-message success';
        await loadAlbums();
        resetForm();
    } catch (error) {
        albumFormMessage.textContent = error.message || 'Não foi possível salvar o álbum.';
        albumFormMessage.className = 'form-message error';
    }
});

albumCancelBtn.addEventListener('click', resetForm);

async function init() {
    try {
        await Promise.all([loadArtists(), loadAlbums()]);
    } catch (error) {
        console.error('Erro ao carregar álbuns:', error);
        pageError.textContent = 'Não foi possível carregar os álbuns.';
    }
}

init();
