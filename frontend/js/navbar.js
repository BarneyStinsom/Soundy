(function () {

    const API_URL =
        'https://soundy-utye.onrender.com';

    const ROOT =
        new URL(
            '../',
            document.currentScript.src
        ).href;

    const userId =
        localStorage.getItem('userId');


    if (!userId) {

        window.location.href =
            ROOT + 'Login.html';

        return;
    }


    /* =========================
       DESTINOS
    ========================= */

    const DESTINOS = {

        playlistsBtn:
            'playlist/pPlaylists.html',

        artistasBtn:
            'menu/artistas.html',

        albumnsBtn:
            'menu/albuns.html',

        adminBtn:
            'admin/dashboard.html',

        profileBtn:
            `menu/perfil.html?userId=${userId}`,
    };


    /* =========================
       FOTO PADRÃO
    ========================= */

    const DEFAULT_PHOTO =
        ROOT + 'assets/default-avatar.png';


    /* =========================
       NAVBAR
    ========================= */

    const NAVBAR_HTML = `

<header class="admin-topbar">

    <a href="${ROOT}index.html">

        <img
            src="${ROOT}imagens/Logo.png"
            alt="Logo do Soundy"
            class="logo"
        >

    </a>


    <nav class="admin-nav">

        <div class="titulos">

            <button
                class="playlists"
                id="playlistsBtn"
                type="button"
            >
                Playlists
            </button>


            <button
                class="artistas"
                id="artistasBtn"
                type="button"
            >
                Artistas
            </button>


            <button
                class="albumns"
                id="albumnsBtn"
                type="button"
            >
                Álbuns
            </button>

        </div>


        <button
            class="admin"
            id="adminBtn"
            type="button"
            hidden
        >
            Painel Admin
        </button>


        <div class="busca-wrapper">

            <input
                class="buscabusca"
                id="searchInput"
                type="search"
                placeholder="Buscar músicas, artistas e álbuns"
                autocomplete="off"
            >

            <ul
                id="searchResults"
                hidden
            ></ul>

        </div>

    </nav>


    <!-- FOTO DO USUÁRIO -->

    <button
        class="perfil"
        id="profileBtn"
        type="button"
        title="Meu perfil"
    >

        <img
            id="navbarUserPhoto"
            src="${DEFAULT_PHOTO}"
            alt="Foto de perfil"
        >

    </button>

</header>
`;


    /* =========================
       MONTAR NAVBAR
    ========================= */

    function montarNavbar() {

        const lugar =
            document.querySelector('#navbar');


        if (!lugar) {

            console.warn(
                'navbar.js: coloque <div id="navbar"></div> no body da página.'
            );

            return;
        }


        lugar.outerHTML =
            NAVBAR_HTML;


        ligarBotoes();

        ligarBusca();

        carregarFotoUsuario();
    }


    /* =========================
       BOTÕES
    ========================= */

    function ligarBotoes() {

        for (
            const [id, destino]
            of Object.entries(DESTINOS)
        ) {

            const botao =
                document.getElementById(id);


            if (botao && destino) {

                botao.addEventListener(
                    'click',
                    () => {

                        window.location.href =
                            ROOT + destino;

                    }
                );
            }
        }


        /* botão admin */

        if (
            localStorage.getItem('isAdmin')
            === 'true'
        ) {

            const adminBtn =
                document.getElementById(
                    'adminBtn'
                );


            if (adminBtn) {

                adminBtn.hidden =
                    false;
            }
        }
    }


    /* =========================
       CARREGAR FOTO DO USUÁRIO
    ========================= */

    async function carregarFotoUsuario() {

        const navbarUserPhoto =
            document.getElementById(
                'navbarUserPhoto'
            );


        if (!navbarUserPhoto) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/users/${userId}`
                );


            if (!response.ok) {

                throw new Error(
                    'Não foi possível carregar o usuário.'
                );
            }


            const user =
                await response.json();


            navbarUserPhoto.src =
                user.pictureUrl ||
                DEFAULT_PHOTO;


        } catch (error) {

            console.error(
                'Erro ao carregar foto do usuário:',
                error
            );


            navbarUserPhoto.src =
                DEFAULT_PHOTO;
        }
    }


    /* =========================
       BUSCA
    ========================= */

    let dadosBusca = null;


    function carregarDadosBusca() {

        if (!dadosBusca) {

            const buscar =
                (rota) =>

                    fetch(
                        `${API_URL}${rota}`
                    ).then((r) => {

                        if (!r.ok) {

                            throw new Error(
                                `Erro ao carregar ${rota}: ${r.status}`
                            );
                        }

                        return r.json();
                    });


            dadosBusca =
                Promise.all([

                    buscar('/songs'),

                    buscar('/artists'),

                    buscar('/albums'),

                ]).then(
                    ([songs, artists, albums]) => ({
                        songs,
                        artists,
                        albums
                    })
                );


            dadosBusca.catch(() => {

                dadosBusca = null;

            });
        }


        return dadosBusca;
    }


    /* =========================
       BUSCA NA NAVBAR
    ========================= */

    function ligarBusca() {

        const searchInput =
            document.getElementById(
                'searchInput'
            );


        const searchResults =
            document.getElementById(
                'searchResults'
            );


        function addResultado(
            texto,
            destino
        ) {

            const li =
                document.createElement(
                    'li'
                );


            li.textContent =
                texto;


            li.addEventListener(
                'click',
                () => {

                    window.location.href =
                        ROOT + destino;

                }
            );


            searchResults.appendChild(
                li
            );
        }


        searchInput.addEventListener(
            'input',
            async () => {

                const termo =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                searchResults.innerHTML =
                    '';


                if (termo === '') {

                    searchResults.style.display =
                        'none';

                    return;
                }


                let dados;


                try {

                    dados =
                        await carregarDadosBusca();

                } catch (error) {

                    console.error(
                        'Erro ao carregar dados da busca:',
                        error
                    );

                    return;
                }


                if (
                    searchInput.value
                        .trim()
                        .toLowerCase()
                    !== termo
                ) {

                    return;
                }


                const songs =
                    dados.songs.filter(
                        (s) =>
                            s.title
                                ?.toLowerCase()
                                .includes(termo)
                    );


                const artists =
                    dados.artists.filter(
                        (a) =>
                            a.name
                                ?.toLowerCase()
                                .includes(termo)
                    );


                const albums =
                    dados.albums.filter(
                        (a) =>
                            a.title
                                ?.toLowerCase()
                                .includes(termo)
                    );


                searchResults.innerHTML =
                    '';


                if (
                    songs.length === 0 &&
                    artists.length === 0 &&
                    albums.length === 0
                ) {

                    searchResults.innerHTML =
                        '<li>Nenhum resultado encontrado>';
                }


                songs.forEach(
                    (s) =>
                        addResultado(
                            `🎵 ${s.title} — ${s.artist?.name ?? ''}`,
                            `musica/pMusica.html?id=${s.id}`
                        )
                );


                artists.forEach(
                    (a) =>
                        addResultado(
                            `🎤 ${a.name}`,
                            `menu/artista.html?id=${a.id}`
                        )
                );


                albums.forEach(
                    (a) =>
                        addResultado(
                            `💿 ${a.title}`,
                            `pgMusicas.html?tipo=album&id=${a.id}`
                        )
                );


                searchResults.style.display =
                    'block';

            }
        );
    }


    /* =========================
       INICIAR
    ========================= */

    montarNavbar();

})();