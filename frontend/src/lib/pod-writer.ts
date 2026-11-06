import {
  createContainerAt,
  overwriteFile,
  getSolidDatasetWithAcl,
  getResourceAcl,
  createAcl,
  createAclFromFallbackAcl,
  setPublicResourceAccess,
  setPublicDefaultAccess,
  saveAclFor,
} from '@inrupt/solid-client';

export interface TrackMetadata {
  title: string;
  artist: string;
  genre?: string;
  durationSeconds: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

/**
 * Derive pod root from WebID.
 * https://host.docker.internal/alice/profile/card#me → https://host.docker.internal/alice/
 */
export function getPodRoot(webId: string): string {
  return webId.replace('/profile/card#me', '/');
}

/**
 * Ensure a container exists. Idempotent.
 */
async function ensureContainer(url: string, fetch: typeof globalThis.fetch): Promise<void> {
  try {
    await createContainerAt(url, { fetch });
  } catch (e: any) {
    // 409 = already exists, ok
    if (!String(e.message || e).includes('409')) throw e;
  }
}

/**
 * Make a resource publicly readable.
 * Tries ACL API first, falls back to direct .acl turtle upload.
 */
async function makePublicRead(resourceUrl: string, fetch: typeof globalThis.fetch): Promise<void> {
  // Approach 1: Inrupt ACL API
  try {
    const withAcl = await getSolidDatasetWithAcl(resourceUrl, { fetch });
    let acl = getResourceAcl(withAcl);

    if (!acl) {
      try {
        acl = createAclFromFallbackAcl(withAcl);
      } catch {
        acl = createAcl(new URL(resourceUrl));
      }
    }

    acl = setPublicResourceAccess(acl, { read: true });
    acl = setPublicDefaultAccess(acl, { read: true });
    await saveAclFor(withAcl, acl, { fetch });
    return;
  } catch (err) {
    console.warn('ACL API failed, trying direct .acl upload:', err);
  }

  // Approach 2: Direct turtle upload (fallback)
  const turtle = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

<#public>
    a acl:Authorization;
    acl:agentClass foaf:Agent;
    acl:accessTo <./>;
    acl:default <./>;
    acl:mode acl:Read.
`;

  await overwriteFile(
    `${resourceUrl}.acl`,
    new Blob([turtle], { type: 'text/turtle' }),
    { contentType: 'text/turtle', fetch },
  );
}

/**
 * Upload a track (audio + metadata) to Pod, then make it public.
 * Returns the metadata URL to pass to backend /sync.
 */
export async function uploadTrack(
  file: File,
  meta: TrackMetadata,
  webId: string,
  fetch: typeof globalThis.fetch,
): Promise<string> {
  const podRoot = getPodRoot(webId);
  const slug = slugify(meta.title);
  const containerUrl = `${podRoot}public/music/${slug}/`;

  // 1. Create container
  await ensureContainer(`${podRoot}public/`, fetch).catch(() => {});
  await ensureContainer(`${podRoot}public/music/`, fetch).catch(() => {});
  await ensureContainer(containerUrl, fetch);

  // 2. Upload audio
  const audioUrl = `${containerUrl}audio.mp3`;
  await overwriteFile(audioUrl, file, {
    contentType: 'audio/mpeg',
    fetch,
  });

  // 3. Build and upload metadata JSON-LD
  const metadataUrl = `${containerUrl}metadata.jsonld`;
  const duration = `PT${Math.floor(meta.durationSeconds / 60)}M${meta.durationSeconds % 60}S`;
  const metadata = {
    '@context': { '@vocab': 'https://schema.org/' },
    '@type': 'MusicRecording',
    '@id': metadataUrl,
    name: meta.title,
    byArtist: {
      '@id': webId,
      '@type': 'Person',
      name: meta.artist,
    },
    contentUrl: audioUrl,
    duration,
    ...(meta.genre && { genre: [meta.genre] }),
  };

  await overwriteFile(
    metadataUrl,
    new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/ld+json' }),
    { contentType: 'application/ld+json', fetch },
  );

  // 4. Set ACL public read on the container (cascades to files)
  await makePublicRead(containerUrl, fetch);

  return metadataUrl;
}

/**
 * Read audio duration from file (client-side).
 */
export async function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src);
      resolve(Math.round(audio.duration) || 0);
    };
    audio.onerror = () => resolve(0);
  });
}
