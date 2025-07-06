// backend/seeds/createUsers.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User"; // Import your User model -  ADJUST PATH
import dotenv from 'dotenv';

dotenv.config()

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);

    // Delete existing users (optional - use with caution!)
    await User.deleteMany({});

    // Create users
    const users = [
      {
        name: "Chairperson",
        email: "chairperson@example.com",
        password: "password", // Will be hashed by the pre-save hook
        role: "chairperson",
      },
      {
        name: "Financial Leader",
        email: "financial@example.com",
        password: "password",
        role: "financial",
      },
    ];

     // Create and save the new users. The pre-save hook will automatically hash the password
    const savedUsers = await User.create(users);

    console.log("Users created:", savedUsers);
  } catch (error) {
    console.error("Error creating users:", error);
  } finally {
    await mongoose.disconnect();
  }
}

createUsers();