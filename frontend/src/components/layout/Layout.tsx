import { useState, FormEvent } from 'react';
import { Link, Outlet, useNavigate, useSearchParams, useLocation, NavLink } from 'react-router-dom';
import { LoginButton } from '../LoginButton';
import { GlobalPlayer } from '../player/GlobalPlayer';

const MENU_ITEMS = [
  { to: '/', label: 'LIBRARY', end: true },
  { to: '/dashboard', label: 'DASHBOARD', end: false },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) navigate(`/?q=${encodeURIComponent(trimmed)}`);
    else navigate('/');
  }

  function clearSearch() {
    setInputValue('');
    navigate('/');
  }

  const showSearch = location.pathname === '/';
  const activeQuery = searchParams.get('q') || '';
  const showClear = showSearch && (activeQuery || inputValue);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-50 font-sans select-none">
      {/* Header with navbar */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0 gap-6">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-bold tracking-widest text-lg hover:text-accent transition-colors shrink-0"
          >
            SOLID<span className="text-accent">.</span>MUSIC
          </Link>

          <nav className="flex items-center gap-2">
            {MENU_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-[10px] font-mono font-bold tracking-widest px-3 py-1.5 border transition-colors ${
                    isActive
                      ? 'bg-accent text-white border-accent'
                      : 'bg-zinc-50 text-zinc-950 border-zinc-50 hover:bg-accent hover:text-white hover:border-accent'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {showSearch && (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="SEARCH..."
                className="bg-transparent border border-zinc-800 text-xs font-mono px-3 py-1.5 w-48 outline-none focus:border-zinc-400 text-zinc-200 placeholder:text-zinc-700"
              />
              <button
                type="submit"
                className="text-[10px] font-mono bg-zinc-50 text-zinc-950 hover:bg-accent hover:text-white px-3 py-1.5 transition-colors font-bold tracking-widest"
              >
                FIND
              </button>
              {showClear && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-[10px] font-mono text-zinc-500 hover:text-accent px-2 py-1 transition-colors"
                >
                  X
                </button>
              )}
            </form>
          )}
          <LoginButton />
        </div>
      </header>

      {/* Main: 2 columns (sidebar + content) */}
      <main className="flex-1 flex overflow-hidden pb-20">
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
· Files you can take anywhere`}
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-w-0">
          <Outlet />
        </section>
      </main>

      <GlobalPlayer />
    </div>
  );
}
