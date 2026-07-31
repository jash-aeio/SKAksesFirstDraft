const db = require('./database/db');

// Add new columns to event_registrations for ticket system
const cols = [
  { table: 'event_registrations', col: 'ticket_code', type: "TEXT DEFAULT ''" },
  { table: 'event_registrations', col: 'status', type: "TEXT DEFAULT 'confirmed'" },
];

for (const { table, col, type } of cols) {
  try {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`).run();
    console.log(`✅ Added ${col} to ${table}`);
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log(`⏭️  ${col} already exists in ${table}`);
    } else {
      console.error(`❌ Error adding ${col}:`, e.message);
    }
  }
}

// Backfill existing registrations with ticket codes if needed
const crypto = require('crypto');
const existing = db.prepare("SELECT * FROM event_registrations WHERE ticket_code IS NULL OR ticket_code = ''").all();
for (const reg of existing) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const hash = crypto.createHash('md5').update(`${reg.event_id}-${reg.user_id}-${timestamp}`).digest('hex').substring(0, 6).toUpperCase();
  const ticketCode = `KTP-${String(reg.event_id).padStart(3, '0')}-${hash}-${timestamp.slice(-4)}`;
  db.prepare('UPDATE event_registrations SET ticket_code = ?, status = ? WHERE id = ?').run(ticketCode, reg.attended ? 'attended' : 'confirmed', reg.id);
  console.log(`🎫 Backfilled ticket ${ticketCode} for registration #${reg.id}`);
}

console.log('\n✅ SKill Up migration complete.');
