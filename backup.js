const fs = require('fs');
const https = require('https');

const BACKUP_FILE = './backup-data.json';

// Fetch current data from Render
https.get('https://roaring-tigers-backend.onrender.com/rms', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const rms = JSON.parse(data);
    
    https.get('https://roaring-tigers-backend.onrender.com/targets', (res2) => {
      let targetsData = '';
      res2.on('data', chunk => targetsData += chunk);
      res2.on('end', () => {
        const targets = JSON.parse(targetsData);
        
        const backup = {
          rms,
          targets,
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
        
        fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2));
        console.log(`✅ Backup saved to ${BACKUP_FILE}`);
        console.log(`📊 Backed up ${rms.length} RMs and ${targets.length} targets`);
      });
    });
  });
}).on('error', (err) => {
  console.error('❌ Backup failed:', err);
});
