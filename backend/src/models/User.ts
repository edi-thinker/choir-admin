// backend/src/models/User.ts
import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: {
    type: String,
    required: true,
    enum: ["chairperson", "financial"], 
    default: "chairperson", 
  },
}, { timestamps: true });

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
    if(!this.isModified('password')) {
        return next()
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;