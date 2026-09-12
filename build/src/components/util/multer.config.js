"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBufferToS3 = exports.uploadStorage = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const logger_1 = __importDefault(require("../../lib/logger"));
const clientLabel = __importStar(require("../../config/clientlabel.config.json"));
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWSRegin,
    credentials: {
        accessKeyId: process.env.AWSAccessKeyId,
        secretAccessKey: process.env.AWSSecretKey,
    },
    // useAccelerateEndpoint:true
});
const storage = (0, multer_s3_1.default)({
    s3: s3Client,
    bucket: process.env.Bucket,
    //   acl: "public-read", 
    key: (req, file, cb) => {
        console.log(file, 'uploadStorag');
        const fieldname = file?.fieldname;
        console.log(file.originalname);
        if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error(clientLabel?.products.productError.multerFileFormatError.code), "false");
        }
        let filePath;
        filePath = 'header_image';
        if (fieldname?.includes('header_image')) {
            filePath = process.env.headerImagePath;
        }
        else if (fieldname?.includes('image')) {
            filePath = process.env.productDetailsImagePath;
        }
        else if (fieldname?.includes('barcode')) {
            filePath = process.env.barCodeImage;
        }
        if (!filePath) {
            return cb(new Error("Invalid fieldname"), "false");
        }
        let formatFileName = file?.originalname?.replace(/ +/g, "");
        let fileName = formatFileName?.split('.');
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const guid = Math.floor(Math.random() * 90000) + 10000;
        const fileKey = `${filePath}/${year}${month}${day}${guid}_${fileName[0]}.${fileName[fileName.length - 1]}`;
        console.log(fileKey, 'fileKey');
        cb(null, fileKey);
    },
});
exports.uploadStorage = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});
const uploadBufferToS3 = async (buffer, from) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const guid = Math.floor(Math.random() * 90000) + 10000;
    let buf = buffer;
    const fileKey = from == 1 ? `${process.env.barCodeImage}/${year}${month}${day}${guid}barcode.png` : `${process.env.qrCodePath}/${year}${month}${day}${guid}${process.env.qrCodePath}.png`;
    const params = {
        Bucket: process.env.Bucket,
        Key: fileKey,
        Body: buf,
        ContentType: 'image/png',
    };
    try {
        const command = new client_s3_1.PutObjectCommand(params);
        const response = await s3Client.send(command); // Upload the file
        return fileKey;
    }
    catch (error) {
        console.error('Error uploading to S3:', error);
        logger_1.default.error(error);
        throw error;
    }
};
exports.uploadBufferToS3 = uploadBufferToS3;
//# sourceMappingURL=multer.config.js.map