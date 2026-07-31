const express = require('express');
const cors = require('cors');
const path = require('path');
const { runMigrations } = require('./database/migrations');
const { seedDatabase } = require('./database/seed');
const { runMigrationsV2 } = require('./database/migrations_v2');
const { seedV2 } = require('./database/seed_v2');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Run migrations and seed (V1 + V2)
runMigrations();
seedDatabase();
runMigrationsV2();
seedV2();

// ─── Core Routes ───
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/news', require('./routes/news'));
app.use('/api/services', require('./routes/services'));
app.use('/api/skillup', require('./routes/skillup'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/transparency', require('./routes/transparency'));
app.use('/api/notifications', require('./routes/notifications'));

// ─── Expansion Routes (Modules 1–4) ───
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/hazards', require('./routes/hazards'));
app.use('/api/safespace', require('./routes/safespace'));
app.use('/api/gigs', require('./routes/gigs'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/exchange', require('./routes/exchange'));
app.use('/api/eco-points', require('./routes/eco-points'));
app.use('/api/agri-connect', require('./routes/agri-connect'));
app.use('/api/volunteer', require('./routes/volunteer'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Katips API', version: '1.0.0' });
});

// Dashboard stats (admin)
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const db = require('./database/db');
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'youth'").get().count;
    const totalThreads = db.prepare("SELECT COUNT(*) as count FROM forum_threads WHERE status != 'deleted'").get().count;
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM skillup_events').get().count;
    const totalServices = db.prepare('SELECT COUNT(*) as count FROM services').get().count;
    const pendingLogs = db.prepare("SELECT COUNT(*) as count FROM service_logs WHERE status = 'pending'").get().count;
    const upcomingEvents = db.prepare("SELECT COUNT(*) as count FROM skillup_events WHERE status = 'upcoming'").get().count;
    res.json({ totalUsers, totalThreads, totalEvents, totalServices, pendingLogs, upcomingEvents });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

app.listen(PORT, () => {
  console.log(`\n🏛️  Katips API Server running on http://localhost:${PORT}`);
  console.log(`📊  Health check: http://localhost:${PORT}/api/health\n`);
});
