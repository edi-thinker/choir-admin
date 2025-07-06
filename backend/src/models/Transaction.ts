// models/Transaction.js
import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  date: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true, enum: ["income", "expense"] },
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

export default Transaction;