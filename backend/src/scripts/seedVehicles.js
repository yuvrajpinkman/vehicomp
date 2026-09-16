require('dotenv').config();
const mongoose = require('mongoose');
const { Vehicle } = require('../models/Vehicle');

const sampleVehicles = [
  {
    registrationNumber: 'TS07-CR-3344',
    make: 'Hyundai',
    model: 'Creta SX (O)',
    year: 2024,
    vehicleType: 'SUV',
    fuelType: 'DIESEL',
    pricePerDay: 3200,
    condition: 'EXCELLENT',
    status: 'AVAILABLE',
    location: {
      city: 'Hyderabad',
      address: 'Hitec City Metro Station Hub',
      coordinates: { latitude: 17.4474, longitude: 78.3762 },
    },
    seatingCapacity: 5,
    mileage: 12400,
    features: ['Panoramic Sunroof', 'Ventilated Seats', 'ADAS Level 2', '360 Camera'],
    isActive: true,
  },
  {
    registrationNumber: 'TS08-EV-9009',
    make: 'Tata',
    model: 'Nexon EV Empowered',
    year: 2024,
    vehicleType: 'ELECTRIC',
    fuelType: 'ELECTRIC',
    pricePerDay: 2800,
    condition: 'EXCELLENT',
    status: 'AVAILABLE',
    location: {
      city: 'Hyderabad',
      address: 'Gachibowli Financial District',
      coordinates: { latitude: 17.4123, longitude: 78.3475 },
    },
    seatingCapacity: 5,
    mileage: 8500,
    features: ['Fast Charging', 'V2V Charging', 'Connected Car Tech', 'Harman Audio'],
    isActive: true,
  },
  {
    registrationNumber: 'AP09-CT-1024',
    make: 'Honda',
    model: 'City ZX',
    year: 2023,
    vehicleType: 'SEDAN',
    fuelType: 'PETROL',
    pricePerDay: 2200,
    condition: 'GOOD',
    status: 'AVAILABLE',
    location: {
      city: 'Hyderabad',
      address: 'Madhapur Cyber Towers',
      coordinates: { latitude: 17.4504, longitude: 78.3808 },
    },
    seatingCapacity: 5,
    mileage: 24000,
    features: ['Sunroof', 'LaneWatch Camera', 'Leather Upholstery', 'Cruise Control'],
    isActive: true,
  },
  {
    registrationNumber: 'TS09-BM-7777',
    make: 'BMW',
    model: '3 Series Gran Limousine',
    year: 2024,
    vehicleType: 'LUXURY',
    fuelType: 'PETROL',
    pricePerDay: 7500,
    condition: 'EXCELLENT',
    status: 'RESERVED',
    location: {
      city: 'Hyderabad',
      address: 'Jubilee Hills Road No. 36',
      coordinates: { latitude: 17.4319, longitude: 78.4073 },
    },
    seatingCapacity: 5,
    mileage: 6200,
    features: ['Harman Kardon Surround', 'Panoramic Roof', 'Ambient Lighting', 'Wireless CarPlay'],
    isActive: true,
  },
  {
    registrationNumber: 'AP10-SW-4040',
    make: 'Maruti Suzuki',
    model: 'Swift ZXi+',
    year: 2023,
    vehicleType: 'HATCHBACK',
    fuelType: 'PETROL',
    pricePerDay: 1600,
    condition: 'GOOD',
    status: 'RENTED',
    location: {
      city: 'Hyderabad',
      address: 'Secunderabad Railway Station Hub',
      coordinates: { latitude: 17.4399, longitude: 78.5017 },
    },
    seatingCapacity: 5,
    mileage: 31000,
    features: ['Touchscreen Infotainment', 'Keyless Entry', 'Rear Camera'],
    isActive: true,
  },
  {
    registrationNumber: 'TS09-XU-5555',
    make: 'Mahindra',
    model: 'XUV700 AX7 Luxury',
    year: 2023,
    vehicleType: 'SUV',
    fuelType: 'DIESEL',
    pricePerDay: 4000,
    condition: 'FAIR',
    status: 'MAINTENANCE',
    location: {
      city: 'Hyderabad',
      address: 'Kondapur Service Center',
      coordinates: { latitude: 17.4649, longitude: 78.3582 },
    },
    seatingCapacity: 7,
    mileage: 48000,
    features: ['Sony 12-speaker 3D Audio', 'Skyroof', 'Dual 10.25 inch screens'],
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas...');

    for (const data of sampleVehicles) {
      await Vehicle.findOneAndUpdate(
        { registrationNumber: data.registrationNumber },
        { $set: data },
        { upsert: true, new: true }
      );
      console.log(`Seeded vehicle: ${data.make} ${data.model} (${data.registrationNumber}) [${data.status}]`);
    }

    console.log('✅ Demo fleet seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seed();
