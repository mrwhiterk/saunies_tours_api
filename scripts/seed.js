const mongoose = require('mongoose');
require('dotenv').config();

const Patron = require('../models/Patron');
const Trip = require('../models/Trip');

const samplePatrons = [
  {
    name: 'Mary Johnson',
    phone: '410-555-0123',
    address: '123 Main St, Baltimore, MD 21201',
    email: 'mary.johnson@email.com',
    emergencyContact: {
      name: 'John Johnson',
      phone: '410-555-0124',
      relationship: 'Spouse'
    },
    notes: 'Prefers front seats'
  },
  {
    name: 'Robert Smith',
    phone: '410-555-0456',
    address: '456 Oak Ave, Randallstown, MD 21133',
    email: 'robert.smith@email.com',
    emergencyContact: {
      name: 'Sarah Smith',
      phone: '410-555-0457',
      relationship: 'Daughter'
    }
  },
  {
    name: 'Patricia Davis',
    phone: '410-555-0789',
    address: '789 Pine Rd, Towson, MD 21204',
    email: 'patricia.davis@email.com',
    emergencyContact: {
      name: 'Michael Davis',
      phone: '410-555-0790',
      relationship: 'Son'
    },
    notes: 'Wheelchair accessible seating needed'
  },
  {
    name: 'James Wilson',
    phone: '410-555-0321',
    address: '321 Elm St, Catonsville, MD 21228',
    email: 'james.wilson@email.com'
  },
  {
    name: 'Linda Brown',
    phone: '410-555-0654',
    address: '654 Maple Dr, Dundalk, MD 21222',
    email: 'linda.brown@email.com',
    emergencyContact: {
      name: 'David Brown',
      phone: '410-555-0655',
      relationship: 'Husband'
    }
  }
];

const sampleTrips = [
  {
    destination: 'Delaware Park Casino',
    date: new Date('2025-07-15'),
    time: '09:00',
    busCapacity: 45,
    price: 35,
    departureLocation: 'Superior Tours Office, Baltimore',
    returnTime: '18:00',
    description: 'Day trip to Delaware Park Casino with lunch included',
    driver: {
      name: 'Mike Johnson',
      phone: '410-555-1000',
      license: 'CDL-12345'
    },
    bus: {
      number: 'ST-001',
      model: 'MCI J4500',
      capacity: 45
    }
  },
  {
    destination: 'Midway Slots & Simulcast',
    date: new Date('2025-07-22'),
    time: '10:30',
    busCapacity: 45,
    price: 40,
    departureLocation: 'Superior Tours Office, Baltimore',
    returnTime: '19:30',
    description: 'Casino trip with buffet dinner',
    driver: {
      name: 'Sarah Williams',
      phone: '410-555-1001',
      license: 'CDL-12346'
    },
    bus: {
      number: 'ST-002',
      model: 'MCI J4500',
      capacity: 45
    }
  },
  {
    destination: 'Hollywood Casino Perryville',
    date: new Date('2025-08-05'),
    time: '08:00',
    busCapacity: 45,
    price: 45,
    departureLocation: 'Superior Tours Office, Baltimore',
    returnTime: '20:00',
    description: 'Extended casino trip with premium amenities',
    driver: {
      name: 'Mike Johnson',
      phone: '410-555-1000',
      license: 'CDL-12345'
    },
    bus: {
      number: 'ST-001',
      model: 'MCI J4500',
      capacity: 45
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saunie_tours');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Patron.deleteMany({});
    await Trip.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample patrons
    const createdPatrons = await Patron.insertMany(samplePatrons);
    console.log(`Created ${createdPatrons.length} patrons`);

    // Insert sample trips with some bookings
    const tripsWithBookings = sampleTrips.map((trip, index) => {
      if (index === 0) {
        // Add some bookings to the first trip
        return {
          ...trip,
          bookings: [
            {
              patronId: createdPatrons[0]._id,
              seatNumber: 1,
              bookingDate: new Date(),
              status: 'confirmed',
              paymentStatus: 'paid'
            },
            {
              patronId: createdPatrons[1]._id,
              seatNumber: 5,
              bookingDate: new Date(),
              status: 'confirmed',
              paymentStatus: 'paid'
            },
            {
              patronId: createdPatrons[2]._id,
              seatNumber: 12,
              bookingDate: new Date(),
              status: 'confirmed',
              paymentStatus: 'pending'
            }
          ]
        };
      }
      return trip;
    });

    const createdTrips = await Trip.insertMany(tripsWithBookings);
    console.log(`Created ${createdTrips.length} trips`);

    console.log('Database seeded successfully!');
    console.log('\nSample data created:');
    console.log(`- ${createdPatrons.length} patrons`);
    console.log(`- ${createdTrips.length} trips`);
    console.log(`- ${createdTrips[0].bookings.length} bookings on first trip`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 