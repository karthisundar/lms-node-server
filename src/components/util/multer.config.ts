import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import logger from "../../lib/logger";
import * as  clientLabel from '../../config/clientlabel.config.json'


const s3Client = new S3Client({
  region: process.env.AWSRegin,
  credentials: {
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
  },
  // useAccelerateEndpoint:true
});


const storage = multerS3({
  s3: s3Client,
  bucket: process.env.Bucket,
//   acl: "public-read", 
  key: (req, file, cb) => {
    console.log(file,'uploadStorag')
    const fieldname = file?.fieldname;
    console.log(file.originalname);
    if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error(clientLabel?.products.productError.multerFileFormatError.code), "false");
    }

    let filePath: string | undefined;
    filePath = 'header_image'
    
    if (fieldname?.includes('header_image')) {
      filePath = process.env.headerImagePath;
    } else if (fieldname?.includes('image')) {
      filePath = process.env.productDetailsImagePath;
    } else if(fieldname?.includes('barcode')){
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

    console.log(fileKey,'fileKey')
    cb(null, fileKey);
  },
});


export const uploadStorage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const   uploadBufferToS3 = async(buffer: Buffer|any,from:any)=> {
  const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const guid = Math.floor(Math.random() * 90000) + 10000;
    let  buf =buffer
    const fileKey =from==1? `${process.env.barCodeImage}/${year}${month}${day}${guid}barcode.png`:`${process.env.qrCodePath}/${year}${month}${day}${guid}${process.env.qrCodePath}.png`;
    
  const params = {
    Bucket: process.env.Bucket,  
    Key: fileKey,                    
    Body: buf,               
    ContentType: 'image/png',    
    
  };

  try {
    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command); // Upload the file

    return fileKey
    
  } catch (error) {
    console.error('Error uploading to S3:', error);
    logger.error(error)
    throw error;
  }
}