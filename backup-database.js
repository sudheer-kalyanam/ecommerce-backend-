const fs = require('fs');
const path = require('path');

function backupDatabase() {
  const sourceDb = path.join(__dirname, 'prisma', 'dev.db');
  const backupDir = path.join(__dirname, 'backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `dev-backup-${timestamp}.db`);

  try {
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Check if source database exists
    if (!fs.existsSync(sourceDb)) {
      console.log('❌ Source database not found:', sourceDb);
      return;
    }

    // Copy database file
    fs.copyFileSync(sourceDb, backupFile);
    
    console.log('✅ Database backed up successfully!');
    console.log(`📁 Backup location: ${backupFile}`);
    
    // List all backups
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('dev-backup-'))
      .sort()
      .reverse();
    
    console.log(`\n📋 Total backups: ${backups.length}`);
    if (backups.length > 0) {
      console.log('🕒 Latest backups:');
      backups.slice(0, 5).forEach(backup => {
        const stats = fs.statSync(path.join(backupDir, backup));
        console.log(`  - ${backup} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`);
      });
    }

  } catch (error) {
    console.error('❌ Error backing up database:', error);
  }
}

backupDatabase();
