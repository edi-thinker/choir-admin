import express, { RequestHandler } from "express";
import Member from "../models/Member";
import Alumnus from "../models/Alumnus";

const router = express.Router()

// Get all members
router.get("/", async (req, res) => {
  try {
    const members = await Member.find()
    
    // Check for members who have completed their studies and auto-transfer them
    const completedMembers = members.filter(member => member.hasCompletedStudies());
    
    if (completedMembers.length > 0) {
      // Auto-transfer completed members to alumni
      for (const member of completedMembers) {
        // Calculate the actual graduation year (July of final academic year)
        const finalAcademicYear = member.academicStartYear + member.studyDurationYears - 1;
        const graduationYear = finalAcademicYear + 1; // July is in the calendar year after academic year started
        
        const newAlumnus = new Alumnus({
          name: member.name,
          phone: member.phone,
          email: member.email,
          program: member.program,
          voiceGroup: member.voiceGroup,
          yearCompleted: graduationYear.toString(),
        });
        
        await Alumnus.create(newAlumnus);
        await Member.findByIdAndDelete(member._id);
      }
      
      // Fetch remaining members after auto-transfer
      const remainingMembers = await Member.find();
      res.json(remainingMembers);
    } else {
      res.json(members);
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching members", error })
  }
})

// Add a new member
router.post("/", async (req, res) => {
  try {
    const newMember = new Member(req.body)
    const savedMember = await Member.create(newMember)
    res.status(201).json(savedMember)
  } catch (error) {
    res.status(400).json({ message: "Error adding member", error })
  }
})

// Update a member
router.put("/:id", async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updatedMember)
  } catch (error) {
    res.status(400).json({ message: "Error updating member", error })
  }
})

// Delete a member
router.delete("/:id", async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id)
    res.json({ message: "Member deleted successfully" })
  } catch (error) {
    res.status(400).json({ message: "Error deleting member", error })
  }
});

// Transfer a member to alumni
router.post("/:id/transfer", (async (req, res) => { // Remove explicit RequestHandler typing *here*
  try {
      const { id } = req.params;
      const { yearCompleted } = req.body;

      if (!yearCompleted) {
          res.status(400).json({ message: "Year completed is required" }); // No return
          return; // Use return to stop execution
      }

      const member = await Member.findById(id);
      if (!member) {
          res.status(404).json({ message: "Member not found" }); // No return
          return; // Use return to stop execution
      }

      const newAlumnus = new Alumnus({
          name: member.name,
          phone: member.phone,
          email: member.email,
          program: member.program,
          voiceGroup: member.voiceGroup,
          yearCompleted,
      });

      const savedAlumnus = await Alumnus.create(newAlumnus);
      await Member.findByIdAndDelete(id);

      res.status(200).json({ message: "Member transferred to alumni successfully", alumnus: savedAlumnus }); // No return
  } catch (error) {
      console.error("Error transferring member to alumni:", error);
      res.status(500).json({ message: "Error transferring member to alumni", error }); // No return
  }
}) as RequestHandler<{ id: string }, any, { yearCompleted: string }>); // Keep the type assertion *here*

// Check and auto-transfer completed members
router.post("/check-graduation", (async (req, res) => {
  try {
    const members = await Member.find();
    const completedMembers = members.filter(member => member.hasCompletedStudies());
    
    if (completedMembers.length === 0) {
      return res.json({ message: "No members to transfer", transferred: 0 });
    }
    
    const transferredMembers = [];
    
    for (const member of completedMembers) {
      // Calculate the actual graduation year (July of final academic year)
      const finalAcademicYear = member.academicStartYear + member.studyDurationYears - 1;
      const graduationYear = finalAcademicYear + 1; // July is in the calendar year after academic year started
      
      const newAlumnus = new Alumnus({
        name: member.name,
        phone: member.phone,
        email: member.email,
        program: member.program,
        voiceGroup: member.voiceGroup,
        yearCompleted: graduationYear.toString(),
      });
      
      await Alumnus.create(newAlumnus);
      await Member.findByIdAndDelete(member._id);
      transferredMembers.push(member.name);
    }
    
    res.json({ 
      message: `Successfully transferred ${completedMembers.length} members to alumni`,
      transferred: completedMembers.length,
      memberNames: transferredMembers
    });
  } catch (error) {
    console.error("Error checking graduation:", error);
    res.status(500).json({ message: "Error checking graduation", error });
  }
}) as RequestHandler);

router.get("/count", (async (req, res) => {
  try {
      const count = await Member.countDocuments(); // Use countDocuments
      res.status(200).json({ count }); // Return the count in a JSON object
  } catch (error) {
      console.error("Error getting member count:", error);
      res.status(500).json({ message: "Error getting member count", error });
  }
}) as RequestHandler);


export default router

