import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function AudioPlayer({ track }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Auto-play dicegah browser", e));
      setIsPlaying(true);
    }
  }, [track]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!track) return null; // Sembunyikan player jika belum ada lagu yang dipilih

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 border-t border-gray-700 z-50">
      <audio 
        ref={audioRef} 
        src={track.audio_url} 
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} className="p-2 bg-blue-500 rounded-full hover:bg-blue-600">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div>
            <h4 className="text-sm font-bold">{track.title}</h4>
            <p className="text-xs text-gray-400">{track.artistName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 size={20} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}