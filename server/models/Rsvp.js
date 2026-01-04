import mongoose from "mongoose";

const RsvpSchema = new mongoose.Schema(
  {
    eventSlug: { type: String, required: true, index: true },

    name: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },

    guestsCount: { type: Number, default: 1 },
    message: { type: String, default: "" },

    status: {
      type: String,
      enum: ["yes", "no", "maybe"],
      default: "yes",
    },

    editToken: { type: String, required: true, index: true },
    editTokenExpiresAt: { type: Date, required: true, index: true }, // ✅ scadenza token
  },
  { timestamps: true }
);

// ✅ blocco doppioni per email o phone nello stesso evento
RsvpSchema.index(
  { eventSlug: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);

RsvpSchema.index(
  { eventSlug: 1, phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } }
);

export default mongoose.model("Rsvp", RsvpSchema);
