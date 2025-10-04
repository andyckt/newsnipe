// This script adds the rawPasscode field to existing company records
// For existing records, we can't recover the original passcode, so we'll set a default value

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
  console.log('Starting company passcode migration...');
  
  // Connection URL
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable not set');
    process.exit(1);
  }
  
  const client = new MongoClient(uri);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database and collection
    const db = client.db(); // Use the database from the connection string
    const companiesCollection = db.collection('companies');
    
    // Find all companies without a rawPasscode field
    const companies = await companiesCollection.find({ rawPasscode: { $exists: false } }).toArray();
    console.log(`Found ${companies.length} companies without rawPasscode`);
    
    // Update each company
    let updateCount = 0;
    for (const company of companies) {
      console.log(`Updating company: ${company._id} (${company.name})`);
      
      // Set a default rawPasscode - in a real scenario, you might want to notify users
      // that they need to reset their passcode
      const result = await companiesCollection.updateOne(
        { _id: company._id },
        { $set: { rawPasscode: 'default-passcode' } }
      );
      
      if (result.modifiedCount > 0) {
        updateCount++;
      }
    }
    
    console.log(`Migration complete. Updated ${updateCount} companies.`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);
