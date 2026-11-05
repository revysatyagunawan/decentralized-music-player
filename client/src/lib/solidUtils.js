import { overwriteFile } from '@inrupt/solid-client';

/**
 * Mendapatkan Root URL Pod dari WebID.
 * (Asumsi format WebID standar: https://pod.example.com/profile/card#me)
 */
export const getPodRoot = (webId) => {
  if (!webId) return null;
  return webId.replace('/profile/card#me', '/');
};

/**
 * Mengunggah file Audio dan Metadata JSON-LD langsung ke Solid Pod musisi.
 * 
 * @param {File} audioFile - Berkas fisik MP3/WAV
 * @param {Object} metadataForm - Objek berisi { title, artistName, genre, duration }
 * @param {Object} session - Objek sesi dari useSolidAuth() (mengandung session.fetch)
 * @returns {Promise<string>} - Mengembalikan URL dari metadata.jsonld yang terbentuk
 */
export const uploadTrackToPod = async (audioFile, metadataForm, session) => {
  if (!session.info.isLoggedIn) throw new Error("Belum login ke Pod");

  const webId = session.info.webId;
  const podRoot = getPodRoot(webId);
  
  // Membuat slug URL-safe dari judul lagu (misal: "Kota yang Sama" -> "kota-yang-sama")
  const slug = metadataForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Konstruksi URL sesuai spesifikasi arsitektur
  const containerUrl = `${podRoot}music/${slug}/`;
  const audioUrl = `${containerUrl}audio.mp3`;
  const metadataUrl = `${containerUrl}metadata.jsonld`;

  try {
    // 1. Mengunggah File Audio (MP3) ke Pod
    console.log("Mengunggah audio ke:", audioUrl);
    await overwriteFile(
      audioUrl,
      audioFile,
      { contentType: audioFile.type || 'audio/mpeg', fetch: session.fetch }
    );

    // 2. Merakit kontrak metadata JSON-LD (Sesuai Spesifikasi Inti)
    const jsonldMetadata = {
      "@context": { "@vocab": "https://schema.org/" },
      "@type": "MusicRecording",
      "@id": metadataUrl,
      "name": metadataForm.title,
      "byArtist": {
        "@id": webId,
        "name": metadataForm.artistName
      },
      "contentUrl": audioUrl,
      "duration": metadataForm.duration || "PT0M0S",
      "genre": metadataForm.genre ? [metadataForm.genre] : []
    };

    // 3. Mengunggah Metadata ke Pod
    const metadataBlob = new Blob([JSON.stringify(jsonldMetadata, null, 2)], {
      type: 'application/ld+json'
    });

    console.log("Mengunggah metadata ke:", metadataUrl);
    await overwriteFile(
      metadataUrl,
      metadataBlob,
      { contentType: 'application/ld+json', fetch: session.fetch }
    );

    console.log("Unggahan Pod berhasil!");
    return metadataUrl; // Return ini krusial untuk diteruskan ke API Backend di Ticket B1.4

  } catch (error) {
    console.error("Gagal mengunggah ke Pod:", error);
    throw new Error("Gagal menyimpan ke Solid Pod. Periksa izin WAC/ACL atau koneksi internet.");
  }
};