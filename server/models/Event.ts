import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const blockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true }, // es: "text", "image", "map", "rsvp"
    order: { type: Number, default: 0 },
    x: { type: Schema.Types.Mixed },
    y: { type: Schema.Types.Mixed },
    width: { type: Schema.Types.Mixed },
    height: { type: Schema.Types.Mixed },
    props: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const layerSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true, default: "text" }, // "text", "image"
    text: { type: String, default: "" },
    src: { type: String, default: "" }, // Per i layer immagine
    x: { type: Schema.Types.Mixed, default: "center" },
    y: { type: Schema.Types.Mixed, default: "center" },
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
    width: { type: Schema.Types.Mixed, default: "max-content" }, // Deprecating or keeping for compat
  },
  { _id: false }
);

const themeSchema = new Schema(
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
);

const eventSchema = new Schema(
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
      bgX: { type: Number },
      bgY: { type: Number },
      bgScale: { type: Number },
      width: { type: Number, default: 800 },
      height: { type: Number, default: 1000 },
    },
    layers: { type: [layerSchema], default: [] },
    blocks: { type: [blockSchema], default: [] },
    theme: { type: themeSchema, default: undefined },
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export type IEvent = InferSchemaType<typeof eventSchema>;

export default mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);
