// routes/messageRoutes.js
import express, { RequestHandler } from "express";
import twilio from "twilio";
import dotenv from "dotenv";
import Member from "../models/Member"; 

dotenv.config();

const router = express.Router();

// Your Account SID and Auth Token from twilio.com/console
const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;

// Initialize the Twilio client
const client = twilio(accountSid, authToken);

// Function to validate and format phone numbers (VERY IMPORTANT)
function formatPhoneNumber(phoneNumber: string): string {
    // Remove non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
  
    // Remove leading zero (if present)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
  
    // Prepend +255 *only if* the number doesn't already start with a +
    if (!cleaned.startsWith('+')) {
          cleaned = '+255' + cleaned;
    }
  console.log("Formatted phone number:", cleaned);
  
    // Basic length check (adjust for Tanzanian numbers if needed)
    //  Tanzanian mobile numbers after removing 0 and adding +255 should have 12 digits
    if (cleaned.length !== 13) {
        throw new Error('Invalid phone number format. Check the length.');
    }
  
    return cleaned;
  }

interface SendMessageRequestBody {
    message: string;
}

// Send SMS message
router.post("/", (async (req, res) => {
    console.log("POST /api/messages request received")
    try {
        const { message } = req.body as SendMessageRequestBody;

        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }

        // Fetch all members from the database
        const members = await Member.find();
        const recipients = members.map((member) => member.phone);


        // Send messages to all recipients
        const messagePromises = recipients.map(async (recipient) => {
             const formattedNumber = formatPhoneNumber(recipient); // Format
            const msg = await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER as string,
                to: formattedNumber, // Use formatted number
            });
            return msg;
        });

        const results = await Promise.all(messagePromises);

        res.status(200).json({ message: "Messages sent successfully", results });

    } catch (error: any) {
        console.error("Error sending message:", error);
        let errorMessage = "Error sending message";
        if (error.message) {
            errorMessage += `: ${error.message}`;
        }
        res.status(500).json({ message: errorMessage, error: error.toString() });
    }
}) as RequestHandler);

export default router;