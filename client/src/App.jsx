import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('piggy-token'));
  const [username, setUsername] = useState(() => localStorage.getItem('piggy-user') || '');

  function handleLogin(tok, user) {
    localStorage.setItem('piggy-token', tok);
    localStorage.setItem('piggy-user', user);
    setToken(tok);
    setUsername(user);
  }

  function handleLogout() {
    localStorage.removeItem('piggy-token');
    localStorage.removeItem('piggy-user');
    setToken(null);
    setUsername('');
  }

  return token
    ? <Dashboard token={token} username={username} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}
