// perfil/pUser.js
const API_URL = 'https://soundy-utye.onrender.com';

const userId = localStorage.getItem('userId');
if (!userId) {
    window.location.href = '../Login.html';
}

const userPhoto = document.querySelector('#userPhoto');
const userName = document.querySelector('#userName');
const userEmail = document.querySelector('#userEmail');
const logoutBtn = document.querySelector('#logoutBtn');
const deleteAccountBtn = document.querySelector('#deleteAccountBtn');
const pageError = document.querySelector('#pageError');

// imagem padrão caso o usuário não tenha foto cadastrada
const DEFAULT_PHOTO = '../assets/default-avatar.png'; // ajuste o caminho conforme seu projeto

async function loadUser() {
    const response = await fetch(`${API_URL}/users/${userId}`);

    if (!response.ok) {
        throw new Error('Usuário não encontrado');
    }

    const user = await response.json();

    userName.textContent = user.name;
    userEmail.textContent = user.email;
    userPhoto.src = user.photoUrl || DEFAULT_PHOTO;
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userId');
    window.location.href = '../Login.html';
});

deleteAccountBtn.addEventListener('click', async () => {
    const confirmed = confirm('Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.');
    if (!confirmed) {
        return;
    }

    const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        pageError.textContent = errorData.message || 'Não foi possível excluir a conta';
        return;
    }

    localStorage.removeItem('userId');
    window.location.href = '../Login.html';
});

async function init() {
    try {
        await loadUser();
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        pageError.textContent = 'Não foi possível carregar seu perfil.';
    }
}

init();