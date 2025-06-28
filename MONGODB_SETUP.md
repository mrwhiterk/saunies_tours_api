# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Recommended - Cloud)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider and region
4. Click "Create"

### 3. Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password (save these!)
4. Select "Read and write to any database"
5. Click "Add User"

### 4. Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### 5. Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `saunie_tours`

### 6. Update Environment Variables
Edit your `api/.env` file:
```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/saunie_tours
```

## Option 2: Local MongoDB Installation

### macOS (using Homebrew)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Verify installation
mongosh
```

### Windows
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Follow the installation wizard
4. MongoDB will be installed as a service and start automatically

### Linux (Ubuntu)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod
```

### Verify Local Installation
```bash
# Connect to MongoDB
mongosh

# You should see the MongoDB shell
# Type 'exit' to quit
```

## Testing the Connection

After setting up MongoDB, test your connection:

```bash
# Start the API server
cd api
npm run dev

# In another terminal, test the connection
curl http://localhost:5001/health

# If MongoDB is connected, you should see:
# {"status":"OK","timestamp":"...","environment":"development"}
```

## Seeding the Database

Once MongoDB is connected, populate it with sample data:

```bash
cd api
npm run seed
```

You should see output like:
```
Connected to MongoDB
Cleared existing data
Created 5 patrons
Created 3 trips
Database seeded successfully!
```

## Troubleshooting

### Connection Issues
- Check if MongoDB is running: `brew services list` (macOS) or `sudo systemctl status mongod` (Linux)
- Verify your connection string in `.env`
- Check network access (for Atlas)
- Ensure database user has correct permissions

### Port Issues
- MongoDB runs on port 27017 by default
- If you get connection errors, check if another process is using the port

### Authentication Issues
- Double-check username and password in connection string
- Ensure database user has the correct roles assigned

## Next Steps

Once MongoDB is set up and connected:

1. ✅ Test the health endpoint: `curl http://localhost:5001/health`
2. ✅ Seed the database: `npm run seed`
3. ✅ Test API endpoints: `curl http://localhost:5001/api/patrons`
4. ✅ Start developing your application!

## Useful MongoDB Commands

```bash
# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use our database
use saunie_tours

# Show collections
show collections

# Query patrons
db.patrons.find()

# Query trips
db.trips.find()

# Exit MongoDB shell
exit
``` 