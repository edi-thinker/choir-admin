"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const DocumentSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    originalFileName: { type: String, required: true },
    cloudinaryPublicId: { type: String }
}, { timestamps: true });
const Document = mongoose_1.default.models.Document || mongoose_1.default.model("Document", DocumentSchema);
exports.default = Document;
