import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import Event from "../models/Event.js";

console.log("[DEBUG TOP] uploads.js eval - R2_BUCKET_NAME:", process.env.R2_BUCKET_NAME);

const router = express.Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype && file.mimetype.startsWith("image/");
  if (!isImage) return cb(new Error("Puoi caricare solo immagini."), false);
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

// Caricamento Immagini
router.post(
  "/",
  requirePremiumForGalleryUpload,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const files = req.files || [];
      const urls = [];

      // Check R2 on every request to avoid dotenv loading issues
      const r2Config = {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        endpoint: process.env.R2_ENDPOINT,
        bucketName: process.env.R2_BUCKET_NAME,
        publicUrl: process.env.R2_PUBLIC_URL
      };

      const isR2Ready = !!(r2Config.accessKeyId && r2Config.secretAccessKey && r2Config.endpoint && r2Config.bucketName);

      if (isR2Ready) {
        const client = new S3Client({
          region: "auto",
          endpoint: r2Config.endpoint,
          credentials: {
            accessKeyId: r2Config.accessKeyId,
            secretAccessKey: r2Config.secretAccessKey,
          },
        });

        const uploadPromises = files.map(async (file) => {
          const ext = path.extname(file.originalname);
          const key = `events/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

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

// ✅ Endpoint di test per R2
router.post("/test-r2", upload.single("image"), async (req, res) => {
  console.log("[DEBUG REQ] process.env.R2_BUCKET_NAME:", process.env.R2_BUCKET_NAME);
  console.log("[DEBUG REQ] All env keys:", Object.keys(process.env).filter(k => k.startsWith("R2_") || k === "PORT"));

  const r2Config = {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    endpoint: process.env.R2_ENDPOINT,
    bucketName: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.R2_PUBLIC_URL
  };

  const isR2Ready = !!(r2Config.accessKeyId && r2Config.secretAccessKey && r2Config.endpoint && r2Config.bucketName);

  if (!isR2Ready) {
    return res.status(500).json({ 
      error: "R2 non configurato", 
      debug: { 
        hasKey: !!r2Config.accessKeyId, 
        keyLen: r2Config.accessKeyId?.length,
        secretLen: r2Config.secretAccessKey?.length,
        endpoint: r2Config.endpoint,
        bucket: r2Config.bucketName 
      } 
    });
  }

  // Debug log (masked)
  console.log("[TEST-R2] Attempting upload with:", {
    keyStart: r2Config.accessKeyId?.substring(0, 4),
    secretEnd: r2Config.secretAccessKey?.substring(r2Config.secretAccessKey.length - 4),
    endpoint: r2Config.endpoint,
    bucket: r2Config.bucketName
  });

  if (!req.file) return res.status(400).json({ error: "Nessun file inviato" });

  try {
    const client = new S3Client({
      region: "us-east-1", // Alcuni client preferiscono us-east-1 per il signing v4 su R2
      endpoint: r2Config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
    });

    console.log("[DEBUG R2] CLIENT CREATED. Region: us-east-1, Endpoint:", r2Config.endpoint);

    const ext = path.extname(req.file.originalname);
    const key = `test/${Date.now()}${ext}`;

    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await client.send(command);
    
    const url = `${r2Config.publicUrl}/${key}`;
    res.json({ message: "Test R2 riuscito!", url });
  } catch (err) {
    console.error("TEST R2 ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
