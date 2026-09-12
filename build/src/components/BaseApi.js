"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../lib/logger"));
class BaseApi {
    router;
    constructor() {
        this.router = (0, express_1.Router)();
    }
    send(res, statusCode = http_status_codes_1.StatusCodes.OK) {
        let obj = {};
        obj = res.locals.data;
        if (environment.isTestEnvironment()) {
            logger_1.default.info(JSON.stringify(obj, null, 2));
        }
        res.status(statusCode).send(obj);
    }
}
exports.default = BaseApi;
//# sourceMappingURL=BaseApi.js.map