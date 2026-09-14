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
exports.SessionController = void 0;
const BaseApi_1 = __importDefault(require("../BaseApi"));
const http_status_codes_1 = require("http-status-codes");
const ApiResponses_1 = require("../../abstractions/ApiResponses");
const service = __importStar(require("./session.service"));
class SessionController extends BaseApi_1.default {
    constructor() {
        super();
    }
    register() {
        this.router.post("/createSession", this.createSession.bind(this));
        this.router.get("/getAllSessions", this.getAllSessions.bind(this));
        this.router.get("/getSession", this.getSession.bind(this));
        this.router.post("/deleteSession", this.deleteSession.bind(this));
        this.router.post("/createUserSessionMapping", this.createUserSessionMapping.bind(this));
        this.router.get("/getAllUserSessionMappings", this.getAllUserSessionMappings.bind(this));
        this.router.get("/getUserSessionMapping", this.getUserSessionMapping.bind(this));
        this.router.post("/deleteUserSessionMapping", this.deleteUserSessionMapping.bind(this));
        return this.router;
    }
    async createSession(req, res, next) {
        try {
            const createSession = await service.createSession(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createSession);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllSessions(req, res, next) {
        try {
            const getAllSessions = await service.getAllSessions(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getAllSessions);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getSession(req, res, next) {
        try {
            const getSession = await service.getSession(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getSession);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteSession(req, res, next) {
        try {
            const deleteSession = await service.deleteSession(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", deleteSession);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async createUserSessionMapping(req, res, next) {
        try {
            const createUserSessionMapping = await service.createUserSessionMapping(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createUserSessionMapping);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUserSessionMappings(req, res, next) {
        try {
            const createUserSessionMapping = await service.getAllUserSessionMappings(req.query, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createUserSessionMapping);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getUserSessionMapping(req, res, next) {
        try {
            const createUserSessionMapping = await service.getUserSessionMapping(req.query, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createUserSessionMapping);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteUserSessionMapping(req, res, next) {
        try {
            const deleteUserSessionMapping = await service.deleteUserSessionMapping(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", deleteUserSessionMapping);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SessionController = SessionController;
//# sourceMappingURL=session.controller.js.map