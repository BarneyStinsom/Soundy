// musica.js — player de uma música: capa, barra de progresso, anterior / play-pause / próxima.
// Também registra a reprodução no histórico depois de 30 s ouvidos (POST /playhistory).
// Depende de api.js (API_URL, userId, api, formatDuration)

const params = new URLSearchParams(window.location.search);
const startId = params.get('id');
const tipo = (params.get('tipo') || '').toLowerCase();
const colecaoId = params.get('colecao');

const LISTEN_SECONDS = 30; // tempo ouvido para contar como reprodução
const RESTART_AFTER = 3;   // "Anterior" com mais de 3 s tocados volta ao começo da música

const backLink = document.querySelector('#backLink');
const message = document.querySelector('#message');
const content = document.querySelector('#content');
const cover = document.querySelector('#cover');
const titleEl = document.querySelector('#title');
const artistEl = document.querySelector('#artist');
const albumEl = document.querySelector('#album');
const seek = document.querySelector('#seek');
const currentTimeEl = document.querySelector('#currentTime');
const totalTimeEl = document.querySelector('#totalTime');
const prevBtn = document.querySelector('#prevBtn');
const playPauseBtn = document.querySelector('#playPauseBtn');
const nextBtn = document.querySelector('#nextBtn');
const player = document.querySelector('#player');

let current = null; // dados da música atual (GET /songs/:id)
let queue = [];     // ids das músicas da coleção, na ordem
let loadToken = 0;  // evita que uma resposta antiga sobrescreva uma música mais nova
let scrubbing = false;

// contagem de reprodução
let listened = 0;   // segundos realmente ouvidos desta reprodução
let lastTime = 0;   // posição do player no evento anterior
let counted = false;

function formatTime(seconds) {
    return formatDuration(Math.floor(seconds || 0));
}

// ---------- COLEÇÃO (ANTERIOR / PRÓXIMA) ----------

function kindFromTipo(value) {
    if (value === 'playlist') return 'playlist';
    if (['album', 'albuns', 'albums', 'ep', 'eps', 'single', 'singles'].includes(value)) return 'album';
    return null;
}

// Devolve só os ids das músicas, na ordem em que aparecem na coleção.
async function loadQueue(kind, collectionId) {
    let items = [];
    try {
        items = await api(kind === 'playlist'
            ? `/playlists/${collectionId}/songs`
            : `/albums/${collectionId}/songs`);
    } catch (error) {
        if (error.status !== 404) throw error; // 404 = coleção vazia
    }

    if (kind === 'playlist') {
        return items
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((item) => item.song?.id)
            .filter(Boolean);
    }
    return items.map((song) => song.id);
}

async function buildQueue() {
    let context = null;
    const kind = kindFromTipo(tipo);

    if (kind && colecaoId) {
        context = { kind, id: colecaoId };
    } else if (current.album?.id) {
        context = { kind: 'album', id: current.album.id }; // sem coleção na URL: usa o álbum da música
    }

    queue = [];
    if (context) {
        try {
            queue = await loadQueue(context.kind, context.id);
        } catch (error) {
            console.error('Erro ao carregar a coleção:', error);
        }
    }
    if (!queue.includes(current.id)) queue = [current.id];

    backLink.href = context
        ? `pgMusicas.html?tipo=${context.kind}&id=${encodeURIComponent(context.id)}`
        : 'menu/menu.html';

    updateButtons();
}

// ---------- CARREGAR UMA MÚSICA ----------

async function loadSong(id, { autoplay }) {
    const token = ++loadToken;
    const song = await api(`/songs/${encodeURIComponent(id)}`);
    if (token !== loadToken) return; // pediram outra música enquanto esta carregava
    if (!song) throw new Error('Música não encontrada.');

    player.pause();
    current = song;
    resetCounter();

    document.title = `${song.title} — Soundy`;
    titleEl.textContent = song.title;
    artistEl.textContent = song.artist?.name ?? '';
    albumEl.textContent = song.album ? `${song.album.title} (${song.album.type})` : '';
    showCover(song.songCoverUrl || song.album?.coverUrl);

    seek.max = song.duration;
    seek.value = 0;
    currentTimeEl.textContent = formatTime(0);
    totalTimeEl.textContent = formatTime(song.duration);

    // mantém o endereço com a música atual (se atualizar a página, continua nela)
    const url = new URL(window.location.href);
    url.searchParams.set('id', song.id);
    window.history.replaceState(null, '', url);

    content.hidden = false;
    message.textContent = '';

    if (song.songUrl) {
        // songUrl pode ser "/audio/aurora.mp3" (do seu backend) ou um link completo
        player.src = new URL(song.songUrl, API_URL).href;
        if (autoplay) tryPlay();
    } else {
        player.removeAttribute('src');
        player.load();
        message.textContent = 'Esta música ainda não tem arquivo de áudio.';
    }

    updatePlayPause();
    updateButtons();
}

function showCover(url) {
    cover.hidden = !url;
    if (url) cover.src = url;
}

cover.addEventListener('error', () => {
    cover.hidden = true;
});

async function goTo(id) {
    try {
        await loadSong(id, { autoplay: true });
    } catch (error) {
        message.textContent = error.message;
    }
}

// ---------- BOTÕES ----------

function updatePlayPause() {
    playPauseBtn.textContent = player.paused ? 'Tocar' : 'Pausar';
}

function updateButtons() {
    const index = current ? queue.indexOf(current.id) : -1;
    const hasAudio = Boolean(current && current.songUrl);

    playPauseBtn.disabled = !hasAudio;
    seek.disabled = !hasAudio;
    prevBtn.disabled = !hasAudio && index <= 0;
    nextBtn.disabled = index < 0 || index >= queue.length - 1;
}

function tryPlay() {
    return player.play().catch((error) => {
        if (error.name === 'AbortError') return; // trocaram de música no meio
        if (error.name === 'NotAllowedError') {
            message.textContent = 'O navegador bloqueou o play automático. Clique em Tocar.';
            return;
        }
        console.error('Erro ao tocar:', error);
        message.textContent = 'Não foi possível tocar esta música. Confira o arquivo de áudio.';
    });
}

playPauseBtn.addEventListener('click', () => {
    if (!current || !current.songUrl) return;
    if (player.paused) tryPlay();
    else player.pause();
});

// como no Spotify: depois de 3 s volta pro começo da música; antes disso, vai pra anterior
prevBtn.addEventListener('click', () => {
    const index = current ? queue.indexOf(current.id) : -1;

    if (index > 0 && player.currentTime <= RESTART_AFTER) {
        goTo(queue[index - 1]);
    } else {
        player.currentTime = 0;
    }
});

nextBtn.addEventListener('click', () => {
    const index = current ? queue.indexOf(current.id) : -1;
    if (index >= 0 && index < queue.length - 1) goTo(queue[index + 1]);
});

// ---------- BARRA DE PROGRESSO ----------

seek.addEventListener('input', () => {
    scrubbing = true; // enquanto arrasta, a barra não é atualizada pelo player
    currentTimeEl.textContent = formatTime(Number(seek.value));
});

seek.addEventListener('change', () => {
    player.currentTime = Number(seek.value);
    scrubbing = false;
});

player.addEventListener('loadedmetadata', () => {
    // a duração real do arquivo vale mais que a que está gravada no banco
    if (Number.isFinite(player.duration)) {
        seek.max = Math.floor(player.duration);
        totalTimeEl.textContent = formatTime(player.duration);
    }
});

// ---------- CONTAGEM DE REPRODUÇÕES ----------
//
// Uma reprodução só conta depois de LISTEN_SECONDS (30 s) OUVIDOS de verdade:
//  - o tempo só soma enquanto a música toca (pausa não conta);
//  - arrastar a barra (seek) não conta como tempo ouvido;
//  - registra UMA vez por reprodução;
//  - músicas menores que 30 s contam ao ouvir até o fim.

function resetCounter() {
    listened = 0;
    lastTime = 0;
    counted = false;
}

function secondsNeeded() {
    return Math.min(LISTEN_SECONDS, player.duration || current?.duration || LISTEN_SECONDS);
}

async function registerPlay(song) {
    counted = true; // marca antes, pra não registrar duas vezes

    try {
        await api('/playhistory', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                songId: song.id,
                playedAt: new Date().toISOString(),
            }),
        });
    } catch (error) {
        console.error('Erro ao registrar reprodução:', error);
        message.textContent = 'Não foi possível registrar a reprodução.';
    }
}

player.addEventListener('play', () => {
    lastTime = player.currentTime; // ao retomar, não conta o tempo em que ficou pausado
    message.textContent = '';
    updatePlayPause();
});

player.addEventListener('pause', updatePlayPause);

player.addEventListener('seeked', () => {
    lastTime = player.currentTime; // depois de pular, recomeça a medir daqui
});

player.addEventListener('timeupdate', () => {
    const now = player.currentTime;
    const delta = now - lastTime;
    lastTime = now;

    if (!scrubbing) {
        seek.value = Math.floor(now);
        currentTimeEl.textContent = formatTime(now);
    }

    if (!current || player.paused || player.seeking) return;

    // timeupdate chega ~4x por segundo: um avanço normal é < 1 s. Avanços maiores são pulos.
    if (delta > 0 && delta < 1.5) listened += delta;

    if (!counted && listened >= secondsNeeded()) registerPlay(current);
});

// terminou: garante o registro (música curta) e segue pra próxima da coleção
player.addEventListener('ended', () => {
    updatePlayPause();
    if (!current) return;

    if (!counted && listened >= secondsNeeded() - 1) registerPlay(current);

    const index = queue.indexOf(current.id);
    if (index >= 0 && index < queue.length - 1) {
        goTo(queue[index + 1]);
    } else {
        resetCounter(); // se der play de novo, começa uma nova reprodução
    }
});

player.addEventListener('error', () => {
    if (!player.getAttribute('src')) return;
    message.textContent = 'Não foi possível carregar o áudio desta música.';
});

// ---------- INICIALIZAÇÃO ----------

async function init() {
    if (!startId) {
        message.textContent = 'Endereço inválido: falta o id da música. Use musica.html?id=...';
        return;
    }

    message.textContent = 'Carregando...';

    try {
        await loadSong(startId, { autoplay: true });
        await buildQueue();
    } catch (error) {
        message.textContent = error.message;
    }
}

if (userId) {
    init();
}
