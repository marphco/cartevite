import mongoose, { Schema, Document } from "mongoose";

export interface IProfessionalRequest extends Document {
  fullName: string;
  email: string;
  phone?: string;
  tier: string;
  status: "pending" | "contacted" | "activated" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ProfessionalRequestSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    tier: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "contacted", "activated", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProfessionalRequest>(
  "ProfessionalRequest",
  ProfessionalRequestSchema
);
