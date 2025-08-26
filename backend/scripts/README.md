# Database Management Scripts

This directory contains scripts to help you manage your choir-admin database.

## Scripts Available

### 1. Clear Entire Database (`clearDatabase.ts`)

This script will delete **ALL** data from your database. Use with extreme caution!

**Usage:**
```bash
# Show warning and instructions
ts-node scripts/clearDatabase.ts

# Actually clear the database (with confirmation)
ts-node scripts/clearDatabase.ts --confirm
```

**What it clears:**
- All members
- All alumni  
- All users
- All transactions
- All documents
- All music sheets

### 2. Clear Specific Collections (`clearSpecificCollections.ts`)

This script allows you to clear only specific collections instead of the entire database.

**Usage:**
```bash
# Clear only members
ts-node scripts/clearSpecificCollections.ts members

# Clear multiple collections
ts-node scripts/clearSpecificCollections.ts members alumni

# Clear transactions and documents
ts-node scripts/clearSpecificCollections.ts transactions documents
```

**Available collections:**
- `members` - All choir members
- `alumni` - All alumni records
- `users` - All user accounts
- `transactions` - All financial transactions
- `documents` - All document records
- `musicsheets` - All music sheet records

## Examples

### Starting Fresh with New Data
If you want to completely start over with fresh data:
```bash
ts-node scripts/clearDatabase.ts --confirm
```

### Clearing Only Member Data
If you want to keep users and financial data but reset member/alumni data:
```bash
ts-node scripts/clearSpecificCollections.ts members alumni
```

### Clearing Financial Data Only
If you want to reset only financial records:
```bash
ts-node scripts/clearSpecificCollections.ts transactions
```

## Safety Features

- **Confirmation Required**: The full database clear requires `--confirm` flag
- **Progress Reporting**: Shows what will be deleted and confirms deletion
- **Count Verification**: Reports before/after counts to verify operations
- **Error Handling**: Proper error handling and cleanup

## ⚠️ Important Warnings

1. **Backup First**: Always backup your data before running these scripts
2. **No Undo**: These operations cannot be undone
3. **Production Safety**: Be extra careful in production environments
4. **Environment**: Make sure your `.env` file points to the correct database

## Environment Setup

Make sure your `.env` file contains the correct MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/choir-admin
```

Or for MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/choir-admin
```

## Manual Execution

You can run these scripts directly using ts-node:

```bash
# Navigate to the backend directory
cd backend

# Clear entire database (with confirmation)
ts-node scripts/clearDatabase.ts --confirm

# Clear specific collections
ts-node scripts/clearSpecificCollections.ts members alumni
```

Make sure you have ts-node installed. If not, install it globally:
```bash
npm install -g ts-node
```
