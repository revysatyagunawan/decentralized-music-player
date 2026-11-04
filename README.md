# Decentralized Music Player (Solid DApp)

A decentralized, hybrid music streaming application built on top of the **Solid Protocol**. This platform separates music storage and data ownership from the application layer, allowing artists to host their own audio files and metadata on their personal **Solid Pods** while providing listeners with seamless music discovery and streaming.

---

## Features

- **Decentralized Ownership:** Audio files (`.mp3`) and metadata (`.ttl`) remain strictly inside the artist's Solid Pod.
- **Hybrid Architecture:** Uses a centralized indexer (Express.js + PostgreSQL) purely for fast global search and metadata discovery without storing media assets.
- **WebID Authentication:** Seamless login via Solid Identity Providers (IdP).
- **Client-Side Direct Streaming:** Audio is streamed directly from the artist's Pod URL to the listener's browser.
- **Personalized Playlists:** Listener playlists are saved as RDF linked data directly on the listener's Pod.
- **Public & Authenticated Access:** Anyone can stream public tracks without logging in; authenticated users can access interactive and social features.

---

## System Architecture

```
+-----------------------------------------------------------------------+
|                              CLIENT                                   |
|   React DApp (Audio Player, WebID Auth, Pod CRUD, Search UI)          |
+-----------------------------------------------------------------------+
             |                         |                     |
   1. OAuth WebID Login       4. Stream Audio (GET)   3. Query Search (GET)
             |                         |                     |
             v                         v                     v
+------------------------+   +-------------------+   +------------------+
| Solid Identity Provider|   |  Artist Solid Pod |   | Express.js API   |
|     (e.g., Inrupt)     |   | (Media & RDF Data)|   | & PostgreSQL     |
+------------------------+   +-------------------+   | (Global Index)   |
                                                     +------------------+
```

---

## Repository Structure

```text
decentralized-music-player/
├── client/                     # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── assets/             # Images and static assets
│   │   ├── components/         # Reusable UI components (Player, Navbar, Cards)
│   │   ├── contexts/           # React Contexts (SolidAuth, AudioPlayer)
│   │   ├── lib/                # Solid SDK helper functions and API clients
│   │   ├── pages/              # Page views (Home, Search, Profile, Upload)
│   │   ├── App.jsx             # Main Router
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express Backend Indexer
│   ├── src/
│   │   ├── config/             # Database connection setup (PostgreSQL)
│   │   ├── controllers/        # Route controllers (Search, Track Registration)
│   │   ├── models/             # Database models / queries
│   │   ├── routes/             # API endpoint definitions
│   │   └── index.js            # Express server entry point
│   └── package.json
│
├── docs/                       # Project documentation & presentation slides
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (installed locally or running via Docker)
- A **Solid Pod** account (e.g., from [solidcommunity.net](https://solidcommunity.net/)) for testing upload & auth features.

---

### Setup & Installation

#### 1. Clone the repository
```bash
git clone https://github.com/your-username/decentralized-music-player.git
cd decentralized-music-player
```

#### 2. Configure and start the Backend Server
```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/solid_music_db
```

Run database migrations/scripts (if applicable) and start the server:
```bash
npm run dev
```

#### 3. Configure and start the Frontend Client
Open a new terminal window:
```bash
cd client
npm install
```

Create a `.env` file inside the `client/` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## Ontologies & Standards Used

- **Schema.org:** `MusicRecording`, `MusicAlbum`, `MusicGroup`
- **Solid Web Access Control (WAC):** For managing read/write permissions on Pod resources.
- **RDF / Turtle (`.ttl`):** Linked Data format used for storing track metadata and user playlists.

---

## Contributors

- **Ravif Gayuh Wicaksono** (24/540583/PA/22953)
- **Revy Gunawan Satya** (24/538296/PA/22835)

---

## License

This project is developed for educational purposes under the **Platform Based Software Engineering** course.