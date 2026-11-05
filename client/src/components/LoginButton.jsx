import React, { useState } from 'react';
import { useSolidAuth } from '../contexts/SolidAuthContext';

export default function LoginButton() {
  const { webId, isAuthProcessing, loginWithSolid, logoutSolid } = useSolidAuth();
  const [issuer, setIssuer] = useState('https://solidcommunity.net');

  if (isAuthProcessing) return <p className="text-sm text-slate-400 animate-pulse">Memverifikasi Pod...</p>;

  if (webId) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-cyan-400 truncate max-w-[150px] sm:max-w-xs" title={webId}>
          {webId.split('/')[2]} {/* Menampilkan domain pod saja agar rapi */}
        </p>
        <button 
          onClick={logoutSolid}
          className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-all border border-slate-700"
        >
          Keluar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input 
        type="url" 
        value={issuer} 
        onChange={(e) => setIssuer(e.target.value)}
        className="hidden sm:block px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-500"
        placeholder="Pod Provider URL"
      />
      <button 
        onClick={() => loginWithSolid(issuer)}
        className="px-5 py-2 text-sm font-medium text-slate-900 bg-cyan-400 rounded-full hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
      >
        Masuk
      </button>
    </div>
  );
}