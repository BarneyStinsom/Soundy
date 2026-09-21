// artistas.js — CRUD de artistas no painel admin
// Depende de api.js (API_URL, api) carregado antes deste script.

const artistForm = document.querySelector('#artistForm');
const artistIdInput = document.querySelector('#artistId');
const artistNameInput = document.querySelector('#artistName');
const artistCoverFileInput = document.querySelector('#artistCoverFile');
const artistCoverUrlInput = document.querySelector('#artistCoverUrl');
const artistCoverHint = document.querySelector('#artistCoverHint');
const artistFormMessage = document.querySelector('#artistFormMessage');
const artistFormTitle = document.querySelector('#formTitle');
const artistSubmitBtn = document.querySelector('#artistSubmitBtn');
const artistCancelBtn = document.querySelector('#artistCancelBtn');
const artistsTableBody = document.querySelector('#artistsTableBody');
const pageError = document.querySelector('#pageError');

let artists = [];

function resetForm() {
    artistForm.reset();
    artistIdInput.value = '';
    artistCoverUrlInput.value = '';
    artistCoverHint.textContent = '';
    artistFormTitle.textContent = 'Novo artista';
    artistSubmitBtn.textContent = 'Adicionar artista';
    artistCancelBtn.hidden = true;
    artistFormMessage.textContent = '';
    artistFormMessage.className = 'form-message';
}

function startEdit(artist) {
    artistIdInput.value = artist.id;
    artistNameInput.value = artist.name;
    artistCoverUrlInput.value = artist.coverUrl || '';
    artistCoverFileInput.value = '';
    artistCoverHint.textContent = artist.coverUrl
        ? 'Já tem uma capa. Escolha um arquivo só se quiser trocar.'
        : '';
    artistFormTitle.textContent = `Editando: ${artist.name}`;
    artistSubmitBtn.textContent = 'Salvar alterações';
    artistCancelBtn.hidden = false;
    artistFormMessage.textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderArtists() {
    artistsTableBody.innerHTML = '';

    if (artists.length === 0) {
        artistsTableBody.innerHTML = '<tr class="empty-row"><td colspan="3">Nenhum artista cadastrado ainda</td></tr>';
        return;
    }

    artists.forEach((artist) => {
        const tr = document.createElement('tr');

        const tdCover = document.createElement('td');
        if (artist.coverUrl) {
            const img = document.createElement('img');
            img.className = 'thumb';
            img.src = artist.coverUrl;
            img.alt = '';
            tdCover.appendChild(img);
        }

        const tdName = document.createElement('td');
        tdName.textContent = artist.name;

        const tdActions = document.createElement('td');
        tdActions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn btn-outline btn-small';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', () => startEdit(artist));

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger btn-small';
        deleteBtn.textContent = 'Excluir';
        deleteBtn.addEventListener('click', () => deleteArtist(artist));

        tdActions.append(editBtn, deleteBtn);
        tr.append(tdCover, tdName, tdActions);
        artistsTableBody.appendChild(tr);
    });
}

async function loadArtists() {
    artists = await api('/artists');
    renderArtists();
}

async function deleteArtist(artist) {
    if (!confirm(`Excluir o artista "${artist.name}"? Essa ação não pode ser desfeita.`)) {
        return;
    }
    try {
        await api(`/artists/${artist.id}`, { method: 'DELETE' });
        await loadArtists();
    } catch (error) {
        pageError.textContent = error.message || 'Não foi possível excluir o artista.';
    }
}

artistForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    artistFormMessage.textContent = '';
    artistFormMessage.className = 'form-message';

    const editingId = artistIdInput.value;
    let coverUrl = artistCoverUrlInput.value.trim() || undefined;

    try {
        const chosenFile = artistCoverFileInput.files[0];
        if (chosenFile) {
            artistFormMessage.textContent = 'Enviando imagem...';
            coverUrl = await uploadFile('image', chosenFile);
        }
    } catch (error) {
        artistFormMessage.textContent = error.message || 'Não foi possível enviar a imagem.';
        artistFormMessage.className = 'form-message error';
        return;
    }

    const payload = {
        name: artistNameInput.value.trim(),
        coverUrl,
    };

    try {
        if (editingId) {
            await api(`/artists/${editingId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
            artistFormMessage.textContent = 'Artista atualizado com sucesso.';
        } else {
            await api('/artists', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            artistFormMessage.textContent = 'Artista adicionado com sucesso.';
        }
        artistFormMessage.className = 'form-message success';
        await loadArtists();
        resetForm();
    } catch (error) {
        artistFormMessage.textContent = error.message || 'Não foi possível salvar o artista.';
        artistFormMessage.className = 'form-message error';
    }
});

artistCancelBtn.addEventListener('click', resetForm);

async function init() {
    try {
        await loadArtists();
    } catch (error) {
        console.error('Erro ao carregar artistas:', error);
        pageError.textContent = 'Não foi possível carregar os artistas.';
    }
}

init();
