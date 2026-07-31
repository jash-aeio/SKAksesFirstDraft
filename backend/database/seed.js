const db = require('./db');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) {
    console.log('⏭️  Database already seeded, skipping...');
    return;
  }

  // Create admin user
  const adminHash = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (username, email, password_hash, full_name, role, is_verified, bio, barangay, total_points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('admin', 'admin@katips.ph', adminHash, 'SK Admin', 'admin', 1, 'Sangguniang Kabataan Administrator', 'Katipunan', 0);

  // Create moderator
  const modHash = bcrypt.hashSync('mod123', 10);
  db.prepare(`
    INSERT INTO users (username, email, password_hash, full_name, role, is_verified, bio, barangay, total_points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('moderator', 'mod@katips.ph', modHash, 'SK Moderator', 'moderator', 1, 'Community moderator', 'Katipunan', 0);

  // Create sample youth users
  const youthHash = bcrypt.hashSync('youth123', 10);
  const youthUsers = [
    { username: 'juan_dc', email: 'juan@email.com', name: 'Juan Dela Cruz', bio: 'Active community member', barangay: 'Katipunan', points: 150 },
    { username: 'maria_cs', email: 'maria@email.com', name: 'Maria Clara Santos', bio: 'Youth volunteer & student leader', barangay: 'Katipunan', points: 320 },
    { username: 'jose_rv', email: 'jose@email.com', name: 'Jose Rizal Valdez', bio: 'Sports enthusiast & community builder', barangay: 'Katipunan', points: 210 },
    { username: 'andrea_mg', email: 'andrea@email.com', name: 'Andrea Mendoza Garcia', bio: 'Arts and culture advocate', barangay: 'Katipunan', points: 180 },
    { username: 'carlo_bt', email: 'carlo@email.com', name: 'Carlo Bernardo Torres', bio: 'Tech enthusiast', barangay: 'Katipunan', points: 90 },
  ];

  for (const u of youthUsers) {
    db.prepare(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_verified, bio, barangay, total_points)
      VALUES (?, ?, ?, ?, 'youth', 1, ?, ?, ?)
    `).run(u.username, u.email, youthHash, u.name, u.bio, u.barangay, u.points);
  }

  // Create services
  const services = [
    { name: 'Printing Services', description: 'Document printing, photocopying, and scanning services available at the SK office.', type: 'printing', icon: '🖨️' },
    { name: 'SK Gym', description: 'Community gymnasium reservation and check-in system. Check availability and log your visits.', type: 'gym', icon: '🏋️' },
    { name: 'Court Reservation', description: 'Reserve basketball, volleyball, and badminton courts in the barangay facilities.', type: 'other', icon: '🏀' },
  ];

  for (const s of services) {
    db.prepare(`
      INSERT INTO services (name, description, type, icon) VALUES (?, ?, ?, ?)
    `).run(s.name, s.description, s.type, s.icon);
  }

  // Create sample forum threads
  const threads = [
    { user_id: 3, title: 'Basketball Tournament Registration Open!', content: 'Hey everyone! The inter-barangay basketball tournament registration is now open. Teams of 5 can register at the SK office. Deadline is next Friday. Who\'s joining? 🏀', category: 'sports' },
    { user_id: 4, title: 'Free Coding Workshop This Saturday', content: 'Sharing a free coding workshop for beginners! It will be held at the SK Hall from 9AM to 3PM. Snacks will be provided. Bring your own laptop if you have one. 💻', category: 'education' },
    { user_id: 5, title: 'Community Clean-Up Drive: Volunteers Needed', content: 'We\'re organizing a community clean-up drive this Sunday morning at 6AM. Meet at the barangay plaza. Let\'s keep our community clean! 🌿', category: 'community' },
    { user_id: 6, title: 'SK Gym New Equipment Arrived!', content: 'Great news! New gym equipment has been delivered to the SK Gym. We now have additional treadmills, dumbbells, and a bench press. Come check it out! 💪', category: 'announcement' },
    { user_id: 7, title: 'Study Group for Board Exam Review', content: 'Looking for study buddies for the upcoming civil service exam. We meet every Wednesday and Friday at the SK library. All are welcome! 📚', category: 'education' },
  ];

  for (const t of threads) {
    db.prepare(`
      INSERT INTO forum_threads (user_id, title, content, category) VALUES (?, ?, ?, ?)
    `).run(t.user_id, t.title, t.content, t.category);
  }

  // Create sample replies
  const replies = [
    { thread_id: 1, user_id: 5, content: 'Count us in! We already have a team of 5. Where do we sign up exactly?' },
    { thread_id: 1, user_id: 6, content: 'This is exciting! Will there be prizes for the winners?' },
    { thread_id: 2, user_id: 3, content: 'This is amazing! What programming language will be taught?' },
    { thread_id: 3, user_id: 4, content: 'I\'ll bring my friends along! Should we bring our own cleaning materials?' },
    { thread_id: 4, user_id: 3, content: 'Finally! I\'ve been waiting for new equipment. What are the gym hours?' },
  ];

  for (const r of replies) {
    db.prepare(`
      INSERT INTO forum_replies (thread_id, user_id, content) VALUES (?, ?, ?)
    `).run(r.thread_id, r.user_id, r.content);
  }

  // Create news & events
  const newsEvents = [
    { admin_id: 1, title: 'SK Katipunan General Assembly 2026', description: 'Join us for the annual SK General Assembly! This year, we will discuss our accomplishments, financial reports, and upcoming projects for the community.', type: 'event', event_date: '2026-08-15T09:00:00', event_location: 'Barangay Hall, Katipunan' },
    { admin_id: 1, title: 'Free Health Check-up for Youth', description: 'In partnership with the local health center, SK Katipunan offers free health check-ups for youth aged 15-30. Services include blood pressure monitoring, BMI check, and dental screening.', type: 'event', event_date: '2026-08-10T08:00:00', event_location: 'SK Health Center' },
    { admin_id: 1, title: 'New SK Programs Launched for 2026', description: 'SK Katipunan is proud to announce the launch of three new programs: Youth Leadership Training, Digital Literacy Workshop, and Sports Development League.', type: 'news', event_date: null, event_location: null },
    { admin_id: 1, title: 'SK Office Hours Update', description: 'Please be informed that the SK Office will now be open from Monday to Saturday, 8:00 AM to 5:00 PM. For urgent concerns, you may reach us through the Katips platform.', type: 'announcement', event_date: null, event_location: null },
  ];

  for (const ne of newsEvents) {
    db.prepare(`
      INSERT INTO news_events (admin_id, title, description, type, event_date, event_location) VALUES (?, ?, ?, ?, ?, ?)
    `).run(ne.admin_id, ne.title, ne.description, ne.type, ne.event_date, ne.event_location);
  }

  // Create SKill Up events
  const skillupEvents = [
    { admin_id: 1, title: 'Youth Leadership Summit 2026', description: 'A full-day leadership training covering public speaking, project management, and community organizing. Certificate and points will be given to all participants.', category: 'leadership', location: 'SK Convention Hall', points: 50, max: 100, date: '2026-08-20T08:00:00', end_date: '2026-08-20T17:00:00' },
    { admin_id: 1, title: 'Digital Literacy Workshop', description: 'Learn essential digital skills including basic computer operations, internet safety, and social media management. Open to all youth members.', category: 'education', location: 'SK Computer Lab', points: 30, max: 40, date: '2026-08-25T09:00:00', end_date: '2026-08-25T15:00:00' },
    { admin_id: 1, title: 'Community Clean-Up & Tree Planting', description: 'Join our environmental initiative! Help clean the community and plant trees in designated areas. Refreshments will be provided.', category: 'environment', location: 'Barangay Plaza', points: 25, max: 200, date: '2026-09-01T06:00:00', end_date: '2026-09-01T12:00:00' },
    { admin_id: 1, title: 'Sports Fest 2026: Basketball League', description: 'Annual inter-purok basketball tournament. Register your team and compete for the championship title! Teams of 5 with 2 reserves.', category: 'sports', location: 'SK Gymnasium', points: 40, max: 70, date: '2026-09-15T08:00:00', end_date: '2026-09-17T18:00:00' },
    { admin_id: 1, title: 'Arts & Culture Festival', description: 'Showcase your talent in music, dance, visual arts, and spoken word! Join our cultural festival and celebrate Filipino heritage.', category: 'culture', location: 'SK Open Grounds', points: 35, max: 150, date: '2026-09-22T10:00:00', end_date: '2026-09-22T20:00:00' },
  ];

  for (const se of skillupEvents) {
    db.prepare(`
      INSERT INTO skillup_events (admin_id, title, description, category, location, points_reward, max_participants, event_date, event_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(se.admin_id, se.title, se.description, se.category, se.location, se.points, se.max, se.date, se.end_date);
  }

  // Create rewards
  const rewards = [
    { name: 'SK Shirt (Limited Edition)', description: 'Exclusive SK Katipunan shirt with 2026 design', points: 100, qty: 50 },
    { name: 'Free Printing Credits (50 pages)', description: '50 pages of free printing at the SK office', points: 50, qty: 100 },
    { name: 'Gym Pass (1 Month)', description: 'One month unlimited access to the SK Gym', points: 150, qty: 30 },
    { name: 'School Supplies Kit', description: 'Complete set of notebooks, pens, and folders', points: 75, qty: 80 },
    { name: 'SK Tumbler', description: 'Eco-friendly tumbler with SK Katipunan logo', points: 60, qty: 100 },
  ];

  for (const r of rewards) {
    db.prepare(`
      INSERT INTO rewards (name, description, points_cost, quantity_available) VALUES (?, ?, ?, ?)
    `).run(r.name, r.description, r.points, r.qty);
  }

  // Seed some registrations and points
  db.prepare(`INSERT INTO event_registrations (event_id, user_id, attended) VALUES (1, 3, 0)`).run();
  db.prepare(`INSERT INTO event_registrations (event_id, user_id, attended) VALUES (1, 4, 0)`).run();
  db.prepare(`INSERT INTO event_registrations (event_id, user_id, attended) VALUES (2, 5, 0)`).run();

  // Points ledger entries
  db.prepare(`INSERT INTO points_ledger (user_id, event_id, points, description, type) VALUES (4, NULL, 320, 'Active community participation', 'earned')`).run();
  db.prepare(`INSERT INTO points_ledger (user_id, event_id, points, description, type) VALUES (5, NULL, 210, 'Sports event participation', 'earned')`).run();
  db.prepare(`INSERT INTO points_ledger (user_id, event_id, points, description, type) VALUES (3, NULL, 150, 'Volunteer activities', 'earned')`).run();

  // Transparency docs
  db.prepare(`INSERT INTO transparency_docs (admin_id, title, type, description) VALUES (1, 'Q1 2026 Financial Report', 'financial', 'Quarterly financial report covering January to March 2026 expenditures and budget allocation.')`).run();
  db.prepare(`INSERT INTO transparency_docs (admin_id, title, type, description) VALUES (1, 'SK Resolution No. 2026-001', 'resolution', 'Resolution approving the establishment of the Katips digital platform for youth services.')`).run();
  db.prepare(`INSERT INTO transparency_docs (admin_id, title, type, description) VALUES (1, 'SK Meeting Minutes - July 2026', 'minutes', 'Minutes of the regular SK council meeting held on July 5, 2026.')`).run();

  console.log('✅ Database seeded with sample data.');
}

module.exports = { seedDatabase };
