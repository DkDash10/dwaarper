const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://dhaneshdash11:DKdash12@cluster0.v1e3u.mongodb.net/dwaarper";

const mongoDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');

    const fetched_data = await mongoose.connection.db.collection("service_category").find({}).toArray();
    // console.log('Data fetched successfully from MongoDB:', fetched_data);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = mongoDB;