import express from "express";
import Event from "../models/Event.js";
import Rsvp from "../models/Rsvp.js";
import requireAuth from "../middleware/requireAuth.js";
import { getRsvpsSummary } from "../controllers/rsvpSummaryController.js";
import mongoose from "mongoose";
import crypto from "crypto";

const router = express.Router();

// helper slug
const slugify = (str) => {
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/* ============================
   ✅ CREATE EVENT (PROTECTED)
============================ */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, date, dateTBD, templateId, blocks, layers, canvas, plan } = req.body;

    if (!title)
      return res.status(400).json({ message: "title è obbligatorio" });

    let baseSlug = slugify(title) || "evento";

    if (date && !dateTBD) {
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        baseSlug = `${baseSlug}-${yyyy}${mm}${dd}`;
      }
    }

    let slug = baseSlug;
    let counter = 1;
    while (await Event.exists({ slug })) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }

    const event = await Event.create({
      title,
      slug,
      date: dateTBD ? null : date,
      dateTBD: !!dateTBD,
      templateId: templateId || "basic-free",
      status: "draft",
      blocks: blocks || [],
      layers: layers || [],
      canvas: canvas || {},
      plan: plan || "free",
      ownerId: req.userId,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Errore creazione evento:", error.message);
    res.status(500).json({ message: "Errore del server" });
  }
});

/* ============================
   ✅ DASHBOARD LIST (PROTECTED)
============================ */
router.get("/", requireAuth, async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.userId);

    const events = await Event.find({ ownerId }).sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error("Errore lista eventi:", error);
    res.status(500).json({ message: "Errore del server" });
  }
});

/* ============================
   ✅ PUBLIC EVENT PAGE (PUBLIC)
============================ */
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const event = await Event.findOne({ slug });

    if (!event) return res.status(404).json({ message: "Evento non trovato" });

    if (event.status !== "published") {
      return res.status(403).json({ message: "Evento non pubblicato" });
    }

    res.json(event);
  } catch (error) {
    console.error("Errore recupero evento:", error.message);
    res.status(500).json({ message: "Errore del server" });
  }
});

/* ============================
   ✅ EVENT PAGE (DRAFT)
============================ */
router.get("/:slug/private", requireAuth, async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug });
  if (!event) return res.status(404).json({ message: "Evento non trovato" });

  if (event.ownerId.toString() !== req.userId) {
    return res.status(403).json({ message: "Non autorizzato" });
  }

  res.json(event);
});

/* ============================
   ✅ EDIT EVENT (PROTECTED)
============================ */
router.put("/:slug", requireAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, date, dateTBD, templateId, status, blocks, plan, theme, layers, canvas } = req.body;

    const existing = await Event.findOne({ slug });
    if (!existing)
      return res.status(404).json({ message: "Evento non trovato" });

    // ✅ owner check
    if (existing.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorizzato" });
    }

    // ✅ plan (server truth)
    const realPlan = (plan || existing.plan || "free").toLowerCase();
    const isPremium = realPlan === "premium";

    // ✅ blocks safe
    let safeBlocks = Array.isArray(blocks) ? blocks : [];
    if (!isPremium) safeBlocks = safeBlocks.filter((b) => b.type !== "gallery");

    const update = {
      ...(title !== undefined && { title }),
      ...(templateId !== undefined && { templateId }),
      ...(status !== undefined && { status }),
      ...(blocks !== undefined && { blocks: safeBlocks }),
      ...(theme !== undefined && { theme }),
      ...(layers !== undefined && { layers }),
      ...(canvas !== undefined && { canvas }),

      // ✅ allow plan update ONLY if explicitly provided
      ...(plan !== undefined && { plan: realPlan }),
    };

    // data logic
    if (dateTBD === true) {
      update.dateTBD = true;
      update.date = null;
    } else if (dateTBD === false) {
      update.dateTBD = false;
      update.date = date || null;
    } else if (date) {
      update.dateTBD = false;
      update.date = date;
    }

    const updated = await Event.findOneAndUpdate({ slug }, update, {
      new: true,
    });

    res.json(updated);
  } catch (error) {
    console.error("Errore aggiornamento evento:", error.message);
    res.status(500).json({ message: "Errore del server" });
  }
});

/* ============================
   ✅ DELETE EVENT (PROTECTED)
============================ */
router.delete("/:slug", requireAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const existing = await Event.findOne({ slug });
    if (!existing)
      return res.status(404).json({ message: "Evento non trovato" });

    if (existing.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorizzato" });
    }

    await Event.deleteOne({ slug });
    res.json({ message: "Evento eliminato" });
  } catch (error) {
    console.error("Errore eliminazione evento:", error.message);
    res.status(500).json({ message: "Errore del server" });
  }
});

/* ============================
   ✅ RSVPs LIST (PROTECTED)
============================ */
router.get("/:slug/rsvps", requireAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const existing = await Event.findOne({ slug });
    if (!existing)
      return res.status(404).json({ message: "Evento non trovato" });

    if (existing.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorizzato" });
    }

    const rsvps = await Rsvp.find({ eventSlug: slug }).sort({ createdAt: -1 });
    res.json(rsvps);
  } catch (err) {
    console.error("Errore recupero rsvps:", err.message);
    res.status(500).json({ message: "Errore del server" });
  }
});

/* ============================
   ✅ ADD RSVP MANUAL (PROTECTED)
   POST /api/events/:slug/rsvps/manual
============================ */
router.post("/:slug/rsvps/manual", requireAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, guestsCount, status } = req.body;

    if (!name) return res.status(400).json({ message: "name obbligatorio" });

    // ✅ evento + owner check
    const existing = await Event.findOne({ slug });
    if (!existing)
      return res.status(404).json({ message: "Evento non trovato" });

    if (existing.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorizzato" });
    }

    // ✅ crea RSVP senza email/phone
    const created = await Rsvp.create({
      eventSlug: slug,
      name,
      guestsCount: Number(guestsCount) || 1,
      status: status || "yes",
      message: "",
      email: undefined,
      phone: undefined,
      editToken: crypto.randomBytes(24).toString("hex"),
      editTokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 anno fallback
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Errore add manual RSVP:", err.message);
    res.status(500).json({ message: "Errore server" });
  }
});

/* ============================
   ✅ SUMMARY (PROTECTED)
============================ */
router.get("/:slug/rsvps/summary", requireAuth, getRsvpsSummary);

export default router;
