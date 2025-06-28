const fs = require('fs');
const path = require('path');

// Read the current .env file
const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Fix the double slash issue
const fixedConnectionString = envContent.replace(
  'mongodb+srv://admin:pa%24%24word@cluster0.uyfdcq4.mongodb.net//saunie_tours',
  'mongodb+srv://admin:pa%24%24word@cluster0.uyfdcq4.mongodb.net/saunie_tours'
);

// Write the fixed .env file
fs.writeFileSync(envPath, fixedConnectionString);

console.log('✅ Fixed MongoDB Atlas connection string!');
console.log('');
console.log('Updated connection string:');
console.log('mongodb+srv://admin:pa%24%24word@cluster0.uyfdcq4.mongodb.net/saunie_tours?retryWrites=true&w=majority&appName=Cluster0');
console.log('');
console.log('Now you can:');
console.log('1. Restart the API server');
console.log('2. Run: npm run seed'); 