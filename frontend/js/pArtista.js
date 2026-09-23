// artista/pArtista.js
const API_URL = 'https://soundy-utye.onrender.com';

const userId = localStorage.getItem('userId');
if (!userId) {
    window.location.href = '../index.html';
}

const params = new URLSearchParams(window.location.search);
const artistId = params.get('id');

const artistName = document.querySelector('#artistName');
const albumsList = document.querySelector('#albumsList');
const pageError = document.querySelector('#pageError');

function renderAlbums(albums) {
    albumsList.innerHTML = '';

    if (albums.length === 0) {
        albumsList.innerHTML = '<li class="hit-item">Nenhum álbum encontrado</li>';
        return;
    }

    albums.forEach((album, index) => {
        const li = document.createElement('li');
        li.className = 'hit-item';

        const capa = album.coverUrl || album.cover || album.image || '../imagens/Logo.png';

        li.innerHTML = `
            <span class="hit-rank">${index + 1}</span>
            <img class="hit-avatar" src="${capa}" alt="${album.title}">
            <div class="hit-info">
                <div class="hit-name">${album.title}</div>
                <div class="hit-artist">${artistName.textContent}</div>
            </div>
            <span class="hit-duration">${album.type || 'Álbum'}</span>
        `;

        li.addEventListener('click', () => {
            window.location.href = `../pgMusicas.html?tipo=album&id=${album.id}`;
        });

        albumsList.appendChild(li);
    });
}

async function loadArtist() {
    const response = await fetch(`${API_URL}/artists/${artistId}`);
    if (!response.ok) {
        throw new Error('Artista não encontrado');
    }
    const artist = await response.json();
    artistName.textContent = artist.name;
}

async function loadAlbums() {
    const response = await fetch(`${API_URL}/artists/${artistId}/albums`);
    if (!response.ok) {
        // ArtistsService.findAlbums lança 404 se o artista não tiver nenhum álbum
        renderAlbums([]);
        return;
    }
    const albums = await response.json();
    renderAlbums(albums);
}

async function init() {
    if (!artistId) {
        pageError.textContent = 'Página inválida: falta o id do artista na URL.';
        return;
    }

    try {
        await loadArtist();
        await loadAlbums();
    } catch (error) {
        console.error('Erro ao carregar artista:', error);
        pageError.textContent = 'Não foi possível carregar esta página.';
    }
}

init();