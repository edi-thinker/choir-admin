"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    console.log("GET /api/transactions request received");
    try {
        const transactions = await Transaction_1.default.find().sort({ date: -1 });
        res.status(200).json(transactions);
    }
    catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Error fetching transactions", error });
    }
});
router.post("/", (async (req, res) => {
    console.log("POST /api/transactions request received");
    try {
        const newTransaction = new Transaction_1.default(req.body);
        const savedTransaction = await Transaction_1.default.create(newTransaction);
        res.status(201).json(savedTransaction);
    }
    catch (error) {
        console.error("Error adding transaction:", error);
        res.status(400).json({ message: "Error adding transaction", error });
    }
}));
router.put("/:id", (async (req, res) => {
    console.log("PUT /api/transactions request received");
    try {
        const updatedTransaction = await Transaction_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        res.status(200).json(updatedTransaction);
    }
    catch (error) {
        console.error("Error updating transaction:", error);
        res.status(400).json({ message: "Error updating transaction", error });
    }
}));
router.delete("/:id", (async (req, res) => {
    console.log("DELETE /api/transactions request received");
    try {
        const deletedTransaction = await Transaction_1.default.findByIdAndDelete(req.params.id);
        if (!deletedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        res.status(200).json({ message: "Transaction deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Error deleting transaction", error });
    }
}));
exports.default = router;
