import React from 'react';

export default function TotalTile({ total }) {
  return (
    <div className="tile-total-wrap">
      <div className="tile total">
        <div className="total-left">
          <div className="tile-icon total-icon">📊</div>
          <div>
            <div className="tile-label total-lbl">Total Balance</div>
            <div className="tile-account-id">All accounts combined</div>
          </div>
        </div>
        <div className="total-right">
          <div className="tile-balance">
            <span className="currency">$</span>
            {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}
