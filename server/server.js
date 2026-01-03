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
import uploadsRouter from "./routes/uploads.js";

dotenv.config();

const app = express();

// ✅ CORS MUST be before routes
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ static uploads
const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadsRouter);
app.use("/api/events", eventRoutes);
app.use("/api/rsvps", rsvpRoutes);

app.get("/", (req, res) => res.json({ message: "YNVIO API is running" }));

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
