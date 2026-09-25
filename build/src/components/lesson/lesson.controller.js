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
exports.LessionController = void 0;
const BaseApi_1 = __importDefault(require("../BaseApi"));
const http_status_codes_1 = require("http-status-codes");
const ApiResponses_1 = require("../../abstractions/ApiResponses");
const service = __importStar(require("./lesson.service"));
const lessonNotesUpload_1 = __importDefault(require("../../middleware/lessonNotesUpload"));
class LessionController extends BaseApi_1.default {
    constructor() {
        super();
    }
    register() {
        this.router.post("/createLesson", this.createLesson.bind(this));
        this.router.post("/deleteLesson", this.deleteLesson.bind(this));
        this.router.get("/getAllLessons", this.getAllLessons.bind(this));
        this.router.get("/getLesson", this.getLesson.bind(this));
        this.router.get("/getAllLessonVideoMappings", this.getAllLessonVideoMappings.bind(this));
        this.router.get("/getLessonVideoMapping", this.getLessonVideoMapping.bind(this));
        this.router.post("/createLessonVideoMapping", this.createLessonVideoMapping.bind(this));
        this.router.post("/deleteLessonVideoMapping", this.deleteLessonVideoMapping.bind(this));
        this.router.post("/createLessonNotes", lessonNotesUpload_1.default.single("file"), this.createLessonNotes.bind(this));
        this.router.post("/deleteLessonNotes", this.deleteLessonNotes.bind(this));
        this.router.get("/getAllLessonNotes", this.getAllLessonNotes.bind(this));
        this.router.get("/getLessonNotes", this.getLessonNotes.bind(this));
        this.router.post("/createUserLessonMapping", this.createUserLessonMapping.bind(this));
        this.router.post("/deleteUserLessonMapping", this.deleteUserLessonMapping.bind(this));
        this.router.get("/getAllUserLessonMappings", this.getAllUserLessonMappings.bind(this));
        this.router.get("/getUserLessonMapping", this.getUserLessonMapping.bind(this));
        return this.router;
    }
    async createLesson(req, res, next) {
        try {
            const createLesson = await service.createLesson(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createLesson);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllLessons(req, res, next) {
        try {
            const getAllLessons = await service.getAllLessons(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getAllLessons);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getLesson(req, res, next) {
        try {
            const getLesson = await service.getLesson(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getLesson);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteLesson(req, res, next) {
        try {
            const deleteLesson = await service.deleteLesson(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", deleteLesson);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async createLessonVideoMapping(req, res, next) {
        try {
            const createLessonVideoMapping = await service.createLessonVideoMapping(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createLessonVideoMapping);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllLessonVideoMappings(req, res, next) {
        try {
            const getAllLessonVideoMappings = await service.getAllLessonVideoMappings(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getAllLessonVideoMappings);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getLessonVideoMapping(req, res, next) {
        try {
            const getLessonVideoMapping = await service.getLesson(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getLessonVideoMapping);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteLessonVideoMapping(req, res, next) {
        try {
            const deleteLessonVideoMapping = await service.deleteLessonVideoMapping(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", deleteLessonVideoMapping);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async createLessonNotes(req, res, next) {
        try {
            const file = req.file;
            const createLessonNotes = await service.createLessonNotes(req.body, req.headers.authorization, file);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createLessonNotes);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllLessonNotes(req, res, next) {
        try {
            const getAllLessonNotes = await service.getAllLessonNotes(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getAllLessonNotes);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getLessonNotes(req, res, next) {
        try {
            const getLessonNotes = await service.getLessonNotes(req.query);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getLessonNotes);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteLessonNotes(req, res, next) {
        try {
            const deleteLessonNotes = await service.deleteLessonNotes(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", deleteLessonNotes);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async createUserLessonMapping(req, res, next) {
        try {
            const createUserLessonMapping = await service.createUserLessonMapping(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createUserLessonMapping);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUserLessonMappings(req, res, next) {
        try {
            const getAllUserLessonMappings = await service.getAllUserLessonMappings(req.query, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getAllUserLessonMappings);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async getUserLessonMapping(req, res, next) {
        try {
            const getUserLessonMapping = await service.getUserLessonMapping(req.query, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getUserLessonMapping);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteUserLessonMapping(req, res, next) {
        try {
            const deleteUserLessonMapping = await service.deleteUserLessonMapping(req.body, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", deleteUserLessonMapping);
            super.send(res);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LessionController = LessionController;
//# sourceMappingURL=lesson.controller.js.map