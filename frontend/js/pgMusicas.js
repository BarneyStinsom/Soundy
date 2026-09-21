
const params = new URLSearchParams(window.location.search);
const tipo = (params.get('tipo') || '').toLowerCase();
const id = params.get('id');


function kindFromTipo(value) {
    if (value === 'playlist') return 'playlist';
    if (['album', 'albuns', 'albums', 'ep', 'eps', 'single', 'singles'].includes(value)) return 'album';
    return null;
}

let kind = kindFromTipo(tipo); 

const backLink = document.querySelector('#backLink');
const message = document.querySelector('#message');
const content = document.querySelector('#content');
const titleEl = document.querySelector('#title');
const tipoText = document.querySelector('#tipoText');
const info = document.querySelector('#info');
const emptyText = document.querySelector('#emptyText');
const songList = document.querySelector('#songList');
const addForm = document.querySelector('#addForm');
const songSelect = document.querySelector('#songSelect');
const addBtn = document.querySelector('#addBtn');

let currentSongs = []; 
let allSongs = [];     


async function loadPlaylist() {
    const mine = await api(`/users/${userId}/playlists`);
    const playlist = mine.find((p) => p.id === id);
    if (!playlist) throw new Error('Playlist não encontrada.');

    return {
        title: playlist.name,
        tipoLabel: 'playlist',
        songs: await loadPlaylistSongs(),
    };
}


async function loadPlaylistSongs() {
    let items = [];
    try {
        items = await api(`/playlists/${id}/songs`);
    } catch (error) {
        if (error.status !== 404) throw error;
    }

    return items
        .sort((a, b) => a.position - b.position)
        .map((item) => ({
            rowId: item.id, 
            position: item.position,
            id: item.song?.id,
            title: item.song?.title ?? 'Música removida',
            duration: item.song?.duration ?? 0,
        }));
}

async function loadAlbum() {
    const album = await api(`/albums/${id}`);
    if (!album) throw new Error('Álbum não encontrado.'); 

    let songs = [];
    try {
        songs = await api(`/albums/${id}/songs`);
    } catch (error) {
        if (error.status !== 404) throw error; 
    }

    const artistName = album.artist?.name;
    return {
        title: artistName ? `${album.title} — ${artistName}` : album.title,
        tipoLabel: album.type, 
        songs: songs.map((song, index) => ({
            position: index + 1,
            id: song.id,
            title: song.title,
            duration: song.duration,
        })),
    };
}



function render(data) {
    currentSongs = data.songs;

    document.title = `${data.title} — Soundy`;
    titleEl.textContent = data.title;
    tipoText.textContent = `Tipo: ${data.tipoLabel}`;

    const total = currentSongs.reduce((sum, song) => sum + song.duration, 0);
    info.textContent = currentSongs.length === 0
        ? 'Nenhuma música'
        : `${currentSongs.length} ${currentSongs.length === 1 ? 'música' : 'músicas'} — ${formatDuration(total)} no total`;

    emptyText.hidden = currentSongs.length > 0;
    renderSongs();
    content.hidden = false;
}

function renderSongs() {
    songList.replaceChildren();

    currentSongs.forEach((song) => {
        const li = document.createElement('li');
        li.textContent = `${song.title} — ${formatDuration(song.duration)}`;

        // abre o player; tipo e coleção fazem "Anterior" e "Próxima" seguirem esta lista
        const playLink = document.createElement('a');
        playLink.href = `musica/pMusica.html?id=${encodeURIComponent(song.id)}&tipo=${kind}&colecao=${encodeURIComponent(id)}`;
        playLink.textContent = 'Tocar';
        li.append(' ', playLink);

        if (kind === 'playlist') {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = 'Remover';
            removeBtn.addEventListener('click', () => removeSong(song));
            li.append(' ', removeBtn);
        }

        songList.appendChild(li);
    });
}


function fillSongSelect() {
    const inPlaylist = new Set(currentSongs.map((song) => song.id));
    const available = allSongs.filter((song) => !inPlaylist.has(song.id));

    songSelect.replaceChildren();
    available.forEach((song) => {
        const option = document.createElement('option');
        option.value = song.id;
        option.textContent = song.artist?.name ? `${song.title} — ${song.artist.name}` : song.title;
        songSelect.appendChild(option);
    });

    addBtn.disabled = available.length === 0;
    if (available.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'Todas as músicas já estão na playlist';
        songSelect.appendChild(option);
    }
}

async function reloadPlaylist(notice = '') {
    const data = await loadPlaylist();
    render(data);
    fillSongSelect();
    message.textContent = notice;
}

addForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!songSelect.value) return;

    const position = currentSongs.reduce((max, song) => Math.max(max, song.position), 0) + 1;
    addBtn.disabled = true;

    try {
        await api('/playlistsongs', {
            method: 'POST',
            body: JSON.stringify({ playlistId: id, songId: songSelect.value, position }),
        });
        await reloadPlaylist('Música adicionada.');
    } catch (error) {
        message.textContent = error.message;
        addBtn.disabled = false;
    }
});

async function removeSong(song) {
    try {
        await api(`/playlistsongs/${song.rowId}`, { method: 'DELETE' });
        await reloadPlaylist('Música removida da playlist.');
    } catch (error) {
        message.textContent = error.message;
    }
}


async function detectKind() {
    const album = await api(`/albums/${id}`);
    if (album) return 'album';

    const mine = await api(`/users/${userId}/playlists`);
    if (mine.some((playlist) => playlist.id === id)) return 'playlist';

    return null;
}


async function init() {
    if (!id) {
        message.textContent =
            'Endereço inválido: falta o id. Use pgMusicas.html?tipo=album&id=... ou ?tipo=playlist&id=...';
        return;
    }

    message.textContent = 'Carregando...';

    try {
        if (!kind) {
            kind = await detectKind();
            if (!kind) throw new Error('Não encontrei nenhum álbum ou playlist com esse id.');
        }

        backLink.href = kind === 'playlist' ? 'playlist/pPlaylists.html' : 'menu/menu.html';

        if (kind === 'playlist') {
            allSongs = await api('/songs');
            await reloadPlaylist();
            addForm.hidden = false;
        } else {
            render(await loadAlbum());
            message.textContent = '';
        }
    } catch (error) {
        message.textContent = error.message;
    }
}

if (userId) {
    init();
}