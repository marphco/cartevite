import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import Stripe from "stripe";
import Event from "../models/Event.js";
import requireAuth, { AuthRequest } from "../middleware/requireAuth.js";
import { getStripe, isStripeConfigured } from "../utils/stripeClient.js";
import { isPaidPlan } from "../utils/eventPlan.js";
import { validateInvoiceForIntent } from "../utils/invoiceIntentPayload.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_123", { apiVersion: "2023-10-16" as any });

const unlockIntentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Troppe richieste. Riprova fra un minuto." },
});

/** €69 una tantum — listino commerciale (roadmap / business plan 2026-04) */
const EVENT_UNLOCK_AMOUNT_CENTS = 6900;

function clientOrigin(): string {
  const raw = process.env.CLIENT_ORIGINS || "http://localhost:5173";
  return raw.split(",")[0]?.trim() || "http://localhost:5173";
}

function useMockCheckout(): boolean {
  const k = process.env.STRIPE_SECRET_KEY || "";
  return !k || k.includes("mock");
}

const receiptEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/subscriptions/create-unlock-intent
 * PaymentIntent piattaforma (come donazioni: Elements + conferma lato client).
 */
router.post("/create-unlock-intent", requireAuth, unlockIntentLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { eventSlug, receiptEmail: rawReceipt, payerName: rawPayer } = req.body as {
      eventSlug?: string;
      receiptEmail?: string;
      payerName?: string;
    };
    if (!eventSlug || typeof eventSlug !== "string") {
      return res.status(400).json({ message: "eventSlug richiesto" });
    }

    const payerName =
      typeof rawPayer === "string" ? rawPayer.trim().slice(0, 120) : "";
    if (!payerName) {
      return res.status(400).json({ message: "Nome richiesto" });
    }

    const receiptEmail =
      typeof rawReceipt === "string" ? rawReceipt.trim().toLowerCase().slice(0, 200) : "";
    if (!receiptEmail || !receiptEmailRegex.test(receiptEmail)) {
      return res.status(400).json({ message: "Email per la ricevuta non valida" });
    }

    const inv = validateInvoiceForIntent(req.body as Record<string, unknown>);
    if (!inv.ok) return res.status(400).json({ message: inv.message });

    const ev = await Event.findOne({ slug: eventSlug });
    if (!ev) return res.status(404).json({ message: "Event Not Found" });
    if (ev.ownerId.toString() !== req.userId) return res.status(403).json({ message: "Forbidden" });
    if (isPaidPlan(ev.plan)) return res.status(400).json({ message: "L'evento risulta già attivato (pagamento registrato)." });

    if (useMockCheckout()) {
      if (process.env.NODE_ENV === "production") {
        return res.status(503).json({ message: "Pagamenti non configurati." });
      }
      return res.json({
        mode: "dev_simulate" as const,
        simulatePath: `/api/subscriptions/${encodeURIComponent(eventSlug)}/success-mock`,
      });
    }

    if (!isStripeConfigured()) {
      return res.status(503).json({
        message: "Servizio pagamenti non disponibile.",
        code: "STRIPE_UNAVAILABLE",
      });
    }

    const stripeSdk = getStripe();
    const idempotencyKey = crypto.randomUUID();

    const pi = await stripeSdk.paymentIntents.create(
      {
        amount: EVENT_UNLOCK_AMOUNT_CENTS,
        currency: "eur",
        payment_method_types: ["card", "sepa_debit"],
        receipt_email: receiptEmail,
        metadata: {
          kind: "event_unlock",
          eventSlug,
          ownerId: String(req.userId),
          payer_name: payerName,
          receipt_email: receiptEmail,
          ...inv.metadata,
        },
        description: `Eenvee — Piano Evento — ${ev.title} (${eventSlug})`,
      },
      { idempotencyKey }
    );

    if (!pi.client_secret) {
      return res.status(500).json({ message: "Stripe non ha restituito il client secret" });
    }

    return res.json({
      mode: "elements" as const,
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/subscriptions/complete-unlock-intent
 * Dopo confirmPayment sul client: verifica PI e imposta plan `paid` (piano Evento).
 */
router.post("/complete-unlock-intent", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (useMockCheckout() || !isStripeConfigured()) {
      return res.status(400).json({ message: "Operazione non disponibile in questa configurazione" });
    }

    const { paymentIntentId } = req.body as { paymentIntentId?: string };
    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return res.status(400).json({ message: "paymentIntentId richiesto" });
    }

    const stripeSdk = getStripe();
    const pi = await stripeSdk.paymentIntents.retrieve(paymentIntentId);

    if (pi.metadata?.kind !== "event_unlock") {
      return res.status(400).json({ message: "Pagamento non valido" });
    }
    if (pi.metadata.ownerId !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const eventSlug = pi.metadata.eventSlug;
    if (!eventSlug) {
      return res.status(400).json({ message: "Metadati incompleti" });
    }
    if (pi.amount !== EVENT_UNLOCK_AMOUNT_CENTS || (pi.currency && pi.currency.toLowerCase() !== "eur")) {
      return res.status(400).json({ message: "Importo non valido" });
    }

    if (pi.status !== "succeeded" && pi.status !== "processing") {
      return res.status(400).json({ message: "Pagamento non completato" });
    }

    const ev = await Event.findOne({ slug: eventSlug });
    if (!ev) return res.status(404).json({ message: "Evento non trovato" });
    if (ev.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (isPaidPlan(ev.plan)) {
      // Le ricevute email partono solo dal webhook `payment_intent.succeeded` (idempotente), altrimenti doppio invio con questa route.
      return res.json({ ok: true, slug: eventSlug, alreadyPaid: true });
    }

    ev.plan = "paid";
    await ev.save();

    return res.json({ ok: true, slug: eventSlug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/checkout", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { eventSlug } = req.body as { eventSlug?: string };
    if (!eventSlug || typeof eventSlug !== "string") {
      return res.status(400).json({ message: "eventSlug richiesto" });
    }

    const ev = await Event.findOne({ slug: eventSlug });
    if (!ev) return res.status(404).json({ message: "Event Not Found" });
    if (ev.ownerId.toString() !== req.userId) return res.status(403).json({ message: "Forbidden" });
    if (isPaidPlan(ev.plan)) return res.status(400).json({ message: "L'evento risulta già attivato (pagamento registrato)." });

    if (useMockCheckout()) {
      const sessionUrl = `/api/subscriptions/${eventSlug}/success-mock`;
      return res.json({ url: sessionUrl, mode: "mock" as const });
    }

    const origin = clientOrigin();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: EVENT_UNLOCK_AMOUNT_CENTS,
            product_data: {
              name: "Eenvee — Piano Evento (69 €)",
              description: `${ev.title} (${eventSlug})`,
            },
          },
        },
      ],
      metadata: {
        kind: "event_unlock",
        eventSlug,
        ownerId: String(req.userId),
      },
      client_reference_id: `${eventSlug}:${req.userId}`,
      success_url: `${origin}/dashboard?unlock=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
    });

    if (!session.url) {
      return res.status(500).json({ message: "Stripe non ha restituito l'URL di checkout" });
    }

    return res.json({ url: session.url, mode: "stripe" as const });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Dopo redirect Stripe: il client invia session_id; verifichiamo il pagamento e aggiorniamo l'evento.
 */
router.post("/complete-checkout", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (useMockCheckout()) {
      return res.status(400).json({ message: "Checkout Stripe non configurato" });
    }

    const { sessionId } = req.body as { sessionId?: string };
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ message: "sessionId richiesto" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.kind !== "event_unlock") {
      return res.status(400).json({ message: "Sessione non valida" });
    }
    if (session.metadata.ownerId !== req.userId) {
      return res.status(403).json({ message: "Sessione di un altro utente" });
    }

    const eventSlug = session.metadata.eventSlug;
    if (!eventSlug) {
      return res.status(400).json({ message: "Sessione senza evento" });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Pagamento non completato" });
    }

    const ev = await Event.findOne({ slug: eventSlug });
    if (!ev) return res.status(404).json({ message: "Evento non trovato" });
    if (ev.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (isPaidPlan(ev.plan)) {
      return res.json({ ok: true, slug: eventSlug, alreadyPaid: true });
    }

    ev.plan = "paid";
    await ev.save();

    return res.json({ ok: true, slug: eventSlug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:slug/success-mock", async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).send("Not found");
  }
  try {
    const { slug } = req.params;
    await Event.findOneAndUpdate({ slug }, { plan: "paid" }, { new: true });
    res.redirect(`${clientOrigin()}/edit/${slug}?payment=success`);
  } catch (err) {
    res.status(500).send("Mock success err");
  }
});

export default router;
