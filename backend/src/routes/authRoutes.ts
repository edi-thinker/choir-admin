// backend/src/routes/authRoutes.ts
import express, { RequestHandler, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User"; // Import your User model
import { authenticateToken } from "../middleware/authMiddleware";
import dotenv from 'dotenv';

dotenv.config()
const router = express.Router();

// Interface for authenticated requests
interface AuthRequest extends Request {
    user?: { id: string; role: string };
}

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

// Change password route
router.put("/change-password", authenticateToken as any, (async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = (req as any).user?.id; // Get user ID from auth middleware

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required." });
        }

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the current password is correct
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Validate new password (you can add more validation rules here)
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }

        // Update the password (the pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Server error during password change" });
    }
}) as RequestHandler);

export default router;