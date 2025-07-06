// routes/transactionRoutes.js
import express, { RequestHandler } from "express";
import Transaction from "../models/Transaction";

const router = express.Router();

// Get all transactions
router.get("/", async (req, res) => {
    console.log("GET /api/transactions request received");
  try {
    const transactions = await Transaction.find().sort({ date: -1 }); // Sort by date (descending)
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions", error });
  }
});

// Add a new transaction
router.post("/", (async (req, res) => {
    console.log("POST /api/transactions request received");
  try {
    const newTransaction = new Transaction(req.body);
    const savedTransaction = await Transaction.create(newTransaction);
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(400).json({ message: "Error adding transaction", error });
  }
}) as RequestHandler);

// Update a transaction
router.put("/:id", (async (req, res) => {
    console.log("PUT /api/transactions request received");
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(400).json({ message: "Error updating transaction", error });
  }
}) as RequestHandler);

// Delete a transaction
router.delete("/:id", (async (req, res) => {
    console.log("DELETE /api/transactions request received");
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
     if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Error deleting transaction", error });
  }
}) as RequestHandler);

export default router;