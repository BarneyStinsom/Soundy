// menu.js
const API_URL = 'https://soundy-utye.onrender.com';

const userId = localStorage.getItem('userId');
if (!userId) {
    window.location.href = '../Login.html'; // sem login, vai pra tela de login
}

const searchInput = document.querySelector('#searchInput');
const searchResults = document.querySelector('#searchResults');
const profileBtn = document.querySelector('#profileBtn');
const playlistsBtn = document.querySelector('#playlistsBtn');
const adminBtn = document.querySelector('#adminBtn');
const topHitsList = document.querySelector('#topHitsList');
const artistsList = document.querySelector('#artistsList');
const albumsList = document.querySelector('#albumsList');

// dados carregados em memória pra alimentar a busca sem bater na API a cada letra
let allSongs = [];
let allArtists = [];
let allAlbums = [];

// ---------- BOTÕES DE NAVEGAÇÃO ----------

profileBtn.addEventListener('click', () => {
    window.location.href = `perfil.html?userId=${userId}`;
});

playlistsBtn.addEventListener('click', () => {
    window.location.href = '../playlist/pPlaylists.html';
});

if (localStorage.getItem('isAdmin') === 'true') {
    adminBtn.hidden = false;
    adminBtn.addEventListener('click', () => {
        window.location.href = '../admin/dashboard.html';
    });
}

// ---------- CARREGAR MÚSICAS (usado só pra busca) ----------

async function loadSongs() {
    const response = await fetch(`${API_URL}/songs`);
    allSongs = await response.json();
}

// ---------- TOP HITS (agora vem pronto do banco) ----------

async function loadTopHits() {
    const response = await fetch(`${API_URL}/songs/top?limit=10`);
    const topHits = await response.json();
    renderTopHits(topHits);
}

function renderTopHits(topHits) {
    topHitsList.innerHTML = '';

    if (topHits.length === 0) {
        topHitsList.innerHTML = '<li class="hit-item">Nenhuma música tocada ainda</li>';
        return;
    }

    topHits.forEach((song, i) => {
        const li = document.createElement('li');
        li.className = 'hit-item';
        li.innerHTML = `
            <span class="hit-rank">${i + 1}</span>
            <img class="hit-avatar" src="${song.coverUrl ? new URL(song.coverUrl, API_URL).href : '../imagens/fotoperfilusuario/fotoperfilbase.jfif'}" alt="${song.title}">
            <div class="hit-info">
                <div class="hit-name">${song.title}</div>
                <div class="hit-artist">${song.artist?.name ?? ''}</div>
            </div>
            <span class="hit-duration">${song.playCount} reprodução${song.playCount === 1 ? '' : 'ões'}</span>
        `;
        li.addEventListener('click', () => {
            window.location.href = `../musica/pMusica.html?id=${song.songId}`;
        });
        topHitsList.appendChild(li);
    });
}

// ---------- ARTISTAS ----------

async function loadArtists() {
    const response = await fetch(`${API_URL}/artists`);
    allArtists = await response.json();
    renderArtists(allArtists.slice(0, 10)); // mostra só alguns no menu
}

function renderArtists(artists) {
    artistsList.innerHTML = '';
    artists.forEach((artist) => {
        const li = document.createElement('li');
        li.textContent = artist.name;
        li.addEventListener('click', () => {
            window.location.href = `artista.html?id=${artist.id}`;
        });
        artistsList.appendChild(li);
    });
}

// ---------- ÁLBUNS ----------

async function loadAlbums() {
    const response = await fetch(`${API_URL}/albums`);
    allAlbums = await response.json();
    renderAlbums(allAlbums.slice(0, 10)); // mostra só alguns no menu
}

function renderAlbums(albums) {
    albumsList.innerHTML = '';
    albums.forEach((album) => {
        const li = document.createElement('li');
        li.textContent = album.title;
        li.addEventListener('click', () => {
            window.location.href = `../pgMusicas.html?tipo=album&id=${album.id}`;
        });
        albumsList.appendChild(li);
    });
}

// ---------- BUSCA (músicas, artistas e álbuns já carregados) ----------

searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';

    if (term === '') {
        searchResults.style.display = 'none';
        return;
    }

    const matchedSongs = allSongs.filter((song) =>
        song.title.toLowerCase().includes(term)
    );
    const matchedArtists = allArtists.filter((artist) =>
        artist.name.toLowerCase().includes(term)
    );
    const matchedAlbums = allAlbums.filter((album) =>
        album.title.toLowerCase().includes(term)
    );

    if (matchedSongs.length === 0 && matchedArtists.length === 0 && matchedAlbums.length === 0) {
        searchResults.innerHTML = '<li>Nenhum resultado encontrado</li>';
    } else {
        matchedSongs.forEach((song) => {
            const li = document.createElement('li');
            li.textContent = `🎵 ${song.title} — ${song.artist?.name ?? ''}`;
            li.addEventListener('click', () => {
                window.location.href = `../musica/pMusica.html?id=${song.id}`;
            });
            searchResults.appendChild(li);
        });
        matchedArtists.forEach((artist) => {
            const li = document.createElement('li');
            li.textContent = `🎤 ${artist.name}`;
            li.addEventListener('click', () => {
                window.location.href = `artista.html?id=${artist.id}`;
            });
            searchResults.appendChild(li);
        });
        matchedAlbums.forEach((album) => {
            const li = document.createElement('li');
            li.textContent = `💿 ${album.title}`;
            li.addEventListener('click', () => {
                window.location.href = `../pgMusicas.html?tipo=album&id=${album.id}`;
            });
            searchResults.appendChild(li);
        });
    }

    searchResults.style.display = 'block';
});

// ---------- INICIALIZAÇÃO ----------

async function init() {
    try {
        await Promise.all([
            loadSongs(),
            loadArtists(),
            loadAlbums(),
            loadTopHits(),
        ]);
    } catch (error) {
        console.error('Erro ao carregar o menu:', error);
    }
}

init();