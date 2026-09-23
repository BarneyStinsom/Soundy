// menu.js — só a página do menu (lista "Em alta no mundo!").
// A barra de cima (botões, busca, perfil) mora em navbar.js.

// ---------- CONFIGURAÇÃO ----------

const API_URL = 'https://soundy-utye.onrender.com';

const userId = localStorage.getItem('userId');

if (!userId) {
    window.location.href = '../Login.html';
}

// ---------- ELEMENTOS DO HTML ----------

const topHitsList = document.querySelector('#topHitsList');

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

    // Se o elemento não existir, não quebra o resto da página
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

// ---------- INICIALIZAÇÃO ----------

loadTopHits();
