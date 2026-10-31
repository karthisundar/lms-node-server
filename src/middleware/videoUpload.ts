import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import s3Client from "../config/s3";

const allowedMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/mp2t",
  "application/x-mpegURL",
  "application/vnd.apple.mpegurl",
];

const allowedExtensions = [
  ".mp4",
  ".webm",
  ".ogg",
  ".mov",
  ".mkv",
  ".avi",
  ".m4v",
  ".m3u8",
  ".ts",
];

const fileFilter: multer.Options["fileFilter"] = (req, file, callback) => {
  const originalName = file.originalname.toLowerCase();
  const extension = originalName.substring(originalName.lastIndexOf("."));

  const mimeValid = allowedMimeTypes.includes(file.mimetype.toLowerCase());
  const extValid = allowedExtensions.includes(extension);

  if (!mimeValid && !extValid) {
    return callback(
      new Error("Only MP4, WEBM, OGG, MOV, MKV, and AVI video files are allowed.")
    );
  }

  callback(null, true);
};

// Check if S3 credentials and bucket are configured
const isS3Configured = Boolean(
  process.env.AWS_S3_BUCKET_NAME &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
);

let storage: multer.StorageEngine;

if (isS3Configured) {
  storage = multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME as string,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req: any, file: any, cb: any) => {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
      });
    },
    key: (req: any, file: any, cb: any) => {
      const sanitizedName = file.originalname
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "");
      const safeKey = `videos/${Date.now()}-${randomUUID().slice(0, 8)}-${sanitizedName}`;
      cb(null, safeKey);
    },
  });
} else {
  // Local disk storage fallback
  const localUploadDir = path.resolve(__dirname, "../../appData/videos");
  if (!fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, localUploadDir);
    },
    filename: (req, file, cb) => {
      const sanitizedName = file.originalname
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "");
      const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}-${sanitizedName}`;
      cb(null, fileName);
    },
  });
}

export const videoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
});

export default videoUpload;
