// pgMusicas.js — lista as músicas de uma playlist OU de um álbum/EP/single e toca no player inferior.
// URL: pgMusicas.html?tipo=playlist&id=...  (ou tipo=album). Sem "tipo", descobre pelo id.
// Playlist própria: botão "+ Adicionar músicas" (canto inferior esquerdo) e botão ✕ em cada música.
// Depende de api.js (API_URL, userId, api, formatDuration)

const params = new URLSearchParams(window.location.search);
const tipo = (params.get('tipo') || params.get('type') || '').toLowerCase();
const id = params.get('id');

// Álbum, EP e single são todos "álbuns" no banco (o que muda é o campo type).
function kindFromTipo(value) {
    if (value === 'playlist') return 'playlist';
    if (['album', 'albuns', 'albums', 'ep', 'eps', 'single', 'singles'].includes(value)) return 'album';
    return null;
}

let kind = kindFromTipo(tipo); // 'playlist' | 'album' | null (null = descobrir pelo id)

const DEFAULT_COVER = 'imagens/Logo.png';
const LISTEN_SECONDS = 30; // tempo ouvido para contar como reprodução

const $ = (selector) => document.querySelector(selector);
const backLink = $('#backLink');
const message = $('#message');
const content = $('#content');
const titleEl = $('#title');
const coverEl = $('#cover');
const tipoText = $('#tipoText');
const info = $('#info');
const emptyText = $('#emptyText');
const songList = $('#songList');
const openAddBtn = $('#openAddBtn');
const addDialog = $('#addDialog');
const closeAddBtn = $('#closeAddBtn');
const searchInput = $('#addSearchInput');
const searchResults = $('#addSearchResults');
const addMessage = $('#addMessage');

function atualizarPreenchimento(input) {
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const valor = Number(input.value);
    const percentual = max > min ? ((valor - min) / (max - min)) * 100 : 0;
    input.style.setProperty('--valor', `${percentual}%`);
}

const audio = $('#audioPlayer');
const playPauseBtn = $('#playPauseBtn');
const barraProgresso = $('#barraProgresso');
const tempoAtual = $('#tempoAtual');
const barraVolume = $('#barraVolume');
const playerCapa = $('#playerCapa');
const playerNome = $('#playerNome');
const playerArtista = $('#playerArtista');

let currentSongs = [];   // [{ rowId, position, id, title, duration, artist, cover }]
let allSongs = [];       // todas as músicas do sistema (pra buscar e adicionar)
let songById = new Map();
let collectionCover = DEFAULT_COVER;

function notify(text) {
    message.textContent = text;
    addMessage.textContent = text;
}

// áudios podem vir como "/audio/x.mp3" (do backend) ou como link completo
function assetUrl(url) {
    return new URL(url, API_URL).href;
}

// Capas podem ser: link completo (Cloudinary), caminho local da pasta imagens
// ("imagens/pop.jfif", "../imagens/pop.jfif") ou caminho do backend ("/uploads/x.jpg").
function imageUrl(url) {
    if (/^(https?:|data:|blob:)/i.test(url)) return url;

    const local = url.replace(/\\/g, '/').match(/imagens\/.+$/i); // pgMusicas.html fica na mesma pasta de "imagens"
    if (local) return local[0];

    return assetUrl(url);
}

// se uma capa não carregar, avisa no console qual endereço falhou e troca pela padrão
function fallbackCover(img) {
    img.onerror = () => {
        console.warn('Capa não carregou:', img.src);
        message.textContent = `Uma capa não carregou: ${img.src}`;
        img.onerror = null;
        img.src = DEFAULT_COVER;
    };
}

function normalize(text) {
    // "Ação" e "acao" passam a ser iguais na busca
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function formatTime(seconds) {
    return formatDuration(Math.floor(seconds || 0));
}

// ---------- PEÇAS DAS LINHAS ----------

// links (opcional): { titleHref } faz o nome abrir uma página; { onCover } faz a foto ser clicável
function createRow(song, artist, links = {}) {
    const row = document.createElement('div');
    row.className = 'musica';

    const img = document.createElement('img');
    img.className = 'musica-capa';
    img.alt = '';
    fallbackCover(img);
    img.src = song.cover ? imageUrl(song.cover) : collectionCover;

    if (links.onCover) {
        const open = (event) => { event.stopPropagation(); links.onCover(); };
        img.classList.add('link');
        img.title = 'Abrir álbum';
        img.tabIndex = 0;
        img.setAttribute('role', 'link');
        img.addEventListener('click', open);
        img.addEventListener('keydown', (event) => { if (event.key === 'Enter') open(event); });
    }

    const box = document.createElement('div');
    box.className = 'musica-info';
    const strong = document.createElement('strong');
    if (links.titleHref) {
        const link = document.createElement('a');
        link.href = links.titleHref;
        link.title = 'Abrir música';
        link.textContent = song.title;
        link.addEventListener('click', (event) => event.stopPropagation()); // não dispara o play da linha
        strong.appendChild(link);
    } else {
        strong.textContent = song.title;
    }
    box.appendChild(strong);
    if (artist) {
        const span = document.createElement('span');
        span.textContent = artist;
        box.appendChild(span);
    }

    const duration = document.createElement('span');
    duration.className = 'musica-duracao';
    duration.textContent = formatDuration(song.duration ?? 0);

    row.append(img, box, duration);
    return row;
}

// ---------- CARREGAR CONFORME O TIPO ----------
// Cada loader devolve { title, subtitle, cover, songs } no mesmo formato.

async function loadPlaylist() {
    const mine = await api(`/users/${userId}/playlists`);
    const playlist = mine.find((p) => p.id === id);
    if (!playlist) throw new Error('Playlist não encontrada.');

    // A API responde 404 quando a playlist existe mas está vazia — aqui vira lista vazia.
    let items = [];
    try {
        items = await api(`/playlists/${id}/songs`);
    } catch (error) {
        if (error.status !== 404) throw error;
    }

    return {
        title: playlist.name,
        subtitle: playlist.description || 'playlist',
        cover: playlist.coverUrl,
        songs: items
            .sort((a, b) => a.position - b.position)
            .map((item) => ({
                rowId: item.id, // id da linha em playlistsongs (usado pra remover)
                position: item.position,
                id: item.song?.id,
                title: item.song?.title ?? 'Música removida',
                duration: item.song?.duration ?? 0,
                artist: songById.get(item.song?.id)?.artist?.name,
                cover: item.song?.songCoverUrl,
            })),
    };
}

async function loadAlbum() {
    const album = await api(`/albums/${id}`);
    if (!album) throw new Error('Álbum não encontrado.');

    let songs = [];
    try {
        songs = await api(`/albums/${id}/songs`);
    } catch (error) {
        if (error.status !== 404) throw error; // 404 = álbum sem músicas
    }

    // Confira no console (F12) o que a API mandou: se coverUrl / songCoverUrl vierem null, o problema é o cadastro.
    console.log('[album] /albums/:id →', album);
    console.log('[album] /albums/:id/songs →', songs);

    const artistName = album.artist?.name;
    const hasAnyCover = album.coverUrl || songs.some((song) => song.songCoverUrl);
    return {
        notice: hasAnyCover ? '' : `A API não trouxe capa para este álbum. Resposta de /albums/${id}: ${JSON.stringify(album)}`,
        title: album.title,
        subtitle: artistName ? `${album.type} — ${artistName}` : album.type,
        // capa do álbum; se ele não tiver, usa a capa da primeira música que tiver
        cover: album.coverUrl || songs.find((song) => song.songCoverUrl)?.songCoverUrl,
        songs: songs.map((song, index) => ({
            position: index + 1,
            id: song.id,
            title: song.title,
            duration: song.duration,
            artist: artistName,
            cover: song.songCoverUrl,
        })),
    };
}

// ---------- MOSTRAR NA TELA ----------

function render(data) {
    currentSongs = data.songs;
    collectionCover = data.cover ? imageUrl(data.cover) : DEFAULT_COVER;

    document.title = `${data.title} — Soundy`;
    titleEl.textContent = data.title;
    tipoText.textContent = data.title;
    info.textContent = data.subtitle;

    coverEl.alt = `Capa de ${data.title}`;
    fallbackCover(coverEl);
    coverEl.src = collectionCover;

    emptyText.hidden = currentSongs.length > 0;
    renderSongs();
    content.hidden = false;
}

function renderSongs() {
    songList.replaceChildren();

    currentSongs.forEach((song) => {
        const row = createRow(song, song.artist, {
            titleHref: song.id ? songPageUrl(song.id) : null,
            // na página de um álbum a foto já é do próprio álbum, então só a playlist precisa do atalho
            onCover: song.id && kind === 'playlist' ? () => openAlbumOf(song) : null,
        });
        row.dataset.id = song.id;
        row.addEventListener('click', () => playSong(song.id));

        // só a playlist permite tirar músicas
        if (kind === 'playlist') {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn-remover';
            removeBtn.textContent = '✕';
            removeBtn.title = 'Remover da playlist';
            removeBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // sem isso o clique também tocaria a música
                removeSong(song);
            });
            row.appendChild(removeBtn);
        }

        songList.appendChild(row);
    });

    markPlaying();
}

// página da música, com a coleção atual para "Anterior" e "Próxima" seguirem esta lista
function songPageUrl(songId) {
    return `musica/pMusica.html?id=${encodeURIComponent(songId)}&tipo=${kind}&colecao=${encodeURIComponent(id)}`;
}

// A lista da playlist não traz o álbum de cada música, então busca a música inteira (GET /songs/:id).
async function openAlbumOf(song) {
    try {
        const full = await api(`/songs/${encodeURIComponent(song.id)}`);
        const albumId = full?.album?.id;
        if (!albumId) {
            notify('Não encontrei o álbum desta música.');
            return;
        }
        window.location.href = `pgMusicas.html?tipo=album&id=${encodeURIComponent(albumId)}`;
    } catch (error) {
        notify(error.message);
    }
}

function markPlaying() {
    songList.querySelectorAll('.musica').forEach((row) => {
        row.classList.toggle('tocando', row.dataset.id === playingId);
    });
}

// ---------- PLAYER ----------

let playingId = null;
let loadToken = 0; // evita que uma resposta antiga sobrescreva uma música mais nova

// As listas não trazem o arquivo de áudio, então busca a música inteira (GET /songs/:id) ao clicar.
async function playSong(songId) {
    if (!songId) return;
    const token = ++loadToken;

    try {
        const song = await api(`/songs/${encodeURIComponent(songId)}`);
        if (token !== loadToken) return;
        if (!song?.songUrl) {
            notify('Esta música ainda não tem arquivo de áudio.');
            return;
        }

        playingId = songId;
        resetCounter();
        playerNome.textContent = song.title;
        playerArtista.textContent = song.artist?.name || 'Soundy';
        const cover = song.songCoverUrl || song.album?.coverUrl;
        fallbackCover(playerCapa);
        playerCapa.src = cover ? imageUrl(cover) : collectionCover;
        barraProgresso.value = 0;
        tempoAtual.textContent = formatTime(0);
        atualizarPreenchimento(barraProgresso);
        notify('');
        markPlaying();

        audio.src = assetUrl(song.songUrl);
        await audio.play();
    } catch (error) {
        if (error.name === 'AbortError') return; // trocaram de música no meio
        notify(error.name === 'NotAllowedError'
            ? 'O navegador bloqueou o play automático. Clique em ▶.'
            : (error.message || 'Não foi possível tocar esta música.'));
    }
}

function playNext() {
    const index = currentSongs.findIndex((song) => song.id === playingId);
    if (index >= 0 && index < currentSongs.length - 1) playSong(currentSongs[index + 1].id);
}

playPauseBtn.addEventListener('click', () => {
    if (!audio.getAttribute('src')) {
        if (currentSongs.length > 0) playSong(currentSongs[0].id); // nada tocando: começa pela primeira
        return;
    }
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
});

audio.addEventListener('play', () => { playPauseBtn.textContent = '❚❚'; lastTime = audio.currentTime; });
audio.addEventListener('pause', () => { playPauseBtn.textContent = '▶'; });

audio.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(audio.duration)) barraProgresso.max = Math.floor(audio.duration);
    atualizarPreenchimento(barraProgresso);
});

barraProgresso.addEventListener('input', () => { audio.currentTime = Number(barraProgresso.value); atualizarPreenchimento(barraProgresso); });
barraVolume.addEventListener('input', () => { audio.volume = Number(barraVolume.value); atualizarPreenchimento(barraVolume); });

atualizarPreenchimento(barraProgresso);
atualizarPreenchimento(barraVolume);

audio.addEventListener('error', () => {
    if (audio.getAttribute('src')) notify('Não foi possível carregar o áudio desta música.');
});

// ---------- CONTAGEM DE REPRODUÇÕES (igual à pMusica) ----------
// Só conta depois de 30 s OUVIDOS de verdade (pausa e pulos na barra não somam), uma vez por reprodução.

let listened = 0;
let lastTime = 0;
let counted = false;

function resetCounter() {
    listened = 0;
    lastTime = 0;
    counted = false;
}

function secondsNeeded() {
    return Math.min(LISTEN_SECONDS, audio.duration || LISTEN_SECONDS);
}

async function registerPlay(songId) {
    counted = true; // marca antes, pra não registrar duas vezes
    try {
        await api('/playhistory', {
            method: 'POST',
            body: JSON.stringify({ userId, songId, playedAt: new Date().toISOString() }),
        });
    } catch (error) {
        console.error('Erro ao registrar reprodução:', error);
    }
}

audio.addEventListener('seeked', () => { lastTime = audio.currentTime; });

audio.addEventListener('timeupdate', () => {
    const now = audio.currentTime;
    const delta = now - lastTime;
    lastTime = now;

    barraProgresso.value = Math.floor(now);
    tempoAtual.textContent = formatTime(now);
    atualizarPreenchimento(barraProgresso);

    if (!playingId || audio.paused || audio.seeking) return;
    if (delta > 0 && delta < 1.5) listened += delta; // avanços maiores são pulos
    if (!counted && listened >= secondsNeeded()) registerPlay(playingId);
});

// terminou: garante o registro (música curta) e segue pra próxima da lista
audio.addEventListener('ended', () => {
    if (playingId && !counted && listened >= secondsNeeded() - 1) registerPlay(playingId);
    resetCounter();
    playNext();
});

// ---------- PLAYLIST: BUSCAR, ADICIONAR E REMOVER ----------

function renderSearch() {
    searchResults.replaceChildren();

    const query = normalize(searchInput.value.trim());
    const inPlaylist = new Set(currentSongs.map((song) => song.id));

    // sem texto, mostra algumas sugestões; com texto, filtra por título ou artista
    const matches = allSongs
        .filter((song) => !inPlaylist.has(song.id))
        .filter((song) => !query || normalize(`${song.title} ${song.artist?.name ?? ''}`).includes(query))
        .slice(0, query ? 30 : 8);

    if (matches.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = query ? 'Nenhuma música encontrada.' : 'Todas as músicas já estão na playlist.';
        searchResults.appendChild(empty);
        return;
    }

    matches.forEach((song) => {
        const row = createRow({ title: song.title, duration: song.duration, cover: song.songCoverUrl }, song.artist?.name);

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'btn-adicionar';
        addBtn.textContent = '+ Adicionar';
        addBtn.addEventListener('click', () => addSong(song, addBtn));
        row.appendChild(addBtn);

        searchResults.appendChild(row);
    });
}

searchInput.addEventListener('input', renderSearch);

openAddBtn.addEventListener('click', () => {
    addMessage.textContent = '';
    renderSearch();
    addDialog.showModal(); // o <dialog> cuida do Esc e do fundo escuro
    searchInput.focus();
});
closeAddBtn.addEventListener('click', () => addDialog.close());
addDialog.addEventListener('click', (event) => {
    if (event.target === addDialog) addDialog.close(); // clique fora da janela
});

async function reloadPlaylist(notice = '') {
    render(await loadPlaylist());
    renderSearch(); // a música adicionada some dos resultados
    notify(notice);
}

async function addSong(song, button) {
    const position = currentSongs.reduce((max, s) => Math.max(max, s.position), 0) + 1;
    button.disabled = true;

    try {
        await api('/playlistsongs', {
            method: 'POST',
            body: JSON.stringify({ playlistId: id, songId: song.id, position }),
        });
        await reloadPlaylist(`"${song.title}" adicionada.`);
    } catch (error) {
        notify(error.message);
        button.disabled = false;
    }
}

async function removeSong(song) {
    try {
        await api(`/playlistsongs/${song.rowId}`, { method: 'DELETE' });
        await reloadPlaylist(`"${song.title}" removida da playlist.`);
    } catch (error) {
        notify(error.message);
    }
}

// ---------- DESCOBRIR O TIPO PELO ID ----------

async function detectKind() {
    const album = await api(`/albums/${id}`);
    if (album) return 'album';

    const mine = await api(`/users/${userId}/playlists`);
    if (mine.some((playlist) => playlist.id === id)) return 'playlist';

    return null;
}

// ---------- INICIALIZAÇÃO ----------

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

        // o botão "Voltar" leva pra lista de onde a pessoa veio
        backLink.href = kind === 'playlist' ? 'playlist/pPlaylists.html' : 'menu/menu.html';

        if (kind === 'playlist') {
            allSongs = (await api('/songs')) || [];
            songById = new Map(allSongs.map((song) => [song.id, song]));
            await reloadPlaylist();
            openAddBtn.hidden = false;
        } else {
            const data = await loadAlbum();
            render(data);
            message.textContent = data.notice || '';
        }
    } catch (error) {
        message.textContent = error.message;
    }
}

if (userId) {
    init();
}
