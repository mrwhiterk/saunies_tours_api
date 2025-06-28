# Saunie's Tours API Documentation

## Base URL
```
http://localhost:5001/api
```

## Authentication
Currently, the API is public (no authentication required). Future versions will include JWT authentication.

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": {...},
  "message": "Success message"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [...]
}
```

## Patrons API

### Get All Patrons
```http
GET /patrons
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name, phone, or address
- `sortBy` (optional): Sort field (default: 'name')
- `sortOrder` (optional): 'asc' or 'desc' (default: 'asc')

**Response:**
```json
{
  "patrons": [...],
  "totalPages": 5,
  "currentPage": 1,
  "totalPatrons": 50
}
```

### Get Patron by ID
```http
GET /patrons/:id
```

### Create Patron
```http
POST /patrons
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "410-555-0123",
  "address": "123 Main St, Baltimore, MD 21201",
  "email": "john.doe@email.com",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "410-555-0124",
    "relationship": "Spouse"
  },
  "notes": "Prefers window seats"
}
```

### Update Patron
```http
PUT /patrons/:id
```

### Delete Patron
```http
DELETE /patrons/:id
```

### Quick Search Patrons
```http
GET /patrons/search/quick?q=john
```

## Trips API

### Get All Trips
```http
GET /trips
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for destination or departure location
- `status` (optional): Trip status filter
- `dateFrom` (optional): Start date filter
- `dateTo` (optional): End date filter
- `sortBy` (optional): Sort field (default: 'date')
- `sortOrder` (optional): 'asc' or 'desc' (default: 'asc')

### Get Trip by ID
```http
GET /trips/:id
```

### Create Trip
```http
POST /trips
```

**Request Body:**
```json
{
  "destination": "Delaware Park Casino",
  "date": "2025-07-15",
  "time": "09:00",
  "busCapacity": 45,
  "price": 35,
  "departureLocation": "Superior Tours Office, Baltimore",
  "returnTime": "18:00",
  "description": "Day trip to Delaware Park Casino with lunch included",
  "driver": {
    "name": "Mike Johnson",
    "phone": "410-555-1000",
    "license": "CDL-12345"
  },
  "bus": {
    "number": "ST-001",
    "model": "MCI J4500",
    "capacity": 45
  }
}
```

### Update Trip
```http
PUT /trips/:id
```

### Delete Trip
```http
DELETE /trips/:id
```

### Book a Seat
```http
POST /trips/:id/book
```

**Request Body:**
```json
{
  "patronId": "507f1f77bcf86cd799439011",
  "seatNumber": 5
}
```

### Cancel Booking
```http
DELETE /trips/:id/book/:seatNumber
```

### Get Seat Map
```http
GET /trips/:id/seats
```

**Response:**
```json
{
  "trip": {...},
  "seatMap": [
    {
      "seatNumber": 1,
      "isBooked": true,
      "patron": {...}
    }
  ],
  "availableSeats": 42,
  "totalRevenue": 105,
  "bookingPercentage": 7
}
```

### Get Dashboard Statistics
```http
GET /trips/dashboard/stats
```

**Response:**
```json
{
  "totalTrips": 15,
  "upcomingTrips": 8,
  "completedTrips": 7,
  "totalBookings": 156,
  "totalRevenue": 5460,
  "upcomingTripsList": [...]
}
```

## Health Check

### API Health Status
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Rate limit headers included in responses

## CORS

- Allowed origin: `http://localhost:3000` (configurable)
- Credentials: true

## Validation Rules

### Patron Validation
- Name: 2-100 characters, required
- Phone: Valid phone format, required
- Address: Max 200 characters, optional
- Email: Valid email format, optional
- Notes: Max 500 characters, optional

### Trip Validation
- Destination: 2-100 characters, required
- Date: Future date, required
- Time: HH:MM format, required
- Bus Capacity: 1-60, required
- Price: Positive number, required
- Departure Location: 2-100 characters, required
- Return Time: HH:MM format, optional
- Description: Max 500 characters, optional

## Sample Requests

### Using curl

```bash
# Get all patrons
curl http://localhost:5001/api/patrons

# Create a new patron
curl -X POST http://localhost:5001/api/patrons \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "410-555-0123",
    "address": "123 Main St, Baltimore, MD 21201"
  }'

# Get dashboard stats
curl http://localhost:5001/api/trips/dashboard/stats

# Book a seat
curl -X POST http://localhost:5001/api/trips/507f1f77bcf86cd799439011/book \
  -H "Content-Type: application/json" \
  -d '{
    "patronId": "507f1f77bcf86cd799439012",
    "seatNumber": 5
  }'
```

### Using JavaScript/Fetch

```javascript
// Get all trips
const response = await fetch('http://localhost:5001/api/trips');
const data = await response.json();

// Create a new trip
const newTrip = await fetch('http://localhost:5001/api/trips', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    destination: 'Delaware Park Casino',
    date: '2025-07-15',
    time: '09:00',
    busCapacity: 45,
    price: 35,
    departureLocation: 'Superior Tours Office, Baltimore'
  })
});
``` 