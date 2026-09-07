const mongoose = require("mongoose");
require("dotenv").config();

const Professional = require("./models/Professional");

const mongoURI = `mongodb+srv://dhaneshdash11:${process.env.MONGO_PASSWORD}@cluster0.v1e3u.mongodb.net/dwaarper`;

const professionals = [
  {
    name: "Rahul Sharma",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    phone: "9876543210",
    email: "rahul.sharma@dwaarper.com",
    rating: 4.9,
    totalReviews: 520,
    completedJobs: 520,
    experience: 8,
    verified: true,
    location: "Mumbai",
    active: true,
  },

  {
    name: "Amit Kumar",
    profileImage: "https://randomuser.me/api/portraits/men/44.jpg",
    phone: "9876543211",
    email: "amit.kumar@dwaarper.com",
    rating: 4.8,
    totalReviews: 410,
    completedJobs: 410,
    experience: 6,
    verified: true,
    location: "Mumbai",
    active: true,
  },

  {
    name: "Sameer Patil",
    profileImage: "https://randomuser.me/api/portraits/men/68.jpg",
    phone: "9876543212",
    email: "sameer.patil@dwaarper.com",
    rating: 4.7,
    totalReviews: 380,
    completedJobs: 380,
    experience: 5,
    verified: true,
    location: "Mumbai",
    active: true,
  },
];

const defaultSchedule = {
  monday: {
    start: "09:00",
    end: "20:00",
    available: true,
  },

  tuesday: {
    start: "09:00",
    end: "20:00",
    available: true,
  },

  wednesday: {
    start: "09:00",
    end: "20:00",
    available: true,
  },

  thursday: {
    start: "09:00",
    end: "20:00",
    available: true,
  },

  friday: {
    start: "09:00",
    end: "20:00",
    available: true,
  },

  saturday: {
    start: "09:00",
    end: "20:00",
    available: true,
  },

  sunday: {
    start: "09:00",
    end: "20:00",
    available: false,
  },
};

const seedProfessionals = async () => {
  try {
    await mongoose.connect(mongoURI);

    console.log("MongoDB connected");

    // Get the exact services already stored in your database
    const services = await mongoose.connection.db.collection("service_data").find({}).toArray();

    console.log(`Found ${services.length} services`);

    if (!services.length) {
      console.log("No services found in service_data");
      process.exit(1);
    }

    // Remove existing seeded professionals
    await Professional.deleteMany({
      email: {
        $in: professionals.map((professional) => professional.email),
      },
    });

    // Give all 3 professionals every existing service
    // This guarantees at least 3 professionals per service.
    const serviceIds = services.map((service) => service._id);

    const documents = professionals.map((professional) => ({
      ...professional,
      services: serviceIds,
      schedule: defaultSchedule,
    }));

    const created = await Professional.insertMany(documents);

    console.log(`Successfully created ${created.length} professionals`);

    console.log(`Each professional is assigned to ${serviceIds.length} services`);

    console.log(`Every service now has ${created.length} available professionals before booking conflicts`);

    await mongoose.disconnect();

    console.log("MongoDB disconnected");
    process.exit(0);
  } catch (error) {
    console.error("Professional seed error:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedProfessionals();
