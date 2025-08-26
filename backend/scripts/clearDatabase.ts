// scripts/clearDatabase.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Member from '../src/models/Member';
import Alumnus from '../src/models/Alumnus';
import User from '../src/models/User';
import Transaction from '../src/models/Transaction';
import Document from '../src/models/Document';
import MusicSheet from '../src/models/MusicSheet';

// Load environment variables
dotenv.config();

const clearDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/choir-admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get collection names and document counts before clearing
    console.log('\n📊 Current database state:');
    const memberCount = await Member.countDocuments();
    const alumnusCount = await Alumnus.countDocuments();
    const userCount = await User.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const documentCount = await Document.countDocuments();
    const musicSheetCount = await MusicSheet.countDocuments();

    console.log(`Members: ${memberCount}`);
    console.log(`Alumni: ${alumnusCount}`);
    console.log(`Users: ${userCount}`);
    console.log(`Transactions: ${transactionCount}`);
    console.log(`Documents: ${documentCount}`);
    console.log(`Music Sheets: ${musicSheetCount}`);

    const totalDocuments = memberCount + alumnusCount + userCount + transactionCount + documentCount + musicSheetCount;
    
    if (totalDocuments === 0) {
      console.log('\n✨ Database is already empty!');
      await mongoose.disconnect();
      return;
    }

    console.log(`\nTotal documents to be deleted: ${totalDocuments}`);
    console.log('\n⚠️  WARNING: This will permanently delete ALL data from your database!');
    console.log('⚠️  This action cannot be undone!');

    // In a real environment, you might want to add a confirmation prompt
    // For now, we'll add a 3-second delay
    console.log('\n⏳ Starting deletion in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Clear all collections
    console.log('\n🧹 Clearing database...');
    
    const deletionResults = await Promise.all([
      Member.deleteMany({}),
      Alumnus.deleteMany({}),
      User.deleteMany({}),
      Transaction.deleteMany({}),
      Document.deleteMany({}),
      MusicSheet.deleteMany({})
    ]);

    console.log('\n✅ Database cleared successfully!');
    console.log('\n📊 Deletion summary:');
    console.log(`Members deleted: ${deletionResults[0].deletedCount}`);
    console.log(`Alumni deleted: ${deletionResults[1].deletedCount}`);
    console.log(`Users deleted: ${deletionResults[2].deletedCount}`);
    console.log(`Transactions deleted: ${deletionResults[3].deletedCount}`);
    console.log(`Documents deleted: ${deletionResults[4].deletedCount}`);
    console.log(`Music Sheets deleted: ${deletionResults[5].deletedCount}`);
    
    const totalDeleted = deletionResults.reduce((sum, result) => sum + result.deletedCount, 0);
    console.log(`\n🎉 Total documents deleted: ${totalDeleted}`);

    // Verify the database is empty
    console.log('\n🔍 Verifying database is empty...');
    const remainingCounts = await Promise.all([
      Member.countDocuments(),
      Alumnus.countDocuments(),
      User.countDocuments(),
      Transaction.countDocuments(),
      Document.countDocuments(),
      MusicSheet.countDocuments()
    ]);

    const totalRemaining = remainingCounts.reduce((sum, count) => sum + count, 0);
    
    if (totalRemaining === 0) {
      console.log('✅ Database is now completely empty!');
    } else {
      console.log(`⚠️  Warning: ${totalRemaining} documents still remain in the database`);
    }

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Add confirmation prompt for production safety
const confirmAndClear = async () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--confirm') || args.includes('-y')) {
    await clearDatabase();
  } else {
    console.log('🚨 DANGER ZONE: Database Cleanup Script');
    console.log('====================================');
    console.log('This script will DELETE ALL data from your database.');
    console.log('This includes:');
    console.log('- All members');
    console.log('- All alumni');
    console.log('- All users');
    console.log('- All transactions');
    console.log('- All documents');
    console.log('- All music sheets');
    console.log('');
    console.log('⚠️  THIS ACTION CANNOT BE UNDONE!');
    console.log('');
    console.log('To proceed, run the script with --confirm flag:');
    console.log('npm run clear-db -- --confirm');
    console.log('or');
    console.log('ts-node scripts/clearDatabase.ts --confirm');
  }
};

// Run the script
confirmAndClear();
