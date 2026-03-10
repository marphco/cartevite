import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import Event from "../models/Event.js";

const router = express.Router();

const isS3Configured =
  process.env.AWS_REGION &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_BUCKET_NAME;

let s3Client;
if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    // Useful for Cloudflare R2
    endpoint: process.env.AWS_ENDPOINT || undefined, 
  });
  console.log("[STORAGE] S3/R2 configurato correttamente.");
} else {
  console.log("[STORAGE] Fallback su server locale (cartella uploads).");
}

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!isS3Configured && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Memory Storage instradato via Lib-Storage su S3 o DiskStorage
const storage = isS3Configured
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, UPLOAD_DIR),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
      },
    });

const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype && file.mimetype.startsWith("image/");
  if (!isImage) return cb(new Error("Puoi caricare solo immagini."), false);
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 20,
  },
});

const requirePremiumForGalleryUpload = async (req, res, next) => {
  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: "Missing slug" });

    const ev = await Event.findOne({ slug });
    if (!ev) return res.status(404).json({ error: "Evento non trovato" });

    const isPremium = (ev.plan || "free").toLowerCase() === "premium";
    if (!isPremium) {
      return res.status(403).json({ error: "Gallery solo Premium" });
    }

    next();
  } catch (err) {
    next(err);
  }
};

router.post(
  "/",
  requirePremiumForGalleryUpload,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const files = req.files || [];
      const urls = [];

      if (isS3Configured) {
        // Parallel S3 upload streams
        const uploadPromises = files.map(async (file) => {
          const ext = path.extname(file.originalname);
          const key = `cartevite/events/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

          const s3Upload = new Upload({
            client: s3Client,
            params: {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: key,
              Body: file.buffer,
              ContentType: file.mimetype,
            },
          });

          await s3Upload.done();
          
          const domain = process.env.AWS_PUBLIC_DOMAIN || `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
          return `${domain}/${key}`;
        });

        const s3Urls = await Promise.all(uploadPromises);
        urls.push(...s3Urls);
      } else {
        // Fallback locale urls
        const localUrls = files.map((f) => `/uploads/${f.filename}`);
        urls.push(...localUrls);
      }

      res.json({ urls });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({
        error: "Errore durante il salvataggio o inoltro S3.",
        code: err.code,
      });
    }
  }
);

export default router;
