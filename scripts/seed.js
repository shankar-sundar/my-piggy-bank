require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TXN_TEMPLATES = {
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
    { desc: 'Donation – Red Cross', sub: 'Charity transfer',     type: 'debit',  amount: 50.00  },
    { desc: 'Gift – Birthday',      sub: "Friend's birthday",    type: 'debit',  amount: 40.00  },
    { desc: 'Monthly Contribution', sub: 'Auto-fund share acct', type: 'credit', amount: 100.00 },
    { desc: 'School Fundraiser',    sub: 'Lincoln Elementary',   type: 'debit',  amount: 25.00  },
    { desc: 'Community Garden',     sub: 'Local non-profit',     type: 'debit',  amount: 15.00  },
    { desc: 'Transfer In',          sub: 'From save account',    type: 'credit', amount: 100.00 },
    { desc: 'Gift Card',            sub: 'Neighbor thank-you',   type: 'debit',  amount: 20.00  },
    { desc: 'Animal Shelter',       sub: 'Monthly pledge',       type: 'debit',  amount: 30.00  },
    { desc: 'Interest Earned',      sub: 'Monthly interest',     type: 'credit', amount: 1.22   },
    { desc: 'Food Bank',            sub: 'Harvest Hope',         type: 'debit',  amount: 45.00  },
    { desc: 'Fundraiser Run',       sub: 'Charity 5K',           type: 'debit',  amount: 35.00  },
    { desc: 'Birthday Fund',        sub: 'Family contribution',  type: 'credit', amount: 50.00  },
    { desc: 'Library Donation',     sub: 'City Public Library',  type: 'debit',  amount: 10.00  },
    { desc: 'Transfer In',          sub: 'Monthly top-up',       type: 'credit', amount: 100.00 },
    { desc: 'Medical Charity',      sub: "St. Jude's",           type: 'debit',  amount: 25.00  },
    { desc: 'Disaster Relief',      sub: 'UNICEF',               type: 'debit',  amount: 60.00  },
    { desc: 'Neighbor Gift',        sub: 'Moving away gift',     type: 'debit',  amount: 30.00  },
    { desc: 'Interest Earned',      sub: 'Quarterly interest',   type: 'credit', amount: 2.15   },
    { desc: 'Scholarship Fund',     sub: 'University fund',      type: 'debit',  amount: 100.00 },
    { desc: 'Team Lunch',           sub: 'Office farewell',      type: 'debit',  amount: 18.00  },
  ],
};

async function seed() {
  console.log('Seeding Supabase...');

  // Clear existing data
  await supabase.from('transactions').delete().neq('id', 0);
  await supabase.from('accounts').delete().neq('id', 0);
  await supabase.from('users').delete().neq('id', 0);

  // Insert user
  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({ username: 'admin', password_hash: bcrypt.hashSync('piggy123', 10) })
    .select()
    .single();
  if (userErr) { console.error('User insert failed:', userErr.message); process.exit(1); }
  console.log('✓ User created');

  // Insert accounts
  const { data: accounts, error: accErr } = await supabase
    .from('accounts')
    .insert([
      { user_id: user.id, type: 'spend', account_number: 'ACC · 0001 · 8821', balance: 1240.50 },
      { user_id: user.id, type: 'save',  account_number: 'ACC · 0002 · 4473', balance: 8905.00 },
      { user_id: user.id, type: 'share', account_number: 'ACC · 0003 · 7729', balance: 620.75  },
    ])
    .select();
  if (accErr) { console.error('Accounts insert failed:', accErr.message); process.exit(1); }
  console.log('✓ Accounts created');

  // Insert transactions
  const today = new Date();
  const txnRows = [];
  for (const acc of accounts) {
    TXN_TEMPLATES[acc.type].forEach((t, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 2);
      txnRows.push({
        account_id: acc.id,
        txn_date: d.toISOString().split('T')[0],
        description: `${t.desc} — ${t.sub}`,
        reference: 'TXN' + String(100000 + txnRows.length + 1),
        type: t.type,
        amount: t.amount,
      });
    });
  }

  const { error: txnErr } = await supabase.from('transactions').insert(txnRows);
  if (txnErr) { console.error('Transactions insert failed:', txnErr.message); process.exit(1); }
  console.log(`✓ ${txnRows.length} transactions created`);
  console.log('Seeding complete.');
}

seed();
