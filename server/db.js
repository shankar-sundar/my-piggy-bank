const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'piggy.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    account_number TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    account_id INTEGER NOT NULL,
    txn_date TEXT NOT NULL,
    description TEXT NOT NULL,
    reference TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL
  );
`);

function seed() {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (existing) return;

  const hash = bcrypt.hashSync('piggy123', 10);
  const userStmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  userStmt.run('admin', hash);
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  const userId = user.id;

  const accounts = [
    { type: 'spend', number: 'ACC · 0001 · 8821', balance: 1240.50 },
    { type: 'save',  number: 'ACC · 0002 · 4473', balance: 8905.00 },
    { type: 'share', number: 'ACC · 0003 · 7729', balance: 620.75  },
  ];

  const insertAccount = db.prepare('INSERT INTO accounts (user_id, type, account_number, balance) VALUES (?, ?, ?, ?)');

  const txnData = {
    spend: [
      { desc: 'Grocery Store',        sub: 'Whole Foods Market',    type: 'debit',  amount: 87.43   },
      { desc: 'Netflix Subscription', sub: 'Streaming service',     type: 'debit',  amount: 15.99   },
      { desc: 'Salary Credit',        sub: 'Monthly payroll',       type: 'credit', amount: 3200.00 },
      { desc: 'Coffee Shop',          sub: 'Blue Bottle Coffee',    type: 'debit',  amount: 6.50    },
      { desc: 'Electric Bill',        sub: 'City Power & Light',    type: 'debit',  amount: 112.00  },
      { desc: 'Online Shopping',      sub: 'Amazon.com',            type: 'debit',  amount: 59.99   },
      { desc: 'Gym Membership',       sub: 'Fit Life Studios',      type: 'debit',  amount: 40.00   },
      { desc: 'Restaurant',           sub: 'The Golden Fork',       type: 'debit',  amount: 74.20   },
      { desc: 'Refund',               sub: 'Purchase return',       type: 'credit', amount: 29.99   },
      { desc: 'Gas Station',          sub: 'Shell #4421',           type: 'debit',  amount: 52.30   },
      { desc: 'Phone Bill',           sub: 'T-Mobile',              type: 'debit',  amount: 65.00   },
      { desc: 'Internet',             sub: 'Comcast Xfinity',       type: 'debit',  amount: 79.99   },
      { desc: 'Pharmacy',             sub: 'CVS Pharmacy',          type: 'debit',  amount: 23.15   },
      { desc: 'Bonus Credit',         sub: 'Q1 performance bonus',  type: 'credit', amount: 500.00  },
      { desc: 'Movie Tickets',        sub: 'AMC Theaters',          type: 'debit',  amount: 32.00   },
      { desc: 'Book Store',           sub: 'Barnes & Noble',        type: 'debit',  amount: 18.95   },
      { desc: 'Parking',              sub: 'City Parking Garage',   type: 'debit',  amount: 12.00   },
      { desc: 'Bank Transfer In',     sub: 'From savings',          type: 'credit', amount: 200.00  },
      { desc: 'Uber',                 sub: 'Ride share',            type: 'debit',  amount: 17.40   },
      { desc: 'Subscription',         sub: 'Adobe Creative Cloud',  type: 'debit',  amount: 54.99   },
      { desc: 'Supermarket',          sub: "Trader Joe's",          type: 'debit',  amount: 63.10   },
      { desc: 'Clothing',             sub: 'H&M Store',             type: 'debit',  amount: 49.00   },
      { desc: 'Interest Earned',      sub: 'Monthly interest',      type: 'credit', amount: 3.22    },
      { desc: 'Dentist',              sub: 'Bright Smile Dental',   type: 'debit',  amount: 150.00  },
      { desc: 'Hardware Store',       sub: 'Home Depot',            type: 'debit',  amount: 35.60   },
    ],
    save: [
      { desc: 'Monthly Deposit',    sub: 'Auto-transfer from spend', type: 'credit', amount: 500.00  },
      { desc: 'Interest Earned',    sub: 'High-yield savings',       type: 'credit', amount: 22.14   },
      { desc: 'Emergency Fund',     sub: 'Fund transfer',            type: 'credit', amount: 300.00  },
      { desc: 'Withdrawal',         sub: 'Transfer to spend',        type: 'debit',  amount: 200.00  },
      { desc: 'Goal: Vacation',     sub: 'Automatic saving',         type: 'credit', amount: 150.00  },
      { desc: 'Bonus Savings',      sub: 'Year-end bonus',           type: 'credit', amount: 1000.00 },
      { desc: 'ATM Withdrawal',     sub: 'Cash withdrawal',          type: 'debit',  amount: 100.00  },
      { desc: 'Interest Q1',        sub: 'Quarterly credit',         type: 'credit', amount: 45.80   },
      { desc: 'Savings Deposit',    sub: 'Manual deposit',           type: 'credit', amount: 250.00  },
      { desc: 'Tax Refund',         sub: 'IRS direct deposit',       type: 'credit', amount: 1240.00 },
      { desc: 'Goal: Home',         sub: 'Mortgage fund',            type: 'credit', amount: 400.00  },
      { desc: 'Fee Waived',         sub: 'Monthly fee reversal',     type: 'credit', amount: 5.00    },
      { desc: 'Transfer Out',       sub: 'To share account',         type: 'debit',  amount: 100.00  },
      { desc: 'Round-up Savings',   sub: 'Auto round-up',            type: 'credit', amount: 18.32   },
      { desc: 'Savings Deposit',    sub: 'Payroll deduction',        type: 'credit', amount: 600.00  },
      { desc: 'Interest Earned',    sub: 'Monthly interest',         type: 'credit', amount: 19.75   },
      { desc: 'Partial Withdrawal', sub: 'Medical expense',          type: 'debit',  amount: 350.00  },
      { desc: 'Automatic Deposit',  sub: 'Recurring transfer',       type: 'credit', amount: 500.00  },
      { desc: 'Interest Earned',    sub: 'Monthly interest',         type: 'credit', amount: 21.00   },
      { desc: 'Goal: Education',    sub: '529 contribution',         type: 'debit',  amount: 200.00  },
      { desc: 'Deposit',            sub: 'One-time deposit',         type: 'credit', amount: 750.00  },
    ],
    share: [
      { desc: 'Donation – Red Cross', sub: 'Charity transfer',    type: 'debit',  amount: 50.00  },
      { desc: 'Gift – Birthday',      sub: "Friend's birthday",   type: 'debit',  amount: 40.00  },
      { desc: 'Monthly Contribution', sub: 'Auto-fund share acct',type: 'credit', amount: 100.00 },
      { desc: 'School Fundraiser',    sub: 'Lincoln Elementary',  type: 'debit',  amount: 25.00  },
      { desc: 'Community Garden',     sub: 'Local non-profit',    type: 'debit',  amount: 15.00  },
      { desc: 'Transfer In',          sub: 'From save account',   type: 'credit', amount: 100.00 },
      { desc: 'Gift Card',            sub: 'Neighbor thank-you',  type: 'debit',  amount: 20.00  },
      { desc: 'Animal Shelter',       sub: 'Monthly pledge',      type: 'debit',  amount: 30.00  },
      { desc: 'Interest Earned',      sub: 'Monthly interest',    type: 'credit', amount: 1.22   },
      { desc: 'Food Bank',            sub: 'Harvest Hope',        type: 'debit',  amount: 45.00  },
      { desc: 'Fundraiser Run',       sub: 'Charity 5K',          type: 'debit',  amount: 35.00  },
      { desc: 'Birthday Fund',        sub: 'Family contribution', type: 'credit', amount: 50.00  },
      { desc: 'Library Donation',     sub: 'City Public Library', type: 'debit',  amount: 10.00  },
      { desc: 'Transfer In',          sub: 'Monthly top-up',      type: 'credit', amount: 100.00 },
      { desc: 'Medical Charity',      sub: "St. Jude's",          type: 'debit',  amount: 25.00  },
      { desc: 'Disaster Relief',      sub: 'UNICEF',              type: 'debit',  amount: 60.00  },
      { desc: 'Neighbor Gift',        sub: 'Moving away gift',    type: 'debit',  amount: 30.00  },
      { desc: 'Interest Earned',      sub: 'Quarterly interest',  type: 'credit', amount: 2.15   },
      { desc: 'Scholarship Fund',     sub: 'University fund',     type: 'debit',  amount: 100.00 },
      { desc: 'Team Lunch',           sub: 'Office farewell',     type: 'debit',  amount: 18.00  },
    ],
  };

  const insertTxn = db.prepare(
    'INSERT INTO transactions (account_id, txn_date, description, reference, type, amount) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const today = new Date();
  for (const acc of accounts) {
    insertAccount.run(userId, acc.type, acc.number, acc.balance);
    const row = db.prepare('SELECT id FROM accounts WHERE user_id = ? AND type = ?').get(userId, acc.type);
    const accId = row.id;
    txnData[acc.type].forEach((t, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 2);
      const dateStr = d.toISOString().split('T')[0];
      const ref = 'TXN' + String(100000 + Math.floor(Math.random() * 900000));
      insertTxn.run(accId, dateStr, `${t.desc} — ${t.sub}`, ref, t.type, t.amount);
    });
  }
}

seed();
module.exports = db;
