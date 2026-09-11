const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') });
const mongoose = require('mongoose');

const runTest = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<db_username>') || uri.includes('<db_password>')) {
    console.error('❌ MONGODB_URI is not yet configured with real credentials in backend/.env');
    console.log('Current URI template:', uri);
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ Successfully connected to MongoDB Atlas!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);

    // Create a temporary test schema to verify write and read operations
    const TestSchema = new mongoose.Schema({
      message: String,
      verifiedBy: String,
      module: String,
      sampleVehicle: {
        registrationNumber: { type: String },
        vehicleType: { type: String },
        status: { type: String },
      },
      createdAt: { type: Date, default: Date.now },
    });

    const TestModel = mongoose.models.ConnectionTest || mongoose.model('ConnectionTest', TestSchema);

    // Insert sample data
    console.log('📝 Inserting sample verification record into Atlas...');
    const sampleRecord = await TestModel.create({
      message: 'MongoDB Atlas connection verification successful',
      verifiedBy: 'MEMBER 2 - Fleet & Admin',
      module: 'Fleet & Administration Management',
      sampleVehicle: {
        registrationNumber: 'AP09-TEST-0001',
        vehicleType: 'SUV',
        status: 'AVAILABLE',
      },
    });

    console.log('✅ Sample data inserted successfully!');
    console.log('   Document ID:', sampleRecord._id.toString());
    console.log('   Document Data:', JSON.stringify(sampleRecord, null, 2));

    // Verify Read
    const found = await TestModel.findById(sampleRecord._id);
    console.log('🔍 Verified Read from Atlas:', found ? 'SUCCESS' : 'FAILED');

    await mongoose.connection.close();
    console.log('🔒 Connection closed gracefully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection or operation failed:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

runTest();
