const profileBtn = document.querySelector('#profileBtn');

function showProfilePhoto(url) {
    if (!url) return; // sem foto: fica o avatar padrão do CSS
    const full = new URL(url, API_URL).href;
    profileBtn.style.backgroundImage = `url('${full}')`;
}

// ao abrir o menu, carrega a foto do usuário (se ele já tiver escolhido uma)
async function loadProfilePhoto() {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`);
        const user = await response.json();
        showProfilePhoto(user.profilePictureUrl); // ajuste o nome do campo
    } catch (error) {
        console.error('Erro ao carregar foto de perfil:', error);
    }
}

// clicar no botão leva pra página de perfil
profileBtn.addEventListener('click', () => {
    window.location.href = `perfil.html?userId=${userId}`;
});

loadProfilePhoto();

async function loadTopHits() {
  try {
    const response = await fetch(`${API_URL}/songs/top?limit=10`, {
      cache: 'no-store'   // não reaproveita resposta antiga
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const musicas = await response.json();
    renderTopHits(musicas);
  } catch (error) {
    console.error('Erro ao carregar top hits:', error);
  }
}

loadTopHits();

// recarrega a lista quando a página é restaurada pelo botão voltar (bfcache)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) loadTopHits();
});
function renderTopHits(musicas) {
  const ul = document.getElementById('topHitsList');

  ul.innerHTML = '';

  musicas.forEach((m, i) => {
    const li = document.createElement('li');

    li.className = 'hit-item';

    li.innerHTML = `
      <span class="hit-rank">${i + 1}</span>

      <img
        class="hit-avatar"
        src="${m.songCoverUrl ? m.songCoverUrl : '../imagens/fotoperfilusuario/fotoperfilbase.jfif'}"
        alt="${m.title}"
      >

      <div class="hit-info">
        <div class="hit-name">${m.title}</div>
        <div class="hit-artist">${m.artistName || ''}</div>
      </div>

      <span class="hit-duration">
        ${m.playCount} ${m.playCount === 1 ? 'reprodução' : 'reproduções'}
      </span>
    `;

    ul.appendChild(li);
  });
}

loadTopHits();
