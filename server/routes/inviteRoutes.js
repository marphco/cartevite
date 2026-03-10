import express from "express";
import Invite from "../models/Invite.js";
import Event from "../models/Event.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/:slug/invites", requireAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const existing = await Event.findOne({ slug });
    if (!existing) return res.status(404).json({ message: "Evento non trovato" });
    if (existing.ownerId.toString() !== req.userId) return res.status(403).json({ message: "Non autorizzato" });

    const invites = await Invite.find({ eventSlug: slug }).sort({ createdAt: -1 });
    res.json(invites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

router.post("/:slug/invites", requireAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const { contacts } = req.body; // Array di { name, phone, email, channel }

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ message: "contacts array mancante" });
    }

    const existing = await Event.findOne({ slug });
    if (!existing) return res.status(404).json({ message: "Evento non trovato" });
    if (existing.ownerId.toString() !== req.userId) return res.status(403).json({ message: "Non autorizzato" });

    const newInvites = contacts.map(c => ({
      eventSlug: slug,
      name: c.name,
      phone: c.phone,
      email: c.email,
      channel: c.channel || "whatsapp",
      status: "pending"
    }));

    const created = await Invite.insertMany(newInvites);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

router.post("/:slug/invites/send", requireAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const { inviteIds, messageTemplate } = req.body;
    
    // In futuro qui chiamerà messageDispatcher.js per ognuno
    await Invite.updateMany(
      { _id: { $in: inviteIds }, eventSlug: slug },
      { $set: { status: "sent", sentAt: new Date() } }
    );
    
    res.json({ message: "Inviti marcati come inviati (mock)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

export default router;
