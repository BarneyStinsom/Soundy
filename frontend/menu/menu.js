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
    const response = await fetch(`${API_URL}/musicas/top`); // ajuste a rota certa da sua API
    const musicas = await response.json();
    renderTopHits(musicas);
  } catch (error) {
    console.error('Erro ao carregar top hits:', error);
  }
}

function renderTopHits(musicas) {
  const ul = document.getElementById('topHitsList');
  ul.innerHTML = '';

  musicas.forEach((m, i) => {
    const li = document.createElement('li');
    li.className = 'hit-item';
    li.innerHTML = `
      <span class="hit-rank">${i + 1}</span>
      <img class="hit-avatar" src="${m.capaUrl ? new URL(m.capaUrl, API_URL).href : '../imagens/fotoperfilusuario/fotoperfilbase.jfif'}" alt="${m.nome}">
      <div class="hit-info">
        <div class="hit-name">${m.nome}</div>
        <div class="hit-artist">${m.artista || ''}</div>
      </div>
      <span class="hit-duration">${m.plays} reprodução${m.plays === 1 ? '' : 'ões'}</span>
    `;
    ul.appendChild(li);
  });
}

loadTopHits();