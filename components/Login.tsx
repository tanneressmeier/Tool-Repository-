import React, { useState } from 'react';
import { ToolIcon } from './icons/ToolIcon';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
            <ToolIcon className="w-16 h-16 text-cyan-400 mx-auto" />
            <h1 className="text-3xl font-extrabold text-white mt-4">
                Tool Inventory System
            </h1>
            <p className="mt-2 text-gray-400">
                Please log in to continue
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              placeholder="e.g., john.doe"
            />
             <p className="text-xs text-gray-500 mt-2">Enter any name to create or access a user-specific inventory workspace.</p>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={!username.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              Login / Access Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
