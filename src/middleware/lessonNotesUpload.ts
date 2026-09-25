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

const lessonNotesUpload = multer({
  storage: multerS3({
    s3: s3Client,

    bucket: process.env.AWS_S3_BUCKET_NAME as string,

    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
      });
    },

    key: (req, file, cb) => {
      const timestamp = Date.now();

      const sanitizedFileName = file.originalname
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "");

      const key = `lesson-notes/${timestamp}-${sanitizedFileName}`;

      cb(null, key);
    },
  }),

  fileFilter,

  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

export default lessonNotesUpload;