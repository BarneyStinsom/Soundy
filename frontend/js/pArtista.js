// artista/pArtista.js
const API_URL = 'https://soundy-utye.onrender.com';
const DEFAULT_COVER = '../imagens/Logo.png';

const userId = localStorage.getItem('userId');
if (!userId) {
    window.location.href = '../index.html';
}

const params = new URLSearchParams(window.location.search);
const artistId = params.get('id');

const artistName = document.querySelector('#artistName');
const artistPhoto = document.querySelector('#artistPhoto');
const albumsList = document.querySelector('#albumsList');
const pageError = document.querySelector('#pageError');

// URLs de áudio/arquivo cru que vêm do backend ("/uploads/x.jpg")
function assetUrl(url) {
    return new URL(url, API_URL).href;
}

// Capas podem ser: link completo (Cloudinary), caminho local da pasta imagens
// ("imagens/pop.jfif") ou caminho do backend ("/uploads/x.jpg").
// artista.html fica dentro de /menu, por isso o caminho local vira "../imagens/...".
function imageUrl(url) {
    if (!url) return null;
    if (/^(https?:|data:|blob:)/i.test(url)) return url;

    const local = url.replace(/\\/g, '/').match(/imagens\/.+$/i);
    if (local) return `../${local[0]}`;

    return assetUrl(url);
}

// se uma capa não carregar, troca pela padrão em vez de mostrar ícone quebrado
function fallbackCover(img, defaultSrc) {
    img.onerror = () => {
        console.warn('Capa não carregou:', img.src);
        img.onerror = null;
        img.src = defaultSrc;
    };
}

function renderAlbums(albums) {
    albumsList.innerHTML = '';

    if (albums.length === 0) {
        albumsList.innerHTML = '<li class="hit-item">Nenhum álbum encontrado</li>';
        return;
    }

    albums.forEach((album, index) => {
        const li = document.createElement('li');
        li.className = 'hit-item';

        const capaBruta = album.coverUrl || album.cover || album.image;
        const capa = imageUrl(capaBruta) || DEFAULT_COVER;

        li.innerHTML = `
            <span class="hit-rank">${index + 1}</span>
            <img class="hit-avatar" src="${capa}" alt="${album.title}">
            <div class="hit-info">
                <div class="hit-name">${album.title}</div>
                <div class="hit-artist">${artistName.textContent}</div>
            </div>
            <span class="hit-duration">${album.type || 'Álbum'}</span>
        `;

        fallbackCover(li.querySelector('.hit-avatar'), DEFAULT_COVER);

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

    const fotoBruta = artist.coverUrl || artist.photoUrl || artist.imageUrl || artist.avatar;
    const foto = imageUrl(fotoBruta);

    if (foto) {
        artistPhoto.src = foto;
        artistPhoto.alt = artist.name;
        artistPhoto.hidden = false;
        fallbackCover(artistPhoto, DEFAULT_COVER);
    }
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