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
    logger_1.default.error("error from validator", error.array().map((d) => d.msg));
    res.status(400).json({
        statusCode: 400,
        response: {
            code: error.array().map((d) => d.msg),
            name: "error",
            stack: error.array(),
        },
    });
};
exports.validator = validator;
//# sourceMappingURL=validator.js.map