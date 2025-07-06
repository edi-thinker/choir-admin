import express, { RequestHandler } from "express"
import Alumnus from "../models/Alumnus"

const router = express.Router()

// Get all alumni
router.get("/", async (req, res) => {
  try {
    const alumni = await Alumnus.find()
    res.json(alumni)
  } catch (error) {
    res.status(500).json({ message: "Error fetching alumni", error })
  }
})

// Add a new alumnus
router.post("/", async (req, res) => {
  try {
    const newAlumnus = new Alumnus(req.body)
// 
    const savedAlumnus = await Alumnus.create(newAlumnus)
    res.status(201).json(savedAlumnus)
  } catch (error) {
    res.status(400).json({ message: "Error adding alumnus", error })
  }
})

// Update an alumnus
router.put("/:id", async (req, res) => {
  try {
    const updatedAlumnus = await Alumnus.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updatedAlumnus)
  } catch (error) {
    res.status(400).json({ message: "Error updating alumnus", error })
  }
})

// Delete an alumnus
router.delete("/:id", async (req, res) => {
  try {
    await Alumnus.findByIdAndDelete(req.params.id)
    res.json({ message: "Alumnus deleted successfully" })
  } catch (error) {
    res.status(400).json({ message: "Error deleting alumnus", error })
  }
})

router.get("/count", (async (req, res) => {
  try {
      const count = await Alumnus.countDocuments(); // Use countDocuments
      res.status(200).json({ count }); // Return the count in a JSON object
  } catch (error) {
      console.error("Error getting member count:", error);
      res.status(500).json({ message: "Error getting member count", error });
  }
}) as RequestHandler);

export default router

