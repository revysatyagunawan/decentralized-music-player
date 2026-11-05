import React, { useState } from 'react';
import Navbar from './components/Navbar';
import UploadForm from './components/UploadForm';
import AudioPlayer from './components/AudioPlayer';

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);

  // Fungsi simulasi untuk menguji Audio Player sebelum terhubung ke Database
  const playTestSong = () => {
    setCurrentTrack({
      title: "Uji Coba Streaming Pod",
      artistName: "Musisi Lokal",
      // Contoh URL MP3 publik yang valid untuk testing (ganti dengan URL Pod Anda nanti)
      audio_url: "https://www.soundhelix.com/architecture/mp3-player/SoundHelix-Song-1.mp3" 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <UploadForm />
        </section>

        <section className="text-center mt-12">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Uji Coba Pemutar Audio</h3>
          <button onClick={playTestSong} className="px-6 py-2 bg-gray-800 text-white rounded shadow hover:bg-gray-700">
            Putar Lagu Dummy
          </button>
        </section>
      </main>

      <AudioPlayer track={currentTrack} />
    </div>
  );
}

export default App;