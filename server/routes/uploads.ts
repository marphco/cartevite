import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Upload } from "@aws-sdk/lib-storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import Event from "../models/Event.js";
import { isPaidPlan } from "../utils/eventPlan.js";
import { getR2Client } from "../utils/r2.js";

const router = express.Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isImage = file.mimetype && file.mimetype.startsWith("image/");
  if (!isImage) return cb(new Error("Puoi caricare solo immagini."));
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 20,
  },
});

/**
 * Upload dedicato per file video locali (mp4/webm/mov/…):
 * - filtro MIME separato da quello immagini (`video/*`)
 * - fileSize molto più alto (200 MB) per consentire clip di qualche minuto
 * - singolo file per request (il widget accetta un solo video per sezione)
 *
 * Risposta: `{ url: string }` (non `urls[]` come per /uploads, così il client
 * non deve destrutturare array per una sorgente singola).
 */
const videoFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isVideo = file.mimetype && file.mimetype.startsWith("video/");
  if (!isVideo) return cb(new Error("Puoi caricare solo file video."));
  cb(null, true);
};
const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB — ragionevole per clip brevi "vlog-style"
    files: 1,
  },
});

const requirePaidForGalleryUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: "Missing slug" });

    // Consenti l'upload libero nella modalità demo/template (senza evento DB associato)
    if (slug === "demo") return next();

    const ev = await Event.findOne({ slug: slug as string });
    if (!ev) return res.status(404).json({ error: "Evento non trovato" });

    // In sviluppo sempre ok; in produzione serve piano Evento (pagato).
    if (!isPaidPlan(ev.plan) && process.env.NODE_ENV === "production") {
      return res.status(403).json({ error: "Caricamento galleria e video disponibile con il piano Evento (69 €)." });
    }

    next();
  } catch (err) {
    next(err);
  }
};

// Caricamento Immagini
router.post(
  "/",
  requirePaidForGalleryUpload as any,
  upload.array("images", 20),
  async (req: Request, res: Response) => {
    try {
      const files = (req as any).files as Express.Multer.File[] || [];
      const { slug, folder: customFolder } = req.query;
      const urls: string[] = [];

      const r2Config = {
        bucketName: process.env.R2_BUCKET_NAME,
        publicUrl: process.env.R2_PUBLIC_URL
      };

      const isR2Ready = !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ENDPOINT && r2Config.bucketName);

      if (isR2Ready) {
        const client = getR2Client();
        
        // Determina la cartella di destinazione
        let folder = "temp";
        if (customFolder === "templates") {
          folder = "templates";
        } else if (slug) {
          folder = `events/${slug}`;
        }

        const uploadPromises = files.map(async (file) => {
          const ext = path.extname(file.originalname);
          const key = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

          const s3Upload = new Upload({
            client,
            params: {
              Bucket: r2Config.bucketName,
              Key: key,
              Body: file.buffer,
              ContentType: file.mimetype,
            },
          });

          await s3Upload.done();
          return `${r2Config.publicUrl}/${key}`;
        });

        const r2Urls = await Promise.all(uploadPromises);
        urls.push(...r2Urls);
      } else {
        if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        
        const localPromises = files.map(async (file) => {
          const ext = path.extname(file.originalname);
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          const filePath = path.join(UPLOAD_DIR, filename);
          fs.writeFileSync(filePath, file.buffer);
          return `/uploads/${filename}`;
        });
        
        const localUrls = await Promise.all(localPromises);
        urls.push(...localUrls);
      }

      res.json({ urls });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: "Errore durante il caricamento delle immagini." });
    }
  }
);

/**
 * POST /api/uploads/video — carica un singolo file video (multipart form "video").
 * Se R2 è configurato salva in `events/<slug>/videos/…` (o `templates/videos/`),
 * altrimenti fallback locale in /uploads. Stesso gate piano Evento (`paid`) del
 * router principale per coerenza commerciale.
 */
router.post(
  "/video",
  requirePaidForGalleryUpload as any,
  uploadVideo.single("video"),
  async (req: Request, res: Response) => {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) return res.status(400).json({ error: "Nessun file inviato" });
      const { slug, folder: customFolder } = req.query;

      const r2Config = {
        bucketName: process.env.R2_BUCKET_NAME,
        publicUrl: process.env.R2_PUBLIC_URL,
      };
      const isR2Ready = !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ENDPOINT && r2Config.bucketName);

      let url: string;
      if (isR2Ready) {
        const client = getR2Client();
        // Nested folder "videos" per mantenere segregati video e immagini nello
        // stesso prefisso evento — comodo per billing/audit su R2.
        const folder = customFolder === "templates"
          ? "templates/videos"
          : slug ? `events/${slug}/videos` : "temp/videos";
        const ext = path.extname(file.originalname) || ".mp4";
        const key = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

        const s3Upload = new Upload({
          client,
          params: {
            Bucket: r2Config.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          },
        });
        await s3Upload.done();
        url = `${r2Config.publicUrl}/${key}`;
      } else {
        if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        const ext = path.extname(file.originalname) || ".mp4";
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);
        url = `/uploads/${filename}`;
      }

      res.json({ url });
    } catch (err: any) {
      console.error("VIDEO UPLOAD ERROR:", err);
      res.status(500).json({ error: err?.message || "Errore durante il caricamento del video." });
    }
  }
);

// ✅ Endpoint di test per R2
router.post("/test-r2", upload.single("image"), async (req: Request, res: Response) => {
  const r2Config = {
    bucketName: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.R2_PUBLIC_URL
  };

  const isR2Ready = !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ENDPOINT && r2Config.bucketName);

  if (!isR2Ready) {
    return res.status(500).json({ error: "R2 non configurato" });
  }

  if (!req.file) return res.status(400).json({ error: "Nessun file inviato" });

  try {
    const client = getR2Client();
    const ext = path.extname(req.file.originalname);
    const key = `test/${Date.now()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await client.send(command);
    
    const url = `${r2Config.publicUrl}/${key}`;
    res.json({ message: "Test R2 riuscito!", url });
  } catch (err: any) {
    console.error("TEST R2 ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
