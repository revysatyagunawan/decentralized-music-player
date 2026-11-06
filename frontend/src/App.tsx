import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { LoginButton } from './components/LoginButton';
import { UploadForm } from './components/UploadForm';
import { Catalog } from './components/Catalog';
import { GlobalPlayer } from './components/player/GlobalPlayer';

function Shell() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center font-mono text-zinc-400 text-sm">
        INITIALIZING...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-50 font-sans select-none">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-bold tracking-widest text-lg">
            SOLID<span className="text-accent">.</span>MUSIC
          </h1>
          <span className="text-[10px] font-mono text-zinc-400 border border-zinc-800 px-2 py-0.5">
            v0.1.0
          </span>
        </div>
        <LoginButton />
      </header>

      {/* Main: 3 columns */}
      <main className="flex-1 flex overflow-hidden pb-20">
        {/* Left: Now Playing / Manifesto */}
        <aside className="w-[280px] border-r border-zinc-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-500 mb-2 tracking-widest">
              NOW PLAYING
            </div>
            <div className="w-full aspect-square bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700 font-mono text-xs">
              [ NO COVER ]
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-[11px] text-zinc-500 overflow-y-auto whitespace-pre-wrap leading-relaxed">
{`// MANIFESTO

If you own your music,
you don't need capitalists
to let your friends hear it.

// PRINCIPLES

· Your Pod, your rules
· No central authority
· No paywall for listening
· Files you can take anywhere

// SOURCE

Solid Protocol
schema.org/MusicRecording
DPoP + Solid-OIDC`}
          </div>
        </aside>

        {/* Center: Catalog */}
        <section className="flex-1 flex flex-col min-w-0">
          <div className="h-8 border-b border-zinc-800 flex items-center px-4 text-[10px] font-mono text-zinc-500 tracking-widest">
            LIBRARY / TRACKS
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Catalog />
          </div>
        </section>

        {/* Right: Upload / Actions */}
        <aside className="w-[320px] border-l border-zinc-800 flex flex-col shrink-0">
          <div className="h-8 border-b border-zinc-800 flex items-center px-4 text-[10px] font-mono text-zinc-500 tracking-widest">
            PUBLISH
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <UploadForm />
          </div>
        </aside>
      </main>

      <GlobalPlayer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Shell />
      </PlayerProvider>
    </AuthProvider>
  );
}
