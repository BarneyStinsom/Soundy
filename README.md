<div align="center">

<img src="frontend/Logo.png" alt="Soundy" width="180">

# Soundy

**Um player de música simples, feito para aprender na prática.**

</div>

---

## 🎧 Sobre o projeto

O **Soundy** é um projeto de estudo: uma aplicação de música onde dá pra cadastrar usuários,
artistas, álbuns e músicas, montar playlists e acompanhar o histórico de reprodução.

A ideia não é competir com o Spotify — é aprender de verdade como uma aplicação full stack
se encaixa: API REST tipada, banco relacional com migrations e um front conversando com tudo isso.

## 🧱 Stack

| Camada | Tecnologias |
| --- | --- |
| **Backend** | NestJS 12, TypeScript, Swagger, class-validator |
| **Banco** | PostgreSQL 15+ com Prisma ORM 8 (contract-first) |
| **Frontend** | HTML, CSS e JavaScript puro (sem framework) |
| **Qualidade** | Jest, Oxlint, Prettier |

## 📁 Estrutura

```
Soundy/
├── backend/                 # API REST em NestJS
│   ├── src/
│   │   ├── user/            # usuários e login
│   │   ├── artists/         # artistas
│   │   ├── album/           # álbuns
│   │   ├── songs/           # músicas (inclui /songs/top)
│   │   ├── playlist/        # playlists
│   │   ├── playlistsongs/   # músicas dentro das playlists
│   │   ├── playhistory/     # histórico de reprodução
│   │   └── prisma/          # contract.ts (modelos e relações)
│   └── migrations/          # migrations e snapshots do Prisma
└── frontend/                # páginas e scripts do cliente
    ├── index.html           # tela inicial
    ├── Login.html           # login / cadastro
    ├── pgMusicas.html       # listagem de músicas
    ├── menu/                # perfil, artista, top hits
    └── js/                  # api.js e scripts das páginas
```

## 🗃️ Modelo de dados

```
User ──< Playlist ──< PlaylistSong >── Song >── Album >── Artist
  └──< PlayHistory >── Song
```

- **User** — nome, email, senha, foto
- **Artist** — nome e capa, com vários álbuns e músicas
- **Album** — título, tipo e capa, pertence a um artista
- **Song** — título, duração (em segundos), URL do áudio e capa
- **Playlist** — nome, descrição, capa e visibilidade (pública/privada)
- **PlaylistSong** — liga música e playlist, guardando a posição na fila
- **PlayHistory** — registro de cada música tocada por um usuário

## 🚀 Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org) 20+
- **[PostgreSQL](https://www.postgresql.org/) 15+ instalado e rodando** — é obrigatório ter um servidor Postgres de pé para o backend funcionar
- **[pgAdmin](https://www.pgadmin.org/download/)** baixado, para visualizar e gerenciar o banco

### 1. Clonar o repositório

```bash
git clone https://github.com/BarneyStinsom/Soundy.git
cd Soundy
```

### 2. Configurar o backend

```bash
cd backend
npm install
cp .env.example .env
```

Abra o `.env` e coloque a string de conexão do seu Postgres:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/soundy"
```

### 3. Aplicar as migrations

```bash
npx prisma migrate dev
```

### 4. Subir a API

```bash
npm run start:dev
```

A API sobe em **http://localhost:3000** e a documentação Swagger fica em
**http://localhost:3000/api**.

### 5. Abrir o frontend

Basta abrir o `frontend/index.html` no navegador — ou, de preferência, servir a pasta:

```bash
cd frontend
npx serve .
```

> O `frontend/js/api.js` aponta para `http://localhost:3000`. Se mudar a porta da API,
> lembre de atualizar lá também.

## 🔌 Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/users` | Lista os usuários |
| `GET` | `/users/:id` | Busca um usuário |
| `GET` | `/users/:id/playlists` | Playlists de um usuário |
| `POST` | `/users` | Cria um usuário |
| `POST` | `/users/login` | Faz login |
| `PATCH` / `DELETE` | `/users/:id` | Atualiza / remove um usuário |
| `GET` | `/artists` · `/artists/:id` | Lista / busca artistas |
| `GET` | `/artists/:id/albums` | Álbuns de um artista |
| `GET` | `/albums` · `/albums/:id` | Lista / busca álbuns |
| `GET` | `/albums/:id/songs` | Músicas de um álbum |
| `GET` | `/songs` | Lista as músicas |
| `GET` | `/songs/top?limit=10` | Músicas mais tocadas |
| `GET` | `/playlists` | Lista as playlists |
| `GET` | `/playlists/:id/songs` | Músicas de uma playlist |
| `GET` · `POST` · `PATCH` · `DELETE` | `/playlistsongs` | Gerencia músicas nas playlists |
| `GET` · `POST` · `DELETE` | `/playhistory` | Histórico de reprodução |

Artistas, álbuns, músicas e playlists também aceitam `POST`, `PATCH /:id` e `DELETE /:id`.
A lista completa e atualizada está sempre no Swagger (`/api`).

## 🗺️ Próximos passos

- [ ] Autenticação com JWT (hoje o login ainda é simples)
- [ ] Hash de senha
- [ ] Player de áudio funcional no frontend
- [ ] Upload de capas e arquivos de música
- [ ] Busca por artista, álbum e música
- [ ] Deploy

## 🤝 Contribuindo

É um projeto de aprendizado, então sugestão e PR são muito bem-vindos:

1. Faça um fork
2. Crie uma branch (`git checkout -b feature/minha-ideia`)
3. Commit (`git commit -m "feat: minha ideia"`)
4. Push e abra um Pull Request

---
