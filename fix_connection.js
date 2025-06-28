const fs = require('fs');
const path = require('path');
require('dotenv').config();

// This script fixes double slash issues in your MongoDB URI in the .env file.
// It now uses the value from process.env.MONGODB_URI.

const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

if (!process.env.MONGODB_URI) {
  console.log('Please set your MongoDB connection string in the .env file as MONGODB_URI.');
  process.exit(1);
}

// Fix the double slash issue in the URI
const fixedConnectionString = process.env.MONGODB_URI.replace('//saunie_tours', '/saunie_tours');

// Update the .env file with the fixed connection string
const updatedEnvContent = envContent.replace(
  /MONGODB_URI=.*/,
  `MONGODB_URI=${fixedConnectionString}`
);

fs.writeFileSync(envPath, updatedEnvContent);
console.log('Updated .env with fixed MongoDB URI.');

console.log('✅ Fixed MongoDB Atlas connection string!');
console.log('');
console.log('Updated connection string:');
console.log('mongodb+srv://admin:pa%24%24word@cluster0.uyfdcq4.mongodb.net/saunie_tours?retryWrites=true&w=majority&appName=Cluster0');
console.log('');
console.log('Now you can:');
console.log('1. Restart the API server');
console.log('2. Run: npm run seed'); 