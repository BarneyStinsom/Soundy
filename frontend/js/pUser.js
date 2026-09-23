/* perfil/pUser.js */

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

const profilePhotoInput =
    document.querySelector('#profilePhotoInput');


/* =========================
   FOTO PADRÃO
========================= */

const DEFAULT_PHOTO =
    '../assets/default-avatar.png';


/* =========================
   CARREGAR USUÁRIO
========================= */

async function loadUser() {

    const response =
        await fetch(`${API_URL}/users/${userId}`);

    if (!response.ok) {
        throw new Error('Usuário não encontrado');
    }

    const user = await response.json();

    userName.textContent = user.name;

    userEmail.textContent = user.email;

    userPhoto.src =
        user.pictureUrl || DEFAULT_PHOTO;
}


/* =========================
   TROCAR FOTO
========================= */

profilePhotoInput.addEventListener(
    'change',
    async () => {

        const file =
            profilePhotoInput.files[0];

        if (!file) {
            return;
        }


        /* limite de 5 MB */

        if (file.size > 5 * 1024 * 1024) {

            pageError.textContent =
                'A imagem deve ter no máximo 5 MB.';

            profilePhotoInput.value = '';

            return;
        }


        try {

            pageError.textContent =
                'Enviando foto...';


            /* =========================
               1. ENVIAR PARA CLOUDINARY
            ========================= */

            const formData =
                new FormData();

            formData.append(
                'file',
                file
            );


            const uploadResponse =
                await fetch(
                    `${API_URL}/uploads/image`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );


            if (!uploadResponse.ok) {

                const errorData =
                    await uploadResponse
                        .json()
                        .catch(() => ({}));

                throw new Error(
                    errorData.message ||
                    'Não foi possível enviar a imagem.'
                );
            }


            const uploadData =
                await uploadResponse.json();


            const photoUrl =
                uploadData.url;


            if (!photoUrl) {

                throw new Error(
                    'O servidor não retornou a URL da imagem.'
                );
            }


            /* =========================
               2. SALVAR NO USUÁRIO
            ========================= */

            const userResponse =
                await fetch(
                    `${API_URL}/users/${userId}/picture`,
                    {
                        method: 'PATCH',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({
                            pictureUrl: photoUrl
                        })
                    }
                );


            if (!userResponse.ok) {

                const errorData =
                    await userResponse
                        .json()
                        .catch(() => ({}));

                throw new Error(
                    errorData.message ||
                    'Não foi possível salvar a foto.'
                );
            }


            /* =========================
               3. ATUALIZAR NA TELA
            ========================= */

            userPhoto.src =
                photoUrl;


            pageError.textContent =
                'Foto atualizada com sucesso!';


            /* permite selecionar
               a mesma imagem novamente */

            profilePhotoInput.value = '';

        } catch (error) {

            console.error(
                'Erro ao trocar foto:',
                error
            );

            pageError.textContent =
                error.message ||
                'Não foi possível alterar a foto.';
        }
    }
);


/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener(
    'click',
    () => {

        localStorage.removeItem(
            'userId'
        );

        window.location.href =
            '../Login.html';
    }
);


/* =========================
   EXCLUIR CONTA
========================= */

deleteAccountBtn.addEventListener(
    'click',
    async () => {

        const confirmed =
            confirm(
                'Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.'
            );


        if (!confirmed) {
            return;
        }


        const response =
            await fetch(
                `${API_URL}/users/${userId}`,
                {
                    method: 'DELETE',
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();

            pageError.textContent =
                errorData.message ||
                'Não foi possível excluir a conta';

            return;
        }


        localStorage.removeItem(
            'userId'
        );

        window.location.href =
            '../Login.html';
    }
);


/* =========================
   INICIALIZAÇÃO
========================= */

async function init() {

    try {

        await loadUser();

    } catch (error) {

        console.error(
            'Erro ao carregar perfil:',
            error
        );

        pageError.textContent =
            'Não foi possível carregar seu perfil.';
    }
}


init();