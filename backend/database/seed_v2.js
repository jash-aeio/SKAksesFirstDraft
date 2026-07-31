const db = require('./db');

function seedV2() {
  // Check if already seeded
  const check = db.prepare("SELECT COUNT(*) as count FROM app_config WHERE key = 'v2_seeded'").get();
  if (check.count > 0) {
    console.log('⏭️  V2 already seeded, skipping...');
    return;
  }

  // ═══════════════════════════════════════
  // E-Panukala: Sample Proposals
  // ═══════════════════════════════════════
  const proposals = [
    {
      user_id: 3, title: 'Covered Walkway from School to Barangay Hall',
      summary: 'Proposing a covered walkway connecting the local high school to the barangay hall to protect students during rainy season.',
      body: 'Every rainy season, students get soaked walking from school to the barangay hall for events and services. A simple covered walkway (approximately 200 meters) would improve safety and accessibility. Estimated cost: ₱350,000 from the ABYIP infrastructure fund. This would benefit over 500 students daily.',
      category: 'infrastructure', status: 'published', upvotes: 78
    },
    {
      user_id: 4, title: 'Free Wi-Fi Zones in Three Public Areas',
      summary: 'Install free Wi-Fi hotspots at the barangay plaza, SK hall, and public library to support digital learning.',
      body: 'Many students in our barangay cannot afford internet access. By installing 3 free Wi-Fi zones at key public areas, we can bridge the digital divide. Monthly cost estimated at ₱5,000/zone for 50Mbps fiber. This directly supports online classes, research, and access to government services.',
      category: 'education', status: 'published', upvotes: 142
    },
    {
      user_id: 5, title: 'Youth Mental Health First Aid Training',
      summary: 'Fund a quarterly Mental Health First Aid certification program for youth volunteers.',
      body: 'Mental health issues among youth are rising, but our barangay has zero trained mental health first aiders. I propose allocating ₱50,000/quarter from the health fund to certify 20 youth volunteers per batch through the DOH-accredited MHFA program. Trained volunteers can staff our SafeSpace initiative.',
      category: 'health', status: 'published', upvotes: 95
    },
    {
      user_id: 6, title: 'Night Basketball League with LED Court Lighting',
      summary: 'Install LED lights on the outdoor court and launch a night basketball league for working youth.',
      body: 'Many working youth can only play sports after 6PM, but our courts are dark by then. Installing LED flood lights (₱80,000 one-time) would unlock evening recreation. Paired with a Night League (₱20,000/season for trophies and refs), this boosts physical fitness and community bonding.',
      category: 'sports', status: 'published', upvotes: 53
    },
    {
      user_id: 7, title: 'Community Composting Station',
      summary: 'Establish a composting facility in the barangay to reduce waste and produce organic fertilizer for Agri-Connect.',
      body: 'Our barangay generates tons of biodegradable waste weekly. A composting station near the material recovery facility would divert waste from landfills and produce organic compost for our urban agriculture program. Startup cost: ₱45,000. Ongoing maintenance can be handled by eco-volunteers earning Eco-Points.',
      category: 'environment', status: 'draft', upvotes: 0
    },
  ];

  const insertProposal = db.prepare(
    `INSERT INTO proposals (user_id, title, summary, body, category, status, upvote_count) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  for (const p of proposals) {
    insertProposal.run(p.user_id, p.title, p.summary, p.body, p.category, p.status, p.upvotes);
  }

  // Add some votes for the published proposals
  const insertVote = db.prepare('INSERT OR IGNORE INTO proposal_votes (user_id, proposal_id) VALUES (?, ?)');
  // Proposal 1 (id might be 1): votes from users 4,5,6,7
  [4, 5, 6, 7].forEach(uid => insertVote.run(uid, 1));
  // Proposal 2 (id might be 2): votes from 3,5,6,7 — this one should have triggered mandatory agenda
  [3, 5, 6, 7].forEach(uid => insertVote.run(uid, 2));
  // Proposal 3: votes from 3,4,6
  [3, 4, 6].forEach(uid => insertVote.run(uid, 3));

  // Mark proposal 2 as mandatory_agenda since upvotes >= 100
  db.prepare("UPDATE proposals SET status = 'mandatory_agenda', is_mandatory_agenda = 1 WHERE id = 2").run();

  // ═══════════════════════════════════════
  // Bantay-Pondo: Budget Data
  // ═══════════════════════════════════════
  const budgetCategories = [
    { name: 'Education & Training', desc: 'Youth educational programs, scholarships, and digital literacy', color: '#3B82F6', amount: 500000 },
    { name: 'Sports Development', desc: 'Sports equipment, tournaments, and facility maintenance', color: '#10B981', amount: 300000 },
    { name: 'Health & Wellness', desc: 'Health programs, mental health support, and medical missions', color: '#EF4444', amount: 250000 },
    { name: 'Infrastructure', desc: 'Facility improvements, equipment, and maintenance', color: '#8B5CF6', amount: 400000 },
    { name: 'Environment', desc: 'Clean-up drives, tree planting, and environmental programs', color: '#059669', amount: 150000 },
    { name: 'Livelihood', desc: 'Skills training, micro-enterprise support, and job fairs', color: '#F59E0B', amount: 200000 },
    { name: 'Administrative', desc: 'Office supplies, utilities, and operational expenses', color: '#6B7280', amount: 100000 },
  ];

  const insertCat = db.prepare('INSERT INTO budget_categories (name, description, color_hex, fiscal_year) VALUES (?, ?, ?, ?)');
  const insertAlloc = db.prepare('INSERT INTO budget_allocations (category_id, allocated_amount, spent_amount, fiscal_year) VALUES (?, ?, ?, ?)');

  const spentRatios = [0.45, 0.30, 0.55, 0.20, 0.60, 0.35, 0.70];
  budgetCategories.forEach((cat, i) => {
    const catResult = insertCat.run(cat.name, cat.desc, cat.color, '2026');
    const spent = Math.round(cat.amount * spentRatios[i]);
    insertAlloc.run(catResult.lastInsertRowid, cat.amount, spent, '2026');
  });

  // Add a few expenditure records
  const expenditures = [
    { alloc: 1, amount: 50000, desc: 'Digital Literacy Workshop (20 laptops rental)', date: '2026-02-15' },
    { alloc: 1, amount: 30000, desc: 'Leadership Summit venue and catering', date: '2026-03-10' },
    { alloc: 2, amount: 25000, desc: 'Basketball tournament prizes and equipment', date: '2026-04-01' },
    { alloc: 3, amount: 40000, desc: 'Mental Health First Aid training batch 1', date: '2026-01-20' },
    { alloc: 4, amount: 80000, desc: 'SK Gym equipment upgrade', date: '2026-05-05' },
    { alloc: 5, amount: 35000, desc: 'Tree planting supplies (500 seedlings)', date: '2026-06-01' },
    { alloc: 7, amount: 15000, desc: 'Office supplies Q1', date: '2026-01-10' },
  ];

  const insertExp = db.prepare(
    'INSERT INTO budget_expenditures (allocation_id, admin_id, amount, description, date_spent) VALUES (?, 1, ?, ?, ?)'
  );
  for (const e of expenditures) {
    insertExp.run(e.alloc, e.amount, e.desc, e.date);
  }

  // ═══════════════════════════════════════
  // Bantay-Komunidad: Sample Hazard Reports
  // ═══════════════════════════════════════
  const hazards = [
    { user_id: 3, category: 'streetlight', desc: 'Streetlight out for 2 weeks on Katipunan Ave corner Calle 5. Very dark at night, unsafe for pedestrians.', lat: 14.6311, lng: 121.0756, address: 'Katipunan Ave cor. Calle 5', severity: 'high', status: 'acknowledged' },
    { user_id: 4, category: 'pothole', desc: 'Deep pothole near the school entrance. Already caused 2 motorcycle accidents this week.', lat: 14.6325, lng: 121.0748, address: 'Near Katipunan Elementary School', severity: 'critical', status: 'in_progress' },
    { user_id: 5, category: 'flooding', desc: 'Drainage is clogged on Rizal Street. Floods ankle-deep even with light rain.', lat: 14.6298, lng: 121.0771, address: 'Rizal Street, Block 7', severity: 'medium', status: 'pending' },
    { user_id: 6, category: 'garbage', desc: 'Illegal dumping site forming behind the basketball court. Attracts rats and smells terrible.', lat: 14.6340, lng: 121.0735, address: 'Behind SK Basketball Court', severity: 'medium', status: 'pending' },
  ];

  const insertHazard = db.prepare(
    `INSERT INTO hazard_reports (user_id, category, description, latitude, longitude, address_text, severity, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const h of hazards) {
    insertHazard.run(h.user_id, h.category, h.desc, h.lat, h.lng, h.address, h.severity, h.status);
  }

  // ═══════════════════════════════════════
  // Module 2: Economic & Educational Empowerment
  // ═══════════════════════════════════════

  // Katips Gig Board
  const gigs = [
    { posted_by: 1, title: 'Graphic Designer for Barangay Fiesta', desc: 'Looking for a youth layout artist to design the main tarpaulin and 5 social media posters for the upcoming fiesta.', company: 'Barangay Council', loc: 'Barangay Hall', pay_range: '₱3,000 - ₱5,000', type: 'fixed', cat: 'tech', req: 'Portfolio of previous poster designs.', deadline: '2026-08-15' },
    { posted_by: 1, title: 'Tutor for High School Math', desc: 'Need a math tutor for 3 high school students in our community reading center. 2 hours every Saturday.', company: 'SK Education Comm', loc: 'Community Reading Center', pay_range: '₱200/hour', type: 'per_hour', cat: 'tutoring', req: 'College student or grad, preferably math/engineering major.', deadline: '2026-08-30' },
  ];
  const insertGig = db.prepare('INSERT INTO gig_postings (posted_by, title, description, company_name, location, pay_range, pay_type, category, requirements, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const g of gigs) insertGig.run(g.posted_by, g.title, g.desc, g.company, g.loc, g.pay_range, g.type, g.cat, g.req, g.deadline);

  // Edu-Hub Scholarships
  const scholarships = [
    { admin_id: 1, title: 'Mayor\'s Scholarship for IT Students', provider: 'LGU Quezon City', desc: 'Full tuition subsidy for IT and Computer Science students residing in QC.', level: 'city', req: 'GWA of 1.75 or better. Certificate of Indigency.', ben: '₱20,000/sem tuition + ₱2,000 monthly allowance', slots: 50, url: 'https://qc.gov.ph/scholarships', deadline: '2026-09-01' },
    { admin_id: 1, title: 'SK Katipunan Educational Assistance', provider: 'SK Katipunan', desc: 'Financial assistance for graduating senior high school students.', level: 'barangay', req: 'Resident of Brgy Katipunan for 1 year. Photovcopy of school ID.', ben: '₱5,000 one-time assistance', slots: 100, url: '', deadline: '2026-10-15' },
  ];
  const insertSch = db.prepare('INSERT INTO scholarships (admin_id, title, provider, description, level, requirements, benefits, slots, application_url, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const s of scholarships) insertSch.run(s.admin_id, s.title, s.provider, s.desc, s.level, s.req, s.ben, s.slots, s.url, s.deadline);

  // SKill-Share Resources
  const resources = [
    { user_id: 3, title: 'Calculus Textbooks (TC7 & TC8) Notes', desc: 'I have scanned my old calculus notes. Very helpful for engineering freshmen.', type: 'notes', subject: 'Math', is_verified: 1 },
    { user_id: 4, title: 'Introduction to HTML/CSS', desc: 'Presentation slides from our last coding bootcamp.', type: 'presentation', subject: 'Programming', is_verified: 1 },
  ];
  const insertRes = db.prepare('INSERT INTO resources (user_id, title, description, type, subject, is_verified) VALUES (?, ?, ?, ?, ?, ?)');
  for (const r of resources) insertRes.run(r.user_id, r.title, r.desc, r.type, r.subject, r.is_verified);

  // Youth Exchange
  const exchange = [
    { admin_id: 1, title: 'Japan-East Asia Network of Exchange for Students and Youths (JENESYS)', desc: 'A youth exchange program aiming to promote mutual trust and understanding among the peoples of Japan and the Asia-Pacific region.', type: 'exchange', scope: 'international', org: 'National Youth Commission', loc: 'Tokyo, Japan', url: 'https://nyc.gov.ph', deadline: '2026-11-01' },
  ];
  const insertExc = db.prepare('INSERT INTO exchange_opportunities (admin_id, title, organizer, description, type, scope, location, application_url, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const e of exchange) insertExc.run(e.admin_id, e.title, e.org, e.desc, e.type, e.scope, e.loc, e.url, e.deadline);

  // ═══════════════════════════════════════
  // Module 3: Environment & Volunteerism
  // ═══════════════════════════════════════

  // Eco-Points Activities
  const ecoActivities = [
    { admin_id: 1, name: 'Plastic Bottle Recycling', desc: 'Exchange 1kg of plastic bottles for 10 eco-points.', points: 10, category: 'recycling' },
    { admin_id: 1, name: 'Barangay Cleanup Drive', desc: 'Participate in the weekly Saturday cleanup drive.', points: 20, category: 'cleanup' },
  ];
  const insertEco = db.prepare('INSERT INTO eco_activities (admin_id, name, description, points_value, category) VALUES (?, ?, ?, ?, ?)');
  for (const e of ecoActivities) insertEco.run(e.admin_id, e.name, e.desc, e.points, e.category);

  // Agri-Connect
  const agriContent = [
    { admin_id: 1, title: 'How to Start Urban Farming', body: 'Urban farming is easy! Start with a few pots of tomatoes...', category: 'urban_farming' },
  ];
  const insertAgri = db.prepare('INSERT INTO agri_content (admin_id, title, body, category) VALUES (?, ?, ?, ?)');
  for (const a of agriContent) insertAgri.run(a.admin_id, a.title, a.body, a.category);

  const seedKits = [
    { type: 'starter', qty: 50 },
    { type: 'herbs', qty: 30 },
  ];
  const insertKit = db.prepare('INSERT INTO seed_kit_inventory (kit_type, quantity_available) VALUES (?, ?)');
  for (const k of seedKits) insertKit.run(k.type, k.qty);

  // VolunTinder
  const volunteers = [
    { admin_id: 1, title: 'River Cleanup Volunteer', desc: 'Help us clean the local river.', loc: 'Barangay River', cat: 'environment', date: '2026-08-20', slots: 20, points: 15 },
    { admin_id: 1, title: 'Tutor for Kids', desc: 'Teach basic math to kids in the daycare center.', loc: 'Daycare Center', cat: 'education', date: '2026-08-22', slots: 5, points: 25 },
  ];
  const insertVol = db.prepare('INSERT INTO volunteer_opportunities (admin_id, title, description, location, category, event_date, slots, points_reward) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (const v of volunteers) insertVol.run(v.admin_id, v.title, v.desc, v.loc, v.cat, v.date, v.slots, v.points);

  // ═══════════════════════════════════════
  // Module 4: Privacy & Health (SafeSpace)
  // ═══════════════════════════════════════
  const safespace = [
    { reporter: 3, type: 'mental_health', urgency: 'high', narrative: 'I am feeling extremely overwhelmed with school and family issues. I need someone to talk to.', pref: 'in_app', anon: 1, status: 'new' },
    { reporter: 4, type: 'bullying', urgency: 'normal', narrative: 'I am being bullied online by some kids from our neighborhood.', pref: 'phone', details: '09123456789', anon: 0, status: 'in_progress', assigned: 2 }
  ];
  const insertSS = db.prepare('INSERT INTO safespace_reports (reporter_id, type, urgency, narrative, contact_preference, contact_details, is_anonymous, status, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const s of safespace) insertSS.run(s.reporter, s.type, s.urgency, s.narrative, s.pref, s.details || null, s.anon, s.status, s.assigned || null);

  // Mark as seeded
  db.prepare("INSERT INTO app_config (key, value, description) VALUES ('v2_seeded', '1', 'V2 seed completed')").run();

  console.log('✅ V2 seed data loaded (Proposals, Budget, Hazards, Gigs, Scholarships, Resources, Exchange, Eco, Agri, VolunTinder, SafeSpace).');
}

module.exports = { seedV2 };
