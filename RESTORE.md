# 🔄 Restore Instructions

If you need to restore your data, follow these steps:

## Backup files:
- `latest-backup.json` - Most recent backup
- `backup-YYYY-MM-DD.json` - Dated backups

## To restore data:

1. **Stop the backend service** on Render temporarily
2. **Clear existing data** by deleting the data.json file
3. **Restart the service** - it will start with default data
4. **Use the admin dashboard** to manually re-enter data
5. **Or contact support** for help with bulk restore

## Backup contains:
- All RMs with their details
- All Channel Partners
- All Meetings
- All Sales
- All Targets

Last backup: $(cat latest-backup.json | grep timestamp | head -1)
