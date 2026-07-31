const db = require('./db');

function runMigrationsV2() {
  // ─── App Configuration ───
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ═══════════════════════════════════════
  // MODULE 1: Governance & Transparency
  // ═══════════════════════════════════════

  // Feature 1: E-Panukala (Proposals)
  db.exec(`
    CREATE TABLE IF NOT EXISTS proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT DEFAULT 'general'
        CHECK(category IN ('infrastructure','education','health','sports','environment','livelihood','general')),
      status TEXT DEFAULT 'draft'
        CHECK(status IN ('draft','published','mandatory_agenda','under_review','approved','rejected','archived')),
      upvote_count INTEGER DEFAULT 0,
      is_mandatory_agenda INTEGER DEFAULT 0,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS proposal_votes (
      user_id INTEGER NOT NULL,
      proposal_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, proposal_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
    );
  `);

  // Feature 2: Bantay-Pondo (Budget Tracker)
  db.exec(`
    CREATE TABLE IF NOT EXISTS budget_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      color_hex TEXT DEFAULT '#F59E0B',
      fiscal_year TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS budget_allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      allocated_amount REAL NOT NULL DEFAULT 0,
      spent_amount REAL NOT NULL DEFAULT 0,
      fiscal_year TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budget_expenditures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      allocation_id INTEGER NOT NULL,
      admin_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      receipt_url TEXT,
      date_spent DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (allocation_id) REFERENCES budget_allocations(id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Feature 3: Bantay-Komunidad (Hazard Reports)
  db.exec(`
    CREATE TABLE IF NOT EXISTS hazard_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL
        CHECK(category IN ('streetlight','pothole','flooding','fallen_tree','garbage','electrical','structural','other')),
      description TEXT NOT NULL,
      image_url TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address_text TEXT,
      severity TEXT DEFAULT 'medium' CHECK(severity IN ('low','medium','high','critical')),
      status TEXT DEFAULT 'pending'
        CHECK(status IN ('pending','acknowledged','in_progress','resolved','dismissed')),
      admin_notes TEXT,
      resolved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // ═══════════════════════════════════════
  // MODULE 2: Economic & Educational
  // ═══════════════════════════════════════

  // Feature 4: Gig Board
  db.exec(`
    CREATE TABLE IF NOT EXISTS gig_postings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      posted_by INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      company_name TEXT,
      location TEXT,
      pay_range TEXT,
      pay_type TEXT DEFAULT 'per_day' CHECK(pay_type IN ('per_hour','per_day','fixed','volunteer')),
      category TEXT DEFAULT 'general'
        CHECK(category IN ('retail','food','tutoring','tech','manual_labor','events','admin_work','general')),
      slots INTEGER DEFAULT 1,
      filled_slots INTEGER DEFAULT 0,
      requirements TEXT,
      contact_info TEXT,
      status TEXT DEFAULT 'open' CHECK(status IN ('open','filled','closed','expired')),
      deadline DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gig_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gig_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected','withdrawn')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(gig_id, user_id),
      FOREIGN KEY (gig_id) REFERENCES gig_postings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Feature 5: Scholarships
  db.exec(`
    CREATE TABLE IF NOT EXISTS scholarships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      provider TEXT NOT NULL,
      description TEXT NOT NULL,
      level TEXT DEFAULT 'barangay' CHECK(level IN ('barangay','city','national','international')),
      requirements TEXT,
      benefits TEXT,
      slots INTEGER DEFAULT 0,
      application_url TEXT,
      attachment_url TEXT,
      deadline DATETIME NOT NULL,
      status TEXT DEFAULT 'open' CHECK(status IN ('open','closed','archived')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS scholarship_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scholarship_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'applied' CHECK(status IN ('applied','under_review','accepted','rejected')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(scholarship_id, user_id),
      FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Feature 6: Resource Bank
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'notes' CHECK(type IN ('notes','reviewer','presentation','ebook','link','other')),
      subject TEXT,
      file_url TEXT,
      external_link TEXT,
      is_verified INTEGER DEFAULT 0,
      verified_by INTEGER,
      download_count INTEGER DEFAULT 0,
      points_awarded INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS tutor_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      preferred_schedule TEXT,
      status TEXT DEFAULT 'open' CHECK(status IN ('open','matched','completed','cancelled')),
      matched_tutor_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (matched_tutor_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Feature 7: Exchange Opportunities
  db.exec(`
    CREATE TABLE IF NOT EXISTS exchange_opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      organizer TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT DEFAULT 'seminar'
        CHECK(type IN ('seminar','summit','exchange','fellowship','conference','workshop')),
      scope TEXT DEFAULT 'national' CHECK(scope IN ('local','national','international')),
      location TEXT,
      application_url TEXT,
      image_url TEXT,
      deadline DATETIME,
      event_start DATETIME,
      event_end DATETIME,
      is_featured INTEGER DEFAULT 0,
      status TEXT DEFAULT 'open' CHECK(status IN ('open','closed','archived')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // ═══════════════════════════════════════
  // MODULE 3: Environment & Volunteerism
  // ═══════════════════════════════════════

  // Feature 8: Eco-Points
  db.exec(`
    CREATE TABLE IF NOT EXISTS eco_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      points_value INTEGER NOT NULL DEFAULT 5,
      category TEXT DEFAULT 'recycling'
        CHECK(category IN ('recycling','cleanup','tree_planting','composting','energy_saving','other')),
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS eco_point_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity_id INTEGER,
      points INTEGER NOT NULL,
      scanned_by INTEGER,
      qr_code_ref TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (activity_id) REFERENCES eco_activities(id) ON DELETE SET NULL,
      FOREIGN KEY (scanned_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Feature 9: Agri-Connect
  db.exec(`
    CREATE TABLE IF NOT EXISTS agri_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT DEFAULT 'urban_farming'
        CHECK(category IN ('urban_farming','composting','hydroponics','container_gardening','seed_saving','other')),
      image_url TEXT,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS seed_kit_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      kit_type TEXT DEFAULT 'starter'
        CHECK(kit_type IN ('starter','herbs','vegetables','flowers')),
      address TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending'
        CHECK(status IN ('pending','approved','dispatched','received','rejected')),
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS seed_kit_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kit_type TEXT NOT NULL,
      quantity_available INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Feature 10: VolunTinder
  db.exec(`
    CREATE TABLE IF NOT EXISTS volunteer_opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT,
      category TEXT DEFAULT 'community'
        CHECK(category IN ('community','environment','education','health','disaster_relief','other')),
      skills_needed TEXT,
      event_date DATETIME NOT NULL,
      event_end DATETIME,
      slots INTEGER DEFAULT 10,
      filled_slots INTEGER DEFAULT 0,
      points_reward INTEGER DEFAULT 10,
      image_url TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','filled','completed','cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS volunteer_swipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      opportunity_id INTEGER NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('commit','skip')),
      points_status TEXT DEFAULT 'pending' CHECK(points_status IN ('pending','awarded','revoked')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, opportunity_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES volunteer_opportunities(id) ON DELETE CASCADE
    );
  `);

  // ═══════════════════════════════════════
  // MODULE 4: Privacy & Health
  // ═══════════════════════════════════════

  // Feature 11: SafeSpace (ISOLATED)
  db.exec(`
    CREATE TABLE IF NOT EXISTS safespace_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('mental_health','vawc','bullying','substance_abuse','other')),
      urgency TEXT DEFAULT 'normal' CHECK(urgency IN ('low','normal','high','emergency')),
      narrative TEXT NOT NULL,
      contact_preference TEXT DEFAULT 'in_app'
        CHECK(contact_preference IN ('in_app','phone','email','face_to_face')),
      contact_details TEXT,
      is_anonymous INTEGER DEFAULT 0,
      status TEXT DEFAULT 'new'
        CHECK(status IN ('new','assigned','in_progress','resolved','closed')),
      assigned_to INTEGER,
      counselor_notes TEXT,
      resolved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS safespace_access_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('view_list','view_report','update_status','add_notes')),
      report_id INTEGER,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (report_id) REFERENCES safespace_reports(id) ON DELETE SET NULL
    );
  `);

  // ─── Seed default config ───
  const configExists = db.prepare("SELECT COUNT(*) as count FROM app_config").get();
  if (configExists.count === 0) {
    const configs = [
      { key: 'proposal_upvote_threshold', value: '100', description: 'Number of upvotes required to trigger Mandatory Agenda status for E-Panukala proposals' },
      { key: 'eco_points_default', value: '5', description: 'Default eco-points awarded per activity' },
      { key: 'volunteer_default_points', value: '10', description: 'Default SKill Up points for volunteer commitments' },
      { key: 'resource_verify_points', value: '15', description: 'Points awarded when a shared resource is verified by admin' },
    ];
    const stmt = db.prepare('INSERT OR IGNORE INTO app_config (key, value, description) VALUES (?, ?, ?)');
    for (const c of configs) {
      stmt.run(c.key, c.value, c.description);
    }
  }

  console.log('✅ V2 Migrations completed — 22 new tables + app_config seeded.');
}

module.exports = { runMigrationsV2 };
