import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import rsvpRoutes from "./routes/rsvpRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadsRouter from "./routes/uploads.js";

dotenv.config();

const app = express();

// ✅ CORS MUST be before routes
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

console.log("[CORS] allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      console.log("[CORS] request origin:", origin);

      // Allow localhost and local network IPs (192.168.x.x)
      if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1") || /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)) {
        return callback(null, origin);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }

      console.warn("[CORS] blocked origin", origin);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

import { sendEmail } from "./utils/emailService.js";

// ✅ parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ API di test email (da rimuovere in futuro)
app.post("/api/test-email", async (req, res) => {
  const { to } = req.body;
  
  if (!to) {
    return res.status(400).json({ error: "Manca l'indirizzo destinatario 'to'" });
  }

  const result = await sendEmail({
    to,
    subject: "Test da Cartevite Server 🚀",
    html: `
      <div style="font-family: sans-serif; padding: 20px; text-align: center;">
        <h2 style="color: #124d45;">Benvenuto a bordo!</h2>
        <p>Se stai leggendo questa email, il server SMTP di Gmail su Railway funziona perfettamente.</p>
        <p>Saluti,<br>Il Server Cartevite</p>
      </div>
    `,
  });

  if (result.success) {
    return res.json({ message: "Email inviata con successo", id: result.messageId });
  } else {
    return res.status(500).json({ error: "Errore invio email", details: result.error });
  }
});

// ✅ static uploads
const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadsRouter);
app.use("/api/events", eventRoutes);
app.use("/api/events", inviteRoutes); // registra sotto /api/events/:slug/invites
app.use("/api/rsvps", rsvpRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => res.json({ message: "CARTEVITE API is running" }));

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
};

// ✅ global error handler LAST
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(err.status || 500).json({
    error: err.message || "Errore server",
  });
});

startServer();
