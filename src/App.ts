import http from 'http'
import cors from 'cors';
import express, { request } from 'express';
import errorHandler from '../src/middleware/error-handler'
import registerRoutes from './routes';
import helmet from 'helmet';
import path from 'path'
import fs from 'fs'
import * as clientLabel from '../src/config/clientlabel.config.json'

export default class App {
    public express!: express.Application;
    public httpServer!: http.Server;

    public async init(): Promise<void> {
        this.express = express();
        this.httpServer = http.createServer(this.express);
        const joinPath = path.join(__dirname, '..', 'appData')
        const checkBaseUrl = joinPath

        this.express.use('/s3/images', express.static(checkBaseUrl))


        this.middleware();
        // this.passportInit(); // Initialize Passport before defining routes
        this.routes();
        // googleAuth
        this.express.use(errorHandler);
    }

    private routes(): void {
        this.express.use(this.allRoute);
        this.express.use('/', registerRoutes());

    }

    // private passportInit(): void {
    //     this.express.use(expressSession({
    //         resave: false,
    //         saveUninitialized: false,
    // 		secret: 'MIIJQgIBADANBgkqhkiG9w0BAQEFAASCCSwwggkoAgEAAoICAQDAj',
    //     }));
    //     // this.express.use(passport.initialize());
    //     // this.express.use(passport.session());
    // }


    private allRoute(
        req: express.Request,
        res: express.Response,
        next: Function,
    ): void {
        let allImagePath: any = path.join(__dirname, '..', 'appData');
        const staticRoot = path.resolve(__dirname, '../../../POS_Client/dist/e-commerce/browser');
        // let isAsset = req.url.toLowerCase().match(/\/(.*\.(ttf|woff|json|js|css|map|png|svg|jpg|xlsx|txt|jpeg|csv|xlsx|pdf))\??/);
        let isAsset = req.url.match(/\/(.*\.(ttf|woff|json|js|css|map|png|svg|jpg|xlsx|txt|jpeg|csv|pdf))\??/i);

        let splittedFilePath: any = isAsset ? isAsset[1]?.split('/') : null;
        let fileName: string = splittedFilePath?.[splittedFilePath?.length - 1];
        if (req.url.indexOf('/s3/images') != -1 && isAsset) {
            if (fs.existsSync(`${allImagePath}/profileBanner/${fileName}`)) {
                return res.sendFile(fileName, { root: `${allImagePath}/profileBanner` })
            } else if (fs.existsSync(`${allImagePath}/profileIcon/${fileName}`)) {
                return res.sendFile(fileName, { root: `${allImagePath}/profileIcon` })
            } else if (fs.existsSync(`${allImagePath}/serviceBookingRefImg/${fileName}`)) {
                return res.sendFile(fileName, { root: `${allImagePath}/serviceBookingRefImg` })
            } else if (fs.existsSync(`${allImagePath}/userProfile/${fileName}`)) {
                return res.sendFile(fileName, { root: `${allImagePath}/userProfile` })
            } else {
                // throw new Error(clientLabel.providers.providerError.fileError.code)
            }
        }
        else if (req.url.indexOf('/downloadFile') != -1 && isAsset?.length > 0) {
            const orginalFileName = fileName.split('=')

            let downloadFilePath: any
            downloadFilePath = path.join(allImagePath, 'serviceBookingRefImg', orginalFileName[orginalFileName?.length - 1]);
            downloadFilePath = fs.existsSync(downloadFilePath) ? downloadFilePath : path.join(allImagePath, 'providerOutputFile', orginalFileName[orginalFileName?.length - 1]);

            if (fs.existsSync(downloadFilePath)) {
                next()
            }
            else {
                res.status(400)
                // res.send(clientLabel.providers.providerError.fileError.message)
            }
        }
        else if (req.url.indexOf('/s3/getFile') == -1 && isAsset) {
            return res.sendFile(isAsset[1], { root: staticRoot });
        }
        else if (req.url.indexOf('/api') != -1) {
            next();
        } else {
            res.sendFile('index.html', { root: staticRoot });
        }
    }

    private middleware(): void {
        this.express.use(helmet({ contentSecurityPolicy: false }));
        this.express.use(express.json({ limit: '100mb' }));
        this.express.use(express.urlencoded({ limit: '100mb', extended: true }));
        const corsOptions = {
            origin: [
                '*',

            ],
        };
        this.express.use(cors());
    }
}
