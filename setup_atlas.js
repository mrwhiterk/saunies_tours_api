const fs = require('fs');
const path = require('path');

// Your MongoDB Atlas connection string
const atlasConnectionString = 'mongodb+srv://admin:pa$$word@cluster0.uyfdcq4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// URL encode the password ($$ becomes %24%24)
const encodedConnectionString = atlasConnectionString.replace('pa$$word', 'pa%24%24word');

// Add the database name (using underscore instead of slash)
const finalConnectionString = encodedConnectionString.replace('?retryWrites=true&w=majority&appName=Cluster0', '/saunie_tours?retryWrites=true&w=majority&appName=Cluster0');

// Read the current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('No existing .env file found, creating new one...');
}

// Update the MongoDB URI in the .env content
const updatedEnvContent = envContent.replace(
  /MONGODB_URI=.*/,
  `MONGODB_URI=${finalConnectionString}`
);

// Write the updated .env file
fs.writeFileSync(envPath, updatedEnvContent);

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