import mongoose from "mongoose";

const BlockSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true }, // es: "text", "image", "map", "rsvp"
    order: { type: Number, default: 0 },
    x: { type: mongoose.Schema.Types.Mixed },
    y: { type: mongoose.Schema.Types.Mixed },
    width: { type: mongoose.Schema.Types.Mixed },
    height: { type: mongoose.Schema.Types.Mixed },
    props: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const LayerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true, default: "text" }, // "text", "image"
    text: { type: String, default: "" },
    src: { type: String, default: "" }, // Per i layer immagine
    x: { type: mongoose.Schema.Types.Mixed, default: "center" },
    y: { type: mongoose.Schema.Types.Mixed, default: "center" },
    w: { type: Number }, // Larghezza per immagini
    h: { type: Number }, // Altezza per immagini
    z: { type: Number, default: 1 },
    fontSize: { type: Number, default: 24 },
    fontFamily: { type: String, default: "sans-serif" },
    fontWeight: { type: String, default: "normal" },
    fontStyle: { type: String, default: "normal" },
    textDecoration: { type: String, default: "none" },
    letterSpacing: { type: Number, default: 0 },
    lineHeight: { type: Number, default: 1.2 },
    color: { type: String, default: "#000000" },
    textAlign: { type: String, default: "center" },
    opacity: { type: Number, default: 1 },
    lockRatio: { type: Boolean, default: false },
    width: { type: mongoose.Schema.Types.Mixed, default: "max-content" }, // Deprecating or keeping for compat
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
      bgColor: { type: String, default: "#ffffff" },
      bgX: { type: Number, default: 0 },
      bgY: { type: Number, default: 0 },
      bgScale: { type: Number, default: 1 },
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
          // Scenario params
          heroBg: { type: String, default: null },
          heroBgColor: { type: String, default: "var(--bg-body)" },
          heroBgOpacity: { type: Number, default: 1 },
          heroBgPosition: { type: String, default: "center" },
          // Envelope params
          envelopeFormat: { type: String, default: "vertical" },
          coverBg: { type: String, default: "#54392d" },
          coverPocketColor: { type: String, default: null },
          coverLiner: { type: String, default: null },
          coverPocketLiner: { type: String, default: null },
          coverLinerColor: { type: String, default: "#ffffff" },
          coverText: { type: String, default: "" },
          // Liner detailed control
          linerX: { type: Number, default: 0 },
          linerY: { type: Number, default: 0 },
          linerScale: { type: Number, default: 1 },
          linerOpacity: { type: Number, default: 1 }
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
