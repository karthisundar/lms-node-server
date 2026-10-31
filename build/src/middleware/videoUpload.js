"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
const s3_1 = __importDefault(require("../config/s3"));
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
const fileFilter = (req, file, callback) => {
    const originalName = file.originalname.toLowerCase();
    const extension = originalName.substring(originalName.lastIndexOf("."));
    const mimeValid = allowedMimeTypes.includes(file.mimetype.toLowerCase());
    const extValid = allowedExtensions.includes(extension);
    if (!mimeValid && !extValid) {
        return callback(new Error("Only MP4, WEBM, OGG, MOV, MKV, and AVI video files are allowed."));
    }
    callback(null, true);
};
// Check if S3 credentials and bucket are configured
const isS3Configured = Boolean(process.env.AWS_S3_BUCKET_NAME &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY);
let storage;
if (isS3Configured) {
    storage = (0, multer_s3_1.default)({
        s3: s3_1.default,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, {
                fieldName: file.fieldname,
                originalName: file.originalname,
            });
        },
        key: (req, file, cb) => {
            const sanitizedName = file.originalname
                .replace(/\s+/g, "_")
                .replace(/[^a-zA-Z0-9._-]/g, "");
            const safeKey = `videos/${Date.now()}-${(0, crypto_1.randomUUID)().slice(0, 8)}-${sanitizedName}`;
            cb(null, safeKey);
        },
    });
}
else {
    // Local disk storage fallback
    const localUploadDir = path_1.default.resolve(__dirname, "../../appData/videos");
    if (!fs_1.default.existsSync(localUploadDir)) {
        fs_1.default.mkdirSync(localUploadDir, { recursive: true });
    }
    storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, localUploadDir);
        },
        filename: (req, file, cb) => {
            const sanitizedName = file.originalname
                .replace(/\s+/g, "_")
                .replace(/[^a-zA-Z0-9._-]/g, "");
            const fileName = `${Date.now()}-${(0, crypto_1.randomUUID)().slice(0, 8)}-${sanitizedName}`;
            cb(null, fileName);
        },
    });
}
exports.videoUpload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB
    },
});
exports.default = exports.videoUpload;
//# sourceMappingURL=videoUpload.js.map