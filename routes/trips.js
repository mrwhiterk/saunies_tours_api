const express = require('express');
const { body, validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const Patron = require('../models/Patron');

const router = express.Router();

// Validation middleware
const validateTrip = [
  body('destination')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination must be between 2 and 100 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please enter a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Trip date must be in the future');
      }
      return true;
    }),
  body('time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please enter a valid time (HH:MM)'),
  body('busCapacity')
    .isInt({ min: 1, max: 60 })
    .withMessage('Bus capacity must be between 1 and 60'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('departureLocation')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Departure location must be between 2 and 100 characters'),
  body('returnTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please enter a valid return time (HH:MM)'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// @route   GET /api/trips
// @desc    Get all trips
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      dateFrom, 
      dateTo,
      sortBy = 'date', 
      sortOrder = 'asc' 
    } = req.query;
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { destination: { $regex: search, $options: 'i' } },
        { departureLocation: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const trips = await Trip.find(query)
      .populate('bookings.patronId', 'name phone')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Trip.countDocuments(query);
    
    res.json({
      trips,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalTrips: count
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/trips/:id
// @desc    Get trip by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('bookings.patronId', 'name phone address');
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Public
router.post('/', validateTrip, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      destination,
      date,
      time,
      busCapacity,
      price,
      departureLocation,
      returnTime,
      description,
      driver,
      bus
    } = req.body;
    
    const trip = new Trip({
      destination,
      date,
      time,
      busCapacity,
      price,
      departureLocation,
      returnTime,
      description,
      driver,
      bus
    });
    
    await trip.save();
    
    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/trips/:id
// @desc    Update a trip
// @access  Public
router.put('/:id', validateTrip, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Don't allow updating bus capacity if there are existing bookings
    if (req.body.busCapacity && trip.bookings.length > 0) {
      if (req.body.busCapacity < trip.bookings.length) {
        return res.status(400).json({ 
          message: `Cannot reduce bus capacity below ${trip.bookings.length} (current bookings)` 
        });
      }
    }
    
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('bookings.patronId', 'name phone');
    
    res.json(updatedTrip);
  } catch (error) {
    console.error('Error updating trip:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/trips/:id
// @desc    Delete a trip
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Don't allow deletion if there are bookings
    if (trip.bookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete trip with existing bookings. Cancel all bookings first.' 
      });
    }
    
    await Trip.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/trips/:id/book
// @desc    Book a seat on a trip
// @access  Public
router.post('/:id/book', [
  body('patronId').isMongoId().withMessage('Valid patron ID is required'),
  body('seatNumber').isInt({ min: 1 }).withMessage('Valid seat number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { patronId, seatNumber } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if patron exists
    const patron = await Patron.findById(patronId);
    if (!patron || !patron.isActive) {
      return res.status(404).json({ message: 'Patron not found' });
    }
    
    // Check if seat is available
    if (!trip.isSeatAvailable(seatNumber)) {
      return res.status(400).json({ message: 'Seat is already booked' });
    }
    
    // Check if patron is already booked on this trip
    const existingBooking = trip.bookings.find(b => b.patronId.toString() === patronId);
    if (existingBooking) {
      return res.status(400).json({ message: 'Patron is already booked on this trip' });
    }
    
    await trip.bookSeat(patronId, seatNumber);
    
    const updatedTrip = await Trip.findById(req.params.id)
      .populate('bookings.patronId', 'name phone');
    
    res.json(updatedTrip);
  } catch (error) {
    console.error('Error booking seat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/trips/:id/book/:seatNumber
// @desc    Cancel a booking
// @access  Public
router.delete('/:id/book/:seatNumber', async (req, res) => {
  try {
    const { id, seatNumber } = req.params;
    
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    const booking = trip.bookings.find(b => b.seatNumber === parseInt(seatNumber));
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    await trip.cancelBooking(parseInt(seatNumber));
    
    const updatedTrip = await Trip.findById(id)
      .populate('bookings.patronId', 'name phone');
    
    res.json(updatedTrip);
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/trips/:id/seats
// @desc    Get seat map for a trip
// @access  Public
router.get('/:id/seats', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('bookings.patronId', 'name phone');
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Create seat map
    const seatMap = [];
    for (let i = 1; i <= trip.busCapacity; i++) {
      const booking = trip.bookings.find(b => b.seatNumber === i);
      seatMap.push({
        seatNumber: i,
        isBooked: !!booking,
        patron: booking ? booking.patronId : null
      });
    }
    
    res.json({
      trip,
      seatMap,
      availableSeats: trip.availableSeats,
      totalRevenue: trip.totalRevenue,
      bookingPercentage: trip.bookingPercentage
    });
  } catch (error) {
    console.error('Error fetching seat map:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/trips/dashboard/stats
// @desc    Get dashboard statistics
// @access  Public
router.get('/dashboard/stats', async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments();
    const upcomingTrips = await Trip.countDocuments({ 
      date: { $gte: new Date() },
      status: 'scheduled'
    });
    const completedTrips = await Trip.countDocuments({ status: 'completed' });
    
    // Get total bookings across all trips
    const tripsWithBookings = await Trip.find().select('bookings price');
    const totalBookings = tripsWithBookings.reduce((sum, trip) => sum + trip.bookings.length, 0);
    const totalRevenue = tripsWithBookings.reduce((sum, trip) => sum + (trip.bookings.length * trip.price), 0);
    
    // Get upcoming trips for dashboard
    const upcomingTripsList = await Trip.find({ 
      date: { $gte: new Date() },
      status: 'scheduled'
    })
    .populate('bookings.patronId', 'name')
    .sort('date')
    .limit(5);
    
    res.json({
      totalTrips,
      upcomingTrips,
      completedTrips,
      totalBookings,
      totalRevenue,
      upcomingTripsList
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 