import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

// Import your Mongoose models
import { User } from '../models/user_scheema.js';
import { Report } from '../models/report_scheema.js';

// Configure dotenv to read your .env file
dotenv.config({ path: './config/config.env' });

const DB_URI = process.env.DATABASE_URI;
const NUM_USERS = 1;
const NUM_REPORTS = 5;

/**
 * Connects to the MongoDB database.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ MongoDB Connected...');
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

/**
 * Generates and inserts dummy users into the database.
 */
const seedUsers = async () => {
  const users = [];
  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  for (let i = 0; i < NUM_USERS; i++) {
    const role = i < 5 ? 'Analyst' : 'Citizen';

    const user = {
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      // --- FIX: Replaced inconsistent phone number generation ---
      // This now reliably generates a 10-digit string.
      phone: faker.helpers.arrayElement(['9', '8', '7', '6']) + faker.string.numeric(9),
      // --- END FIX ---
      password: hashedPassword,
      role: role,
      isVerified: Math.random() < 0.8 ? 1 : 0,
      credibilityScore: faker.number.int({ min: 0, max: 100 }),
      userAvatar: {
        public_id: faker.string.uuid(),
        url: faker.image.avatar(),
      },
    };
    users.push(user);
  }

  await User.insertMany(users);
  console.log(`🌱 Seeded ${users.length} users.`);
};

/**
 * Generates and inserts dummy reports into the database.
 */
const seedReports = async () => {
  const citizens = await User.find({ role: 'Citizen' });
  const analysts = await User.find({ role: 'Analyst' });

  if (citizens.length === 0) {
    console.error('❌ Cannot seed reports: No citizen users found.');
    return;
  }

  const reports = [];
  const statuses = ['Pending', 'Needs Verification', 'Verified'];
  const sources = ['citizen', 'twitter', 'facebook', 'whatsapp'];
  const labels = ['relevant', 'irrelevant', 'panic'];

  for (let i = 0; i < NUM_REPORTS; i++) {
    const randomStatus = faker.helpers.arrayElement(statuses);
    const hasMedia = Math.random() < 0.6;

    const report = {
      text: faker.lorem.sentence({ min: 5, max: 15 }),
      location: {
        type: 'Point',
        coordinates: [
          faker.location.longitude({ min: 79, max: 81 }),
          faker.location.latitude({ min: 12, max: 14 }),
        ],
      },
      source: faker.helpers.arrayElement(sources),
      media: hasMedia
        ? {
            public_id: faker.string.uuid(),
            url: faker.image.urlLoremFlickr({ category: 'nature' }),
          }
        : {},
      status: randomStatus,
      label: faker.helpers.arrayElement(labels),
      confidence: faker.number.float({ min: 0.3, max: 0.99, precision: 0.01 }),
      submittedBy: faker.helpers.arrayElement(citizens)._id,
      verifiedBy:
        randomStatus === 'Verified' && analysts.length > 0
          ? faker.helpers.arrayElement(analysts)._id
          : null,
    };
    reports.push(report);
  }

  await Report.insertMany(reports);
  console.log(`🌱 Seeded ${reports.length} reports.`);
};

/**
 * Main function to run the entire seeding process.
 */
const seedDatabase = async () => {
  console.log('🚀 Starting database seeding process...');
  await connectDB();

  try {
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Report.deleteMany({});
    console.log('✅ Data cleared.');

    await seedUsers();
    await seedReports();

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ An error occurred during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 MongoDB Disconnected.');
  }
};

// Run the seeder
seedDatabase();
