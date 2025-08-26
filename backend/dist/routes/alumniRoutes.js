"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Alumnus_1 = __importDefault(require("../models/Alumnus"));
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        const alumni = await Alumnus_1.default.find();
        res.json(alumni);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching alumni", error });
    }
});
router.post("/", async (req, res) => {
    try {
        const newAlumnus = new Alumnus_1.default(req.body);
        const savedAlumnus = await Alumnus_1.default.create(newAlumnus);
        res.status(201).json(savedAlumnus);
    }
    catch (error) {
        res.status(400).json({ message: "Error adding alumnus", error });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const updatedAlumnus = await Alumnus_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAlumnus);
    }
    catch (error) {
        res.status(400).json({ message: "Error updating alumnus", error });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        await Alumnus_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Alumnus deleted successfully" });
    }
    catch (error) {
        res.status(400).json({ message: "Error deleting alumnus", error });
    }
});
router.get("/count", (async (req, res) => {
    try {
        const count = await Alumnus_1.default.countDocuments();
        res.status(200).json({ count });
    }
    catch (error) {
        console.error("Error getting member count:", error);
        res.status(500).json({ message: "Error getting member count", error });
    }
}));
exports.default = router;
