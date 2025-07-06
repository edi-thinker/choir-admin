// routes/documentRoutes.js
import express, { RequestHandler } from "express";
import multer from "multer";
import Document from "../models/Document";
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
// Get all documents
router.get("/", async (req, res) => {
    console.log("GET /api/documents request received");
    try {
        const documents = await Document.find().sort({ uploadDate: -1 });
        res.json(documents);
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Error fetching documents", error });
    }
});

router.post("/", upload.single("file"), (async (req: express.Request & { file: Express.Multer.File }, res: express.Response) => {
    console.log("POST /api/documents request received");
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    try {
        const { name, department } = req.body;
        if (!name || !department) {
            return res.status(400).json({ message: "Name and department are required." });
        }

        // Upload file to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw", // For non-image files like PDFs
                    folder: "documents", // Optional: organize files in folders
                    public_id: `${name.replace(/\s+/g, '_')}_${Date.now()}`, // Custom filename
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        const cloudinaryResult = uploadResult as any;

        const newDoc = new Document({
            name,
            department,
            fileUrl: cloudinaryResult.secure_url, // Cloudinary URL
            uploadDate: new Date(),
            originalFileName: req.file.originalname,
            cloudinaryPublicId: cloudinaryResult.public_id, // Store for deletion
        });

        const savedDoc = await Document.create(newDoc);
        res.status(201).json(savedDoc);
    } catch (error) {
        console.error("Error adding document:", error);
        res.status(400).json({ message: "Error adding document", error });
    }
}) as RequestHandler);

// Delete a document
router.delete("/:id", (async (req, res) => {
    console.log("DELETE /api/documents/:id request received")
    try {
        const { id } = req.params;
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete from Cloudinary if cloudinaryPublicId exists
        if (document.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(document.cloudinaryPublicId, { resource_type: "raw" });
                console.log("File deleted from Cloudinary");
            } catch (cloudinaryError) {
                console.error("Error deleting from Cloudinary:", cloudinaryError);
                // Continue with database deletion even if Cloudinary deletion fails
            }
        }

        // Delete the document from MongoDB
        await Document.findByIdAndDelete(id);
        res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ message: "Error deleting document", error });
    }
}) as RequestHandler);


export default router;