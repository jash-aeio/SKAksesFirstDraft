const db = require('./db');

function runMigrations() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'youth' CHECK(role IN ('youth', 'moderator', 'admin')),
      profile_photo TEXT,
      id_document TEXT,
      is_verified INTEGER DEFAULT 0,
      bio TEXT DEFAULT '',
      barangay TEXT DEFAULT '',
      birthdate TEXT,
      total_points INTEGER DEFAULT 0,
      youth_profiling_data TEXT,
      katips_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Forum threads
    CREATE TABLE IF NOT EXISTS forum_threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'resolved', 'flagged', 'deleted')),
      likes INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Forum replies
    CREATE TABLE IF NOT EXISTS forum_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- News and events
    CREATE TABLE IF NOT EXISTS news_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT DEFAULT 'news' CHECK(type IN ('news', 'event', 'announcement')),
      poster_image TEXT,
      hyperlink TEXT,
      event_date DATETIME,
      event_location TEXT,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Services
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'other',
      icon TEXT DEFAULT '📋',
      is_available INTEGER DEFAULT 1,
      maintenance_mode INTEGER DEFAULT 0,
      maintenance_message TEXT DEFAULT 'This service is currently under maintenance.',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Service logs
    CREATE TABLE IF NOT EXISTS service_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'completed', 'rejected')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- SKill Up events
    CREATE TABLE IF NOT EXISTS skillup_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      location TEXT,
      points_reward INTEGER DEFAULT 0,
      max_participants INTEGER DEFAULT 0,
      current_participants INTEGER DEFAULT 0,
      status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
      event_date DATETIME NOT NULL,
      event_end_date DATETIME,
      registration_deadline DATETIME,
      image TEXT,
      extra_data TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Event registrations
    CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      attended INTEGER DEFAULT 0,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, user_id),
      FOREIGN KEY (event_id) REFERENCES skillup_events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Points ledger
    CREATE TABLE IF NOT EXISTS points_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER,
      points INTEGER NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'earned' CHECK(type IN ('earned', 'spent', 'bonus')),
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES skillup_events(id) ON DELETE SET NULL
    );

    -- Rewards catalog
    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      points_cost INTEGER NOT NULL,
      quantity_available INTEGER DEFAULT 0,
      image TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Reward redemptions
    CREATE TABLE IF NOT EXISTS reward_redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      reward_id INTEGER NOT NULL,
      points_spent INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'claimed', 'rejected')),
      redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
    );

    -- Transparency documents
    CREATE TABLE IF NOT EXISTS transparency_docs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'financial' CHECK(type IN ('financial', 'resolution', 'minutes', 'other')),
      description TEXT,
      file_path TEXT,
      is_published INTEGER DEFAULT 1,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'system' CHECK(type IN ('forum', 'event', 'service', 'system', 'points')),
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Thread likes (many-to-many)
    CREATE TABLE IF NOT EXISTS thread_likes (
      user_id INTEGER NOT NULL,
      thread_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, thread_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Database migrations completed successfully.');
}

module.exports = { runMigrations };
