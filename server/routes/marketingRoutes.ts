import express, { Request, Response } from "express";
import ProfessionalRequest from "../models/ProfessionalRequest.js";
import { sendProfessionalLeadNotification, sendProfessionalWelcomeEmail } from "../utils/marketingEmails.js";

const router = express.Router();

router.post("/professional-request", async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, tier } = req.body;

    if (!fullName || !email || !tier) {
      return res.status(400).json({ message: "Dati mancanti" });
    }

    // 1. Salva nel database
    const newRequest = new ProfessionalRequest({
      fullName,
      email,
      phone,
      tier,
    });
    await newRequest.save();

    // 2. Invia email all'admin e conferma all'utente (Design Premium)
    await Promise.all([
      sendProfessionalLeadNotification({ fullName, email, phone, tier }),
      sendProfessionalWelcomeEmail({ fullName, email, tier })
    ]);

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Professional Request Error:", err);
    res.status(500).json({ message: "Errore durante l'invio della richiesta" });
  }
});

export default router;
