# Spesifikasi Teknis Super-Detail — Solid Music Platform v2.0

Dokumen ini adalah **blueprint implementasi final**. Semua *tech debt* dari percobaan sebelumnya (bypass `webid`, hack `host.docker.internal`, hilangnya `idToken`) sudah dihapus. Arsitektur ini mengikuti **standar Solid modern** (DPoP, WAC, HTTPS) dan siap untuk skala multi-provider (`solidcommunity.net`, Inrupt, Pod lokal).

---

# BAGIAN 0 — Konvensi Global

## 0.1 Tech Stack Locked
| Layer | Teknologi | Versi |
|---|---|---|
| Backend | Node.js / Express | 22.x / 4.21.x |
| Backend Auth | `@solid/access-token-verifier` | Latest |
| Backend Validation | Zod | 3.23.x |
| Backend DB | PostgreSQL | 18.6 |
| Frontend | React + Vite + TypeScript | 19.x / 6.x / 5.6.x |
| Frontend Solid | `@inrupt/solid-client-authn-browser` | **v4.x** (v5 tidak kompatibel) |
| Frontend Solid Client | `@inrupt/solid-client` | 4.x |
| Frontend State | `@tanstack/react-query` | 5.x |
| Infra Dev | Caddy (HTTPS) + CSS + PostgreSQL | 2.11.x / 7.3.0 |
| Infra Prod | Caddy (HTTPS auto Let's Encrypt) | 2.11.x |

## 0.2 Naming Conventions
- **DB:** `snake_case` (`users`, `owner_webid`, `created_at`).
- **API:** `kebab-case` plural (`/api/tracks`, `/api/auth/exchange`).
- **Backend files:** `*.controller.js`, `*.service.js`, `*.repo.js`, `*.middleware.js`.
- **Frontend files:** `PascalCase.tsx` (component), `camelCase.ts` (api/hook), `camelCase.tsx` (context).

## 0.3 Standard Response Format
```json
{ "data": { "id": "uuid", ... } }
{ "data": [...], "meta": { "total": 10, "limit": 20, "offset": 0 } }
{ "error": "track_not_found", "message": "...", "details": { ... } }
```

## 0.4 Standard Error Codes
`validation_error`, `unauthorized`, `forbidden`, `not_found`, `track_not_found`, `user_not_found`, `solid_fetch_failed`, `invalid_metadata`, `internal_error`, `not_implemented`.

## 0.5 Auth Convention (Solid Standard)
- **Frontend → Backend:** `Authorization: DPoP <access_token>` + `DPoP: <proof>`
- **Backend → Frontend:** Cookie `sm_session` (httpOnly, JWT internal)
- **Multi-Issuer Allowlist:** Backend hanya verifikasi token dari issuer yang terdaftar di `ALLOWED_ISSUERS`.
- **WebID Normalization:** Selalu strip trailing slash dari `webid` sebelum disimpan.

## 0.6 Directory Structure (Backend)
```
backend/
├── src/
│   ├── index.js / app.js
│   ├── config/index.js
│   ├── db/{pool,migrate}.js
│   ├── middlewares/{auth,dpop,error,logger,validate}.middleware.js
│   ├── utils/{response,errors,jwt,slug}.js
│   ├── routes/{index,auth,tracks,search,social}.routes.js
│   ├── controllers/{auth,tracks,search,social}.controller.js
│   ├── services/{auth,solid,tracks,search,social}.service.js
│   ├── repositories/{user,track,follow,like,comment}.repo.js
│   ├── validators/{auth,track,social}.validator.js
│   └── musicbrainz/client.js
├── migrations/
│   ├── 0001_init.up.sql
│   └── 0002_admin_role.up.sql
└── test/
```

## 0.7 Directory Structure (Frontend)
```
frontend/src/
├── main.tsx / App.tsx / router.tsx
├── contexts/AuthContext.tsx / PlayerContext.tsx
├── api/client.ts / auth.api.ts / tracks.api.ts
├── lib/solid.ts / pod-writer.ts / metadata-builder.ts
├── hooks/useAuth.ts / useTracks.ts
├── components/{layout,auth,tracks,player,ui}/
└── pages/{Home,Catalog,TrackDetail,Upload,Login}Page.tsx
```

---

# BAGIAN 1 — MINGGU 1: Infra, DPoP Auth, & Core Chain

## 🎫 C1.1 — Caddy HTTPS untuk CSS Lokal
**Tujuan:** Semua komunikasi ke CSS lokal menggunakan HTTPS (`https://localhost`). Ini memenuhi syarat Solid-OIDC (WebID harus HTTPS atau HTTP localhost).

**`infra/caddy/Caddyfile`:**
```
localhost:443 {
    tls internal
    reverse_proxy css:3001
}
```

**`docker-compose.yml` (excerpt):**
```yaml
services:
  css:
    image: solidproject/community-server:7.3.0
    command: --baseUrl https://localhost --port 3001
    environment:
      CSS_BASE_URL: https://localhost
    volumes:
      - cssdata:/data
  caddy:
    image: caddy:2-alpine
    ports: ["443:443"]
    volumes:
      - ./infra/caddy/Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on: [css]
```

**Acceptance:**
- [ ] `curl -k https://localhost` → 200 (halaman welcome CSS).
- [ ] Buat akun alice di `https://localhost`. WebID jadi: `https://localhost/alice/profile/card#me`.

---

## 🎫 C1.2 — Konfigurasi WAC (Web Access Control)
**Tujuan:** CSS lokal mengizinkan publik untuk *read* folder `/public/`, tapi *write* hanya untuk pemilik. Ini standar Solid.

**`infra/css/config.json`:**
Gunakan konfigurasi `file.json` bawaan CSS, tapi pastikan WAC aktif (bukan `allow-all`). Tambahkan resource *authorization* default:
```json
{
  "import": [
    "css:config/app/main/default.json",
    "css:config/ldp/authorization/webacl.json",  // ← WAC aktif
    // ... config lain
  ]
}
```

**Seed ACL (jalankan sekali sebagai alice):**
Frontend akan menulis ACL ini saat user pertama kali publish. Backend tidak menulis ACL (harus dari sisi user).

**Acceptance:**
- [ ] GET anonim ke `/alice/public/` → 200.
- [ ] PUT anonim ke `/alice/public/` → 401 (harus login).
- [ ] PUT sebagai alice → 201.

---

## 🎫 A1.1 — Backend Bootstrap + Migration
**Files:** `backend/package.json`, `src/index.js`, `src/app.js`, `src/config/index.js`, `src/db/{pool,migrate}.js`, `migrations/0001_init.up.sql`.

**Env Schema (`src/config/index.js`):**
```javascript
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  // Multi-issuer: pisahkan dengan koma
  ALLOWED_ISSUERS: z.string()
    .default('https://localhost,https://solidcommunity.net,https://inrupt.net,https://login.inrupt.com')
    .transform(s => s.split(',').map(i => i.trim())),
});
```

**`.env.example`:**
```env
DATABASE_URL=postgres://solidmusic:dev-password@postgres:5432/solidmusic
JWT_SECRET=change-me-min-32-chars-random
ALLOWED_ISSUERS=https://localhost,https://solidcommunity.net,https://inrupt.net,https://login.inrupt.com
CORS_ORIGINS=http://localhost:5173
```

**Migration `0001_init.up.sql`:** (semua tabel dari spec v1 + tambahan berikut)
- `users.is_admin BOOLEAN DEFAULT false` (siapkan untuk Minggu 5).
- `tracks.search_vector tsvector` (siapkan untuk Minggu 2 search).

**Acceptance:**
- [ ] `docker compose up` → `/health` 200, `/ready` 200.
- [ ] Semua tabel terbuat di PostgreSQL.
- [ ] Log `listening on :8080`.

---

## 🎫 A1.2 — DPoP Middleware (Multi-Issuer)
**Files:** `src/middlewares/dpop.middleware.js`, `src/utils/errors.js`.

**`src/middlewares/dpop.middleware.js`:**
```javascript
import { createSolidTokenVerifier } from '@solid/access-token-verifier';
import { config } from '../config/index.js';
import { errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function verifyDpopToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const dpopHeader = req.headers.dpop;

  if (!authHeader?.startsWith('DPoP ') || !dpopHeader) {
    return next(errors.unauthorized('Missing DPoP headers'));
  }

  try {
    const verifier = createSolidTokenVerifier({
      allow: { issuers: config.ALLOWED_ISSUERS }
    });

    const { webid } = await verifier(authHeader, {
      header: dpopHeader,
      method: req.method,
      url: `https://api.solidmusic.local${req.originalUrl}`
    });

    req.solid = { webid: webid.replace(/\/$/, '') };
    next();
  } catch (error) {
    logger.error({ err: error.message, webid: req.solid?.webid }, 'DPoP failed');
    return next(errors.unauthorized(`Invalid DPoP token: ${error.message}`));
  }
}
```

**Acceptance:**
- [ ] Request tanpa header DPoP → 401.
- [ ] Request dengan token invalid → 401.
- [ ] Request dengan token alice dari `solidcommunity.net` **dan** dari `localhost` → keduanya valid (multi-issuer).

---

## 🎫 A1.3 — Endpoint Auth Exchange
**Files:** `src/routes/auth.routes.js`, `src/controllers/auth.controller.js`, `src/repositories/user.repo.js`.

**`auth.routes.js`:**
```javascript
router.post('/solid/exchange', verifyDpopToken, authController.exchange);
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);
```

**`auth.controller.js` — `exchange`:**
```javascript
export async function exchange(req, res, next) {
  try {
    const { webid } = req.solid;
    const displayName = webid.split('/')[3] || webid.split('/')[2] || 'User';

    const user = await userRepo.upsertByWebId(webid, displayName);
    const token = await signJWT({ uid: user.id, webid: user.webid });

    res.cookie('sm_session', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 3600 * 1000,
      path: '/',
    });

    res.json({ data: { user } });
  } catch (err) { next(err); }
}
```

**Acceptance:**
- [ ] Frontend login dengan DPoP → 200 + cookie `sm_session`.
- [ ] User tercatat di tabel `users` dengan webid yang benar.
- [ ] Login dari `solidcommunity.net` → user baru di DB (multi-provider works).
- [ ] `GET /api/auth/me` dengan cookie → 200.

---

## 🎫 A1.4 — Katalog & Sync dari Pod
**Files:** `src/controllers/tracks.controller.js`, `src/services/{tracks,solid}.service.js`, `src/repositories/track.repo.js`, `src/validators/track.validator.js`.

**`solid.service.js` — `fetchMetadata`:**
```javascript
export async function fetchMetadata(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/ld+json' },
      signal: controller.signal,
    });
    if (!res.ok) throw errors.validation({ reason: 'solid_fetch_failed', status: res.status });
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
```

**`track.validator.js` — Metadata JSON-LD:**
```javascript
export const metadataSchema = z.object({
  '@type': z.literal('MusicRecording'),
  '@id': z.string().url(),
  name: z.string().min(1).max(500),
  byArtist: z.object({
    '@id': z.string().url(),
    name: z.string().optional(),
  }),
  contentUrl: z.string().url(),
  duration: z.string().regex(/^PT(\d+H)?(\d+M)?(\d+S)?$/),
  genre: z.union([z.string(), z.array(z.string())]).optional(),
  description: z.string().max(5000).optional(),
  image: z.string().url().optional(),
});
```

**Endpoint `POST /api/tracks/sync`:**
- Auth: `requireAuth` (cek cookie `sm_session`).
- Body: `{ pod_resource_url: "https://..." }`.
- Logic: `fetchMetadata` → `metadataSchema.parse` → validasi `byArtist['@id'] === req.user.webid` → `trackRepo.upsertFromPod` → return track.
- Error: 422 `solid_fetch_failed` / 422 `invalid_metadata` / 403 `forbidden`.

**Endpoint `GET /api/tracks` & `GET /api/tracks/:id`:**
- Publik (`optionalAuth` untuk cek `stream_access='paid'`).
- Return `audio_url: null` jika `stream_allowed=false`.

**Acceptance:**
- [ ] Sync metadata dari CSS lokal → 200, track masuk katalog.
- [ ] Sync 10x → 1 row (idempotent).
- [ ] `byArtist.@id` beda dengan user → 403.
- [ ] `GET /api/tracks` publik → list (hanya `status='available'`).
- [ ] Audio URL menunjuk ke Pod (bukan backend).

---

## 🎫 B1.1 — Frontend Bootstrap
**Files:** `frontend/package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`.

**`package.json` dependencies (locked):**
```json
{
  "@inrupt/solid-client": "^4.0.0",
  "@inrupt/solid-client-authn-browser": "^4.0.0",
  "axios": "^1.7.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "react-router-dom": "^6.26.0"
}
```

**Note:** Frontend pakai React 18 (bukan 19) untuk stabilitas ekosistem.

**`.env`:**
```env
VITE_API_URL=http://localhost:8080
VITE_SOLID_ISSUER=https://localhost
```

**Acceptance:**
- [ ] `npm run dev` → halaman kosong tanpa error.
- [ ] `http://localhost:5173` terbuka.

---

## 🎫 B1.2 — Solid Auth Context
**Files:** `src/contexts/AuthContext.tsx`, `src/lib/solid.ts`, `src/components/auth/LoginButton.tsx`.

**`AuthContext.tsx` — inti:**
```tsx
useEffect(() => {
  handleIncomingRedirect({ restorePreviousSession: true }).then(async (info) => {
    if (info?.isLoggedIn) {
      const session = getDefaultSession();
      setSession(session);
      setWebId(session.info.webId);

      // Kirim DPoP ke backend
      try {
        const res = await session.fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/solid/exchange`,
          { method: 'POST', credentials: 'include' }
        );
        if (res.ok) {
          const { data } = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Exchange failed:', err);
      }
    }
    setIsProcessing(false);
  });
}, []);
```

**`LoginButton.tsx` — behaviour:**
- Anonymous: tombol "Login" → `login({ oidcIssuer: VITE_SOLID_ISSUER, redirectUrl: window.location.href })`.
- Authenticated: tampil `user.display_name` + tombol "Logout".

**Multi-provider support:** Tambahkan dropdown/input untuk issuer, agar user bisa pilih `https://solidcommunity.net` atau `https://localhost`. Default: `VITE_SOLID_ISSUER`.

**Acceptance:**
- [ ] Klik Login → redirect ke CSS.
- [ ] Login alice → balik ke app → tampil nama.
- [ ] Console: **tidak ada** error exchange.
- [ ] Cookie `sm_session` ada di DevTools.
- [ ] Coba login dari `https://solidcommunity.net` → works (atau error yang jelas jika ada masalah CORS).

---

## 🎫 B1.3 — Upload Form & Sync
**Files:** `src/lib/pod-writer.ts`, `src/lib/metadata-builder.ts`, `src/components/tracks/UploadForm.tsx`.

**`pod-writer.ts` — inti:**
```ts
export async function uploadTrack(file: File, meta: TrackMeta, session) {
  const podRoot = session.info.webId.replace('/profile/card#me', '/');
  const slug = slugify(meta.title);
  const containerUrl = `${podRoot}public/music/${slug}/`;

  // 1. Buat container
  try {
    await createContainerAt(containerUrl, { fetch: session.fetch });
  } catch (e) {
    if (!String(e.message).includes('409')) throw e;
  }

  // 2. Upload audio
  const audioUrl = `${containerUrl}audio.mp3`;
  await overwriteFile(audioUrl, file, { contentType: 'audio/mpeg', fetch: session.fetch });

  // 3. Upload metadata
  const metadataUrl = `${containerUrl}metadata.jsonld`;
  const metadata = buildMetadata({ ...meta, audioUrl, artistWebId: session.info.webId }, metadataUrl);
  await overwriteFile(metadataUrl, new Blob([JSON.stringify(metadata)], { type: 'application/ld+json' }), {
    contentType: 'application/ld+json',
    fetch: session.fetch,
  });

  return metadataUrl;
}
```

**`UploadForm.tsx` — on submit:**
```tsx
const metadataUrl = await uploadTrack(file, formData, session);
await axios.post(`${VITE_API_URL}/api/tracks/sync`,
  { pod_resource_url: metadataUrl },
  { withCredentials: true }
);
navigate(`/tracks/${syncedTrackId}`);
```

**Acceptance:**
- [ ] Form menampilkan preview file.
- [ ] Klik Upload → audio & metadata masuk Pod.
- [ ] `POST /api/tracks/sync` return 200.
- [ ] Redirect ke halaman detail track.

---

## 🎫 B1.4 — Catalog & Player (Minimal UI)
**Files:** `src/pages/CatalogPage.tsx`, `src/pages/TrackDetailPage.tsx`, `src/components/player/GlobalPlayer.tsx`, `src/hooks/useTracks.ts`.

**Behaviour:**
- `CatalogPage`: `useQuery(['tracks'], () => GET /api/tracks)` → grid card.
- `TrackDetailPage`: `useQuery(['track', id], ...)` → tampil cover, title, artist, player (`<audio controls src={track.audio_url}>`).
- `GlobalPlayer`: `<audio>` fixed di bottom, controlled via PlayerContext.

**Acceptance:**
- [ ] Katalog menampilkan semua track (dari CSS lokal & Pod eksternal).
- [ ] Klik track → detail + player.
- [ ] Play → audio dari Pod (cek DevTools Network).
- [ ] Jika audio_url null (login_required/paid) → tampil tombol login/beli.

---

# BAGIAN 2 — MINGGU 2: Search, Social, Profil

## 🎫 A2.1 — PostgreSQL Full-Text Search
**Files:** `src/services/search.service.js`, `src/repositories/track.repo.js` (tambah `search`), `src/controllers/search.controller.js`.

**Migration tambahan `0002_search.up.sql`:**
```sql
ALTER TABLE tracks ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(artist_name,'') || ' ' || coalesce(description,''))
  ) STORED;
CREATE INDEX idx_tracks_search ON tracks USING GIN(search_vector);
```

**Endpoint `GET /api/search?q=&genre=&limit=`:**
```sql
SELECT *, ts_rank(search_vector, plainto_tsquery('simple', $1)) AS rank
FROM tracks
WHERE deleted_at IS NULL AND visibility = 'public' AND status = 'available'
  AND search_vector @@ plainto_tsquery('simple', $1)
  AND ($2::text IS NULL OR $2 = ANY(genre))
ORDER BY rank DESC, created_at DESC
LIMIT $3 OFFSET $4;
```

**Acceptance:**
- [ ] `?q=kota` → hasil judul mengandung "Kota".
- [ ] `?q=kotaa` (typo) → fallback `pg_trgm`.
- [ ] Latency < 300ms (dengan 10k row).

---

## 🎫 A2.2 — Social APIs
**Files:** `src/repositories/{follow,like,comment}.repo.js`, `src/controllers/social.controller.js`, `src/routes/social.routes.js`.

**Endpoints:**
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/api/users/:webid/follow` | requireAuth | — |
| DELETE | `/api/users/:webid/follow` | requireAuth | — |
| POST | `/api/tracks/:id/likes` | requireAuth | — |
| DELETE | `/api/tracks/:id/likes` | requireAuth | — |
| GET | `/api/tracks/:id/comments` | None | — |
| POST | `/api/tracks/:id/comments` | requireAuth | `{ content }` |
| DELETE | `/api/comments/:id` | requireAuth | — |

**Rules:**
- Self-follow → 422 `forbidden`.
- Duplicate follow/like → 409 `already_following`/`already_liked`.
- Delete comment: hanya pemilik → 403 jika bukan.
- Comment content: `min(1).max(2000)`.

**Acceptance:**
- [ ] Follow/unfollow works.
- [ ] Like/unlike works.
- [ ] Komentar CRUD works (hanya pemilik yang bisa delete).

---

## 🎫 A2.3 — Endpoint Profil Artis
**Tambahan di `social.routes.js`:**
| Method | Path | Response |
|---|---|---|
| GET | `/api/artists/:webid` | `{ webid, display_name, bio, follower_count, track_count }` |
| GET | `/api/artists/:webid/tracks` | List tracks |
| GET | `/api/me/following/:webid` | `{ following: bool }` |

**Acceptance:**
- [ ] Buka profil artis → info + list track.
- [ ] Follower count akurat.
- [ ] Follow button state akurat.

---

## 🎫 B2.1 — Search UI + Filter
**Files:** `src/pages/SearchPage.tsx`, `src/components/filters/GenreFilter.tsx`, `src/hooks/useSearch.ts`.

**Behaviour:**
- Input dengan debounce 300ms.
- URL sync: `?q=kota&genre=Indie`.
- Load More pagination.

**Acceptance:**
- [ ] Ketik → setelah 300ms → hasil.
- [ ] Klik genre → filter.
- [ ] URL ter-update saat filter berubah.

---

## 🎫 B2.2 — Profil Artis UI
**Files:** `src/pages/ArtistProfilePage.tsx`, `src/components/social/FollowButton.tsx`.

**Acceptance:**
- [ ] Header: avatar, nama, bio, follower count.
- [ ] Follow/unfollow instant update.
- [ ] Self visit → tombol follow hidden.

---

## 🎫 B2.3 — Track Detail + Comments UI
**Files:** `src/pages/TrackDetailPage.tsx` (update), `src/components/social/{CommentList,CommentForm,LikeButton}.tsx`.

**Acceptance:**
- [ ] Like/unlike instant update.
- [ ] Comment CRUD works.
- [ ] `stream_allowed=false` → tampil tombol login/beli.

---

# BAGIAN 3 — MINGGU 3: Monetisasi (Payment Adapter + Guest Checkout)

## 🎫 A3.1 — Payment Adapter Infrastructure
**Files:** `src/services/payments/{payment-adapter.interface,midtrans.adapter,index}.js`.

**Interface:**
```javascript
export class PaymentAdapter {
  async createPayment({ orderId, amountCents, currency, description, customer, returnUrl }) { throw new Error('not_implemented'); }
  async verifyWebhook(req) { throw new Error('not_implemented'); }
  async refund(gatewayRef) { throw new Error('not_implemented'); }
}
```

**`midtrans.adapter.js`** implements: `createPayment` → POST ke Snap API, `verifyWebhook` → verify signature SHA512, `refund`.

**Env:**
```env
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
MIDTRANS_IS_PRODUCTION=false
```

**Acceptance:**
- [ ] `getAdapter('midtrans').createPayment(...)` → return `{ redirectUrl }`.
- [ ] Verify signature valid → `{ status: 'paid' }`.
- [ ] Verify invalid signature → throw.

---

## 🎫 A3.2 — Guest Checkout
**Endpoint `POST /api/purchases/guest`:**
- Body: `{ track_id, email }`.
- Rules: track exists, `download_enabled=true`, `download_price_cents > 0`.
- Create `purchases` row `{ type: 'download', status: 'pending', guest_email, buyer_id: null }`.
- Call adapter → return `{ purchase_id, redirect_url }`.

**Acceptance:**
- [ ] Guest checkout valid → 201 + redirect.
- [ ] Track gratis atau download disabled → 422.
- [ ] Row `purchases` dibuat.

---

## 🎫 A3.3 — Webhook Handler
**Endpoint `POST /api/payments/webhook/:gateway`:**
- Verify webhook via adapter.
- Idempotent: jika sudah `paid`, return 200 tanpa side-effect.
- Update `purchases.status = 'paid'`, `paid_at = now()`.
- Generate download token (JWT HS256, exp 30 hari) → simpan di `purchases.download_token`.
- Kirim email via nodemailer (fallback: log ke console di dev).
- Return 200 `{ status: 'ok' }`.

**Acceptance:**
- [ ] Webhook paid → status update + email dikirim.
- [ ] Webhook duplicate → idempotent.
- [ ] Webhook invalid signature → 401.

---

## 🎫 A3.4 — Secure Download Endpoint
**Endpoint `GET /api/download/:purchaseId?token=`:**
- Verify `token` via `jwtVerify`.
- Cek `purchases.status = 'paid'`.
- Fetch audio dari Pod (backend jadi proxy hanya untuk download).
- Stream ke client dengan `Content-Disposition: attachment`.

**Acceptance:**
- [ ] Token valid → file ter-download.
- [ ] Token invalid/expired → 401.
- [ ] Purchase pending → 403.

---

## 🎫 B3.1 — UI Setting Harga (Musisi)
**Files:** `src/components/tracks/TrackEditForm.tsx`, `src/pages/TrackEditPage.tsx`.

**Fields:**
- `stream_access`: radio (`free` / `login_required` / `paid`).
- `download_enabled`: toggle.
- `download_price_cents`: number.
- `tip_enabled`: toggle.

**Backend need:** endpoint `PATCH /api/tracks/:id` (owner-only). **Tambah ke A1.4** — belum ada di spec asli.

**Acceptance:**
- [ ] Edit track → save → tersimpan.
- [ ] Non-owner edit → 403.

---

## 🎫 B3.2 — Guest Checkout UI
**Files:** `src/components/purchase/GuestCheckoutModal.tsx`, `src/components/purchase/BuyButton.tsx`.

**Acceptance:**
- [ ] Klik "Beli" → modal → isi email → redirect Midtrans.
- [ ] Pembayaran success → email masuk.

---

# BAGIAN 4 — MINGGU 4: Login Checkout, Stream Unlock, Tip, History

## 🎫 A4.1 — Login Checkout
**Endpoint `POST /api/purchases`:**
- Body: `{ track_id, type: 'download'|'stream_unlock'|'bundle' }`.
- Cek existing purchase → 409 `already_purchased`.
- Insert + call adapter → return `{ redirect_url }`.

**Acceptance:**
- [ ] Login checkout → 201 + redirect.
- [ ] Duplicate purchase → 409.

---

## 🎫 A4.2 — Stream Unlock Logic
Update `tracks.service.findById`:
```javascript
if (track.stream_access === 'paid' && user) {
  const unlocked = await purchaseRepo.existsUnlockedStream(user.userId, track.id);
  stream_allowed = unlocked;
}
```

**Acceptance:**
- [ ] Setelah beli → `stream_allowed=true` + `audio_url` terisi.
- [ ] User lain → tetap false.

---

## 🎫 A4.3 — Feed API & UI
**Endpoint `GET /api/feed`:** Fan-out on read dari `follows` + `posts` + `tracks`.

**UI `src/pages/FeedPage.tsx`:** List aktivitas dari artis yang di-follow.

**Acceptance:**
- [ ] Follow artis → feed menampilkan track mereka.
- [ ] Pagination works.

---

## 🎫 A4.4 — Purchase History
**Endpoint `GET /api/purchases`:** Return semua purchase milik user (status paid).

**UI `src/pages/PurchasesPage.tsx`:** List card dengan tombol Play (jika unlocks_stream) + Download.

**Acceptance:**
- [ ] Pembelian muncul setelah login.
- [ ] Tombol Download works.

---

## 🎫 B4.3 — Tip Jar
**Backend `POST /api/tips`:** Guest atau login, bebas nominal. Insert `purchases` `{ type: 'tip' }`.

**UI `src/components/purchase/TipModal.tsx`:** Modal nominal preset + custom.

**Acceptance:**
- [ ] Tip masuk `purchases` dengan `type='tip'`.
- [ ] Email thanks terkirim.

---

# BAGIAN 5 — MINGGU 5: Verify, MusicBrainz, Moderasi

## 🎫 A5.1 — On-Demand Verify
**Endpoint `POST /api/tracks/:id/verify`:**
- Rate limit: 1x per 5 menit per track.
- HEAD ke `audio_url`.
- 200 → `available`, 404/410 → `deleted`, 403 → `access_revoked`, 5xx/timeout → no-op.
- Update `last_verified_at`.

**Acceptance:**
- [ ] 404 → track hilang dari katalog.
- [ ] Pod down → status tidak berubah.

---

## 🎫 A5.2 — MusicBrainz Integration
**Endpoint `GET /api/musicbrainz/search?q=`:** Backend proxy ke MusicBrainz API, rate limit 1 req/detik, cache 24 jam.

**Acceptance:**
- [ ] `?q=radiohead` → 10 hasil.
- [ ] Cache hit pada request kedua.

---

## 🎫 A5.3 — Report & Admin
**Migration `0003_admin.up.sql`:** sudah ada di `0001` (`is_admin` column).

**Endpoints:**
- `POST /api/reports` → create report.
- `GET /api/admin/reports` (requireAdmin) → list.
- `PATCH /api/admin/reports/:id` → resolve/dismiss.
- `PATCH /api/admin/tracks/:id/hide` → `status = 'hidden_by_admin'`.

**Middleware `requireAdmin`:** cek `users.is_admin`.

**Acceptance:**
- [ ] User report → 201.
- [ ] Non-admin access admin → 403.
- [ ] Admin hide track → hilang dari katalog.

---

# BAGIAN 6 — MINGGU 6: Portability, Test, Deploy

## 🎫 A6.1 — Portability CLI
**File:** `tools/portability-cli/index.js`.

**Behaviour:** fetch `metadata.jsonld` langsung dari Pod (tanpa backend kita), print info, putar audio via `ffplay`.

**Acceptance:**
- [ ] Upload track via app → jalankan CLI → audio terputar.
- [ ] CLI tidak import apapun dari backend/frontend kita.

---

## 🎫 A6.2 — Load Test & Optimize
**Tools:** k6 atau artillery. **Target:** search p95 < 300ms (10k rows), concurrent stream 100 user tanpa error.

**Acceptance:**
- [ ] Report di `docs/performance-report.md`.

---

## 🎫 A6.3 — Production Deploy
**Files:** `docker-compose.prod.yml`, `Caddyfile` (untuk app), backup script.

**Acceptance:**
- [ ] Domain HTTPS works via Caddy.
- [ ] Backup harian Postgres jalan.
- [ ] Login via `solidcommunity.net` (pod eksternal) works.

---

# BAGIAN 7 — Catatan Akhir

## 7.1 Decision Log (Solid-Standard Edition)
| # | Keputusan | Alasan |
|---|---|---|
| 1 | **Caddy sebagai reverse proxy HTTPS di dev** | CSS tidak bisa pakai HTTP non-localhost. Caddy auto-signed cert. |
| 2 | **Multi-issuer allowlist** (`ALLOWED_ISSUERS`) | Mencegah SSRF + fleksibel multi-provider. |
| 3 | **DPoP via `@solid/access-token-verifier`** (bukan JWT manual) | Standar Solid, aman dari replay attack. |
| 4 | **Frontend v4 auth library** (bukan v5) | v5 menyembunyikan token, tidak bisa diakses. |
| 5 | **React 18** (bukan 19) | Stabilitas ekosistem Solid. |
| 6 | **WAC aktif di CSS** (bukan allow-all) | Standar Solid, siap multi-user. |
| 7 | **Backend proxy hanya untuk download berbayar** | Audio streaming selalu direct dari Pod. |
| 8 | **Multi-provider from day 1** | Dropdown issuer di LoginButton. |

## 7.2 Limitations (Wajib di `docs/limitations.md`)
1. Katalog eventually consistent.
2. Discovery terpusat di PostgreSQL.
3. Kontrol akses ≠ kontrol salinan (file yang sudah diunduh tidak bisa ditarik).
4. Data sosial di PostgreSQL (dengan `webid`, siap diekspor).
5. Portabilitas konten ≠ portabilitas audiens.
6. Stream gating = friksi, bukan DRM.
7. Stream `free` track tidak bisa dibatasi.
8. Guest tidak dapat stream unlock.
9. CORS di Pod eksternal di luar kontrol kita.
10. Admin tidak bisa hapus file di Pod user.

## 7.3 PR Checklist Sebelum Start Coding
- [ ] Docker & Caddy terinstall di mesin dev.
- [ ] Browser trust sertifikat Caddy (`tls internal` — sekali saja: buka `https://localhost`, klik "Advanced" → "Proceed").
- [ ] Akun test di `https://localhost` (alice) dan akun di `https://solidcommunity.net` (untuk uji multi-provider).
- [ ] Postgres 18 container running.
- [ ] Repository di-init (git init, .gitignore).

## 7.4 Yang Belum Ada di Spec Ini (Bisa Ditambah Nanti)
- `PATCH /api/tracks/:id` dan `DELETE /api/tracks/:id` — sudah ditandai di B3.1, perlu ditambahkan ke A1.4.
- `GET /api/openapi.json` + Swagger UI di `/api/docs` — untuk B6.1.
- `POST /api/purchases/claim` (guest → login account linking) — future.

---
