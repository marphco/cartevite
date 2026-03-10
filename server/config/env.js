import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

// Trim R2 keys specifically
if (process.env.R2_ACCESS_KEY_ID) process.env.R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID.trim();
if (process.env.R2_SECRET_ACCESS_KEY) process.env.R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY.trim();
if (process.env.R2_ENDPOINT) process.env.R2_ENDPOINT = process.env.R2_ENDPOINT.trim();
if (process.env.R2_BUCKET_NAME) process.env.R2_BUCKET_NAME = process.env.R2_BUCKET_NAME.trim();

console.log("[ENV] Environment variables loaded and trimmed.");

export default process.env;
