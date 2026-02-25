const fs = require('fs');
const https = require('https');

const BACKUP_FILE = `backup-${new Date().toISOString().split('T')[0]}.json`;

// Function to fetch data from an endpoint
function fetchData(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`https://roaring-tigers-backend.onrender.com/${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

console.log('📦 Creating complete backup...');
console.log('================================');

// Fetch all data
Promise.all([
  fetchData('rms'),
  fetchData('channel_partners'),
  fetchData('meetings'),
  fetchData('sales'),
  fetchData('targets')
]).then(([rms, channel_partners, meetings, sales, targets]) => {
  
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    stats: {
      rms: rms.length,
      channel_partners: channel_partners.length,
      meetings: meetings.length,
      sales: sales.length,
      targets: targets.length
    },
    data: {
      rms,
      channel_partners,
      meetings,
      sales,
      targets
    }
  };

  // Save to file
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2));
  
  console.log(`✅ Backup saved to: ${BACKUP_FILE}`);
  console.log('================================');
  console.log('📊 Backup Summary:');
  console.log(`   - RMs: ${rms.length}`);
  console.log(`   - Channel Partners: ${channel_partners.length}`);
  console.log(`   - Meetings: ${meetings.length}`);
  console.log(`   - Sales: ${sales.length}`);
  console.log(`   - Targets: ${targets.length}`);
  console.log('================================');
  
  // Also create a latest backup copy
  fs.writeFileSync('latest-backup.json', JSON.stringify(backup, null, 2));
  console.log('📋 Also saved as: latest-backup.json');
  
}).catch(err => {
  console.error('❌ Backup failed:', err);
});
