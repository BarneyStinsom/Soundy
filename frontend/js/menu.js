// ---------- CONFIGURAÇÃO ----------

const API_URL = 'https://soundy-utye.onrender.com';

const userId = localStorage.getItem('userId');

if (!userId) {
    window.location.href = '../Login.html';
}

// ---------- ELEMENTOS DO HTML ----------

const searchInput = document.querySelector('#searchInput');
const searchResults = document.querySelector('#searchResults');

const profileBtn = document.querySelector('#profileBtn');
const playlistsBtn = document.querySelector('#playlistsBtn');
const adminBtn = document.querySelector('#adminBtn');

const topHitsList = document.querySelector('#topHitsList');
const artistsList = document.querySelector('#artistsList');
const albumsList = document.querySelector('#albumsList');

// ---------- DADOS EM MEMÓRIA ----------

let allSongs = [];
let allArtists = [];
let allAlbums = [];

// ---------- BOTÕES DE NAVEGAÇÃO ----------

if (profileBtn) {
    profileBtn.addEventListener('click', () => {
        window.location.href = `perfil.html?userId=${userId}`;
    });
}

if (playlistsBtn) {
    playlistsBtn.addEventListener('click', () => {
        window.location.href = '../playlist/pPlaylists.html';
    });
}

if (adminBtn && localStorage.getItem('isAdmin') === 'true') {
    adminBtn.hidden = false;

    adminBtn.addEventListener('click', () => {
        window.location.href = '../admin/dashboard.html';
    });
}

// ---------- CARREGAR MÚSICAS ----------

async function loadSongs() {
    const response = await fetch(`${API_URL}/songs`);

    if (!response.ok) {
        throw new Error(`Erro ao carregar músicas: ${response.status}`);
    }

    allSongs = await response.json();
}

// ---------- TOP HITS ----------

async function loadTopHits() {
    try {
        const response = await fetch(`${API_URL}/songs/top?limit=10`);

        if (!response.ok) {
            throw new Error(`Erro ao carregar Top Hits: ${response.status}`);
        }

        const topHits = await response.json();

        renderTopHits(topHits);

    } catch (error) {
        console.error('Erro ao carregar top hits:', error);
    }
}

function renderTopHits(topHits) {

    // Se o elemento não existir, não quebra o resto do menu
    if (!topHitsList) {
        console.warn('Elemento #topHitsList não encontrado.');
        return;
    }

    topHitsList.innerHTML = '';

    if (!topHits || topHits.length === 0) {
        topHitsList.innerHTML =
            '<li class="hit-item">Nenhuma música tocada ainda</li>';
        return;
    }

    topHits.forEach((song, i) => {

        const li = document.createElement('li');

        li.className = 'hit-item';

        // A API usa songCoverUrl
        const coverUrl = song.songCoverUrl
            ? song.songCoverUrl
            : '../imagens/fotoperfilusuario/fotoperfilbase.jfif';

        li.innerHTML = `
            <span class="hit-rank">${i + 1}</span>

            <img
                class="hit-avatar"
                src="${coverUrl}"
                alt="${song.title || 'Capa da música'}"
                onerror="this.src='../imagens/fotoperfilusuario/fotoperfilbase.jfif';"
            >

            <div class="hit-info">

                <div class="hit-name">
                    ${song.title || 'Sem título'}
                </div>

                <div class="hit-artist">
                    ${song.artistName || song.artist?.name || ''}
                </div>

            </div>

            <span class="hit-duration">
                ${song.playCount || 0}
                ${song.playCount === 1 ? 'reprodução' : 'reproduções'}
            </span>
        `;

        li.addEventListener('click', () => {

            const songId = song.songId || song.id;

            if (songId) {
                window.location.href =
                    `../musica/pMusica.html?id=${songId}`;
            }

        });

        topHitsList.appendChild(li);
    });
}

// ---------- ARTISTAS ----------

async function loadArtists() {

    try {

        const response = await fetch(`${API_URL}/artists`);

        if (!response.ok) {
            throw new Error(`Erro ao carregar artistas: ${response.status}`);
        }

        allArtists = await response.json();

        renderArtists(allArtists.slice(0, 10));

    } catch (error) {

        console.error('Erro ao carregar artistas:', error);

    }
}

function renderArtists(artists) {

    if (!artistsList) {
        console.warn('Elemento #artistsList não encontrado.');
        return;
    }

    artistsList.innerHTML = '';

    artists.forEach((artist) => {

        const li = document.createElement('li');

        li.textContent = artist.name;

        li.addEventListener('click', () => {

            window.location.href =
                `artista.html?id=${artist.id}`;

        });

        artistsList.appendChild(li);

    });
}

// ---------- ÁLBUNS ----------

async function loadAlbums() {

    try {

        const response = await fetch(`${API_URL}/albums`);

        if (!response.ok) {
            throw new Error(`Erro ao carregar álbuns: ${response.status}`);
        }

        allAlbums = await response.json();

        renderAlbums(allAlbums.slice(0, 10));

    } catch (error) {

        console.error('Erro ao carregar álbuns:', error);

    }
}

function renderAlbums(albums) {

    // Esse era o erro que estava quebrando o init()
    if (!albumsList) {
        console.warn(
            'Elemento #albumsList não existe no menu.html.'
        );
        return;
    }

    albumsList.innerHTML = '';

    albums.forEach((album) => {

        const li = document.createElement('li');

        li.textContent = album.title;

        li.addEventListener('click', () => {

            window.location.href =
                `../pgMusicas.html?tipo=album&id=${album.id}`;

        });

        albumsList.appendChild(li);

    });
}

// ---------- BUSCA ----------

if (searchInput && searchResults) {

    searchInput.addEventListener('input', () => {

        const term =
            searchInput.value.trim().toLowerCase();

        searchResults.innerHTML = '';

        if (term === '') {

            searchResults.style.display = 'none';

            return;
        }

        const matchedSongs = allSongs.filter((song) =>
            song.title?.toLowerCase().includes(term)
        );

        const matchedArtists = allArtists.filter((artist) =>
            artist.name?.toLowerCase().includes(term)
        );

        const matchedAlbums = allAlbums.filter((album) =>
            album.title?.toLowerCase().includes(term)
        );

        if (
            matchedSongs.length === 0 &&
            matchedArtists.length === 0 &&
            matchedAlbums.length === 0
        ) {

            searchResults.innerHTML =
                '<li>Nenhum resultado encontrado</li>';

        } else {

            // MÚSICAS

            matchedSongs.forEach((song) => {

                const li = document.createElement('li');

                li.textContent =
                    `🎵 ${song.title} — ${song.artist?.name ?? ''}`;

                li.addEventListener('click', () => {

                    window.location.href =
                        `../musica/pMusica.html?id=${song.id}`;

                });

                searchResults.appendChild(li);

            });

            // ARTISTAS

            matchedArtists.forEach((artist) => {

                const li = document.createElement('li');

                li.textContent =
                    `🎤 ${artist.name}`;

                li.addEventListener('click', () => {

                    window.location.href =
                        `artista.html?id=${artist.id}`;

                });

                searchResults.appendChild(li);

            });

            // ÁLBUNS

            matchedAlbums.forEach((album) => {

                const li = document.createElement('li');

                li.textContent =
                    `💿 ${album.title}`;

                li.addEventListener('click', () => {

                    window.location.href =
                        `../pgMusicas.html?tipo=album&id=${album.id}`;

                });

                searchResults.appendChild(li);

            });

        }

        searchResults.style.display = 'block';

    });

}

// ---------- INICIALIZAÇÃO ----------

async function init() {

    try {

        await Promise.all([
            loadSongs(),
            loadArtists(),
            loadAlbums(),
            loadTopHits()
        ]);

        console.log('Menu carregado com sucesso.');

    } catch (error) {

        console.error(
            'Erro ao carregar o menu:',
            error
        );

    }
}

init();