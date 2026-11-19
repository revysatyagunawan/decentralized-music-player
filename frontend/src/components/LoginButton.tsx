import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginButton() {
  const { user, loginWithIssuer, logoutUser } = useAuth();
  const [issuer, setIssuer] = useState('https://solidcommunity.net');

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span
          className="text-[11px] font-mono text-zinc-400 truncate max-w-[200px]"
          title={user.webid}
        >
          {user.display_name}
        </span>
        <button
          onClick={logoutUser}
          className="text-[11px] font-mono text-zinc-400 hover:text-accent border border-zinc-800 hover:border-accent px-2 py-1 transition-colors"
        >
          LOGOUT
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={issuer}
        onChange={(e) => setIssuer(e.target.value)}
        placeholder="issuer url"
        className="bg-transparent border border-zinc-800 text-[11px] font-mono px-2 py-1 w-56 outline-none focus:border-zinc-400 text-zinc-300 placeholder:text-zinc-700"
      />
      <button
        onClick={() => loginWithIssuer(issuer)}
        className="text-[11px] font-mono bg-zinc-50 text-zinc-950 hover:bg-accent hover:text-white px-3 py-1 transition-colors font-bold"
      >
        LOGIN
      </button>
    </div>
  );
}
