import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: false }, // Optional for SSO users
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
