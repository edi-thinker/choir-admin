"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Member_1 = __importDefault(require("../models/Member"));
const Alumnus_1 = __importDefault(require("../models/Alumnus"));
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        const members = await Member_1.default.find();
        const completedMembers = members.filter(member => member.hasCompletedStudies());
        if (completedMembers.length > 0) {
            for (const member of completedMembers) {
                const finalAcademicYear = member.academicStartYear + member.studyDurationYears - 1;
                const graduationYear = finalAcademicYear + 1;
                const newAlumnus = new Alumnus_1.default({
                    name: member.name,
                    phone: member.phone,
                    email: member.email,
                    program: member.program,
                    voiceGroup: member.voiceGroup,
                    yearCompleted: graduationYear.toString(),
                });
                await Alumnus_1.default.create(newAlumnus);
                await Member_1.default.findByIdAndDelete(member._id);
            }
            const remainingMembers = await Member_1.default.find();
            res.json(remainingMembers);
        }
        else {
            res.json(members);
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching members", error });
    }
});
router.post("/", async (req, res) => {
    try {
        const newMember = new Member_1.default(req.body);
        const savedMember = await Member_1.default.create(newMember);
        res.status(201).json(savedMember);
    }
    catch (error) {
        res.status(400).json({ message: "Error adding member", error });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const updatedMember = await Member_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedMember);
    }
    catch (error) {
        res.status(400).json({ message: "Error updating member", error });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        await Member_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Member deleted successfully" });
    }
    catch (error) {
        res.status(400).json({ message: "Error deleting member", error });
    }
});
router.post("/:id/transfer", (async (req, res) => {
    try {
        const { id } = req.params;
        const { yearCompleted } = req.body;
        if (!yearCompleted) {
            res.status(400).json({ message: "Year completed is required" });
            return;
        }
        const member = await Member_1.default.findById(id);
        if (!member) {
            res.status(404).json({ message: "Member not found" });
            return;
        }
        const newAlumnus = new Alumnus_1.default({
            name: member.name,
            phone: member.phone,
            email: member.email,
            program: member.program,
            voiceGroup: member.voiceGroup,
            yearCompleted,
        });
        const savedAlumnus = await Alumnus_1.default.create(newAlumnus);
        await Member_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Member transferred to alumni successfully", alumnus: savedAlumnus });
    }
    catch (error) {
        console.error("Error transferring member to alumni:", error);
        res.status(500).json({ message: "Error transferring member to alumni", error });
    }
}));
router.post("/check-graduation", async (req, res) => {
    try {
        const members = await Member_1.default.find();
        const completedMembers = members.filter(member => member.hasCompletedStudies());
        if (completedMembers.length === 0) {
            return res.json({ message: "No members to transfer", transferred: 0 });
        }
        const transferredMembers = [];
        for (const member of completedMembers) {
            const finalAcademicYear = member.academicStartYear + member.studyDurationYears - 1;
            const graduationYear = finalAcademicYear + 1;
            const newAlumnus = new Alumnus_1.default({
                name: member.name,
                phone: member.phone,
                email: member.email,
                program: member.program,
                voiceGroup: member.voiceGroup,
                yearCompleted: graduationYear.toString(),
            });
            await Alumnus_1.default.create(newAlumnus);
            await Member_1.default.findByIdAndDelete(member._id);
            transferredMembers.push(member.name);
        }
        res.json({
            message: `Successfully transferred ${completedMembers.length} members to alumni`,
            transferred: completedMembers.length,
            memberNames: transferredMembers
        });
    }
    catch (error) {
        console.error("Error checking graduation:", error);
        res.status(500).json({ message: "Error checking graduation", error });
    }
});
router.get("/count", (async (req, res) => {
    try {
        const count = await Member_1.default.countDocuments();
        res.status(200).json({ count });
    }
    catch (error) {
        console.error("Error getting member count:", error);
        res.status(500).json({ message: "Error getting member count", error });
    }
}));
exports.default = router;
