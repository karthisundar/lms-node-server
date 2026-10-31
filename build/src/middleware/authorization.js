"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkReseller = exports.checkAccessReseller = void 0;
exports.checkAccess = checkAccess;
exports.checkAdminAccess = checkAdminAccess;
exports.checkUserAccess = checkUserAccess;
const ApiResponses_1 = require("../abstractions/ApiResponses");
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../lib/logger"));
const jwt_utils_1 = require("../components/auth/jwt.utils");
const clientlabel_config_json_1 = __importDefault(require("../config/clientlabel.config.json"));
/**
 * Standard authentication middleware.
 * Verifies that the request contains a valid, unexpired RS256 JWT token.
 * Populates req.user and res.locals.user.
 */
async function checkAccess(req, res, next) {
    try {
        const authHeader = req.headers?.authorization;
        if (!authHeader || typeof authHeader !== "string" || authHeader.trim() === "") {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, clientlabel_config_json_1.default.user?.userError?.unauthorized?.code || "UNAUTHORIZED");
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(res.locals.data);
        }
        const verification = (0, jwt_utils_1.verifyJWT)(authHeader);
        if (!verification.payload || verification.expired) {
            const errorCode = verification.expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, errorCode);
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(res.locals.data);
        }
        // Attach validated token payload to request and locals
        req.user = verification.payload;
        res.locals.user = verification.payload;
        next();
    }
    catch (err) {
        logger_1.default.error("checkAccess error src/middleware/authorization.ts", err);
        next(err);
    }
}
/**
 * Administrator authorization middleware.
 * Enforces that the authenticated user possesses the Admin role (role_id === 1 or role === 'admin').
 */
async function checkAdminAccess(req, res, next) {
    try {
        const authHeader = req.headers?.authorization;
        if (!authHeader || typeof authHeader !== "string" || authHeader.trim() === "") {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, clientlabel_config_json_1.default.user?.userError?.unauthorized?.code || "UNAUTHORIZED");
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(res.locals.data);
        }
        const verification = (0, jwt_utils_1.verifyJWT)(authHeader);
        if (!verification.payload || verification.expired) {
            const errorCode = verification.expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, errorCode);
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(res.locals.data);
        }
        const payload = verification.payload;
        const roleId = Number(payload.role_id);
        const role = String(payload.role || "").toLowerCase();
        const isAdmin = roleId === 1 || role.includes("admin");
        if (!isAdmin) {
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                statusCode: http_status_codes_1.StatusCodes.FORBIDDEN,
                response: {
                    code: "FORBIDDEN",
                    message: "Access denied. Administrator privileges required.",
                },
            });
        }
        req.user = payload;
        res.locals.user = payload;
        next();
    }
    catch (err) {
        logger_1.default.error("checkAdminAccess error src/middleware/authorization.ts", err);
        next(err);
    }
}
/**
 * Standard User role authorization middleware.
 * Enforces that the authenticated user possesses the student/user role (role_id === 2 or role === 'user').
 */
async function checkUserAccess(req, res, next) {
    try {
        const authHeader = req.headers?.authorization;
        if (!authHeader || typeof authHeader !== "string" || authHeader.trim() === "") {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, clientlabel_config_json_1.default.user?.userError?.unauthorized?.code || "UNAUTHORIZED");
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(res.locals.data);
        }
        const verification = (0, jwt_utils_1.verifyJWT)(authHeader);
        if (!verification.payload || verification.expired) {
            const errorCode = verification.expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, errorCode);
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(res.locals.data);
        }
        const payload = verification.payload;
        const roleId = Number(payload.role_id);
        const role = String(payload.role || "").toLowerCase();
        const isUser = roleId === 2 || role === "user";
        if (!isUser) {
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                statusCode: http_status_codes_1.StatusCodes.FORBIDDEN,
                response: {
                    code: "FORBIDDEN",
                    message: "Access denied. Student user access required.",
                },
            });
        }
        req.user = payload;
        res.locals.user = payload;
        next();
    }
    catch (err) {
        logger_1.default.error("checkUserAccess error src/middleware/authorization.ts", err);
        next(err);
    }
}
const checkAccessReseller = async (req, res, next) => {
    try {
        const token = req.headers?.authorization;
        if (!token || token?.trim() === "") {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, "");
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(res.locals.data);
        }
        const verification = (0, jwt_utils_1.verifyJWT)(token);
        if (!verification.payload || verification.expired) {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, "");
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(res.locals.data);
        }
        req.user = verification.payload;
        res.locals.user = verification.payload;
        next();
    }
    catch (err) {
        logger_1.default.error("checkAccessReseller catch src/middleware/authorization.ts", err);
        next(err);
    }
};
exports.checkAccessReseller = checkAccessReseller;
const checkReseller = async (req, res, next) => {
    try {
        const token = req.headers?.authorization;
        if (!token || token?.trim() === "") {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, "");
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(res.locals.data);
        }
        const payload = (0, jwt_utils_1.verifyJWT)(token)?.payload;
        if (payload == null || !payload?.reseller_ref_id) {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, "");
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json(res.locals.data);
        }
        req.user = payload;
        res.locals.user = payload;
        next();
    }
    catch (error) {
        logger_1.default.error("reseller valid catch src/middleware/authorization.ts", error);
        next(error);
    }
};
exports.checkReseller = checkReseller;
//# sourceMappingURL=authorization.js.map