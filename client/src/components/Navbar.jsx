import React from 'react';
import LoginButton from './LoginButton'; // Asumsi LoginButton sudah ada dari B1.1

export default function Navbar() {
  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold text-blue-600">DecentralizedMusic</h1>
          </div>
          <div>
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  );
}