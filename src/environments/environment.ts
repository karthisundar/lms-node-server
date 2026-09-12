import * as fs from 'fs';
import * as path from 'path';
import { config as configDotenv } from 'dotenv';
import IEnvironment from './environment.interface';
import { Environments, EnvironmentFile } from './environment.constant';

class Environment implements IEnvironment {
    public port: number;
    //  public secretKey: string;
    public applyEncryption: boolean;
    public secretKey: string;
    public AWSAccessKeyId: string;
    public AWSSecretKey: string;
    public AWSProfileName: string;
    public bucket: string;
    public serviceUrl: string;
    public productDetailsImagePath: string;
    public headerImagePath: string;
    public barCodeImage: string;
    public AWSRegin: string;
    public storeLogo: string;
    public qrCodePath: string;
    public client_url: string;
    public email_url: string;
    public cc_email: string;
    //  public mobileAppUrl:string;
    public onlineStoreUrl: string;
    public onlineStoreConsumerKey: string;
    public onlineStoreConsumerSecret: string;
    public resellerSiteUrl: string;
    public transport = {
        "name": "",
        "host": "",
        "port": null,
        "secure": null,
        "auth": null,
        dsn: null

    }
    public db = {
        'host': '',
        'port': 1,
        'database': '',
        'password': '',
        'name': '',
        'user': '',
    };

    //  public db = {
    //     'host': '',
    //     'port': '',
    //     'database': '',
    //     'password': '',
    //     'name': '',
    //     'user': '',
    // };
    env: string;


    constructor(NODE_ENV?: string) {

        this.env = NODE_ENV || process.env.NODE_ENV || Environments.DEV;
        const port: string | undefined | number = process.env.PORT || 3100;
        this.port = Number(port);
        this.setEnvironment(this.env);
        this.db.host = process.env.DB_HOST;
        this.db.port = Number(process.env.DB_PORT);
        this.db.database = process.env.DB_DATABASE;
        this.db.password = process.env.DB_PASSWORD;
        this.db.name = process.env.DB_NAME;
        this.db.user = process.env.DB_USER;


        let applyEncryption: any = process.env.APPLY_ENCRYPTION
        this.applyEncryption = JSON.parse(applyEncryption||false);
        this.secretKey = process.env.SECRET_KEY;
        this.db.host = process.env.DB_HOST;
        this.db.port = Number(process.env.DB_PORT);
        this.db.database = process.env.DB_DATABASE;
        this.db.password = process.env.DB_PASSWORD;
        this.db.name = process.env.DB_NAME;
        this.db.user = process.env.DB_USER;
        this.AWSAccessKeyId = process.env.AWSAccessKeyId
        this.AWSSecretKey = process.env.AWSSecretKey
        this.bucket = process.env.Bucket
        this.serviceUrl = process.env.ServiceUrl
        this.headerImagePath = process.env.headerImagePath
        this.productDetailsImagePath = process.env.productDetailsImagePath
        this.barCodeImage = process.env.barCodeImage
        this.AWSRegin = process.env.AWSRegin
        this.storeLogo = process.env.storeLogo
        this.qrCodePath = process.env.qrCodePath
        this.client_url = process.env.client_url
        this.email_url = process.env.email_url;
        this.cc_email = process.env.cc_email;
        this.resellerSiteUrl = process.env.resellerSiteUrl;
        // this.mobileAppUrl = process.env.mobileAppUrl;
        this.onlineStoreUrl = process.env.onlineStoreUrl
        this.onlineStoreConsumerKey = process.env.onlineStoreConsumerKey
        this.onlineStoreConsumerSecret = process.env.onlineStoreConsumerSecret

        this.transport.name = process.env.email_type;
        this.transport.host = process.env.email_host;
        this.transport.secure = Boolean(process.env.email_secure);
        this.transport.port = Number(process.env.email_port);
        this.transport.auth = {
            "user": process.env.email_user,
            "pass": process.env.email_pass
        }

    }


    /**
        *
        * @returns
        */

    public getCurrentEnvironment(): string {
        return this.env;
    }
    /**
         *
         * @param env
         */
    public isTestEnvironment(): boolean {
        return this.getCurrentEnvironment() === Environments.LOCAL;
    }

    public setEnvironment(env: string): void {

        let envPath: string;
        this.env = env || Environments.LOCAL;
        const rootdir: string = path.resolve(__dirname, '../../');


        switch (env) {
            case Environments.LOCAL:
                envPath = path.resolve(rootdir, EnvironmentFile.LOCAL);
                break;
            default:
                envPath = path.resolve(rootdir, EnvironmentFile.LOCAL);
        }
        if (!fs.existsSync(envPath)) {
            throw new Error('.env file is missing in root directory');
        }

        configDotenv({ path: envPath });

    }

}


export default Environment;