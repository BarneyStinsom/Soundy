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