// backend/src/routes/authRoutes.ts
import express, { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User"; // Import your User model
import dotenv from 'dotenv';

dotenv.config()
const router = express.Router();

// Login route
router.post("/login", (async (req, res) => {
    console.log("POST /api/login request received")
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" }); // Don't reveal if it's email or password
        }

        // Check if the password is correct (using bcrypt)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create a JWT
        const payload = {
            user: {
                id: user.id, // Use the user's ID from the database
                role: user.role, // Include the user's role
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET as string, // Use a strong secret from .env
            { expiresIn: '1h' }, // Set token expiry (adjust as needed)
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    token, // Send the token
                    user: {
                        email: user.email, // Send back relevant user info
                        role: user.role,
                        name: user.name,  // Assuming you have a 'name' field
                        id: user._id
                    },
                });
            },
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during login" });
    }
}) as RequestHandler);

export default router;