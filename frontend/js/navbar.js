// navbar.js — barra superior do Soundy, compartilhada por todas as páginas.
//
// Como usar em uma página:
//   1) no <head>:   <link rel="stylesheet" href="../css/menu.css">
//                   <script src="../js/navbar.js" defer></script>
//   2) no <body>:   <div id="navbar"></div>
//
// Para mudar a barra (botão novo, texto, ordem...), edite SÓ este arquivo:
// a mudança aparece em todas as páginas de uma vez.

(function () {
    const API_URL = 'https://soundy-utye.onrender.com';

    // Este arquivo fica em js/, então a raiz do site é uma pasta acima dele.
    // Com isso os links funcionam de qualquer pasta (menu/, playlist/, musica/...).
    const ROOT = new URL('../', document.currentScript.src).href;

    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = ROOT + 'Login.html';
        return;
    }

    // ---------- PARA ONDE CADA BOTÃO LEVA ----------
    // (relativo à raiz do site; null = ainda não existe página para isso)

    const DESTINOS = {
        playlistsBtn: 'playlist/pPlaylists.html',
        artistasBtn: 'menu/artistas.html',
        albumnsBtn: 'menu/albuns.html',
        adminBtn: 'admin/dashboard.html',
        profileBtn: `menu/perfil.html?userId=${userId}`,
    };

    // ---------- HTML DA BARRA ----------

    const NAVBAR_HTML = `
<header class="admin-topbar">
    <a href="${ROOT}index.html">i
        <img src="${ROOT}imagens/Logo.png" alt="Logo do Soundy" class="logo">
    </a>

    <nav class="admin-nav">
        <div class="titulos">
            <button class="playlists" id="playlistsBtn" type="button">Playlists</button>
            <button class="artistas" id="artistasBtn" type="button">Artistas</button>
            <button class="albumns" id="albumnsBtn" type="button">Álbuns</button>
        </div>
        <button class="admin" id="adminBtn" type="button" hidden>Painel Admin</button>

        <div class="busca-wrapper">
            <input class="buscabusca" id="searchInput" type="search"
                   placeholder="Buscar músicas, artistas e álbuns" autocomplete="off">
            <ul id="searchResults" hidden></ul>
        </div>
    </nav>

    <button class="perfil" id="profileBtn" type="button" title="Trocar foto de perfil"></button>
    <input type="file" id="photoInput" accept="image/*" hidden>
</header>`;

    function montarNavbar() {
        const lugar = document.querySelector('#navbar');

        if (!lugar) {
            console.warn('navbar.js: coloque <div id="navbar"></div> no body da página.');
            return;
        }

        lugar.outerHTML = NAVBAR_HTML;

        ligarBotoes();
        ligarBusca();
    }

    // ---------- BOTÕES ----------

    function ligarBotoes() {
        for (const [id, destino] of Object.entries(DESTINOS)) {
            const botao = document.getElementById(id);

            if (botao && destino) {
                botao.addEventListener('click', () => {
                    window.location.href = ROOT + destino;
                });
            }
        }

        // O botão do painel admin só aparece para administradores
        if (localStorage.getItem('isAdmin') === 'true') {
            document.getElementById('adminBtn').hidden = false;
        }
    }

    // ---------- BUSCA ----------

    let dadosBusca = null;

    // Carrega músicas, artistas e álbuns só na primeira vez que a pessoa digita,
    // assim as páginas não fazem 3 requisições à toa quando ninguém usa a busca.
    function carregarDadosBusca() {
        if (!dadosBusca) {
            const buscar = (rota) =>
                fetch(`${API_URL}${rota}`).then((r) => {
                    if (!r.ok) throw new Error(`Erro ao carregar ${rota}: ${r.status}`);
                    return r.json();
                });

            dadosBusca = Promise.all([
                buscar('/songs'),
                buscar('/artists'),
                buscar('/albums'),
            ]).then(([songs, artists, albums]) => ({ songs, artists, albums }));

            // se falhar, deixa tentar de novo na próxima digitação
            dadosBusca.catch(() => { dadosBusca = null; });
        }

        return dadosBusca;
    }

    function ligarBusca() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        function addResultado(texto, destino) {
            const li = document.createElement('li');
            li.textContent = texto;
            li.addEventListener('click', () => {
                window.location.href = ROOT + destino;
            });
            searchResults.appendChild(li);
        }

        searchInput.addEventListener('input', async () => {
            const termo = searchInput.value.trim().toLowerCase();

            searchResults.innerHTML = '';

            if (termo === '') {
                searchResults.style.display = 'none';
                return;
            }

            let dados;

            try {
                dados = await carregarDadosBusca();
            } catch (error) {
                console.error('Erro ao carregar dados da busca:', error);
                return;
            }

            // a pessoa pode ter continuado digitando enquanto os dados carregavam
            if (searchInput.value.trim().toLowerCase() !== termo) return;

            const songs = dados.songs.filter((s) => s.title?.toLowerCase().includes(termo));
            const artists = dados.artists.filter((a) => a.name?.toLowerCase().includes(termo));
            const albums = dados.albums.filter((a) => a.title?.toLowerCase().includes(termo));

            searchResults.innerHTML = '';

            if (songs.length === 0 && artists.length === 0 && albums.length === 0) {
                searchResults.innerHTML = '<li>Nenhum resultado encontrado</li>';
            }

            songs.forEach((s) =>
                addResultado(`🎵 ${s.title} — ${s.artist?.name ?? ''}`, `musica/pMusica.html?id=${s.id}`));

            artists.forEach((a) =>
                addResultado(`🎤 ${a.name}`, `menu/artista.html?id=${a.id}`));

            albums.forEach((a) =>
                addResultado(`💿 ${a.title}`, `pgMusicas.html?tipo=album&id=${a.id}`));

            searchResults.style.display = 'block';
        });
    }

    // ---------- INÍCIO ----------

    montarNavbar();
})();
