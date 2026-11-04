# Desentralized Music Platform — Dokumen Spesifikasi Lengkap

---

# BAGIAN I — PRODUK

## 1. Visi & Prinsip Inti

### 1.1 Visi

> Platform musik sosial di mana musisi menyimpan karya mereka di Solid Pod milik sendiri, menjualnya langsung ke pendengar tanpa royalti, dan membangun komunitas di sekitarnya—tanpa kehilangan kontrol atas file atau audiens.

### 1.2 Prinsip yang Tidak Boleh Dilanggar

1. **Aplikasi mengelola pengalaman, bukan memiliki musik.**
2. **Audio selalu diambil langsung dari Pod**, bukan dari backend (dengan pengecualian terbatas untuk unduhan berbayar).
3. **Metadata asli hidup di Pod.** PostgreSQL hanya salinan untuk pencarian.
4. **Katalog bisa dibangun ulang dari Pod kapan saja.**
5. **Identitas via WebID.** Tidak ada password sendiri.
6. **Jujur soal batasan.** Kami tidak berpura-pura melindungi sesuatu yang tidak bisa dilindungi.

### 1.3 Klaim Inti Proyek

> *"Musisi dapat memindahkan seluruh katalog musik mereka ke aplikasi lain tanpa kehilangan apa pun. Aplikasi lain dapat membaca dan memutar musik mereka tanpa izin dari platform asal."*

Klaim ini yang harus dibuktikan lewat uji portabilitas.

---

## 2. Aktor

| Aktor | Peran | Login? |
|---|---|---|
| **Guest** | Pengunjung tanpa akun | ❌ |
| **Listener** | Pendengar terdaftar | ✅ |
| **Musician** | Pemilik konten, bisa juga listener | ✅ |
| **Curator** | Listener yang aktif membuat koleksi/ulasan | ✅ |
| **Admin** | Operator platform | ✅ |
| **External Client** | Aplikasi pihak ketiga yang baca Pod | N/A |

### 2.1 Batas Admin

Admin **bisa**:
- Sembunyikan track dari katalog (`hidden_by_admin`)
- Selesaikan report
- Blokir user dari platform
- Lihat audit log

Admin **tidak bisa**:
- Hapus file di Pod user
- Ubah metadata di Pod user
- Akses audio privat

Ini batas desentralisasi yang diakui.

---

## 3. Feature Matrix Lengkap

### 3.1 Discovery & Consumption

| Fitur | Siapa | Login? | Gelombang |
|---|---|---|---|
| Browse katalog publik | Semua | ❌ | 1 |
| Search (judul, artis, genre) | Semua | ❌ | 1 |
| Filter by genre | Semua | ❌ | 2 |
| Sort (terbaru, populer, A-Z) | Semua | ❌ | 2 |
| Halaman detail track | Semua | ❌ | 1 |
| Halaman profil artis | Semua | ❌ | 1 |
| Stream audio | Semua | Kondisional | 1 |
| Lihat daftar track artis | Semua | ❌ | 1 |
| Halaman album/release | Semua | ❌ | 2 |
| Halaman koleksi kurator | Semua | ❌ | 2 |
| Feed aktivitas dari yang diikuti | Listener | ✅ | 2 |
| Trending / populer | Semua | ❌ | 2 |
| Rekomendasi berbasis genre | Listener | ✅ | 3 |
| Rekomendasi personal | Listener | ✅ | Jangka panjang |

### 3.2 Content Management (Musisi)

| Fitur | Login? | Gelombang |
|---|---|---|
| Upload MP3 ke Pod | ✅ | 1 |
| Isi metadata (judul, artis, genre, deskripsi) | ✅ | 1 |
| Edit metadata | ✅ | 1 |
| Hapus dari katalog (unpublish) | ✅ | 1 |
| Set cover art | ✅ | 1 |
| Set harga unduhan | ✅ | 3 |
| Aktifkan/matikan tip | ✅ | 3 |
| Set mode stream (free/login_required/paid) | ✅ | 2 |
| Buat album/release | ✅ | 2 |
| Kelola multi-artist per track | ✅ | 2 |
| Hubungkan ke MusicBrainz | ✅ | 5 |
| Dashboard statistik (play, like, sale) | ✅ | 2 |
| Dashboard penjualan | ✅ | 3 |
| Lihat pembeli | ✅ | 3 |
| Atur ACL/izin di Pod | ✅ | 1 (default) / 5 (custom) |

### 3.3 Social Interaction

| Fitur | Login? | Gelombang |
|---|---|---|
| Follow artis/user | ✅ | 1 |
| Unfollow | ✅ | 1 |
| Like track | ✅ | 1 |
| Unlike | ✅ | 1 |
| Komentar pada track | ✅ | 1 |
| Hapus komentar sendiri | ✅ | 1 |
| Playlist (buat, edit, hapus) | ✅ | 1 |
| Playlist publik/privat | ✅ | 1 |
| Post/aktivitas musisi (teks, gambar, audio) | ✅ | 2 |
| Koleksi publik (kurasi user) | ✅ | 2 |
| Ulasan + rating (1–5 bintang) | ✅ | 2 |
| Mention user di komentar | ✅ | 3 |
| Notifikasi in-app | ✅ | 3 |
| Notifikasi email | ✅ | 2 (transaksi) / 3 (sosial) |
| Direct message | ✅ | 3 |
| Blokir user | ✅ | 2 |
| Laporkan konten | ✅ | 2 |

### 3.4 Monetization

| Fitur | Login? | Gelombang |
|---|---|---|
| Set harga unduhan per track | ✅ (musisi) | 3 |
| "Name your price" (termasuk gratis) | ✅ | 3 |
| Guest checkout (bayar via email) | ❌ | 3 |
| Login checkout | ✅ | 3 |
| Unduhan setelah bayar (via link email) | ❌ | 3 |
| Unduhan setelah bayar (via aplikasi) | ✅ | 3 |
| Stream unlock permanen (setelah beli + login) | ✅ | 3 |
| Tip ke musisi | ❌ / ✅ | 3 |
| Riwayat pembelian | ✅ | 3 |
| Gateway: Midtrans/Xendit | — | 3 |
| Gateway: Lightning Network | — | 6+ |
| Gateway: Stripe/PayPal | — | 6+ |
| Bundling (album + track) | ✅ | Jangka panjang |
| Kode unduhan / gift | ✅ | Jangka panjang |

### 3.5 Trust & Moderation

| Fitur | Login? | Gelombang |
|---|---|---|
| Laporkan track/user/komentar | ✅ | 2 |
| Admin hide track dari katalog | ✅ (admin) | 2 |
| Admin blokir user | ✅ (admin) | 2 |
| Verifikasi artis (badge) | — | 3 |
| Audit log admin action | ✅ (admin) | 2 |

### 3.6 Platform & Interoperability

| Fitur | Gelombang |
|---|---|
| Solid Pod integration | 1 |
| Metadata schema.org MusicRecording | 1 |
| API OpenAPI spec | 1 |
| Health & readiness endpoint | 1 |
| Structured logging | 1 |
| Uji portabilitas aplikasi klien kedua | 5 |
| ActivityStreams export (social) | Jangka panjang |
| Federasi katalog lintas instance | Jangka panjang |

---

# BAGIAN II — ARSITEKTUR

## 4. Tiga Pemisahan Inti

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  CONTENT OWNERSHIP       CONTENT DISCOVERY           │
│  ─────────────────       ─────────────────           │
│  Solid Pod               PostgreSQL                  │
│  - audio.mp3             - tracks (salinan)          │
│  - metadata.jsonld       - users, follows, likes     │
│  - cover.jpg             - playlists, comments       │
│  - ACL                   - purchases, posts          │
│                          - reviews, events           │
│                                                      │
│                          CONTENT DELIVERY            │
│                          ────────────────            │
│                          Browser / Client            │
│                          - <audio src> ke Pod        │
│                          - download via backend      │
│                            (hanya untuk berbayar)    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 4.1 Aturan Keras

1. Audio **tidak pernah** disimpan di server aplikasi.
2. Audio **tidak pernah** menjadi proxy melalui backend—kecuali untuk unduhan berbayar.
3. Metadata asli **selalu** di Pod.
4. Katalog **selalu** bisa direkonstruksi dari Pod.

### 4.2 Yang Berjalan di Mana

| Komponen | Lokasi | Fungsi |
|---|---|---|
| Backend API | VPS | Auth, katalog, sync, social, payment |
| Frontend | VPS (Caddy) | UI + player |
| PostgreSQL | VPS (internal) | Index & operational data |
| Solid Pod | Luar (user) | Audio & metadata asli |
| MusicBrainz | Luar | Reference metadata |
| Payment Gateway | Luar | Transaksi |

---

## 5. Solid Integration

### 5.1 Solid Pod — Apa yang Disimpan

```
/{username}.pod.example/
├── profile/
│   └── card.jsonld              ← WebID profile
├── music/
│   ├── {slug}/
│   │   ├── metadata.jsonld      ← kontrak utama
│   │   ├── audio.mp3            ← file audio
│   │   └── cover.jpg            ← opsional
│   └── {slug-2}/
│       └── ...
└── (opsional) social/
    └── (future: post, like export)
```

### 5.2 Standar Metadata

**Lapis 1 — Fondasi:** schema.org `MusicRecording` dalam JSON-LD
**Lapis 2 — Pengayaan:** MusicBrainz MBID, ISRC
**Lapis 3 — Operasional:** PostgreSQL columns (salinan untuk pencarian)

### 5.3 Kontrak `metadata.jsonld`

**Field wajib:**

| Field | Tipe | Contoh |
|---|---|---|
| `@context` | object | `{"@vocab": "https://schema.org/"}` |
| `@type` | string | `"MusicRecording"` |
| `@id` | URL | URL metadata itu sendiri |
| `name` | string | `"Kota yang Sama"` |
| `byArtist.@id` | WebID | WebID musisi |
| `byArtist.name` | string | Nama tampilan |
| `contentUrl` | URL | URL audio |
| `duration` | ISO 8601 | `"PT4M12S"` |

**Field opsional:**

| Field | Tipe | Keterangan |
|---|---|---|
| `genre` | string[] | Array genre |
| `description` | string | Deskripsi |
| `image` | URL | Cover art |
| `datePublished` | date | Tanggal rilis |
| `isrcCode` | string | ISRC code |
| `musicbrainzRecordingId` | UUID | MBID |
| `inAlbum` | object | MusicAlbum info |

### 5.4 Alur Solid-OIDC

```
1. User klik "Login dengan Solid"
2. Frontend buka redirect ke Pod issuer
3. User login di Pod, grant akses ke aplikasi
4. Pod redirect balik ke aplikasi dengan authorization code
5. Frontend exchange code → access token + ID token
6. Frontend kirim ID token ke POST /api/auth/solid/exchange
7. Backend fetch OIDC discovery + JWKS dari issuer
8. Backend verifikasi signature ID token
9. Backend extract WebID dari claim `webid` atau `sub`
10. Backend upsert user → issue JWT internal
11. JWT internal disimpan di httpOnly cookie
12. Semua request berikutnya pakai cookie
```

### 5.5 Kontrol Akses Solid

- **WAC** (Web Access Control) atau **ACP** (Access Control Policy), tergantung Pod server.
- Minggu 1: pakai default CSS (public read untuk file yang diupload).
- Gelombang 5: implementasi pengaturan ACL custom dari dashboard musisi.
- **Prinsip:** aplikasi tidak mengasumsikan akses yang tidak diberikan.

---

## 6. Data Model — Semua Tabel

### 6.1 `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | Internal |
| `webid` | TEXT UNIQUE | Eksternal |
| `display_name` | VARCHAR(200) | |
| `bio` | TEXT | |
| `avatar_url` | TEXT | |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

### 6.2 `tracks`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | |
| `owner_id` | UUID FK | |
| `owner_webid` | TEXT | Denormalized |
| `pod_resource_url` | TEXT UNIQUE | URL metadata |
| `audio_url` | TEXT | URL audio |
| `cover_url` | TEXT | |
| `title` | TEXT | |
| `artist_name` | TEXT | |
| `description` | TEXT | |
| `genre` | TEXT[] | |
| `duration_seconds` | INTEGER | |
| `musicbrainz_recording_id` | UUID | Opsional |
| `isrc_code` | VARCHAR(12) | Opsional |
| `stream_access` | ENUM | `free`, `login_required`, `paid` |
| `download_enabled` | BOOLEAN | |
| `download_price_cents` | INTEGER | 0 = gratis |
| `download_currency` | VARCHAR(3) | Default IDR |
| `tip_enabled` | BOOLEAN | |
| `visibility` | VARCHAR(20) | `public`, `private`, `unlisted` |
| `status` | ENUM | `available`, `unavailable`, `unknown`, `deleted`, `access_revoked`, `hidden_by_admin` |
| `last_verified_at` | TIMESTAMPTZ | |
| `source_updated_at` | TIMESTAMPTZ | |
| `synced_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | Soft delete |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

### 6.3 `follows`

`follower_id` (FK), `follower_webid`, `followed_webid`, `created_at`. PK: `(follower_id, followed_webid)`.

### 6.4 `likes`

`user_id` (FK), `user_webid`, `track_id` (FK), `created_at`. PK: `(user_id, track_id)`.

### 6.5 `comments`

`id`, `user_id` (FK), `user_webid`, `track_id` (FK), `content`, `created_at`.

### 6.6 `playlists`

`id`, `owner_id` (FK), `owner_webid`, `name`, `description`, `visibility`, `created_at`, `updated_at`.

### 6.7 `playlist_tracks`

`playlist_id` (FK), `track_id` (FK), `position`, `added_at`. PK: `(playlist_id, track_id)`.

### 6.8 `posts` (gelombang 2)

`id`, `author_id` (FK), `author_webid`, `content`, `media_url`, `track_id` (FK, optional), `created_at`, `updated_at`.

### 6.9 `collections` + `collection_tracks` (gelombang 2)

Sama strukturnya dengan `playlists` + `playlist_tracks`, tapi untuk kurasi publik.

### 6.10 `reviews` (gelombang 2)

`id`, `user_id` (FK), `user_webid`, `track_id` (FK), `rating` (1–5), `content`, `created_at`. UNIQUE: `(user_id, track_id)`.

### 6.11 `purchases` (gelombang 3)

| Kolom | Keterangan |
|---|---|
| `id` | UUID PK |
| `track_id` | FK nullable |
| `recipient_webid` | WebID penerima |
| `buyer_id` | FK users (nullable) |
| `buyer_webid` | (nullable) |
| `guest_email` | (nullable) |
| `type` | `download`, `stream_unlock`, `tip`, `bundle` |
| `unlocks_stream` | BOOLEAN |
| `stream_unlocked_at` | TIMESTAMPTZ |
| `amount_cents` | INTEGER |
| `currency` | VARCHAR(3) |
| `gateway` | `midtrans`, `xendit`, `lightning`, dst. |
| `gateway_ref` | TEXT |
| `status` | `pending`, `paid`, `failed`, `refunded` |
| `download_token` | JWT (nullable) |
| `token_expires_at` | TIMESTAMPTZ |
| `email_sent_at` | TIMESTAMPTZ |
| `paid_at` | TIMESTAMPTZ |
| `created_at` | TIMESTAMPTZ |

**Constraint:** `buyer_id IS NOT NULL OR guest_email IS NOT NULL`.

### 6.12 `reports` (moderasi)

`id`, `reporter_id` (FK), `target_type` (`track`/`comment`/`user`/`post`), `target_id`, `reason`, `status` (`open`/`resolved`/`dismissed`), `created_at`, `resolved_at`.

### 6.13 `events` (telemetry)

`id` (BIGSERIAL), `event_type` (`play`, `view`, `like`, `purchase`, dst.), `user_id` (nullable), `track_id` (nullable), `metadata` (JSONB), `created_at`.

**Catatan:** tidak pakai FK, agar historical record tidak hilang saat user/track dihapus.

### 6.14 `schema_migrations`

`version` (TEXT PK), `applied_at` (TIMESTAMPTZ). Untuk tracking migration.

---

## 7. Sinkronisasi & Penghapusan

### 7.1 Alur Utama

```
1. Musisi publish/edit/hapus via aplikasi → sync langsung → katalog update
2. Musisi ubah di luar aplikasi → deteksi via verifikasi on-demand
```

### 7.2 Deteksi Perubahan Eksternal

**Kapan:** saat playback gagal di browser.

```
1. User klik play
2. <audio> gagal load
3. Browser POST /api/tracks/:id/verify
4. Backend HEAD ke audio_url
5. Baca status code:

   200 OK        → status = 'available'
   404 Not Found → status = 'deleted' (hilang dari index)
   410 Gone      → status = 'deleted'
   403 Forbidden → status = 'access_revoked' (sembunyikan dari publik)
   5xx / timeout → status tidak berubah

6. Rate limit: max 1 HEAD per 5 menit per track
```

### 7.3 Yang Tidak Dilakukan

- ❌ Scheduled sweep periodik
- ❌ Lazy refresh saat view/search
- ❌ Hard delete otomatis
- ❌ Hitung "gagal berapa kali"

### 7.4 Batasan yang Diakui

Track yang tidak pernah diputar dan sudah dihapus dari Pod akan tetap muncul di katalog sampai ada yang mencoba memutarnya. Ini **eventually consistent** tanpa notifikasi Pod.

---

## 8. Model Stream Access

### 8.1 Tiga Mode (Musisi Pilih Per Track)

| Mode | Arti | Penegakan |
|---|---|---|
| `free` | Stream bebas | Tidak ada gate |
| `login_required` | Hanya user login | App-level gate, URL disembunyikan untuk anonim |
| `paid` | Hanya pembeli yang login | App-level gate + cek record `purchases` |

**Catatan jujur:** untuk `login_required` dan `paid`, ini **friksi, bukan proteksi**. File tetap publik di Pod. URL hanya diberikan ke user yang memenuhi syarat. Siapa pun yang tahu URL bisa stream. Ini **trade-off sadar** untuk mempertahankan direct playback tanpa proxy.

### 8.2 Matriks Akses

| Mode Stream | Anonim | Login (belum beli) | Login (sudah beli) | Guest (belum beli) |
|---|---|---|---|---|
| `free` | ✅ Stream | ✅ Stream | ✅ Stream | ✅ Stream |
| `login_required` | ❌ Login dulu | ✅ Stream | ✅ Stream | ❌ Login dulu |
| `paid` | ❌ Beli dulu | ❌ Beli dulu | ✅ Stream | ❌ Beli dulu |

### 8.3 Handler Logic

```
GET /api/tracks/{id}:

stream_allowed =
  track.stream_access == 'free' OR
  (user authenticated AND track.stream_access == 'login_required') OR
  (user authenticated AND has purchase unlocking stream)

return {
  ...,
  stream_access: track.stream_access,
  stream_allowed: stream_allowed,
  audio_url: stream_allowed ? track.audio_url : null
}
```

---

# BAGIAN III — FITUR DETAIL

## 9. Autentikasi & Sesi

### 9.1 Alur

Lihat §5.4.

### 9.2 Sesi

| Aspek | Detail |
|---|---|
| Token | JWT internal, ditandatangani HS256 |
| Penyimpanan | httpOnly cookie `sm_session` |
| TTL | 24 jam |
| SameSite | Lax |
| Secure | Ya (production) |
| Refresh | Manual via re-login |

### 9.3 Endpoint

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/auth/solid/exchange` | ❌ | Tukar ID token → JWT |
| GET | `/api/auth/me` | ✅ | Data user |
| POST | `/api/auth/logout` | ✅ | Hapus cookie |

---

## 10. Content Management

### 10.1 Alur Upload

```
1. Musisi isi form: MP3, judul, artis, genre, deskripsi, visibility
2. Frontend upload MP3 ke Pod: /music/{slug}/audio.mp3
3. Frontend tulis metadata.jsonld ke Pod: /music/{slug}/metadata.jsonld
4. Frontend POST /api/tracks/sync dengan URL metadata
5. Backend fetch metadata.jsonld dari Pod
6. Backend validasi (field wajib, tipe data, dll.)
7. Backend upsert ke tracks dengan pod_resource_url UNIQUE
8. Track muncul di katalog
```

**Catatan:** browser yang nulis ke Pod (bukan backend). Backend tidak mendelegasikan akses tulis.

### 10.2 Validasi Metadata

- `@type` harus `MusicRecording`
- `name`, `byArtist.@id`, `contentUrl`, `duration` wajib
- `contentUrl` harus URL valid
- `byArtist.@id` harus WebID milik pemilik Pod
- `duration` format ISO 8601
- Field opsional tidak valid → **diabaikan** (tidak menggagalkan sync)

### 10.3 Endpoint

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/tracks/sync` | ✅ | Sync dari Pod URL |
| POST | `/api/tracks` | ✅ | Publish via app |
| PATCH | `/api/tracks/{id}` | ✅ | Edit metadata |
| DELETE | `/api/tracks/{id}` | ✅ | Unpublish (soft) |

**Catatan:** `DELETE /api/tracks/{id}` hanya menghapus dari index katalog (soft delete). Tidak menghapus file di Pod. Musisi harus hapus file manual di Pod jika mau.

---

## 11. Catalog & Discovery

### 11.1 Endpoint

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| GET | `/api/tracks` | ❌ | List dengan pagination |
| GET | `/api/tracks/{id}` | ❌ / Optional | Detail + audio_url kondisional |
| GET | `/api/search?q=` | ❌ | Full-text search |
| GET | `/api/artists/{webid}` | ❌ | Profil artis |
| GET | `/api/artists/{webid}/tracks` | ❌ | Track milik artis |

### 11.2 Search

- **Backend:** PostgreSQL `tsvector` + GIN index
- **Fields:** title, artist_name, description, genre
- **Fuzzy:** `pg_trgm` untuk typo tolerance
- **Pagination:** `limit` + `offset`
- **Sort:** terbaru (default), populer, A-Z

### 11.3 Performance Target

| Metrik | Target |
|---|---|
| Search latency (10k track) | < 300 ms |
| Track list latency | < 100 ms |
| Track detail latency | < 100 ms |

---

## 12. Playback

### 12.1 Arsitektur

- **Audio publik:** `<audio src={audio_url}>` → fetch langsung dari Pod
- **Browser:** progressive playback via HTTP
- **Range Request:** didukung jika Pod mendukung (tidak diasumsikan)
- **CORS:** harus dikonfigurasi di Pod (syarat, bukan otomatis)

### 12.2 Penanganan Error

| Kondisi | Aksi UI | Trigger Backend |
|---|---|---|
| Pod tidak dapat dihubungi | "Sumber tidak tersedia" | — |
| 403 | "Akses dibatasi" | — |
| 404/410 | "Lagu tidak tersedia" | Verify on-demand |
| Format tidak didukung | "Format tidak kompatibel" | — |
| Buffering lambat | Spinner | — |

### 12.3 Blob Streaming (untuk Audiens Login)

Tidak diimplementasi di MVP. Untuk `stream_access = 'paid'` yang butuh auth di Pod (future):

```js
fetch(audioUrl, { headers: { Authorization: `Bearer ${token}` } })
  .then(r => r.blob())
  .then(blob => audio.src = URL.createObjectURL(blob))
```

**Trade-off:** full download sebelum play. Tidak progressive. Hanya dipakai jika diperlukan.

---

## 13. Fitur Sosial

### 13.1 Penyimpanan

- **Source of truth:** PostgreSQL (gelombang 1–2)
- **WebID di setiap tabel** — agar bisa diekspor nanti
- **Stub `GET /api/users/me/social-export`** (501) — janji arsitektural untuk portabilitas masa depan

### 13.2 Endpoint

| Method | Path | Auth | Gelombang |
|---|---|---|---|
| POST | `/api/users/{id}/follow` | ✅ | 1 |
| DELETE | `/api/users/{id}/follow` | ✅ | 1 |
| POST | `/api/tracks/{id}/likes` | ✅ | 1 |
| DELETE | `/api/tracks/{id}/likes` | ✅ | 1 |
| GET | `/api/tracks/{id}/comments` | ❌ | 1 |
| POST | `/api/tracks/{id}/comments` | ✅ | 1 |
| DELETE | `/api/comments/{id}` | ✅ | 1 |
| GET | `/api/playlists/{id}` | Kondisional | 1 |
| POST | `/api/playlists` | ✅ | 1 |
| PATCH | `/api/playlists/{id}` | ✅ | 1 |
| POST | `/api/playlists/{id}/tracks` | ✅ | 1 |
| DELETE | `/api/playlists/{id}/tracks/{trackId}` | ✅ | 1 |
| POST | `/api/posts` | ✅ | 2 |
| GET | `/api/feed` | ✅ | 2 |
| POST | `/api/collections` | ✅ | 2 |
| GET | `/api/collections/{id}` | ❌ | 2 |
| POST | `/api/tracks/{id}/reviews` | ✅ | 2 |
| GET | `/api/tracks/{id}/reviews` | ❌ | 2 |
| GET | `/api/users/me/social-export` | ✅ | stub |

### 13.3 Feed

- **Fan-out on read** — tidak ada fan-out on write.
- Ambil aktivitas dari `follows` + `posts` dari artis yang diikuti.
- Pagination wajib.

### 13.4 Batasan

Data sosial **belum portabel** di gelombang 1–2. Ini diakui. `social-export` stub menjadi janji arsitektural.

---

## 14. Monetisasi

### 14.1 Model

> **Stream bebas (dengan gate opsional). Pembayaran untuk unduhan + tip + stream unlock.**

### 14.2 Dua Jalur Pembelian

**A. Guest (tanpa login)**
- Isi email → bayar via gateway
- Webhook verifikasi → generate `download_token` (JWT, 30 hari)
- Kirim link unduhan via email
- **Tidak dapat stream unlock** (tidak ada akun)

**B. Login (WebID)**
- Login → bayar → verifikasi
- Catat `purchases` dengan `buyer_webid`
- Untuk track `paid` + `unlocks_stream`: akses stream permanen
- Download link juga tersedia via aplikasi
- Muncul di "Pembelian Saya"

### 14.3 Alur Pembayaran

```
1. Buyer klik "Beli" atau "Unduh" atau "Tip"
2. Form checkout → pilih guest/login
3. Backend buat order → PaymentAdapter.CreatePayment()
4. Adapter call gateway (Midtrans/Xendit)
5. Gateway return payment URL/QR
6. Buyer bayar
7. Gateway kirim webhook ke backend
8. Backend PaymentAdapter.VerifyWebhook()
9. Backend update purchases.status = 'paid'
10. Untuk download: generate download_token, kirim email
11. Untuk stream_unlock: set unlocks_stream = true
```

### 14.4 Endpoint

| Method | Path | Auth | Gelombang |
|---|---|---|---|
| POST | `/api/purchases/guest` | ❌ | 3 |
| POST | `/api/purchases` | ✅ | 3 |
| GET | `/api/purchases` | ✅ | 3 |
| GET | `/api/download/{purchaseId}?token=` | ❌ (token) | 3 |
| POST | `/api/payments/webhook/{gateway}` | ❌ (signature) | 3 |

### 14.5 Payment Adapter Pattern

```
type PaymentAdapter interface {
    CreatePayment(ctx, order) (PaymentResult, error)
    VerifyWebhook(r *http.Request) (PaymentEvent, error)
    Refund(ctx, purchaseID) error
}
```

Adapter yang direncanakan:

| Adapter | Prioritas | Fee |
|---|---|---|
| Midtrans | Gelombang 3 | ~2.9% + Rp2.000 (CC), 0.7% (QRIS) |
| Xendit | Gelombang 3 | Mirip Midtrans |
| Lightning Network | Gelombang 6+ | ~0% |
| Stripe | Gelombang 6+ | ~2.9% + $0.30 |
| PayPal | Gelombang 6+ | ~3.49% + $0.49 |

### 14.6 Keputusan Monetisasi

| Keputusan | Nilai |
|---|---|
| Harga | Musisi tentukan sendiri |
| Platform fee | 0% (MVP), bisa dipertimbangkan nanti |
| Distribusi uang | Langsung ke akun musisi di gateway |
| Tip | Nominal bebas, terpisah dari unduhan |
| Guest checkout | ✅ Diizinkan |
| Guest stream unlock | ❌ Tidak (butuh akun untuk identitas) |
| Unduhan sharing | Tidak dicegah (setelah download, tidak bisa ditarik) |

### 14.7 Batasan

- **Stream gratis tanpa batas** untuk `free` tracks. File publik di Pod.
- **Stream `paid` adalah friksi, bukan DRM.** URL bisa dishare oleh yang beli.
- **Unduhan berbayar** bisa dibagikan ulang oleh pembeli.
- **Backend proxy hanya untuk unduhan** (satu kali per pembelian), tidak untuk stream.

---

## 15. Moderasi

### 15.1 Alur Report

```
1. User klik "Laporkan" pada track/komentar/user
2. Isi alasan → POST /api/reports
3. Admin review di dashboard
4. Admin pilih: resolve (ambil tindakan) / dismiss (abaikan)
5. Tindakan: hide track, hapus komentar, blokir user
```

### 15.2 Batas Admin

Admin **tidak bisa** hapus file di Pod user. Bisa:
- `status = 'hidden_by_admin'` → sembunyikan dari katalog
- Hapus row di PostgreSQL (tapi file tetap ada di Pod)
- Blokir user dari aplikasi (tidak bisa login)

Ini batas desentralisasi yang **wajib diakui**.

### 15.3 Audit Log

Semua tindakan admin dicatat di `events` dengan `event_type = 'admin_action'` dan `metadata` berisi detail.

---

# BAGIAN IV — TEKNIS

## 16. API Surface Lengkap

### 16.1 Public (tanpa auth)

| Method | Path | Fungsi |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness (DB ping) |
| GET | `/api/tracks` | List |
| GET | `/api/tracks/{id}` | Detail |
| GET | `/api/search` | Search |
| GET | `/api/artists/{webid}` | Profil artis |
| GET | `/api/artists/{webid}/tracks` | Track milik artis |
| GET | `/api/tracks/{id}/comments` | Komentar |
| GET | `/api/tracks/{id}/reviews` | Ulasan |
| GET | `/api/collections/{id}` | Koleksi publik |
| POST | `/api/purchases/guest` | Guest checkout |
| GET | `/api/download/{purchaseId}?token=` | Unduhan |
| POST | `/api/payments/webhook/{gateway}` | Webhook |
| POST | `/api/auth/solid/exchange` | Tukar token |

### 16.2 Authenticated

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/tracks/sync` | Sync dari Pod |
| POST | `/api/tracks` | Publish via app |
| PATCH | `/api/tracks/{id}` | Edit |
| DELETE | `/api/tracks/{id}` | Unpublish |
| POST | `/api/tracks/{id}/verify` | Trigger verification |
| POST | `/api/users/{id}/follow` | Follow |
| DELETE | `/api/users/{id}/follow` | Unfollow |
| POST | `/api/tracks/{id}/likes` | Like |
| DELETE | `/api/tracks/{id}/likes` | Unlike |
| POST | `/api/tracks/{id}/comments` | Komentar |
| DELETE | `/api/comments/{id}` | Hapus komentar |
| POST | `/api/playlists` | Buat playlist |
| PATCH | `/api/playlists/{id}` | Edit |
| POST | `/api/playlists/{id}/tracks` | Tambah track |
| DELETE | `/api/playlists/{id}/tracks/{trackId}` | Hapus track |
| POST | `/api/posts` | Buat post |
| GET | `/api/feed` | Feed |
| POST | `/api/collections` | Buat koleksi |
| POST | `/api/tracks/{id}/reviews` | Ulasan |
| POST | `/api/purchases` | Checkout dengan login |
| GET | `/api/purchases` | Riwayat |
| POST | `/api/reports` | Lapor |
| GET | `/api/users/me/social-export` | Stub (501) |

### 16.3 Error Format

```json
{
  "error": "track_not_found",
  "message": "Track with this id does not exist"
}
```

Kode error konsisten di seluruh API.

---

## 17. Keamanan & Privasi

### 17.1 Authentication

- HTTPS wajib di production
- JWT httpOnly, SameSite=Lax, Secure=true
- JWT tidak pernah di URL atau log
- Verifikasi ID token Solid di backend (bukan frontend)
- Token TTL 24 jam, re-login manual

### 17.2 Authorization

- Izin aktual ada di Pod (WAC/ACP)
- PostgreSQL bukan sumber otorisasi
- Jangan andalkan URL yang sulit ditebak
- Metadata privat tidak masuk index publik
- Endpoint sync dibatasi ke pemilik resource

### 17.3 Input Validation

- Metadata dari Pod adalah **input eksternal tidak tepercaya**
- Validasi: struktur JSON-LD, field wajib, tipe data, panjang, format URL
- File upload: cek ukuran, MIME type, isi file (bukan hanya ekstensi)
- Sanitasi nama file sebelum jadi path

### 17.4 Data Privacy

- Metadata publik vs privat dibedakan jelas
- Metadata privat tidak diindeks
- Jangan bocorkan keberadaan resource privat via search

### 17.5 Rate Limiting

| Endpoint | Limit |
|---|---|
| Auth exchange | 10/menit per IP |
| Verify | 1 per track per 5 menit |
| MusicBrainz API | 1/detik (rate limit MusicBrainz) |
| General API | 60/menit per IP |

### 17.6 CORS

- Dev: `http://localhost:5173`
- Prod: `https://{DOMAIN}`
- Pod CORS: di luar kontrol aplikasi (syarat)

---

## 18. Deployment

### 18.1 Dev

- `docker compose up` (compose.yaml)
- 4 container: postgres, css, backend (hot reload), frontend (Vite)
- Port terbuka semua untuk debugging

### 18.2 Production

- `docker compose -f docker-compose.prod.yml up -d`
- 3 container: postgres (internal), backend (internal), frontend (Caddy + static)
- Port terbuka: 80, 443
- HTTPS otomatis via Caddy Let's Encrypt
- Backup Postgres harian (cron container)

### 18.3 Topologi

```
Internet
   ↓
Caddy (80/443, HTTPS auto)
   ├── /api/*  → backend:8080
   ├── /health → backend:8080
   ├── /ready  → backend:8080
   └── /*      → /srv (static frontend)

Backend ──→ PostgreSQL (internal)
Backend ──→ Solid Pods (external)
Frontend ──→ Solid Pods (external, untuk audio)
```

### 18.4 Versi (Locked)

| Komponen | Versi |
|---|---|
| Go | 1.26 |
| PostgreSQL | 18.6 |
| Community Solid Server | 7.3.0 |
| Caddy | 2.11.8 |
| Node.js (frontend) | 26.13.0 LTS |
| React | 19.3.1 |

### 18.5 Environment

`.env` (dev) dan `.env.prod` (production), tidak di-commit. Berisi:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `DATABASE_URL`
- `JWT_SECRET`, `JWT_TTL`
- `DOMAIN`, `SOLID_OIDC_ISSUER`
- `CORS_ORIGINS`

### 18.6 Backup

- `pg_dump` harian, retention 30 hari
- Backup disimpan di luar container
- Dikonfigurasi sejak production pertama

---

## 19. Testing & Evaluasi

### 19.1 Functional Testing

| Test | Expected |
|---|---|
| Login Solid | WebID dikenali, user dibuat |
| Upload MP3 | File di Pod |
| Publish | Metadata di Pod + index |
| Sync | Track muncul di katalog |
| Search | Hasil relevan |
| Playback publik | Audio jalan |
| Playback `login_required` (anonim) | URL disembunyikan |
| Playback `paid` (belum beli) | URL disembunyikan |
| Follow, like, komentar | Tersimpan |
| Playlist | Tersimpan, urut |
| Guest checkout | Link email dikirim |
| Login checkout | Stream unlock + download |
| Verify 404 | Track hilang dari index |

### 19.2 Integration Testing

| Skenario | Verifikasi |
|---|---|
| Client → Pod | Auth + CORS + Range |
| Backend → Pod | Fetch metadata |
| Sync idempotent | Jalankan 10x, tidak duplikat |
| Gateway webhook | Signature valid, status update |
| Player → Pod | Direct fetch, bukan backend |

### 19.3 Performance Testing

| Metrik | Target |
|---|---|
| Search (10k track) | < 300 ms |
| Playback startup (10 Mbps) | < 3 detik |
| Sync latency (via app) | < 5 detik |
| Playback success (Pod online) | > 90% |
| DB query latency (p95) | < 50 ms |

### 19.4 Portability Test (Bukti Konsep)

**Skenario:**
1. User upload via aplikasi A → Pod
2. Aplikasi B (CLI sederhana) baca metadata JSON-LD dari Pod
3. Aplikasi B putar audio dari Pod
4. Aplikasi B tampilkan informasi track tanpa data dari A

**Hasil yang diharapkan:** aplikasi B berhasil, membuktikan bahwa musik tidak bergantung pada aplikasi A.

### 19.5 Reliability Testing

- Pod mati → track lain tetap bisa diputar
- Token expired → redirect login, tidak crash
- Sync gagal → retry, tidak duplikat
- Playback gagal → trigger verify, status benar
- MusicBrainz down → publication tetap jalan

### 19.6 Load Testing

- 100 concurrent users streaming
- 1000 search request/menit
- 100 sync request/menit

---

## 20. Decision Log

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Web + PWA dulu, mobile native nanti | Solid-OIDC di mobile belum matang |
| 2 | Backend Go, JWT internal | Binary tunggal, ringan di VPS |
| 3 | Deploy VPS + Docker + Caddy | Kontrol penuh, HTTPS otomatis |
| 4 | schema.org MusicRecording JSON-LD | Standar web terbuka, kompatibel Solid |
| 5 | MusicBrainz sebagai referensi opsional | Tidak wajib, pengayaan metadata |
| 6 | Audio publik untuk semua track | Streaming gratis, tanpa login |
| 7 | Direct playback dari Pod | Backend bukan proxy audio |
| 8 | Verifikasi on-demand, bukan crawling | Hanya saat playback gagal |
| 9 | 404/410 → hapus dari index, 403 → hide | Bedakan hilang vs izin dicabut |
| 10 | Tidak ada hard delete otomatis | Row di DB tetap untuk audit |
| 11 | Data sosial di PostgreSQL (gelombang 1–2) | Portabilitas diakui sebagai batasan |
| 12 | WebID di setiap tabel sosial | Reversibilitas ke Pod nanti |
| 13 | Stub `social-export` (501) | Janji arsitektural untuk portabilitas |
| 14 | Monetisasi: jual unduhan + tip | Bukan royalti, bukan paywall stream |
| 15 | Multi-gateway dengan adapter pattern | Mudah tambah gateway |
| 16 | Midtrans/Xendit dulu, Lightning nanti | Praktis dulu, diferensiasi nanti |
| 17 | Semua tabel dibuat di migration pertama | Fitur nanti tinggal isi |
| 18 | Endpoint stub return 501 | Kontrak API stabil sejak awal |
| 19 | Layer handler/service/repository | Fitur baru tinggal tambah file |
| 20 | Tidak ada Redis/CDN di MVP | Belum perlu, tambah kalau terukur |
| 21 | Tidak ada search engine terpisah | PostgreSQL FTS cukup |
| 22 | Admin tidak bisa hapus file di Pod | Batas desentralisasi |
| 23 | Tidak ada pembatasan stream nyata | Friksi semu, bukan keamanan |
| 24 | Stream access modes: `free` / `login_required` / `paid` | Fleksibilitas tanpa proxy |
| 25 | Guest checkout untuk unduhan | Bandcamp-style, tanpa paksa login |
| 26 | Guest tidak dapat stream unlock | Butuh identitas untuk track |
| 27 | `paid` track: guest bayar → file saja | Asimetri disengaja, transparan di UI |
| 28 | Frontend pakai Tailwind + Radix UI | Desain unik, aksesibel |
| 29 | Satu compose dev, satu compose prod | Deploy jelas, dev cepat |

---

## 21. Batasan yang Diakui (Wajib Masuk Laporan)

1. **Katalog eventually consistent.** Track yang dihapus dari Pod tapi tidak pernah diputar akan tetap muncul sampai ada yang mencoba memutarnya.
2. **Desentralisasi penyimpanan ≠ desentralisasi discovery.** Katalog tetap satu titik kontrol.
3. **Kontrol akses ≠ kontrol salinan.** File yang sudah diunduh tidak bisa ditarik.
4. **Data sosial belum portabel.** Follow, like, komentar hidup di PostgreSQL (dengan WebID, siap diekspor).
5. **Portabilitas konten ≠ portabilitas audiens.** Musisi bisa pindah file, tapi followers tidak otomatis ikut.
6. **Stream access gating adalah friksi, bukan DRM.** URL audio bisa dishare oleh user yang memenuhi syarat.
7. **Stream gratis tanpa batas untuk `free` tracks.** Tidak bisa dibatasi tanpa proxy.
8. **Guest tidak dapat stream unlock.** Hanya file download.
9. **CORS di Pod di luar kontrol aplikasi.** Syarat yang harus didokumentasikan.
10. **Admin tidak bisa hapus file di Pod user.** Batas desentralisasi.

---

## 22. Roadmap 6 Minggu

| Minggu | Fokus | Demo |
|---|---|---|
| **1** | Core chain: auth, upload, sync, play, deploy | "Audio dari Pod!" |
| **2** | Search, sosial dasar, profil, stream gating | "Follow, like, komentar" |
| **3** | Monetisasi fondasi: harga, guest checkout, unduhan | "Beli, dapat file" |
| **4** | Login checkout, stream unlock, tip, riwayat | "Beli dengan login" |
| **5** | MusicBrainz, verifikasi 404/410, moderasi, admin | "Metadata kaya, katalog bersih" |
| **6** | Portability test, load testing, docs, final deploy | "Bukti portabilitas" |

---

## 23. Definisi "Selesai" Proyek

Proyek dinyatakan **selesai** jika:

- [ ] Semua fitur gelombang 1–5 terimplementasi
- [ ] Deployment production jalan di VPS dengan HTTPS
- [ ] Uji portabilitas berhasil (aplikasi klien kedua baca Pod)
- [ ] Semua batasan di §21 didokumentasikan di laporan
- [ ] OpenAPI spec lengkap
- [ ] Decision log lengkap
- [ ] Load test dengan 100 concurrent users berhasil
- [ ] Backup berjalan
- [ ] Monitoring dasar (health + log)
- [ ] README dengan instruksi deploy dari nol

---
