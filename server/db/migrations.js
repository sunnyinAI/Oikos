const runMigrations = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      name TEXT DEFAULT 'Oikos User',
      language TEXT DEFAULT 'en',
      dark_mode INTEGER DEFAULT 0,
      dietary_pref TEXT DEFAULT 'vegetarian',
      family_size INTEGER DEFAULT 2,
      monthly_budget REAL DEFAULT 10000,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS grocery_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL DEFAULT 'My List',
      share_code TEXT UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS grocery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      name_hi TEXT,
      quantity REAL DEFAULT 1,
      unit TEXT DEFAULT 'piece',
      category TEXT NOT NULL DEFAULT 'household',
      is_checked INTEGER DEFAULT 0,
      is_recurring INTEGER DEFAULT 0,
      notes TEXT,
      added_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pantry_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity REAL DEFAULT 1,
      unit TEXT DEFAULT 'piece',
      category TEXT DEFAULT 'household',
      storage_zone TEXT DEFAULT 'shelf',
      expiry_date TEXT,
      purchase_date TEXT,
      purchase_price REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      type TEXT NOT NULL DEFAULT 'expense',
      category TEXT NOT NULL DEFAULT 'grocery',
      description TEXT,
      date TEXT NOT NULL,
      payment_method TEXT DEFAULT 'upi',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      due_date TEXT NOT NULL,
      is_recurring INTEGER DEFAULT 1,
      recurrence TEXT DEFAULT 'monthly',
      is_paid INTEGER DEFAULT 0,
      category TEXT DEFAULT 'utility',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      billing_cycle TEXT DEFAULT 'monthly',
      renewal_date TEXT,
      category TEXT DEFAULT 'streaming',
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      week_start TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS list_collaborators (
      list_id INTEGER NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'editor',
      PRIMARY KEY (list_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS affiliate_clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      vendor TEXT NOT NULL,
      product_query TEXT,
      url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS push_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      platform TEXT DEFAULT 'web',
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, token)
    );

    CREATE INDEX IF NOT EXISTS idx_grocery_items_list ON grocery_items(list_id);
    CREATE INDEX IF NOT EXISTS idx_pantry_user ON pantry_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_bills_user ON bills(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_affiliate_user ON affiliate_clicks(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_push_user ON push_tokens(user_id);
  `);
};

module.exports = { runMigrations };
