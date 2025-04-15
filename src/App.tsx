import React from 'react';
import ChessBoard from './components/ChessBoard';

const App: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">Chess Web Application</h1>
      </header>
      <main className="flex flex-col items-center">
        <ChessBoard width={480} />
      </main>
    </div>
  );
};

export default App;
