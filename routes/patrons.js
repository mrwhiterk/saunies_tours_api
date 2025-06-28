const express = require('express');
const { body, validationResult } = require('express-validator');
const Patron = require('../models/Patron');

const router = express.Router();

// Validation middleware
const validatePatron = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// @route   GET /api/patrons
// @desc    Get all patrons
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const patrons = await Patron.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Patron.countDocuments(query);
    
    res.json({
      patrons,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPatrons: count
    });
  } catch (error) {
    console.error('Error fetching patrons:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patrons/:id
// @desc    Get patron by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const patron = await Patron.findById(req.params.id);
    
    if (!patron) {
      return res.status(404).json({ message: 'Patron not found' });
    }
    
    res.json(patron);
  } catch (error) {
    console.error('Error fetching patron:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Patron not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/patrons
// @desc    Create a new patron
// @access  Public
router.post('/', validatePatron, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, phone, address, email, emergencyContact, notes } = req.body;
    
    // Check if patron with same phone already exists
    const existingPatron = await Patron.findOne({ phone, isActive: true });
    if (existingPatron) {
      return res.status(400).json({ message: 'A patron with this phone number already exists' });
    }
    
    const patron = new Patron({
      name,
      phone,
      address,
      email,
      emergencyContact,
      notes
    });
    
    await patron.save();
    
    res.status(201).json(patron);
  } catch (error) {
    console.error('Error creating patron:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/patrons/:id
// @desc    Update a patron
// @access  Public
router.put('/:id', validatePatron, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, phone, address, email, emergencyContact, notes } = req.body;
    
    // Check if phone number is being changed and if it conflicts with another patron
    const existingPatron = await Patron.findById(req.params.id);
    if (!existingPatron) {
      return res.status(404).json({ message: 'Patron not found' });
    }
    
    if (phone !== existingPatron.phone) {
      const phoneConflict = await Patron.findOne({ phone, isActive: true, _id: { $ne: req.params.id } });
      if (phoneConflict) {
        return res.status(400).json({ message: 'A patron with this phone number already exists' });
      }
    }
    
    const updatedPatron = await Patron.findByIdAndUpdate(
      req.params.id,
      {
        name,
        phone,
        address,
        email,
        emergencyContact,
        notes
      },
      { new: true, runValidators: true }
    );
    
    res.json(updatedPatron);
  } catch (error) {
    console.error('Error updating patron:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Patron not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/patrons/:id
// @desc    Soft delete a patron (set isActive to false)
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const patron = await Patron.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!patron) {
      return res.status(404).json({ message: 'Patron not found' });
    }
    
    res.json({ message: 'Patron deleted successfully' });
  } catch (error) {
    console.error('Error deleting patron:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Patron not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patrons/search/quick
// @desc    Quick search patrons by name or phone
// @access  Public
router.get('/search/quick', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ patrons: [] });
    }
    
    const patrons = await Patron.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name phone')
    .limit(10)
    .sort('name');
    
    res.json({ patrons });
  } catch (error) {
    console.error('Error searching patrons:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 