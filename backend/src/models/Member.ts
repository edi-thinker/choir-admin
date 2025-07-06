// models/Member.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

// Define an interface representing a Member document
interface IMember extends Document {
  name: string;
  phone: string;
  email: string;
  program: string;
  voiceGroup: string;
}

const MemberSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  program: { type: String, required: true },
  voiceGroup: { type: String, required: true },
}, { timestamps: true });


const Member: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;