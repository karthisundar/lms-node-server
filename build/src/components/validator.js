"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = void 0;
const express_validator_1 = require("express-validator");
const logger_1 = __importDefault(require("../lib/logger"));
const validator = (validator) => async (req, res, next) => {
    await Promise.all(validator.map((validator) => validator.run(req)));
    const error = (0, express_validator_1.validationResult)(req);
    if (error.isEmpty()) {
        return next();
    }
    const errorList = error.array();
    logger_1.default.error("error from validator", errorList.map((d) => d.msg));
    const firstMsg = String(errorList[0]?.msg || "Validation error");
    const isEmailDup = firstMsg.toLowerCase().includes("already registered") ||
        firstMsg.toLowerCase().includes("already exists");
    const code = isEmailDup ? "EMAIL_ALREADY_EXISTS" : firstMsg;
    const field = isEmailDup ? "email" : (errorList[0]?.path || errorList[0]?.param);
    res.status(400).json({
        statusCode: 400,
        success: false,
        code,
        message: firstMsg,
        field,
        response: {
            code: errorList.map((d) => d.msg),
            name: "error",
            message: firstMsg,
            stack: errorList,
        },
    });
};
exports.validator = validator;
exports.default = exports.validator;
//# sourceMappingURL=validator.js.map