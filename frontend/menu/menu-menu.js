const profileBtn = document.querySelector('#profileBtn');
const photoInput = document.querySelector('#photoInput');

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

// clicar no botão abre o seletor de arquivos do aparelho
profileBtn.addEventListener('click', () => photoInput.click());

photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
        alert('Escolha uma imagem de até 2 MB.');
        return;
    }

    // preview na hora
    profileBtn.style.backgroundImage = `url('${URL.createObjectURL(file)}')`;

    const formData = new FormData();
    formData.append('photo', file);

    try {
        const res = await fetch(`${API_URL}/users/${userId}/photo`, {
            method: 'POST',
            body: formData, // sem Content-Type: o navegador define sozinho
        });
        if (!res.ok) throw new Error('Falha no upload');
        const data = await res.json();
        showProfilePhoto(data.profilePictureUrl);
    } catch (error) {
        console.error(error);
        alert('Não foi possível salvar a foto.');
        loadProfilePhoto(); // volta pra foto anterior
    }
});

loadProfilePhoto();