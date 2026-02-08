const mongoose = require("mongoose");
const User = require("../src/models/User.model");
require("dotenv").config();

const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "Admin@datamaker";

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set. Aborting.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);

    const existing = await User.findOne({ username: ADMIN_USERNAME });
    if (existing) {
      console.log("Admin user already exists.");
      return;
    }

    const admin = new User({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      role: "Admin",
    });

    await admin.save();
    console.log("Admin user created successfully.");
  } catch (error) {
    console.error("Failed to create admin user:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
