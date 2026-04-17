import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PAGE_SIZE = 10;

export default function TransactionPanel({ token, account, onClose }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!account) return;
    setData(null);
    fetch(`/api/accounts/${account.id}/transactions?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setData);
  }, [account?.id, page]);

  useEffect(() => {
    if (account && panelRef.current) {
      setTimeout(() => panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
    }
  }, [account?.id]);

  function exportXLSX() {
    if (!data) return;
    const rows = data.transactions.map(t => ({
      Date: t.txn_date,
      Description: t.description,
      Reference: t.reference,
      Type: t.type,
      Amount: t.type === 'credit' ? Number(t.amount) : -Number(t.amount),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `${account.type}-transactions-p${page}.xlsx`);
  }

  function exportPDF() {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`${account.type.toUpperCase()} Account — Transactions (Page ${page})`, 14, 16);
    autoTable(doc, {
      startY: 24,
      head: [['Date', 'Description', 'Reference', 'Type', 'Amount']],
      body: data.transactions.map(t => [
        t.txn_date,
        t.description,
        t.reference,
        t.type.toUpperCase(),
        `${t.type === 'credit' ? '+' : '-'}$${Number(t.amount).toFixed(2)}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] },
      didParseCell(hookData) {
        if (hookData.column.index === 4 && hookData.section === 'body') {
          hookData.cell.styles.textColor =
            hookData.row.raw[3] === 'CREDIT' ? [22, 163, 74] : [220, 38, 38];
        }
      },
    });
    doc.save(`${account.type}-transactions-p${page}.pdf`);
  }

  const BADGE = { spend: 'badge-spend', save: 'badge-save', share: 'badge-share' };
  const LABEL = { spend: 'Spend Account', save: 'Save Account', share: 'Share Account' };

  const isOpen = !!account;

  return (
    <div className={`txn-panel${isOpen ? ' open' : ''}`} ref={panelRef}>
      <div className="txn-panel-inner">
        <div className="txn-panel-header">
          <div className="txn-panel-title">
            <h2>{account ? LABEL[account.type] : ''} — Transactions</h2>
            {account && <span className={`txn-badge ${BADGE[account.type]}`}>{account.type}</span>}
          </div>
          <div className="txn-actions">
            <button className="btn-export" onClick={exportXLSX}>
              <DownloadIcon /> Export XLSX
            </button>
            <button className="btn-export" onClick={exportPDF}>
              <DownloadIcon /> Export PDF
            </button>
            <button className="btn-close-panel" onClick={onClose}>✕</button>
          </div>
        </div>

        {!data ? (
          <div className="txn-loading">Loading…</div>
        ) : (
          <>
            <div className="txn-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Reference</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map(t => (
                    <tr key={t.id}>
                      <td className="txn-date">{t.txn_date}</td>
                      <td className="txn-desc">{t.description}</td>
                      <td className="txn-ref">{t.reference}</td>
                      <td>
                        <span className={`txn-type-badge type-${t.type}`}>{t.type}</span>
                      </td>
                      <td className={t.type === 'credit' ? 'amount-credit' : 'amount-debit'}>
                        ${Number(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <div className="pagination-info">
                {data.total === 0
                  ? 'No transactions found'
                  : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, data.total)} of ${data.total} transactions`}
              </div>
              <div className="pagination-controls">
                <button className="btn-page" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`btn-page${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="btn-page" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" />
    </svg>
  );
}
