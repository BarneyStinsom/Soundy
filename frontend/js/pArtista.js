// artista/pArtista.js
const API_URL = 'http://localhost:3000';

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
        albumsList.innerHTML = '<li>Nenhum álbum encontrado</li>';
        return;
    }

    albums.forEach((album) => {
        const li = document.createElement('li');
        li.textContent = `${album.title} (${album.type})`;
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
        await Promise.all([
            loadArtist(),
            loadAlbums(),
        ]);
    } catch (error) {
        console.error('Erro ao carregar artista:', error);
        pageError.textContent = 'Não foi possível carregar esta página.';
    }
}

init();