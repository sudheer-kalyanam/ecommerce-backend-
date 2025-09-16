const fs = require('fs');
const path = require('path');

function restoreDatabase() {
  const backupDir = path.join(__dirname, 'backups');
  const targetDb = path.join(__dirname, 'prisma', 'dev.db');

  try {
    // Check if backups directory exists
    if (!fs.existsSync(backupDir)) {
      console.log('❌ No backups directory found');
      return;
    }

    // Get all backup files
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('dev-backup-'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.log('❌ No backup files found');
      return;
    }

    console.log('📋 Available backups:');
    backups.forEach((backup, index) => {
      const stats = fs.statSync(path.join(backupDir, backup));
      console.log(`${index + 1}. ${backup} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`);
    });

    // Use the most recent backup
    const latestBackup = backups[0];
    const backupFile = path.join(backupDir, latestBackup);

    console.log(`\n🔄 Restoring from: ${latestBackup}`);

    // Copy backup to database location
    fs.copyFileSync(backupFile, targetDb);
    
    console.log('✅ Database restored successfully!');
    console.log(`📁 Restored from: ${backupFile}`);

  } catch (error) {
    console.error('❌ Error restoring database:', error);
  }
}

restoreDatabase();
