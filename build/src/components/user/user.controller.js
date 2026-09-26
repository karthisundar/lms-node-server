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
const BaseApi_1 = __importDefault(require("../BaseApi"));
const logger_1 = __importDefault(require("../../lib/logger"));
const http_status_codes_1 = require("http-status-codes");
const ApiResponses_1 = require("../../abstractions/ApiResponses");
const service = __importStar(require("./user.service"));
const clientlabel_config_json_1 = __importDefault(require("../../config/clientlabel.config.json"));
const serverlabel_config_json_1 = __importDefault(require("../../config/serverlabel.config.json"));
const authorization_1 = require("../../middleware/authorization");
const validator_1 = require("../validator");
const express_validator_1 = require("express-validator");
const user_validator_1 = require("./user.validator");
// import {  loginUser } from "./user.validator";
class UserController extends BaseApi_1.default {
    constructor() {
        super();
    }
    register() {
        // this.router.post('/login',validator(checkSchema(loginUser)),this.login.bind(this));
        this.router.post("/login", this.login.bind(this));
        this.router.get("/logout", this.logout.bind(this));
        this.router.post("/setPassword", authorization_1.checkAccess, this.setPassword.bind(this));
        this.router.post("/createUser", authorization_1.checkAccess, (0, validator_1.validator)((0, express_validator_1.checkSchema)(user_validator_1.checkCreateUser)), this.createUser.bind(this));
        this.router.get("/getAllUsers", authorization_1.checkAccess, this.getAllUser.bind(this));
        this.router.get("/getUserDetails", this.getUserDetails.bind(this));
        this.router.get("/clientLabel", this.clientLabelJson.bind(this));
        this.router.post("/deleteUser", this.deleteUser.bind(this));
        return this.router;
    }
    async login(req, res, next) {
        try {
            const bodyData = req.body;
            const login = await service.login(bodyData);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, clientlabel_config_json_1.default.user.login.code, [login]);
            super.send(res);
        }
        catch (error) {
            next(error);
            logger_1.default.error(error);
        }
    }
    async logout(req, res, next) {
        try {
            const token = req?.headers.authorization;
            const logout = await service.logout(token);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, clientlabel_config_json_1.default.user.logOutUser.code, logout);
            super.send(res);
        }
        catch (error) {
            next(error);
            logger_1.default.error(error);
        }
    }
    async createUser(req, res, next) {
        try {
            const createUser = await service.createUser(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createUser);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUser(req, res, next) {
        try {
            const getAllUser = await service.getAllUser(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getAllUser);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    // public async checkDeviceAccessToken(req:Request,res:Response,next:NextFunction) : Promise <void>{
    //     try {
    //         const token = req.query;
    //         const checkDeviceAccessToken = await service.checkDeviceAccessToken(token);
    //         res.locals.data = returnSuccess(StatusCodes.OK,clientLabel.user.getDeviceToken.code,checkDeviceAccessToken);
    //         super.send(res);
    //     } catch (error) {
    //         next(error);
    //         logger.error(error);
    //     }
    // }
    // public async deleteAllowedDeviceToken(req:Request,res:Response,next:NextFunction) : Promise <void>{
    //     try {
    //         const token = req.query;
    //         const checkDeviceAccessToken = await service.deleteAllowedDeviceToken(token);
    //         res.locals.data = returnSuccess(StatusCodes.OK,clientLabel.user.getDeviceToken.code,checkDeviceAccessToken);
    //         super.send(res);
    //     } catch (error) {
    //         next(error);
    //         logger.error(error);
    //     }
    // }
    // public async getAllAllowdDevice(req:Request,res:Response,next:NextFunction) : Promise <void>{
    //     try {
    //         const token = req.query;
    //         const getAllAllowdDevice = await service.getAllAllowdDevice(token);
    //         res.locals.data = returnSuccess(StatusCodes.OK,clientLabel.user.getDeviceToken.code,getAllAllowdDevice);
    //         super.send(res);
    //     } catch (error) {
    //         next(error);
    //         logger.error(error);
    //     }
    // }
    // public async createDeviceToken(req:Request,res:Response,next:NextFunction) : Promise <void>{
    //     try {
    //         const token = req.headers.authorization;
    //         const createDeviceToken = await service.createDeviceToken(req.body,token);
    //         res.locals.data = returnSuccess(StatusCodes.OK,clientLabel.user.deviceIdCreate.code,createDeviceToken);
    //         super.send(res);
    //     } catch (error) {
    //         next(error);
    //         logger.error(error);
    //     }
    // }
    async setPassword(req, res, next) {
        try {
            const token = req?.headers.authorization;
            const hashPassword = await service.passwordChangetoEncrypt(req?.body?.password, 1);
            let bodyData = req.body;
            bodyData.hashPassword = hashPassword;
            const changePassword = await service.setPassword(token, bodyData);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, clientlabel_config_json_1.default.user.passwordChanged.code, changePassword);
            super.send(res);
        }
        catch (error) {
            logger_1.default.error(error);
            next(error);
        }
    }
    async clientLabelJson(req, res, next) {
        try {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", serverlabel_config_json_1.default);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getUserDetails(req, res, next) {
        try {
            const getUserDetails = await service.getUserDetails(req.query, req?.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getUserDetails);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const deleteUser = await service.deleteUser(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", deleteUser);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map