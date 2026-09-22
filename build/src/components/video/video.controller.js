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
exports.VideoController = void 0;
const BaseApi_1 = __importDefault(require("../BaseApi"));
const http_status_codes_1 = require("http-status-codes");
const ApiResponses_1 = require("../../abstractions/ApiResponses");
const service = __importStar(require("./video.service"));
class VideoController extends BaseApi_1.default {
    constructor() {
        super();
    }
    register() {
        this.router.post("/createVideo", this.createVideo.bind(this));
        this.router.get("/getAllVideos", this.getAllVideos.bind(this));
        this.router.get("/getVideo", this.getVideo.bind(this));
        this.router.post("/deleteVideo", this.deleteVideo.bind(this));
        this.router.get("/getVideoProgress", this.getVideoProgress.bind(this));
        this.router.post("/createVideoProgress", this.createVideoProgress.bind(this));
        return this.router;
    }
    async createVideo(req, res, next) {
        try {
            const createVideo = await service.createVideo(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createVideo);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllVideos(req, res, next) {
        try {
            const getAllVideos = await service.getAllVideos(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getAllVideos);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getVideo(req, res, next) {
        try {
            const getVideo = await service.getVideo(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getVideo);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteVideo(req, res, next) {
        try {
            const createVideo = await service.deleteVideo(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createVideo);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async createVideoProgress(req, res, next) {
        try {
            const createVideoProgress = await service.createVideoProgress(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createVideoProgress);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getVideoProgress(req, res, next) {
        try {
            const getVideoProgress = await service.getVideoProgress(req.query?.videoRefId, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getVideoProgress);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.VideoController = VideoController;
//# sourceMappingURL=video.controller.js.map