import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
  {
    eventSlug: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    channel: { type: String, enum: ["whatsapp", "email", "sms"], default: "whatsapp" },
    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Invite || mongoose.model("Invite", inviteSchema);
