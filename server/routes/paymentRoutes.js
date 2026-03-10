import express from "express";
import Stripe from "stripe";
import Event from "../models/Event.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();
// Usa una secret key dummy per lo sviluppo
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_123", { apiVersion: "2023-10-16" });

router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const { eventSlug } = req.body;
    
    // Auth validation handled by requireAuth
    const ev = await Event.findOne({ slug: eventSlug });
    if (!ev) return res.status(404).json({ message: "Event Not Found" });
    if (ev.ownerId.toString() !== req.userId) return res.status(403).json({ message: "Forbidden" });
    if (ev.plan === "premium") return res.status(400).json({ message: "Already premium" });

    // Checkout Session (mockup for prototype if no real key)
    const sessionUrl = `/api/events/${eventSlug}/payments/success-mock`;

    res.json({ url: sessionUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mock rotte fallback success per dev locale
router.get("/:slug/payments/success-mock", async (req, res) => {
   try {
     const { slug } = req.params;
     const ev = await Event.findOneAndUpdate(
       { slug },
       { plan: "premium" },
       { new: true }
     );
     // Reindirizza al client
     res.redirect(`${process.env.CLIENT_ORIGINS?.split(",")[0] || "http://localhost:5173"}/edit/${slug}?payment=success`);
   } catch (err) {
     res.status(500).send("Mock success err");
   }
});

export default router;
