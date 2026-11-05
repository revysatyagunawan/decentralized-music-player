import React from 'react';
import LoginButton from './LoginButton';

export default function Navbar() {
  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Decentralized<span className="text-cyan-400">Music</span></h1>
          </div>
          <div>
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  );
}