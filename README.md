# Solid Music

An alternative music platform where musicians own their data.

Audio files live in the musician's **Solid Pod**, not on our servers.
We provide the catalog, the player, and the discovery—but never the enclosure.

## Manifesto

> If you own your music, you don't need capitalists to let your friends hear it.

- **Your Pod, your rules** — audio is stored in your personal Solid Pod
- **No central authority** — anyone can run their own Pod, or use a provider
- **No paywall for listening** — free tracks stream directly from the Pod
- **Files you can take anywhere** — exit is always possible (see [docs/exit-strategy.md](docs/exit-strategy.md))

## What This App Does

- Indexes public music metadata from Solid Pods into a searchable catalog
- Streams audio directly from Pods (no proxying, no caching of files)
- Provides social features (follow, like, comments)
- Supports multi-provider login (Solid Community, Inrupt, Private Data Pod, self-hosted)

## What This App Does NOT Do

- Host your audio files
- Lock you into a single Pod provider
- Take a cut from your music (no royalty, no subscription)
- Own your data

## Quick Start (Development)

Prerequisites: Docker, Node.js 22+, `ffmpeg` (for testing uploads)

```bash
cp .env.example .env
# Edit .env, replace JWT_SECRET with: openssl rand -base64 32

docker compose up -d --build
```

Open:
- Frontend: http://localhost:5173
- Backend health: http://localhost:8080/health
- Solid Pod provider: https://solidcommunity.net (register a free account)

## Architecture

```
Frontend (React + Vite) → Backend (Node + Express) → PostgreSQL
                       ↘                    ↘
                        Solid Pod (user)      Catalog index

Audio delivery: Browser ← Solid Pod (direct, no backend in between)
```

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, TypeScript
- **Backend:** Node.js 22, Express, PostgreSQL, `jose` (JWT/DPoP)
- **Solid:** `@inrupt/solid-client` v2, `@inrupt/solid-client-authn-browser` v2
- **Auth:** Solid-OIDC with DPoP verification
- **Deployment:** Docker Compose, Caddy (production)

## License

AGPL-3.0 — see [LICENSE](LICENSE)

You are free to fork, self-host, and modify. If you run this as a service, you must share your modifications.
