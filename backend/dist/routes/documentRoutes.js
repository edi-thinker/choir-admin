"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const Document_1 = __importDefault(require("../models/Document"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});
router.get("/", async (req, res) => {
    console.log("GET /api/documents request received");
    try {
        const documents = await Document_1.default.find().sort({ uploadDate: -1 });
        res.json(documents);
    }
    catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Error fetching documents", error });
    }
});
router.post("/", upload.single("file"), (async (req, res) => {
    console.log("POST /api/documents request received");
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }
    try {
        const { name, department } = req.body;
        if (!name || !department) {
            return res.status(400).json({ message: "Name and department are required." });
        }
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary_1.default.uploader.upload_stream({
                resource_type: "raw",
                folder: "documents",
                public_id: `${name.replace(/\s+/g, '_')}_${Date.now()}`,
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            }).end(req.file.buffer);
        });
        const cloudinaryResult = uploadResult;
        const newDoc = new Document_1.default({
            name,
            department,
            fileUrl: cloudinaryResult.secure_url,
            uploadDate: new Date(),
            originalFileName: req.file.originalname,
            cloudinaryPublicId: cloudinaryResult.public_id,
        });
        const savedDoc = await Document_1.default.create(newDoc);
        res.status(201).json(savedDoc);
    }
    catch (error) {
        console.error("Error adding document:", error);
        res.status(400).json({ message: "Error adding document", error });
    }
}));
router.delete("/:id", (async (req, res) => {
    console.log("DELETE /api/documents/:id request received");
    try {
        const { id } = req.params;
        const document = await Document_1.default.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        if (document.cloudinaryPublicId) {
            try {
                await cloudinary_1.default.uploader.destroy(document.cloudinaryPublicId, { resource_type: "raw" });
                console.log("File deleted from Cloudinary");
            }
            catch (cloudinaryError) {
                console.error("Error deleting from Cloudinary:", cloudinaryError);
            }
        }
        await Document_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Document deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ message: "Error deleting document", error });
    }
}));
exports.default = router;
