declare module 'multer-s3' {
  import { S3Client } from '@aws-sdk/client-s3';
  import { StorageEngine } from 'multer';

  interface Options {
    s3: S3Client | any;
    bucket: string | ((req: any, file: any, cb: (error: any, bucket?: string) => void) => void);
    contentType?: any;
    metadata?: (req: any, file: any, cb: (error: any, metadata?: any) => void) => void;
    key?: (req: any, file: any, cb: (error: any, key?: string) => void) => void;
    acl?: string | ((req: any, file: any, cb: (error: any, acl?: string) => void) => void);
  }

  interface MulterS3 {
    (options: Options): StorageEngine;
    AUTO_CONTENT_TYPE: any;
    DEFAULT_CONTENT_TYPE: any;
  }

  const multerS3: MulterS3;
  export = multerS3;
}

declare module 'cors' {
  import { RequestHandler } from 'express';
  function cors(options?: any): RequestHandler;
  export = cors;
}

declare module 'jsonwebtoken' {
  export function sign(payload: string | Buffer | object, secretOrPrivateKey: any, options?: any, callback?: any): any;
  export function verify(token: string, secretOrPublicKey: any, options?: any, callback?: any): any;
  export function decode(token: string, options?: any): any;
}

declare module 'bcrypt' {
  export function hash(data: any, saltOrRounds: string | number): Promise<string>;
  export function hashSync(data: any, saltOrRounds: string | number): string;
  export function compare(data: any, encrypted: string): Promise<boolean>;
  export function compareSync(data: any, encrypted: string): boolean;
  export function genSaltSync(rounds?: number): string;
  export function genSalt(rounds?: number): Promise<string>;
}
