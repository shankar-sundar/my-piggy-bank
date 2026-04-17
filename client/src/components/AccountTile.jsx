import React from 'react';

const META = {
  spend: { icon: '💳', label: 'Spend', footer: '↓ $340 spent this month',  footerClass: 'down' },
  save:  { icon: '🏦', label: 'Save',  footer: '↑ $500 saved this month',   footerClass: 'up'   },
  share: { icon: '🤝', label: 'Share', footer: '↑ $100 donated this month', footerClass: 'up'   },
};

export default function AccountTile({ account, active, onClick }) {
  const m = META[account.type] || { icon: '💰', label: account.type, footer: '', footerClass: '' };
  return (
    <div className={`tile ${account.type}${active ? ' active' : ''}`} onClick={onClick}>
      <div className="tile-header">
        <span className="tile-label">{m.label}</span>
        <div className="tile-icon">{m.icon}</div>
      </div>
      <div className="tile-account-id">{account.account_number}</div>
      <div className="tile-balance">
        <span className="currency">$</span>
        {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className={`tile-footer ${m.footerClass}`}>{m.footer}</div>
      <div className="tile-click-hint">↕ View transactions</div>
    </div>
  );
}
