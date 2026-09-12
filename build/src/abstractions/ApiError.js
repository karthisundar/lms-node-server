"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    status = 500;
    success = false;
    fields;
    errorMessageType;
    constructor(msg, statusCode, name = 'ApiError') {
        super();
        this.message = msg;
        this.status = statusCode;
        this.name = name;
    }
}
exports.default = ApiError;
//# sourceMappingURL=ApiError.js.map