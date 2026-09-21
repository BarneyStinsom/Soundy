const API_URL = 'https://soundy-utye.onrender.com';

const loginSection = document.querySelector('#loginSection');
const registerSection = document.querySelector('#registerSection');
const showRegister = document.querySelector('#showRegister');
const showLogin = document.querySelector('#showLogin');


showRegister.addEventListener('click', () => {
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
});


showLogin.addEventListener('click', () => {
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
});

const registerForm = document.querySelector('#registerForm');

registerForm.addEventListener('submit', async (event) => {

    event.preventDefault();
    const name = document.querySelector('#registerName').value;
    const email = document.querySelector('#registerEmail').value;
    const password = document.querySelector('#registerPassword').value;

    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    });

   if (!response.ok) {
    const errorData = await response.json();

    console.log('Erro do backend:', errorData);

    document.querySelector('#registerError').textContent =
        errorData.message || 'Não foi possível criar a conta';

    return;
}


    const user = await response.json();

    localStorage.setItem('userId', user.id);

    window.location.href = 'menu/menu.html';
});

const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.querySelector('#loginEmail').value;
    const password = document.querySelector('#loginPassword').value;

    const response = await fetch(`${API_URL}/users/login`, { // ajuste a rota conforme seu backend
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log('Erro do backend:', errorData);
        document.querySelector('#loginError').textContent =
            errorData.message || 'Não foi possível fazer login';
        return;
    }

    const user = await response.json();
    localStorage.setItem('userId', user.id);
    window.location.href = 'menu/menu.html';
});