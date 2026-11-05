import React, { useState } from 'react';
import { useSolidAuth } from '../contexts/SolidAuthContext';

export default function LoginButton() {
  const { webId, isAuthProcessing, loginWithSolid, logoutSolid } = useSolidAuth();
  const [issuer, setIssuer] = useState('https://solidcommunity.net'); // Provider default

  if (isAuthProcessing) return <p className="text-sm text-gray-500">Memverifikasi Pod...</p>;

  if (webId) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-green-600 truncate max-w-xs">
          Terhubung: {webId}
        </p>
        <button 
          onClick={logoutSolid}
          className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
        >
          Keluar
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input 
        type="url" 
        value={issuer} 
        onChange={(e) => setIssuer(e.target.value)}
        className="px-3 py-2 border rounded shadow-sm text-sm"
        placeholder="https://solidcommunity.net"
      />
      <button 
        onClick={() => loginWithSolid(issuer)}
        className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        Masuk dengan WebID
      </button>
    </div>
  );
}