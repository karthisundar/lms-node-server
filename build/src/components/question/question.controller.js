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
const service = __importStar(require("./question.service"));
const jwt_utils_1 = require("../auth/jwt.utils");
class QuestionController extends BaseApi_1.default {
    constructor() {
        super();
    }
    register() {
        this.router.get("/getAllQuestions", this.getAllQuestions.bind(this));
        this.router.get("/getQuestionByRefId", this.getQuestionByRefId.bind(this));
        this.router.get("/getEditorQuestions", this.getEditorQuestions.bind(this));
        this.router.post("/checkSyntax", this.checkSyntax.bind(this));
        this.router.post("/createOrUpdateQuestion", this.createOrUpdateQuestion.bind(this));
        this.router.post("/createQuestion", this.createOrUpdateQuestion.bind(this));
        this.router.post("/deleteQuestion", this.deleteQuestion.bind(this));
        this.router.post("/createQuestionAnswer", this.createQuestionAnswer.bind(this));
        this.router.post("/updateQuestionAnswer", this.updateQuestionAnswer.bind(this));
        this.router.post("/deleteQuestionAnswer", this.deleteQuestionAnswer.bind(this));
        return this.router;
    }
    async verifyUserRole(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.trim()) {
            return null;
        }
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : authHeader;
        const decoded = await (0, jwt_utils_1.verifyJWT)(token);
        const payload = decoded?.payload;
        if (!payload)
            return null;
        // Strict role check: User role only (role_id === 2 or role === 'user')
        const roleId = Number(payload.role_id);
        const role = String(payload.role || "").toLowerCase();
        if (roleId === 2 || role === "user") {
            return payload;
        }
        return false; // Valid token but forbidden role (admin/lecturer)
    }
    async checkSyntax(req, res, next) {
        try {
            const userPayload = await this.verifyUserRole(req);
            if (userPayload === null) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                    statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                    response: {
                        code: "UNAUTHORIZED",
                        message: "Authentication token required.",
                    },
                });
                return;
            }
            if (userPayload === false) {
                res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                    statusCode: http_status_codes_1.StatusCodes.FORBIDDEN,
                    response: {
                        code: "FORBIDDEN",
                        message: "Access denied. Python editor and syntax checking is restricted to the User role only.",
                    },
                });
                return;
            }
            const { code } = req.body || {};
            const result = await service.checkPythonSyntax(code);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", result);
            super.send(res);
        }
        catch (error) {
            next(error);
            logger_1.default.error(error);
        }
    }
    async getEditorQuestions(req, res, next) {
        try {
            const userPayload = await this.verifyUserRole(req);
            if (userPayload === null) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                    statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                    response: {
                        code: "UNAUTHORIZED",
                        message: "Authentication token required.",
                    },
                });
                return;
            }
            if (userPayload === false) {
                res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                    statusCode: http_status_codes_1.StatusCodes.FORBIDDEN,
                    response: {
                        code: "FORBIDDEN",
                        message: "Access denied. Questions & Answers for Python Editor is restricted to the User role only.",
                    },
                });
                return;
            }
            const bodyData = req.query;
            const getAllQuestions = await service.getAllQuestions(bodyData, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getAllQuestions);
            super.send(res);
        }
        catch (error) {
            next(error);
            logger_1.default.error(error);
        }
    }
    async getAllQuestions(req, res, next) {
        try {
            const bodyData = req.query;
            const getAllQuestions = await service.getAllQuestions(bodyData, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getAllQuestions);
            super.send(res);
        }
        catch (error) {
            next(error);
            logger_1.default.error(error);
        }
    }
    async getQuestionByRefId(req, res, next) {
        try {
            const bodyData = req.query;
            const getQuestionByRefId = await service.getQuestionByRefId(bodyData, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", getQuestionByRefId);
            super.send(res);
        }
        catch (error) {
            next(error);
            logger_1.default.error(error);
        }
    }
    async createOrUpdateQuestion(req, res, next) {
        try {
            const bodyData = req.body;
            const createOrUpdateQuestion = await service.createOrUpdateQuestion(bodyData, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createOrUpdateQuestion);
            super.send(res);
        }
        catch (error) {
            next(error);
            logger_1.default.error(error);
        }
    }
    async deleteQuestion(req, res, next) {
        try {
            const bodyData = req.body;
            const deleteQuestion = await service.deleteQuestion(bodyData, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", deleteQuestion);
            super.send(res);
        }
        catch (error) {
            next(error);
            logger_1.default.error(error);
        }
    }
    async createQuestionAnswer(req, res, next) {
        try {
            const bodyData = req.body;
            const createQuestionAnswer = await service.createQuestionAnswer(bodyData, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", createQuestionAnswer);
            super.send(res);
        }
        catch (error) {
            next(error);
            logger_1.default.error(error);
        }
    }
    async updateQuestionAnswer(req, res, next) {
        try {
            const bodyData = req.body;
            const updateQuestionAnswer = await service.updateQuestionAnswer(bodyData, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", updateQuestionAnswer);
            super.send(res);
        }
        catch (error) {
            next(error);
            logger_1.default.error(error);
        }
    }
    async deleteQuestionAnswer(req, res, next) {
        try {
            const bodyData = req.body;
            const deleteQuestionAnswer = await service.deleteQuestionAnswer(bodyData, req.headers.authorization);
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.OK, "", deleteQuestionAnswer);
            super.send(res);
        }
        catch (error) {
            next(error);
            logger_1.default.error(error);
        }
    }
}
exports.default = QuestionController;
//# sourceMappingURL=question.controller.js.map