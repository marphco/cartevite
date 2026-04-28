import "./config/env.js"; // ✅ Critical: This MUST be the first import
import path from "path";
import fs from "fs";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import rsvpRoutes from "./routes/rsvpRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import uploadsRouter from "./routes/uploads.js";
import stripeConnectRoutes from "./routes/stripeConnectRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import stripeWebhookRoutes from "./routes/stripeWebhookRoutes.js";
import marketingRoutes from "./routes/marketingRoutes.js";

const app = express();

const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, origin?: any) => void) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1") || /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)) {
      return callback(null, origin);
    }
    if (allowedOrigins.includes(origin)) return callback(null, origin);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// ⚠️ CRITICAL: the Stripe webhook MUST receive the raw body to verify the signature.
// This route is mounted BEFORE express.json() so the body parser does not consume it.
app.use(
  "/api/stripe/webhooks",
  express.raw({ type: "application/json" }),
  stripeWebhookRoutes
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Minimal CSP-related headers for Stripe Embedded Components and Payment Element iframes.
// Note: a stricter CSP is applied client-side via Vite/index.html when needed.
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadsRouter);
app.use("/api/events", eventRoutes);
app.use("/api/events", inviteRoutes);
app.use("/api/rsvps", rsvpRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/stripe/connect", stripeConnectRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/marketing", marketingRoutes);

app.get("/", (req: Request, res: Response) => res.json({ message: "eenvee API is running" }));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("GLOBAL ERROR:", err);
  res.status(err.status || 500).json({ error: err.message || "Errore server" });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
};

startServer();
