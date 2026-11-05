import React, { useState } from 'react';
import Navbar from './components/Navbar';
import UploadForm from './components/UploadForm';
import AudioPlayer from './components/AudioPlayer';

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const playTestSong = () => {
    setCurrentTrack({
      title: "Uji Coba Streaming Pod",
      artistName: "Musisi Lokal",
      // Menggunakan URL MP3 publik HTTPS yang stabil
      audio_url: "https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3" 
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-32 font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-16">
          <UploadForm />
        </section>

        {/* Hapus bagian dummy button jika dirasa mengganggu, atau biarkan dengan style ini */}
        <section className="text-center mt-20 max-w-md mx-auto border-t border-slate-800 pt-12">
          <h3 className="text-lg font-medium text-slate-300 mb-6">Pengetesan Pemutar Audio</h3>
          <button onClick={playTestSong} className="px-6 py-3 bg-slate-800 text-cyan-400 border border-slate-700 rounded-full hover:bg-slate-700 hover:border-cyan-500 transition-all shadow-lg">
            Putar Lagu Dummy
          </button>
        </section>
      </main>

      <AudioPlayer track={currentTrack} />
    </div>
  );
}

export default App;