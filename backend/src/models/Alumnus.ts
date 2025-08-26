// models/Alumnus.js
import mongoose from "mongoose";

const AlumnusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  program: { type: String, required: true },
  voiceGroup: { type: String, required: true },
  yearCompleted: { type: String, required: true },
}, { timestamps: true }); // good practice

// Use mongoose.models.Alumnus || mongoose.model(...)
const Alumnus = mongoose.models.Alumnus || mongoose.model("Alumnus", AlumnusSchema);

export default Alumnus;