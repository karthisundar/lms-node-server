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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = require("dotenv");
const environment_constant_1 = require("./environment.constant");
class Environment {
    port;
    //  public secretKey: string;
    applyEncryption;
    secretKey;
    AWSAccessKeyId;
    AWSSecretKey;
    AWSProfileName;
    bucket;
    serviceUrl;
    productDetailsImagePath;
    headerImagePath;
    barCodeImage;
    AWSRegin;
    storeLogo;
    qrCodePath;
    client_url;
    email_url;
    cc_email;
    //  public mobileAppUrl:string;
    onlineStoreUrl;
    onlineStoreConsumerKey;
    onlineStoreConsumerSecret;
    resellerSiteUrl;
    transport = {
        "name": "",
        "host": "",
        "port": null,
        "secure": null,
        "auth": null,
        dsn: null
    };
    db = {
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
    env;
    constructor(NODE_ENV) {
        this.env = NODE_ENV || process.env.NODE_ENV || environment_constant_1.Environments.DEV;
        const port = process.env.PORT || 3100;
        this.port = Number(port);
        this.setEnvironment(this.env);
        this.db.host = process.env.DB_HOST;
        this.db.port = Number(process.env.DB_PORT);
        this.db.database = process.env.DB_DATABASE;
        this.db.password = process.env.DB_PASSWORD;
        this.db.name = process.env.DB_NAME;
        this.db.user = process.env.DB_USER;
        let applyEncryption = process.env.APPLY_ENCRYPTION;
        this.applyEncryption = JSON.parse(applyEncryption || false);
        this.secretKey = process.env.SECRET_KEY;
        this.db.host = process.env.DB_HOST;
        this.db.port = Number(process.env.DB_PORT);
        this.db.database = process.env.DB_DATABASE;
        this.db.password = process.env.DB_PASSWORD;
        this.db.name = process.env.DB_NAME;
        this.db.user = process.env.DB_USER;
        this.AWSAccessKeyId = process.env.AWSAccessKeyId;
        this.AWSSecretKey = process.env.AWSSecretKey;
        this.bucket = process.env.Bucket;
        this.serviceUrl = process.env.ServiceUrl;
        this.headerImagePath = process.env.headerImagePath;
        this.productDetailsImagePath = process.env.productDetailsImagePath;
        this.barCodeImage = process.env.barCodeImage;
        this.AWSRegin = process.env.AWSRegin;
        this.storeLogo = process.env.storeLogo;
        this.qrCodePath = process.env.qrCodePath;
        this.client_url = process.env.client_url;
        this.email_url = process.env.email_url;
        this.cc_email = process.env.cc_email;
        this.resellerSiteUrl = process.env.resellerSiteUrl;
        // this.mobileAppUrl = process.env.mobileAppUrl;
        this.onlineStoreUrl = process.env.onlineStoreUrl;
        this.onlineStoreConsumerKey = process.env.onlineStoreConsumerKey;
        this.onlineStoreConsumerSecret = process.env.onlineStoreConsumerSecret;
        this.transport.name = process.env.email_type;
        this.transport.host = process.env.email_host;
        this.transport.secure = Boolean(process.env.email_secure);
        this.transport.port = Number(process.env.email_port);
        this.transport.auth = {
            "user": process.env.email_user,
            "pass": process.env.email_pass
        };
    }
    /**
        *
        * @returns
        */
    getCurrentEnvironment() {
        return this.env;
    }
    /**
         *
         * @param env
         */
    isTestEnvironment() {
        return this.getCurrentEnvironment() === environment_constant_1.Environments.LOCAL;
    }
    setEnvironment(env) {
        let envPath;
        this.env = env || environment_constant_1.Environments.LOCAL;
        const rootdir = path.resolve(__dirname, '../../');
        switch (env) {
            case environment_constant_1.Environments.LOCAL:
                envPath = path.resolve(rootdir, environment_constant_1.EnvironmentFile.LOCAL);
                break;
            default:
                envPath = path.resolve(rootdir, environment_constant_1.EnvironmentFile.LOCAL);
        }
        if (!fs.existsSync(envPath)) {
            throw new Error('.env file is missing in root directory');
        }
        (0, dotenv_1.config)({ path: envPath });
    }
}
exports.default = Environment;
//# sourceMappingURL=environment.js.map