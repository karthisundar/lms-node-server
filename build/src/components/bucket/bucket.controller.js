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
exports.BucketController = void 0;
const BaseApi_1 = __importDefault(require("../BaseApi"));
const http_status_codes_1 = require("http-status-codes");
const ApiResponses_1 = require("../../abstractions/ApiResponses");
const service = __importStar(require("./bucket.service"));
class BucketController extends BaseApi_1.default {
    constructor() {
        super();
    }
    register() {
        this.router.post("/createSession", this.createSession.bind(this));
        this.router.post("/createBucket", this.createBucket.bind(this));
        this.router.get("/getAllBuckets", this.getAllBuckets.bind(this));
        this.router.get("/getBucket", this.getBucket.bind(this));
        this.router.post("/deleteBucket", this.deleteBucket.bind(this));
        return this.router;
    }
    async createBucket(req, res, next) {
        try {
            const createBucket = await service.createBucket(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createBucket);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
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
    async getAllBuckets(req, res, next) {
        try {
            const getAllBuckets = await service.getAllBuckets(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getAllBuckets);
            //   console.log(getAllBuckets, "getAllBuckets from controller");
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteBucket(req, res, next) {
        try {
            const deleteBucket = await service.deleteBucket(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", deleteBucket);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getBucket(req, res, next) {
        try {
            const getBucket = await service.getBucket(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getBucket);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BucketController = BucketController;
//# sourceMappingURL=bucket.controller.js.map