const db = require('../db');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'backups');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, 'agriconnect-' + new Date().toISOString().slice(0, 10) + '.db');

db.backup(file)
  .then(() => console.log('Backup saved to ' + file))
  .catch((e) => { console.error(e.message); process.exit(1); });