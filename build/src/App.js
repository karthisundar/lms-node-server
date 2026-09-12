"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const error_handler_1 = __importDefault(require("../src/middleware/error-handler"));
const routes_1 = __importDefault(require("./routes"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class App {
    express;
    httpServer;
    async init() {
        this.express = (0, express_1.default)();
        this.httpServer = http_1.default.createServer(this.express);
        const joinPath = path_1.default.join(__dirname, '..', 'appData');
        const checkBaseUrl = joinPath;
        this.express.use('/s3/images', express_1.default.static(checkBaseUrl));
        this.middleware();
        // this.passportInit(); // Initialize Passport before defining routes
        this.routes();
        // googleAuth
        this.express.use(error_handler_1.default);
    }
    routes() {
        this.express.use(this.allRoute);
        this.express.use('/', (0, routes_1.default)());
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
    allRoute(req, res, next) {
        let allImagePath = path_1.default.join(__dirname, '..', 'appData');
        const staticRoot = path_1.default.resolve(__dirname, '../../../POS_Client/dist/e-commerce/browser');
        // let isAsset = req.url.toLowerCase().match(/\/(.*\.(ttf|woff|json|js|css|map|png|svg|jpg|xlsx|txt|jpeg|csv|xlsx|pdf))\??/);
        let isAsset = req.url.match(/\/(.*\.(ttf|woff|json|js|css|map|png|svg|jpg|xlsx|txt|jpeg|csv|pdf))\??/i);
        let splittedFilePath = isAsset ? isAsset[1]?.split('/') : null;
        let fileName = splittedFilePath?.[splittedFilePath?.length - 1];
        if (req.url.indexOf('/s3/images') != -1 && isAsset) {
            if (fs_1.default.existsSync(`${allImagePath}/profileBanner/${fileName}`)) {
                return res.sendFile(fileName, { root: `${allImagePath}/profileBanner` });
            }
            else if (fs_1.default.existsSync(`${allImagePath}/profileIcon/${fileName}`)) {
                return res.sendFile(fileName, { root: `${allImagePath}/profileIcon` });
            }
            else if (fs_1.default.existsSync(`${allImagePath}/serviceBookingRefImg/${fileName}`)) {
                return res.sendFile(fileName, { root: `${allImagePath}/serviceBookingRefImg` });
            }
            else if (fs_1.default.existsSync(`${allImagePath}/userProfile/${fileName}`)) {
                return res.sendFile(fileName, { root: `${allImagePath}/userProfile` });
            }
            else {
                // throw new Error(clientLabel.providers.providerError.fileError.code)
            }
        }
        else if (req.url.indexOf('/downloadFile') != -1 && isAsset?.length > 0) {
            const orginalFileName = fileName.split('=');
            let downloadFilePath;
            downloadFilePath = path_1.default.join(allImagePath, 'serviceBookingRefImg', orginalFileName[orginalFileName?.length - 1]);
            downloadFilePath = fs_1.default.existsSync(downloadFilePath) ? downloadFilePath : path_1.default.join(allImagePath, 'providerOutputFile', orginalFileName[orginalFileName?.length - 1]);
            if (fs_1.default.existsSync(downloadFilePath)) {
                next();
            }
            else {
                res.status(400);
                // res.send(clientLabel.providers.providerError.fileError.message)
            }
        }
        else if (req.url.indexOf('/s3/getFile') == -1 && isAsset) {
            return res.sendFile(isAsset[1], { root: staticRoot });
        }
        else if (req.url.indexOf('/api') != -1) {
            next();
        }
        else {
            res.sendFile('index.html', { root: staticRoot });
        }
    }
    middleware() {
        this.express.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
        this.express.use(express_1.default.json({ limit: '100mb' }));
        this.express.use(express_1.default.urlencoded({ limit: '100mb', extended: true }));
        const corsOptions = {
            origin: [
                '*',
            ],
        };
        this.express.use((0, cors_1.default)());
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map