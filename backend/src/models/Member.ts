// models/Member.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

// Define an interface representing a Member document
interface IMember extends Document {
  name: string;
  phone: string;
  email: string;
  program: string;
  voiceGroup: string;
  academicStartYear: number;
  studyDurationYears: number;
  getCurrentAcademicYear(): number;
  hasCompletedStudies(): boolean;
  getExpectedGraduationYear(): number;
}

// Helper function to calculate current academic year
function getCurrentAcademicYear(startYear: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  // Academic year starts in October (month 10)
  // If we're in Jan-July, we're still in the academic year that started in the previous calendar year
  // If we're in Aug-Dec, we're in the academic year that starts in the current calendar year
  
  let academicStartYear: number;
  if (currentMonth >= 10) {
    // October or later - current academic year started this calendar year
    academicStartYear = currentYear;
  } else {
    // January to September - current academic year started last calendar year
    academicStartYear = currentYear - 1;
  }
  
  return academicStartYear - startYear + 1;
}

const MemberSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  program: { type: String, required: true },
  voiceGroup: { type: String, required: true },
  academicStartYear: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v: number) {
        const currentYear = new Date().getFullYear();
        return v >= 2000 && v <= currentYear + 1; // Reasonable year range
      },
      message: 'Academic start year must be between 2000 and next year'
    }
  },
  studyDurationYears: { 
    type: Number, 
    required: true,
    min: 1,
    max: 10,
    default: 3
  },
}, { timestamps: true });

// Add instance methods
MemberSchema.methods.getCurrentAcademicYear = function(): number {
  return getCurrentAcademicYear(this.academicStartYear);
};

MemberSchema.methods.hasCompletedStudies = function(): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Calculate the year when studies should end (July of final academic year)
  const finalAcademicYear = this.academicStartYear + this.studyDurationYears - 1;
  const graduationYear = finalAcademicYear + 1; // July is in the calendar year after academic year started
  
  // If we're past July of the graduation year, studies are completed
  if (currentYear > graduationYear) {
    return true;
  }
  
  // If we're in the graduation year and past July (month 7), studies are completed
  if (currentYear === graduationYear && currentMonth > 7) {
    return true;
  }
  
  return false;
};

MemberSchema.methods.getExpectedGraduationYear = function(): number {
  return this.academicStartYear + this.studyDurationYears - 1;
};

const Member: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;