const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = `mongodb+srv://dhaneshdash11:${process.env.MONGO_PASSWORD}@cluster0.v1e3u.mongodb.net/dwaarper`;

const mongoDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');

    const fetched_data = await mongoose.connection.db.collection("service_data").find({}).toArray();
    const fetched_category = await mongoose.connection.db.collection("service_category").find({}).toArray();
    global.service_data = fetched_data
    global.service_category = fetched_category
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = mongoDB;