import mongoose, { Schema, InferSchemaType } from "mongoose";

/**
 * Schema di una risposta personalizzata a una domanda custom del modulo RSVP.
 * Denormalizzato di proposito: salviamo `label` e `type` al momento dell'invio,
 * così se il creatore dell'evento rinomina/cambia una domanda, la storia delle
 * risposte già inviate resta coerente con quello che l'ospite ha effettivamente letto.
 */
const customResponseSchema = new Schema(
  {
    fieldId: { type: String, required: true },
    label:   { type: String, required: true },
    type:    { type: String, enum: ["text", "checkbox"], default: "text" },
    answer:  { type: Schema.Types.Mixed }, // string | boolean | null
  },
  { _id: false }
);

const allergiesPersonSchema = new Schema(
  {
    name: { type: String, default: "" },
    allergies: { type: String, default: "" },
  },
  { _id: false }
);

const allergiesDetailSchema = new Schema(
  {
    mode: { type: String, enum: ["whole_party", "by_person"], required: true },
    wholePartyText: { type: String, default: "" },
    people: { type: [allergiesPersonSchema], default: [] },
  },
  { _id: false }
);

const rsvpSchema = new Schema(
  {
    eventSlug: { type: String, required: true, index: true },

    name: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },

    guestsCount: { type: Number, default: 1 },
    message: { type: String, default: "" },

    /** ✅ Campo dedicato per allergie/intolleranze (separato da `message` per export catering). */
    allergies: { type: String, default: "" },

    /** Dettaglio strutturato (tutti gli ospiti vs persone nominate); `allergies` resta la stringa “flat” per export. */
    allergiesDetail: { type: allergiesDetailSchema, required: false },

    /** ✅ Risposte alle domande personalizzate configurate nel widget RSVP. */
    customResponses: { type: [customResponseSchema], default: [] },

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
rsvpSchema.index(
  { eventSlug: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);

rsvpSchema.index(
  { eventSlug: 1, phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } }
);

export type IRsvp = InferSchemaType<typeof rsvpSchema>;

export default mongoose.model<IRsvp>("Rsvp", rsvpSchema);
