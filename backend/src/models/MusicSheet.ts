// models/MusicSheet.js
import mongoose from "mongoose";

const MusicSheetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  composer: { type: String, required: true },
  fileUrl: { type: String, required: true }, // URL to *retrieve* the file from Cloudinary
  uploadDate: { type: Date, default: Date.now },
  originalFileName: {type: String, required: true}, //original name of the uploaded file
  cloudinaryPublicId: {type: String} // For deletion from Cloudinary
}, { timestamps: true });

const MusicSheet = mongoose.models.MusicSheet || mongoose.model("MusicSheet", MusicSheetSchema);

export default MusicSheet;