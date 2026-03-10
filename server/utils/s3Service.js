import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Carica un file su Cloudflare R2
 * @param {Buffer} fileBuffer - Il buffer del file
 * @param {string} fileName - Nome del file (es. logo.png)
 * @param {string} contentType - Tipo MIME (es. image/png)
 * @returns {Promise<string>} - L'URL pubblico del file caricato
 */
export const uploadToR2 = async (fileBuffer, fileName, contentType) => {
  const key = `uploads/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error("Errore durante l'upload su R2:", error);
    throw error;
  }
};

/**
 * Elimina un file da Cloudflare R2
 * @param {string} fileUrl - L'URL completo del file da eliminare
 */
export const deleteFromR2 = async (fileUrl) => {
  const key = fileUrl.replace(`${process.env.R2_PUBLIC_URL}/`, "");
  
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("Errore durante l'eliminazione da R2:", error);
    throw error;
  }
};
