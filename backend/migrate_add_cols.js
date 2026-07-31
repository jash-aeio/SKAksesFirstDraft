const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'katips.db');
const db = new Database(dbPath);

try {
  db.exec('ALTER TABLE users ADD COLUMN youth_profiling_data TEXT');
  console.log('Added youth_profiling_data column');
} catch (e) { console.log(e.message); }

try {
  db.exec('ALTER TABLE users ADD COLUMN katips_id TEXT');
  console.log('Added katips_id column');
} catch (e) { console.log(e.message); }

console.log('Done');
