import React, { useState, useEffect } from 'react';
import TotalTile from '../components/TotalTile';
import AccountTile from '../components/AccountTile';
import TransactionPanel from '../components/TransactionPanel';

export default function Dashboard({ token, username, onLogout }) {
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [themeIcon, setThemeIcon] = useState(getIcon);

  function getIcon() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  }

  useEffect(() => {
    fetch('/api/accounts', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => onLogout());
  }, [token]);

  useEffect(() => {
    const handler = () => setThemeIcon(getIcon());
    window.addEventListener('piggy-theme-change', handler);
    return () => window.removeEventListener('piggy-theme-change', handler);
  }, []);

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('piggy-theme', next);
    window.dispatchEvent(new Event('piggy-theme-change'));
  }

  function handleTileClick(account) {
    setActiveAccount(prev => prev?.id === account.id ? null : account);
  }

  const total = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="dashboard-screen">
      <nav className="topbar">
        <div className="topbar-left">
          <span className="pig">🐷</span>
          <h1>My Piggy Bank</h1>
        </div>
        <div className="topbar-right">
          <span className="greeting">Hello, <strong>{username}</strong></span>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">{themeIcon}</button>
          <button className="btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </nav>

      <div className="main-content">
        <TotalTile total={total} />

        <div className="accounts-label">Accounts</div>
        <div className="tiles-grid">
          {accounts.map(acc => (
            <AccountTile
              key={acc.id}
              account={acc}
              active={activeAccount?.id === acc.id}
              onClick={() => handleTileClick(acc)}
            />
          ))}
        </div>

        <TransactionPanel token={token} account={activeAccount} onClose={() => setActiveAccount(null)} />
      </div>
    </div>
  );
}
