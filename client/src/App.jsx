import React from 'react';
import LoginButton from './components/LoginButton';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow rounded-lg p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Decentralized Music Player
        </h1>
        <LoginButton />
      </div>
    </div>
  );
}

export default App;