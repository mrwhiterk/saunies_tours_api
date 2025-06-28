const mongoose = require('mongoose');

const patronSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
patronSchema.index({ name: 1, phone: 1 });

// Virtual for full patron info
patronSchema.virtual('fullInfo').get(function() {
  return `${this.name} - ${this.phone}`;
});

// Ensure virtual fields are serialized
patronSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Patron', patronSchema); 