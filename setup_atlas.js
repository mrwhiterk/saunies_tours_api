const fs = require('fs');
const path = require('path');
require('dotenv').config();

// This script helps you set up your MongoDB Atlas connection string in the .env file.
// Please manually set your MongoDB URI in the .env file as MONGODB_URI.
// Example:
// MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/saunie_tours?retryWrites=true&w=majority&appName=Cluster0

const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('No existing .env file found, creating new one...');
}

if (!process.env.MONGODB_URI) {
  console.log('Please set your MongoDB connection string in the .env file as MONGODB_URI.');
  process.exit(1);
}

// Update the MongoDB URI in the .env content
const updatedEnvContent = envContent.replace(
  /MONGODB_URI=.*/,
  `MONGODB_URI=${process.env.MONGODB_URI}`
);

fs.writeFileSync(envPath, updatedEnvContent);
console.log('Updated .env with your MongoDB URI.');

console.log('✅ MongoDB Atlas connection string updated successfully!');
console.log('');
console.log('Connection string details:');
console.log(`- Host: cluster0.uyfdcq4.mongodb.net`);
console.log(`- Database: saunie_tours`);
console.log(`- Username: admin`);
console.log(`- Password: pa$$word (URL encoded as pa%24%24word)`);
console.log('');
console.log('Next steps:');
console.log('1. Start the API server: npm run dev');
console.log('2. Seed the database: npm run seed');
console.log('3. Test the API: curl http://localhost:5001/health'); 