// musicas.js — CRUD de músicas no painel admin
// Depende de api.js (API_URL, api, formatDuration) carregado antes deste script.

const songForm = document.querySelector('#songForm');
const songIdInput = document.querySelector('#songId');
const songTitleInput = document.querySelector('#songTitle');
const songDurationInput = document.querySelector('#songDuration');
const songArtistSelect = document.querySelector('#songArtistId');
const songAlbumSelect = document.querySelector('#songAlbumId');
const songUrlInput = document.querySelector('#songUrl');
const songCoverUrlInput = document.querySelector('#songCoverUrl');
const songFormMessage = document.querySelector('#songFormMessage');
const songFormTitle = document.querySelector('#formTitle');
const songSubmitBtn = document.querySelector('#songSubmitBtn');
const songCancelBtn = document.querySelector('#songCancelBtn');
const songsTableBody = document.querySelector('#songsTableBody');
const pageError = document.querySelector('#pageError');

let songs = [];
let artists = [];
let albums = [];

function resetForm() {
    songForm.reset();
    songIdInput.value = '';
    songFormTitle.textContent = 'Nova música';
    songSubmitBtn.textContent = 'Adicionar música';
    songCancelBtn.hidden = true;
    songFormMessage.textContent = '';
    songFormMessage.className = 'form-message';
    populateAlbumSelect('');
}

function populateArtistSelect() {
    songArtistSelect.innerHTML = '<option value="">Selecione...</option>';
    artists.forEach((artist) => {
        const option = document.createElement('option');
        option.value = artist.id;
        option.textContent = artist.name;
        songArtistSelect.appendChild(option);
    });
}

// Só mostra álbuns do artista selecionado (o backend exige que o álbum pertença ao artista).
function populateAlbumSelect(artistId, selectedAlbumId) {
    if (!artistId) {
        songAlbumSelect.innerHTML = '<option value="">Selecione um artista primeiro</option>';
        return;
    }
    const artistAlbums = albums.filter((album) => (album.artistId || album.artist?.id) === artistId);
    if (artistAlbums.length === 0) {
        songAlbumSelect.innerHTML = '<option value="">Este artista não tem álbuns ainda</option>';
        return;
    }
    songAlbumSelect.innerHTML = '<option value="">Selecione...</option>';
    artistAlbums.forEach((album) => {
        const option = document.createElement('option');
        option.value = album.id;
        option.textContent = album.title;
        songAlbumSelect.appendChild(option);
    });
    if (selectedAlbumId) {
        songAlbumSelect.value = selectedAlbumId;
    }
}

songArtistSelect.addEventListener('change', () => {
    populateAlbumSelect(songArtistSelect.value);
});

async function startEdit(song) {
    songFormMessage.textContent = 'Carregando dados da música...';
    songFormMessage.className = 'form-message';
    try {
        // A listagem não traz artistId/albumId, então busca os detalhes completos.
        const full = await api(`/songs/${song.id}`);
        songIdInput.value = full.id;
        songTitleInput.value = full.title;
        songDurationInput.value = full.duration;
        songUrlInput.value = full.songUrl || '';
        songCoverUrlInput.value = full.songCoverUrl || '';
        songArtistSelect.value = full.artist?.id || '';
        populateAlbumSelect(full.artist?.id, full.album?.id);
        songFormTitle.textContent = `Editando: ${full.title}`;
        songSubmitBtn.textContent = 'Salvar alterações';
        songCancelBtn.hidden = false;
        songFormMessage.textContent = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        songFormMessage.textContent = error.message || 'Não foi possível carregar a música.';
        songFormMessage.className = 'form-message error';
    }
}

function renderSongs() {
    songsTableBody.innerHTML = '';

    if (songs.length === 0) {
        songsTableBody.innerHTML = '<tr class="empty-row"><td colspan="4">Nenhuma música cadastrada ainda</td></tr>';
        return;
    }

    songs.forEach((song) => {
        const tr = document.createElement('tr');

        const tdTitle = document.createElement('td');
        tdTitle.textContent = song.title;

        const tdDuration = document.createElement('td');
        tdDuration.textContent = formatDuration(song.duration);

        const tdArtist = document.createElement('td');
        tdArtist.textContent = song.artist?.name ?? '—';

        const tdActions = document.createElement('td');
        tdActions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn btn-outline btn-small';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', () => startEdit(song));

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger btn-small';
        deleteBtn.textContent = 'Excluir';
        deleteBtn.addEventListener('click', () => deleteSong(song));

        tdActions.append(editBtn, deleteBtn);
        tr.append(tdTitle, tdDuration, tdArtist, tdActions);
        songsTableBody.appendChild(tr);
    });
}

async function loadArtists() {
    artists = await api('/artists');
    populateArtistSelect();
}

async function loadAlbums() {
    albums = await api('/albums');
}

async function loadSongs() {
    songs = await api('/songs');
    renderSongs();
}

async function deleteSong(song) {
    if (!confirm(`Excluir a música "${song.title}"? Essa ação não pode ser desfeita.`)) {
        return;
    }
    try {
        await api(`/songs/${song.id}`, { method: 'DELETE' });
        await loadSongs();
    } catch (error) {
        pageError.textContent = error.message || 'Não foi possível excluir a música.';
    }
}

songForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    songFormMessage.textContent = '';
    songFormMessage.className = 'form-message';

    if (!songArtistSelect.value || !songAlbumSelect.value) {
        songFormMessage.textContent = 'Selecione o artista e o álbum.';
        songFormMessage.className = 'form-message error';
        return;
    }

    const payload = {
        title: songTitleInput.value.trim(),
        duration: parseInt(songDurationInput.value, 10),
        songUrl: songUrlInput.value.trim(),
        artistId: songArtistSelect.value,
        albumId: songAlbumSelect.value,
        songCoverUrl: songCoverUrlInput.value.trim() || undefined,
    };

    const editingId = songIdInput.value;

    try {
        if (editingId) {
            await api(`/songs/${editingId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
            songFormMessage.textContent = 'Música atualizada com sucesso.';
        } else {
            await api('/songs', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            songFormMessage.textContent = 'Música adicionada com sucesso.';
        }
        songFormMessage.className = 'form-message success';
        await loadSongs();
        resetForm();
    } catch (error) {
        songFormMessage.textContent = error.message || 'Não foi possível salvar a música.';
        songFormMessage.className = 'form-message error';
    }
});

songCancelBtn.addEventListener('click', resetForm);

async function init() {
    try {
        await Promise.all([loadArtists(), loadAlbums(), loadSongs()]);
    } catch (error) {
        console.error('Erro ao carregar músicas:', error);
        pageError.textContent = 'Não foi possível carregar as músicas.';
    }
}

init();
