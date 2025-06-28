const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  patronId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patron',
    required: true
  },
  seatNumber: {
    type: Number,
    required: true,
    min: 1
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'refunded'],
    default: 'pending'
  },
  notes: String
});

const tripSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    maxlength: [100, 'Destination cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Trip date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
  },
  busCapacity: {
    type: Number,
    required: [true, 'Bus capacity is required'],
    min: [1, 'Bus capacity must be at least 1'],
    max: [60, 'Bus capacity cannot exceed 60']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  departureLocation: {
    type: String,
    required: [true, 'Departure location is required'],
    trim: true
  },
  returnTime: {
    type: String,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  bookings: [bookingSchema],
  driver: {
    name: String,
    phone: String,
    license: String
  },
  bus: {
    number: String,
    model: String,
    capacity: Number
  }
}, {
  timestamps: true
});

// Indexes for faster queries
tripSchema.index({ date: 1, status: 1 });
tripSchema.index({ destination: 1 });
tripSchema.index({ 'bookings.patronId': 1 });

// Virtual for available seats
tripSchema.virtual('availableSeats').get(function() {
  return this.busCapacity - this.bookings.length;
});

// Virtual for total revenue
tripSchema.virtual('totalRevenue').get(function() {
  return this.bookings.length * this.price;
});

// Virtual for booking percentage
tripSchema.virtual('bookingPercentage').get(function() {
  return Math.round((this.bookings.length / this.busCapacity) * 100);
});

// Method to check if seat is available
tripSchema.methods.isSeatAvailable = function(seatNumber) {
  return !this.bookings.some(booking => booking.seatNumber === seatNumber);
};

// Method to book a seat
tripSchema.methods.bookSeat = function(patronId, seatNumber) {
  if (!this.isSeatAvailable(seatNumber)) {
    throw new Error('Seat is already booked');
  }
  
  this.bookings.push({
    patronId,
    seatNumber,
    bookingDate: new Date()
  });
  
  return this.save();
};

// Method to cancel a booking
tripSchema.methods.cancelBooking = function(seatNumber) {
  this.bookings = this.bookings.filter(booking => booking.seatNumber !== seatNumber);
  return this.save();
};

// Ensure virtual fields are serialized
tripSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Trip', tripSchema); 