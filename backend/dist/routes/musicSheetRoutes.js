"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const MusicSheet_1 = __importDefault(require("../models/MusicSheet"));
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
    console.log("GET /api/music-sheets request received");
    try {
        const musicSheets = await MusicSheet_1.default.find().sort({ uploadDate: -1 });
        res.json(musicSheets);
    }
    catch (error) {
        console.error("Error fetching music sheets:", error);
        res.status(500).json({ message: "Error fetching music sheets", error });
    }
});
router.post("/", upload.single("file"), (async (req, res) => {
    console.log("POST /api/music-sheets request received");
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }
    try {
        const { name, composer } = req.body;
        if (!name || !composer) {
            return res.status(400).json({ message: "Name and composer are required." });
        }
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary_1.default.uploader.upload_stream({
                resource_type: "raw",
                folder: "music-sheets",
                public_id: `${name.replace(/\s+/g, '_')}_${Date.now()}`,
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            }).end(req.file.buffer);
        });
        const cloudinaryResult = uploadResult;
        const newSheet = new MusicSheet_1.default({
            name,
            composer,
            fileUrl: cloudinaryResult.secure_url,
            uploadDate: new Date(),
            originalFileName: req.file.originalname,
            cloudinaryPublicId: cloudinaryResult.public_id,
        });
        const savedSheet = await MusicSheet_1.default.create(newSheet);
        res.status(201).json(savedSheet);
    }
    catch (error) {
        console.error("Error adding music sheet:", error);
        res.status(400).json({ message: "Error adding music sheet", error });
    }
}));
router.delete("/:id", (async (req, res) => {
    console.log("DELETE /api/music-sheets/:id request received");
    try {
        const { id } = req.params;
        const musicSheet = await MusicSheet_1.default.findById(id);
        if (!musicSheet) {
            return res.status(404).json({ message: "Music sheet not found" });
        }
        if (musicSheet.cloudinaryPublicId) {
            try {
                await cloudinary_1.default.uploader.destroy(musicSheet.cloudinaryPublicId, { resource_type: "raw" });
                console.log("File deleted from Cloudinary");
            }
            catch (cloudinaryError) {
                console.error("Error deleting from Cloudinary:", cloudinaryError);
            }
        }
        await MusicSheet_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Music sheet deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting music sheet:", error);
        res.status(500).json({ message: "Error deleting music sheet", error });
    }
}));
router.get("/count", (async (req, res) => {
    try {
        const count = await MusicSheet_1.default.countDocuments();
        res.status(200).json({ count });
    }
    catch (error) {
        console.error("Error getting member count:", error);
        res.status(500).json({ message: "Error getting member count", error });
    }
}));
exports.default = router;
