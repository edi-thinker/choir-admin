import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    fileUrl: { type: String, required: true }, // URL to retrieve the file from Cloudinary
    uploadDate: { type: Date, default: Date.now },
    originalFileName: { type: String, required: true },
    cloudinaryPublicId: { type: String } // For deletion from Cloudinary
}, { timestamps: true });

const Document = mongoose.models.Document || mongoose.model("Document", DocumentSchema);

export default Document;