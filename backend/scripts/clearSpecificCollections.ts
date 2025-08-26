// scripts/clearSpecificCollections.ts
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

const clearSpecificCollections = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/choir-admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const args = process.argv.slice(2);
    const collections = args.filter(arg => !arg.startsWith('--'));

    if (collections.length === 0) {
      console.log('❌ Please specify which collections to clear.');
      console.log('Available collections: members, alumni, users, transactions, documents, musicsheets');
      console.log('Example: npm run clear-collections -- members alumni');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n🧹 Clearing collections: ${collections.join(', ')}`);

    const results: string[] = [];

    for (const collection of collections) {
      switch (collection.toLowerCase()) {
        case 'members':
          const memberResult = await Member.deleteMany({});
          results.push(`Members: ${memberResult.deletedCount} deleted`);
          break;
        case 'alumni':
          const alumnusResult = await Alumnus.deleteMany({});
          results.push(`Alumni: ${alumnusResult.deletedCount} deleted`);
          break;
        case 'users':
          const userResult = await User.deleteMany({});
          results.push(`Users: ${userResult.deletedCount} deleted`);
          break;
        case 'transactions':
          const transactionResult = await Transaction.deleteMany({});
          results.push(`Transactions: ${transactionResult.deletedCount} deleted`);
          break;
        case 'documents':
          const documentResult = await Document.deleteMany({});
          results.push(`Documents: ${documentResult.deletedCount} deleted`);
          break;
        case 'musicsheets':
          const musicSheetResult = await MusicSheet.deleteMany({});
          results.push(`Music Sheets: ${musicSheetResult.deletedCount} deleted`);
          break;
        default:
          console.log(`⚠️  Unknown collection: ${collection}`);
      }
    }

    console.log('\n✅ Collections cleared successfully!');
    console.log('📊 Summary:');
    results.forEach(result => console.log(`  ${result}`));

  } catch (error) {
    console.error('❌ Error clearing collections:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

clearSpecificCollections();
