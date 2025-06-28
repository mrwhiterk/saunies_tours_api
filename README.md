# Saunie's Tours API 🚌

A robust backend API for managing bus tour operations, built with Node.js, Express, and MongoDB. This API provides comprehensive functionality for managing patrons, trips, bookings, and tour operations.

## 🚀 Features

- **Patron Management**: Complete CRUD operations for tour patrons
- **Trip Management**: Create and manage bus trips with detailed information
- **Seat Booking System**: Real-time seat booking and cancellation
- **Search & Filtering**: Advanced search capabilities for both patrons and trips
- **Dashboard Statistics**: Real-time analytics and reporting
- **Rate Limiting**: Built-in protection against abuse
- **Security**: Helmet.js security headers and CORS protection
- **Logging**: Comprehensive request logging with Morgan
- **Validation**: Input validation and error handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd saunie_tours_app/api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/saunie_tours
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Set up MongoDB**
   - For local MongoDB: Start your MongoDB service
   - For MongoDB Atlas: Follow the setup guide in `MONGODB_SETUP.md`

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /health
```

### Available Endpoints

#### Patrons
- `GET /patrons` - Get all patrons with pagination and search
- `GET /patrons/:id` - Get patron by ID
- `POST /patrons` - Create new patron
- `PUT /patrons/:id` - Update patron
- `DELETE /patrons/:id` - Delete patron
- `GET /patrons/search/quick?q=search_term` - Quick search

#### Trips
- `GET /trips` - Get all trips with filtering
- `GET /trips/:id` - Get trip by ID
- `POST /trips` - Create new trip
- `PUT /trips/:id` - Update trip
- `DELETE /trips/:id` - Delete trip
- `POST /trips/:id/book` - Book a seat
- `DELETE /trips/:id/book/:seatNumber` - Cancel booking
- `GET /trips/:id/seats` - Get seat map
- `GET /trips/dashboard/stats` - Get dashboard statistics

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🏗️ Project Structure

```
api/
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/
│   ├── Patron.js           # Patron data model
│   └── Trip.js             # Trip data model
├── routes/
│   ├── patrons.js          # Patron API routes
│   └── trips.js            # Trip API routes
├── scripts/
│   └── seed.js             # Database seeding script
├── server.js               # Main application file
├── package.json            # Dependencies and scripts
└── .env                    # Environment variables
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/saunie_tours` |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`
- `http://localhost:4173`

## 📊 Data Models

### Patron
```javascript
{
  name: String,
  phone: String,
  address: String,
  email: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Trip
```javascript
{
  destination: String,
  date: Date,
  time: String,
  busCapacity: Number,
  price: Number,
  departureLocation: String,
  returnTime: String,
  description: String,
  driver: {
    name: String,
    phone: String,
    license: String
  },
  bus: {
    number: String,
    model: String,
    capacity: Number
  },
  bookings: [{
    patronId: ObjectId,
    seatNumber: Number,
    bookedAt: Date
  }],
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

Currently, no test suite is configured. To add testing:

```bash
npm install --save-dev jest supertest
```

## 🚀 Deployment

### Heroku
1. Create a Heroku app
2. Set environment variables
3. Deploy using Heroku CLI or GitHub integration

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [API Documentation](./API_DOCUMENTATION.md)
- Review the [MongoDB Setup Guide](./MONGODB_SETUP.md)
- Open an issue on GitHub

## 🔮 Roadmap

- [ ] JWT Authentication
- [ ] User roles and permissions
- [ ] Email notifications
- [ ] Payment integration
- [ ] Mobile app API endpoints
- [ ] Advanced reporting
- [ ] Real-time notifications
- [ ] Image upload for trips

---

**Built with ❤️ for Saunie's Tours** 