// routes/musicSheetRoutes.js
import express, { RequestHandler } from "express";
import multer from "multer";
import MusicSheet from "../models/MusicSheet";
import cloudinary from "../config/cloudinary";
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});
// Get all music sheets
router.get("/", async (req, res) => {
    console.log("GET /api/music-sheets request received");
    try {
        const musicSheets = await MusicSheet.find().sort({ uploadDate: -1 });
        res.json(musicSheets);
    } catch (error) {
        console.error("Error fetching music sheets:", error);
        res.status(500).json({ message: "Error fetching music sheets", error });
    }
});

// Add a new music sheet (using upload.single('file'))
router.post("/", upload.single("file"), (async (req: express.Request & { file: Express.Multer.File }, res: express.Response) => {
    console.log("POST /api/music-sheets request received");

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    try {
        const { name, composer } = req.body;
        if (!name || !composer) {
            return res.status(400).json({ message: "Name and composer are required." });
        }

        // Upload file to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw", // For non-image files like PDFs
                    folder: "music-sheets", // Optional: organize files in folders
                    public_id: `${name.replace(/\s+/g, '_')}_${Date.now()}`, // Custom filename
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        const cloudinaryResult = uploadResult as any;

        // Create new music sheet with Cloudinary URL
        const newSheet = new MusicSheet({
            name,
            composer,
            fileUrl: cloudinaryResult.secure_url, // Cloudinary URL
            uploadDate: new Date(),
            originalFileName: req.file.originalname,
            cloudinaryPublicId: cloudinaryResult.public_id, // Store for deletion
        });

        const savedSheet = await MusicSheet.create(newSheet);
        res.status(201).json(savedSheet);
    } catch (error) {
        console.error("Error adding music sheet:", error);
        res.status(400).json({ message: "Error adding music sheet", error });
    }
}) as RequestHandler);

// Delete a music sheet
router.delete("/:id", (async (req, res) => {
    console.log("DELETE /api/music-sheets/:id request received");
    try {
        const { id } = req.params;
        const musicSheet = await MusicSheet.findById(id);

        if (!musicSheet) {
            return res.status(404).json({ message: "Music sheet not found" });
        }

        // Delete from Cloudinary if cloudinaryPublicId exists
        if (musicSheet.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(musicSheet.cloudinaryPublicId, { resource_type: "raw" });
                console.log("File deleted from Cloudinary");
            } catch (cloudinaryError) {
                console.error("Error deleting from Cloudinary:", cloudinaryError);
                // Continue with database deletion even if Cloudinary deletion fails
            }
        }

        // Delete the document from MongoDB
        await MusicSheet.findByIdAndDelete(id);

        res.status(200).json({ message: "Music sheet deleted successfully" });
    } catch (error) {
        console.error("Error deleting music sheet:", error);
        res.status(500).json({ message: "Error deleting music sheet", error });
    }
}) as RequestHandler);

router.get("/count", (async (req, res) => {
    try {
        const count = await MusicSheet.countDocuments(); // Use countDocuments
        res.status(200).json({ count }); // Return the count in a JSON object
    } catch (error) {
        console.error("Error getting member count:", error);
        res.status(500).json({ message: "Error getting member count", error });
    }
}) as RequestHandler);

export default router;