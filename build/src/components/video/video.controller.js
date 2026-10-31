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
const videoUpload_1 = __importDefault(require("../../middleware/videoUpload"));
const authorization_1 = require("../../middleware/authorization");
const jwt_utils_1 = require("../auth/jwt.utils");
const path_1 = __importDefault(require("path"));
class VideoController extends BaseApi_1.default {
    constructor() {
        super();
    }
    register() {
        this.router.post("/upload", authorization_1.checkAdminAccess, videoUpload_1.default.single("video"), this.uploadVideo.bind(this));
        this.router.post("/createVideo", authorization_1.checkAdminAccess, this.createVideo.bind(this));
        this.router.get("/getAllVideos", authorization_1.checkAccess, this.getAllVideos.bind(this));
        this.router.get("/getVideo", authorization_1.checkAccess, this.getVideo.bind(this));
        this.router.post("/deleteVideo", authorization_1.checkAdminAccess, this.deleteVideo.bind(this));
        this.router.get("/getVideoProgress", authorization_1.checkAccess, this.getVideoProgress.bind(this));
        this.router.post("/createVideoProgress", authorization_1.checkAccess, this.createVideoProgress.bind(this));
        return this.router;
    }
    async uploadVideo(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            const token = await (0, jwt_utils_1.verifyJWT)(authHeader);
            const user = token?.payload;
            if (!user) {
                res.status(401).json({ success: false, message: "Invalid session" });
                return;
            }
            const file = req.file;
            if (!file) {
                res.status(400).json({ success: false, message: "No video file provided" });
                return;
            }
            // Safe relative object key or filename
            const relativeKey = file.key || `videos/${file.filename}`;
            const filename = path_1.default.basename(relativeKey);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "Video uploaded successfully", {
                fileName: filename,
                relativeKey,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
            });
            super.send(res);
        }
        catch (error) {
            next(error);
        }
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