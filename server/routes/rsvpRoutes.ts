import express, { Request, Response } from "express";
import crypto from "crypto";
import Rsvp from "../models/Rsvp.js";
import Event from "../models/Event.js";
import requireAuth, { AuthRequest } from "../middleware/requireAuth.js";

const router = express.Router();

/* ======================================
   ✅ Helper: normalizza `customResponses` in un array
   [{ fieldId, label, type, answer }].
   Accetta due forme:
     - array già strutturato (nuovo widget)
     - oggetto { fieldId: answer } (vecchi client / retro-compat)
   Ritorna:
     - array normalizzato
     - `null` se il caller non ha inviato nulla (→ non toccare il record)
===================================== */
function normalizeCustomResponses(input: any): Array<{ fieldId: string; label: string; type: string; answer: any }> | null {
  if (input === undefined || input === null) return null;

  if (Array.isArray(input)) {
    return input
      .filter((r: any) => r && (r.fieldId || r.id))
      .map((r: any) => ({
        fieldId: String(r.fieldId ?? r.id ?? ""),
        label: String(r.label ?? r.fieldId ?? r.id ?? "Domanda"),
        type: r.type === "checkbox" ? "checkbox" : "text",
        answer: r.answer ?? null,
      }));
  }

  if (typeof input === "object") {
    // formato legacy: { "<fieldId>": "answer" }
    return Object.keys(input).map((k) => ({
      fieldId: k,
      label: k,
      type: "text",
      answer: input[k] ?? null,
    }));
  }

  return [];
}

type AllergiesDetailDoc = {
  mode: "whole_party" | "by_person";
  wholePartyText: string;
  people: { name: string; allergies: string }[];
} | null;

function normalizeAllergiesFromHttpBody(
  body: { allergies?: string; allergiesDetail?: any },
  guestsCount: number,
  status: string
): { allergies: string; allergiesDetail: AllergiesDetailDoc } {
  const n = Math.max(1, Math.floor(Number(guestsCount)) || 1);
  if (status === "no") {
    return { allergies: "", allergiesDetail: null };
  }

  const d = body.allergiesDetail;
  if (d && typeof d === "object" && (d.mode === "whole_party" || d.mode === "by_person")) {
    if (d.mode === "whole_party") {
      const text = String(d.wholePartyText || "").trim();
      if (!text) return { allergies: "", allergiesDetail: null };
      if (n < 2) {
        return {
          allergies: text,
          allergiesDetail: { mode: "by_person", wholePartyText: "", people: [{ name: "", allergies: text }] },
        };
      }
      return {
        allergies: `Tutti gli ${n} ospiti dichiarati: ${text}`,
        allergiesDetail: { mode: "whole_party", wholePartyText: text, people: [] },
      };
    }
    const people = (Array.isArray(d.people) ? d.people : [])
      .map((p: any) => ({
        name: String(p?.name || "").trim(),
        allergies: String(p?.allergies || "").trim(),
      }))
      .filter((p: { allergies: string }) => p.allergies.length > 0);
    if (people.length === 0) return { allergies: "", allergiesDetail: null };
    const allergies = people
      .map((p: { name: string; allergies: string }) => (p.name ? `${p.name}: ${p.allergies}` : p.allergies))
      .join(" · ");
    return {
      allergies,
      allergiesDetail: { mode: "by_person", wholePartyText: "", people },
    };
  }

  const legacy = String(body.allergies ?? "").trim();
  if (!legacy) return { allergies: "", allergiesDetail: null };
  return { allergies: legacy, allergiesDetail: null };
}

function applyAllergiesToRsvp(rsvp: any, body: any, guestsCount: number, status: string) {
  const norm = normalizeAllergiesFromHttpBody(body, guestsCount, status);
  rsvp.allergies = norm.allergies;
  if (norm.allergiesDetail === null) rsvp.set("allergiesDetail", undefined);
  else rsvp.allergiesDetail = norm.allergiesDetail;
}

/* ======================================
   ✅ Helper: calcola scadenza token = giorno evento (23:59)
===================================== */
function tokenExpiryFromEvent(event: any) {
  // se evento senza data (dateTBD o null) → scade in 30 giorni (fallback)
  if (!event?.date) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  }

  const exp = new Date(event.date);
  exp.setHours(23, 59, 59, 999);
  return exp;
}

/* ======================================
   ✅ PUBLIC: CREATE OR UPDATE (UPSERT)
   POST /api/rsvps
====================================== */
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      eventSlug,
      name,
      email,
      phone,
      guestsCount,
      message,
      status,
      customResponses,
    } = req.body;

    if (!eventSlug || !name) {
      return res
        .status(400)
        .json({ message: "eventSlug e name sono obbligatori" });
    }

    // ✅ normalizza customResponses: accetta sia array [{fieldId,label,type,answer}]
    //    sia vecchi payload oggetto {fieldId: answer} (retro-compat).
    const normalizedCustomResponses = normalizeCustomResponses(customResponses);

    // ✅ cerchiamo se esiste già una RSVP per questo evento con stessa email o phone
    const hasIdentifier =
      (email && String(email).trim() !== "") ||
      (phone && String(phone).trim() !== "");

    let existing = null;

    // ✅ cerchiamo un record SOLO se abbiamo almeno uno tra email o phone
    if (hasIdentifier) {
      const normalizedEmail = email ? email.toLowerCase().trim() : null;
      const normalizedPhone = phone ? phone.trim() : null;

      existing = await Rsvp.findOne({
        eventSlug,
        $or: [
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ],
      });
    }

    // ✅ se esiste → aggiorniamo (UPDATE)
    if (existing) {
      existing.name = name;
      existing.email = email ? email.toLowerCase().trim() : existing.email;
      existing.phone = phone ? phone.trim() : existing.phone;
      existing.guestsCount = guestsCount ?? existing.guestsCount;
      existing.message = message ?? existing.message;
      existing.status = status || existing.status;

      const mergedGc = Number(existing.guestsCount) || 1;
      const mergedSt = (existing.status || "yes") as string;
      if (mergedSt === "no") {
        applyAllergiesToRsvp(existing, { allergies: "", allergiesDetail: null }, mergedGc, "no");
      } else if (
        Object.prototype.hasOwnProperty.call(req.body, "allergies") ||
        Object.prototype.hasOwnProperty.call(req.body, "allergiesDetail")
      ) {
        applyAllergiesToRsvp(existing, req.body, mergedGc, mergedSt);
      }

      if (normalizedCustomResponses !== null) existing.customResponses = normalizedCustomResponses as any;

      // ✅ refresh scadenza token fino al giorno evento
      const event = await Event.findOne({ slug: eventSlug }).select(
        "date dateTBD"
      );
      existing.editTokenExpiresAt = tokenExpiryFromEvent(event);

      await existing.save();

      return res.status(200).json({
        updated: true,
        rsvp: existing,
      });
    }

    // ✅ se non esiste → creiamo (CREATE)

    const token = crypto.randomBytes(24).toString("hex");

    // ✅ prendiamo data evento per calcolare scadenza token
    const event = await Event.findOne({ slug: eventSlug }).select(
      "date dateTBD"
    );
    const expiresAt = tokenExpiryFromEvent(event);

    const gcNew = Number(guestsCount) || 1;
    const stNew = (status || "yes") as string;
    const normNew = normalizeAllergiesFromHttpBody(req.body, gcNew, stNew);

    const created = await Rsvp.create({
      eventSlug,
      name,
      email,
      phone,
      guestsCount,
      message,
      allergies: normNew.allergies,
      ...(normNew.allergiesDetail ? { allergiesDetail: normNew.allergiesDetail } : {}),
      customResponses: normalizedCustomResponses || [],
      status: status || "yes",
      editToken: token,
      editTokenExpiresAt: expiresAt,
    });

    return res.status(201).json({
      updated: false,
      rsvp: created,
    });
  } catch (error: any) {
    console.error("Errore creazione RSVP:", error.message);
    res.status(500).json({ message: "Errore del server" });
  }
});

/* ======================================
   ✅ PUBLIC: LOOKUP RSVP (email/phone)
   POST /api/rsvps/lookup
====================================== */
router.post("/lookup", async (req: Request, res: Response) => {
  try {
    const { eventSlug, email, phone } = req.body;

    if (!eventSlug) {
      return res.status(400).json({ message: "eventSlug obbligatorio" });
    }
    if (!email && !phone) {
      return res.status(400).json({ message: "email o phone obbligatori" });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    const normalizedPhone = phone ? phone.trim() : null;

    const existing = await Rsvp.findOne({
      eventSlug,
      $or: [
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
      ],
    });

    if (!existing) return res.json({ found: false });

    // ✅ controlla scadenza token
    if (existing.editTokenExpiresAt && existing.editTokenExpiresAt < new Date()) {
      return res.json({ found: false, expired: true });
    }

    return res.json({
      found: true,
      editLink: `/rsvp/edit/${existing.editToken}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

/* ======================================
   ✅ PUBLIC: GET RSVP BY TOKEN
   GET /api/rsvps/edit/:token
====================================== */
router.get("/edit/:token", async (req: Request, res: Response) => {
  try {
    const rsvp = await Rsvp.findOne({ editToken: req.params.token });
    if (!rsvp) return res.status(404).json({ message: "Token non valido" });

    if (rsvp.editTokenExpiresAt && rsvp.editTokenExpiresAt < new Date()) {
      return res.status(403).json({ message: "Token scaduto" });
    }

    res.json(rsvp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

/* ======================================
   ✅ PUBLIC: UPDATE RSVP BY TOKEN
   PUT /api/rsvps/edit/:token
====================================== */
router.put("/edit/:token", async (req: Request, res: Response) => {
  try {
    const { name, guestsCount, status, message, email, phone, customResponses } = req.body;

    const rsvp = await Rsvp.findOne({ editToken: req.params.token });
    if (!rsvp) return res.status(404).json({ message: "Token non valido" });

    if (rsvp.editTokenExpiresAt && rsvp.editTokenExpiresAt < new Date()) {
      return res.status(403).json({ message: "Token scaduto" });
    }

    rsvp.name = name ?? rsvp.name;
    rsvp.guestsCount = guestsCount ?? rsvp.guestsCount;
    rsvp.status = status ?? rsvp.status;
    rsvp.message = message ?? rsvp.message;

    const mergedGc = Number(rsvp.guestsCount) || 1;
    const mergedSt = (rsvp.status || "yes") as string;
    if (mergedSt === "no") {
      applyAllergiesToRsvp(rsvp, { allergies: "", allergiesDetail: null }, mergedGc, "no");
    } else if (
      Object.prototype.hasOwnProperty.call(req.body, "allergies") ||
      Object.prototype.hasOwnProperty.call(req.body, "allergiesDetail")
    ) {
      applyAllergiesToRsvp(rsvp, req.body, mergedGc, mergedSt);
    }

    const normalized = normalizeCustomResponses(customResponses);
    if (normalized !== null) rsvp.customResponses = normalized as any;

    if (email) rsvp.email = email.toLowerCase().trim();
    if (phone) rsvp.phone = phone.trim();

    await rsvp.save();
    res.json(rsvp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

/* ======================================
   ✅ PROTECTED: OWNER UPDATE RSVP BY ID
====================================== */
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const rsvp = await Rsvp.findById(req.params.id);
    if (!rsvp) return res.status(404).json({ message: "RSVP non trovata" });

    // ✅ check owner via eventSlug
    const event = await Event.findOne({ slug: rsvp.eventSlug }).select(
      "ownerId"
    );
    if (!event) return res.status(404).json({ message: "Evento non trovato" });

    if (event.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorizzato" });
    }

    const { name, guestsCount, status, message, customResponses, email, phone } = req.body;

    if (name !== undefined) rsvp.name = name;
    if (guestsCount !== undefined) rsvp.guestsCount = guestsCount;
    if (status !== undefined) rsvp.status = status;
    if (message !== undefined) rsvp.message = message;

    const mergedGcPut = Number(rsvp.guestsCount) || 1;
    const mergedStPut = (rsvp.status || "yes") as string;
    if (mergedStPut === "no") {
      applyAllergiesToRsvp(rsvp, { allergies: "", allergiesDetail: null }, mergedGcPut, "no");
    } else if (
      Object.prototype.hasOwnProperty.call(req.body, "allergies") ||
      Object.prototype.hasOwnProperty.call(req.body, "allergiesDetail")
    ) {
      applyAllergiesToRsvp(rsvp, req.body, mergedGcPut, mergedStPut);
    }

    // Email / phone sono opzionali anche lato owner. Usiamo `undefined` (non "")
    // per rimuoverli: il partial-unique-index su `email`/`phone` scatta solo per
    // valori di tipo string, quindi `""` confliggerebbe fra più RSVP "senza email".
    if (email !== undefined) {
      const v = String(email || "").toLowerCase().trim();
      rsvp.email = v || (undefined as any);
    }
    if (phone !== undefined) {
      const v = String(phone || "").trim();
      rsvp.phone = v || (undefined as any);
    }

    const normalized = normalizeCustomResponses(customResponses);
    if (normalized !== null) rsvp.customResponses = normalized as any;

    await rsvp.save();
    res.json(rsvp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore update RSVP" });
  }
});

/* ======================================
   ✅ PROTECTED: OWNER DELETE RSVP BY ID
====================================== */
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const rsvp = await Rsvp.findById(req.params.id);
    if (!rsvp) return res.status(404).json({ message: "RSVP non trovata" });

    const event = await Event.findOne({ slug: rsvp.eventSlug }).select(
      "ownerId"
    );
    if (!event) return res.status(404).json({ message: "Evento non trovato" });

    if (event.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorizzato" });
    }

    await Rsvp.deleteOne({ _id: rsvp._id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore delete RSVP" });
  }
});

export default router;
