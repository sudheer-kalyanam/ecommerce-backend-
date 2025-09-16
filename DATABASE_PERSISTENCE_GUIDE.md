# Database Persistence Guide

## 🚨 Problem Identified

Your database is being cleared frequently because of the `db:reset` script in `package.json`. This script runs `prisma migrate reset --force` which **completely wipes your database**.

## 🔧 Solutions Implemented

### 1. Automatic Backup Before Reset
- Modified `db:reset` script to automatically backup before resetting
- Now runs: `node backup-database.js && prisma migrate reset --force`

### 2. Manual Backup/Restore Commands
- `npm run db:backup` - Create a backup of current database
- `npm run db:restore` - Restore from the most recent backup

### 3. Backup Scripts Created
- `backup-database.js` - Creates timestamped backups
- `restore-database.js` - Restores from backups

## 📋 How to Use

### Create a Backup
```bash
npm run db:backup
```

### Restore from Backup
```bash
npm run db:restore
```

### Safe Database Reset (with backup)
```bash
npm run db:reset
```

## 🛡️ Prevention Tips

1. **Never run `prisma migrate reset --force` directly** - it wipes all data
2. **Always backup before major changes**
3. **Use `prisma migrate dev` instead of reset** for schema changes
4. **Check what scripts you're running** before executing them

## 🔍 Common Causes of Data Loss

1. **Running `npm run db:reset`** - This is the main culprit
2. **Running `prisma migrate reset --force`** directly
3. **Deleting the `dev.db` file** manually
4. **Running migration scripts** that drop tables

## 📁 Backup Location

Backups are stored in: `backend/backups/`
- Format: `dev-backup-YYYY-MM-DDTHH-mm-ss-sssZ.db`
- Automatic cleanup recommended (keep last 10-20 backups)

## 🚀 Recommended Workflow

1. **Before making changes**: `npm run db:backup`
2. **For schema changes**: `npm run prisma:migrate` (not reset)
3. **If something goes wrong**: `npm run db:restore`
4. **Only use reset**: When you intentionally want to start fresh

## ⚠️ Important Notes

- SQLite database file: `prisma/dev.db`
- Backups are timestamped and won't overwrite each other
- Always test restore process before relying on it
- Consider using PostgreSQL for production (more robust)
