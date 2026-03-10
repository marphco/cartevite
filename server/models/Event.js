import mongoose from "mongoose";

const BlockSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true }, // es: "text", "image", "map", "rsvp"
    order: { type: Number, required: true },
    props: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const LayerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true, default: "text" },
    text: { type: String, default: "" },
    x: { type: mongoose.Schema.Types.Mixed, default: "center" },
    y: { type: mongoose.Schema.Types.Mixed, default: "center" },
    fontSize: { type: Number, default: 24 },
    fontFamily: { type: String, default: "sans-serif" },
    fontWeight: { type: String, default: "normal" },
    fontStyle: { type: String, default: "normal" },
    textDecoration: { type: String, default: "none" },
    letterSpacing: { type: Number, default: 0 },
    lineHeight: { type: Number, default: 1.2 },
    color: { type: String, default: "#000000" },
    textAlign: { type: String, default: "center" },
    width: { type: mongoose.Schema.Types.Mixed, default: "max-content" },
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    date: { type: Date },
    dateTBD: { type: Boolean, default: false },
    templateId: { type: String, default: "basic-free" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    canvas: {
      bgImage: { type: String, default: null },
      width: { type: Number, default: 800 },
      height: { type: Number, default: 1000 },
    },
    layers: { type: [LayerSchema], default: [] },
    blocks: { type: [BlockSchema], default: [] },
    theme: {
      type: new mongoose.Schema(
        {
          accent: { type: String, default: "#f4c46b" },
          background: { type: String, default: "#050506" },
          preset: { type: String, default: "noir" },
          fonts: {
            heading: { type: String, default: "Playfair Display" },
            body: { type: String, default: "Space Grotesk" },
          },
        },
        { _id: false }
      ),
      default: undefined,
    },
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", EventSchema);

export default Event;
