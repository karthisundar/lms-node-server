import multer from "multer";
import multerS3 from "multer-s3";

import s3Client from "../config/s3";

const allowedMimeTypes = [
  "application/pdf",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-excel",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "text/plain",
];

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
];

const fileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  callback,
) => {
  const originalName = file.originalname.toLowerCase();

  const extension = originalName.substring(
    originalName.lastIndexOf("."),
  );

  const mimeTypeValid = allowedMimeTypes.includes(file.mimetype);

  const extensionValid = allowedExtensions.includes(extension);

  if (!mimeTypeValid || !extensionValid) {
    return callback(
      new Error(
        "Only PDF, DOC, DOCX, XLS, XLSX and TXT files are allowed",
      ),
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

const storage: multer.StorageEngine = isS3Configured
  ? multerS3({
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
        const timestamp = Date.now();
        const sanitizedFileName = file.originalname
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9._-]/g, "");
        const key = `lesson-notes/${timestamp}-${sanitizedFileName}`;
        cb(null, key);
      },
    })
  : (() => {
      const fs = require("fs");
      const path = require("path");
      const localDir = path.resolve(__dirname, "../../appData/lesson-notes");
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      return multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, localDir);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const sanitizedFileName = file.originalname
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9._-]/g, "");
          cb(null, `${timestamp}-${sanitizedFileName}`);
        },
      });
    })();

const lessonNotesUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

export default lessonNotesUpload;