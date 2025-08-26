"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const twilio_1 = __importDefault(require("twilio"));
const dotenv_1 = __importDefault(require("dotenv"));
const Member_1 = __importDefault(require("../models/Member"));
dotenv_1.default.config();
const router = express_1.default.Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = (0, twilio_1.default)(accountSid, authToken);
function formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('+')) {
        cleaned = '+255' + cleaned;
    }
    console.log("Formatted phone number:", cleaned);
    if (cleaned.length !== 13) {
        throw new Error('Invalid phone number format. Check the length.');
    }
    return cleaned;
}
router.post("/", (async (req, res) => {
    console.log("POST /api/messages request received");
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }
        const members = await Member_1.default.find();
        const recipients = members.map((member) => member.phone);
        const messagePromises = recipients.map(async (recipient) => {
            const formattedNumber = formatPhoneNumber(recipient);
            const msg = await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedNumber,
            });
            return msg;
        });
        const results = await Promise.all(messagePromises);
        res.status(200).json({ message: "Messages sent successfully", results });
    }
    catch (error) {
        console.error("Error sending message:", error);
        let errorMessage = "Error sending message";
        if (error.message) {
            errorMessage += `: ${error.message}`;
        }
        res.status(500).json({ message: errorMessage, error: error.toString() });
    }
}));
exports.default = router;
