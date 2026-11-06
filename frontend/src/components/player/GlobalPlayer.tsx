import { usePlayer } from '../../contexts/PlayerContext';

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function GlobalPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    toggle,
    seek,
    setVolume,
    close,
  } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-950 border-t border-zinc-800 flex items-center gap-4 px-4 z-50">
      {/* Play/Pause */}
      <button
        onClick={toggle}
        className="w-10 h-10 border border-zinc-700 hover:border-accent hover:text-accent text-zinc-200 font-mono text-sm flex items-center justify-center transition-colors shrink-0"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '||' : '>'}
      </button>

      {/* Track info */}
      <div className="w-48 min-w-0 shrink-0">
        <div className="text-xs font-bold text-zinc-100 truncate">
          {currentTrack.title}
        </div>
        <div className="text-[10px] font-mono text-zinc-500 truncate">
          {currentTrack.artist_name}
        </div>
      </div>

      {/* Progress */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-[10px] font-mono text-zinc-500 w-10 text-right">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="flex-1 h-1 appearance-none bg-zinc-800 accent-accent cursor-pointer"
        />
        <span className="text-[10px] font-mono text-zinc-500 w-10">
          {formatTime(duration)}
        </span>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-mono text-zinc-500">VOL</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-20 h-1 appearance-none bg-zinc-800 accent-accent cursor-pointer"
        />
      </div>

      {/* Close */}
      <button
        onClick={close}
        className="text-zinc-500 hover:text-accent font-mono text-xs w-6 h-10 flex items-center justify-center transition-colors shrink-0"
        title="Close"
      >
        X
      </button>
    </div>
  );
}
